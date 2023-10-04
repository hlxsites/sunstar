/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global WebImporter */

import {
  addBreadCrumb,
  createMetadata,
  fixRelativeLinks,
  createSectionMetadata,
} from './utils.js';

/* eslint-disable no-console, class-methods-use-this */
const extractEmbed = (document) => {
  const embedItems = document.querySelectorAll('.wp-block-embed');

  if (embedItems && embedItems.length) {
    embedItems.forEach((embedItem) => {
      const iframes = embedItem.getElementsByTagName('iframe');

      if (iframes && iframes.length) {
        const cells = [['Embed']];
        const anchor = document.createElement('a');
        anchor.href = iframes[0].src;
        anchor.textContent = iframes[0].src;
        cells.push([anchor]);

        const table = WebImporter.DOMUtils.createTable(cells, document);
        embedItem.replaceWith(table);
      }
    });
  }
};

/**
* Creates a Fragment block from a section
* @param {HTMLDocument} document The document
*/
const createFragmentBlockFromSection = (document) => {
  const block = [];
  const healthifyThinkingCard = document.querySelector('.related-article');
  const newsPressCard = document.querySelector('.news-featured');
  let section;
  block.push(['Fragment']);

  if (healthifyThinkingCard) {
    block.push(['https://main--sunstar--hlxsites.hlx.page/fragments/related-articles']);
    section = healthifyThinkingCard;
  } else if (newsPressCard) {
    block.push(['https://main--sunstar--hlxsites.hlx.page/fragments/featured-articles']);
    section = newsPressCard;
  }

  if (section) {
    const table = WebImporter.DOMUtils.createTable(block, document);
    section.before(document.createElement('hr'));
    section.before(document.querySelector('.slider-title'));
    section.after(document.createElement('hr'));
    section.replaceWith(table);
  }
};

const addSocialBlock = (document) => {
  const socialShare = document.querySelector('.ss-share');
  if (socialShare) {
    const socialLinks = socialShare.querySelectorAll('a');
    if (socialLinks && socialLinks.length) {
      const cells = [['Social']];

      socialLinks.forEach((x) => {
        const img = x.querySelector('img');
        if (img) {
          const url = img.src;
          const startIndex = url.lastIndexOf('/') + 1;
          const extensionIndex = url.lastIndexOf('.svg');
          const filename = url.substring(startIndex, extensionIndex);
          cells.push([filename, x.href]);
        }
      });

      const table = WebImporter.DOMUtils.createTable(cells, document);
      socialShare.after(createSectionMetadata({ Style: 'Narrow' }, document));
      socialShare.replaceWith(table);
    }
  }
};

const addTagsBlock = (document) => {
  const section = document.querySelector('.ss-tag-container');

  if (section) {
    const tagLabel = section.querySelector('.tag-label');
    const cells = [['Tags']];

    const table = WebImporter.DOMUtils.createTable(cells, document);
    section.before(document.createElement('hr'));
    section.after(createSectionMetadata({ Style: 'Narrow' }, document));
    section.before(tagLabel);
    section.replaceWith(table);
  }
};

const addQuoteBlock = (document) => {
  const blockQuotes = document.querySelectorAll('blockquote.wp-block-quote');

  if (blockQuotes && blockQuotes.length) {
    [...blockQuotes].forEach((quote) => {
      const cells = [['Quote']];
      const ps = quote.querySelectorAll('p');
      const div = document.createElement('div');

      [...ps].forEach((para) => {
        if (!para.querySelector('cite')) {
          div.appendChild(para);
        }
      });

      const caption = quote.querySelector('cite') ? quote.querySelector('cite').textContent : '';

      if (caption) {
        cells.push([div, caption]);
      } else {
        cells.push([div]);
      }

      const table = WebImporter.DOMUtils.createTable(cells, document);
      quote.replaceWith(table);
    });
  }
};

const changeAnchorLinks = (document) => {
  const anchors = document.querySelectorAll('a');
  [...anchors].forEach((item) => {
    const newsRegex = /newsroom\/(news|press-releases)/;
    if (newsRegex.test(item.href)) {
      item.href = item.href.replaceAll(/newsroom\/(event|news|press-releases)\//g, 'newsroom/');
    }

    const healthifyThinkingRegex = /healthy-thinking\/(category)/;
    if (healthifyThinkingRegex.test(item.href)) {
      item.href = item.href.replaceAll(/healthy-thinking\/(category)\//g, 'healthy-thinking/');
    }
  });
};

const removeRedundantTag = (document) => {
  const topLevelTag = document.querySelector('.tag');
  if (topLevelTag) {
    topLevelTag.remove();
  }

  const initialH6 = document.querySelector('h6.rabel');
  if (initialH6) {
    const textContent = initialH6.querySelector('a')?.textContent;
    initialH6.innerHTML = '';
    initialH6.textContent = textContent;
  }
};

const customImportLogic = (document) => {
  removeRedundantTag(document);
  changeAnchorLinks(document);
  addBreadCrumb(document);
  addTagsBlock(document);
  extractEmbed(document);
  addSocialBlock(document);
  addQuoteBlock(document);
  fixRelativeLinks(document);
  createFragmentBlockFromSection(document);
};

export default {
  /**
  * Apply DOM operations to the provided document and return
  * the root element to be then transformed to Markdown.
  * @param {HTMLDocument} document The document
  * @param {string} url The url of the page imported
  * @param {string} html The raw html (the document is cleaned up during preprocessing)
  * @param {object} params Object containing some parameters given by the import process.
  * @returns {HTMLElement} The root element to be transformed
  */
  preprocess: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    const schemaDetails = document.querySelector('head script.aioseo-schema');
    const metadataDetails = {};
    const { pathname } = new URL(url);

    if (schemaDetails) {
      const jsonSchema = JSON.parse(schemaDetails.innerText);
      const graphNode = jsonSchema['@graph'];

      if (graphNode) {
        graphNode.forEach((node) => {
          const nodeType = node['@type'];

          if (nodeType === 'BreadcrumbList' && node.itemListElement && node.itemListElement.length) {
            const lastItem = node.itemListElement[node.itemListElement.length - 1];
            const lastItemDetails = lastItem.item;

            if (lastItemDetails) {
              metadataDetails.PageName = lastItemDetails.name;
            }
          } else if (nodeType === 'WebPage' && (pathname.includes('/newsroom/') || pathname.includes('/healthy-thinking/')) && node.datePublished) {
            metadataDetails.PublishedDate = new Date(node.datePublished).getTime();
          }
        });
      }
    }

    const sectionBreadcrumb = document.querySelector('.section-breadcrumb');
    if (sectionBreadcrumb) {
      const breadcrumbItems = sectionBreadcrumb.querySelectorAll('.ss-breadcrumb .breadcrumb-item');
      if (breadcrumbItems && breadcrumbItems.length) {
        const breadcrumbText = breadcrumbItems[breadcrumbItems.length - 1].textContent.trim();
        metadataDetails.BreadcrumbTitle = breadcrumbText.trim();
      }
    }

    if (pathname.includes('/newsroom/')) {
      metadataDetails.Type = 'Newsroom';
    }

    if (pathname.includes('/healthy-thinking/')) {
      metadataDetails.Type = 'Healthy Thinking';
      const firstH6 = document.querySelector('h6.rabel');

      if (firstH6) {
        metadataDetails.Topic = firstH6.textContent;
      }
    }

    const tags = document.querySelectorAll('.tag-pill');

    if (tags && tags.length) {
      metadataDetails.Tags = [...tags].map((x) => x.textContent.trim()).join(', ');
    }

    params.preProcessMetadata = metadataDetails;
  },

  transformDOM: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    // define the main element: the one that will be transformed to Markdown
    const main = document.body;

    // use helper method to remove header, footer, etc.
    WebImporter.DOMUtils.remove(main, [
      'header',
      'footer',
      'noscript',
    ]);

    customImportLogic(document);
    // create the metadata block and append it to the main element
    createMetadata(main, document, params);

    return main;
  },

  /**
  * Return a path that describes the document being transformed (file name, nesting...).
  * The path is then used to create the corresponding Word document.
  * @param {HTMLDocument} document The document
  * @param {string} url The url of the page imported
  * @param {string} html The raw html (the document is cleaned up during preprocessing)
  * @param {object} params Object containing some parameters given by the import process.
  * @return {string} The path
  */
  generateDocumentPath: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    const { pathname } = new URL(url);
    const initialReplace = new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, '');

    console.log(`pathname: ${pathname} -> initialReplace: ${initialReplace}`);
    return WebImporter.FileUtils.sanitizePath(initialReplace);
  },
};
