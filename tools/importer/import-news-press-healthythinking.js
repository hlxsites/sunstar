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
/* eslint-disable no-console, class-methods-use-this */

const createSectionMetadata = (cfg, document) => {
  const cells = [['Section Metadata']];
  Object.keys(cfg).forEach((key) => {
    cells.push([key, cfg[key]]);
  });
  return WebImporter.DOMUtils.createTable(cells, document);
};

const createMetadata = (main, document, params) => {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.textContent.replace(/[\n\t]/gm, '');
  }

  const desc = document.querySelector('[property="og:description"]');
  if (desc) {
    meta.Description = desc.content;
  }

  const img = document.querySelector('[property="og:image"]');
  if (img && img.content) {
    const el = document.createElement('img');
    el.src = img.content;
    meta.Image = el;
  }

  const breadcrumb = document.querySelector('.section-breadcrumb');
  if (breadcrumb) {
    const breadcrumbItems = breadcrumb.querySelectorAll('.ss-breadcrumb .breadcrumb-item');
    if (breadcrumbItems && breadcrumbItems.length) {
      const breadcrumbText = breadcrumbItems[breadcrumbItems.length - 1].textContent.trim();
      meta.BreadcrumbTitle = breadcrumbText;
    }
  }

  if (params.preProcessMetadata && Object.keys(params.preProcessMetadata).length) {
    Object.assign(meta, params.preProcessMetadata);
  }

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);

  return meta;
};

function extractEmbed(document) {
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
        embedItem.before(document.createElement('hr'));
        embedItem.after(document.createElement('hr'));
        embedItem.replaceWith(table);
      }
    });
  }
}

function addBreadCrumb(document) {
  const breadcrumb = document.querySelector('.section-breadcrumb');

  if (breadcrumb) {
    const cells = [['Breadcrumb']];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    breadcrumb.after(document.createElement('hr'));
    breadcrumb.replaceWith(table);
  }
}

/**
* Creates a cards block from a section
* @param {HTMLDocument} document The document
*/
function createCardsBlockFromSection(document) {
  document.querySelectorAll('div.section-container').forEach((section) => {
    const block = [['Cards']];
    const healthifyThinkingCard = section.parentElement.className.includes('related-article');

    if (healthifyThinkingCard) {
      const cards = section.querySelectorAll('a.text-decoration-none');

      Array.from(cards).forEach((card) => {
        const newDiv = document.createElement('div');
        const p = card.querySelector('p');
        if (p) {
          const h6 = document.createElement('h6');
          h6.textContent = p.textContent;
          newDiv.appendChild(h6);
        }

        const h4 = card.querySelector('h4');
        if (h4) {
          const internalP = document.createElement('p');
          internalP.textContent = h4.textContent;
          newDiv.appendChild(internalP);
        }

        const img = card.querySelector('img');
        const a = document.createElement('a');
        a.textContent = 'cards-link';
        a.href = card.href;

        if (a) {
          newDiv.appendChild(a);
        }

        block.push([img, newDiv]);
      });

      const table = WebImporter.DOMUtils.createTable(block, document);
      section.before(document.createElement('hr'));
      section.before(document.querySelector('.slider-title'));
      section.after(document.createElement('hr'));
      section.replaceWith(table);
    }
  });
}

/**
* Creates a Feature block from a section
* @param {HTMLDocument} document The document
*/
function createFeatureBlockFromSection(document) {
  document.querySelectorAll('div.section-container').forEach((section) => {
    const block = [['Feature']];
    // create a cards block from the section
    const newsPressCard = section.parentElement.className.includes('news-featured');

    if (newsPressCard) {
      const table = WebImporter.DOMUtils.createTable(block, document);
      table.append(section.querySelector('h4'));
      section.before(document.createElement('hr'));
      section.after(document.createElement('hr'));
      section.replaceWith(table);
    }
  });
}

function addSocialBlock(document) {
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
      socialShare.replaceWith(table);
    }
  }
}

/**
 * Prefixes relative links with the target domain
 * @param {HTMLDocument} document The document
 */
function fixRelativeLinks(document) {
  document.querySelectorAll('a').forEach((a) => {
    const targetDomain = 'https://main--sunstar--hlxsites.hlx.page';
    // if the link is relative, make it absolute
    if (a.href.startsWith('/')) {
      let link = a.href;
      const p1 = a.href.indexOf('#');
      const p2 = a.href.indexOf('?');
      let p = p1;
      if (p1 < 0 || (p2 > 0 && p2 < p1)) {
        p = p2;
      }
      if (p > 0) {
        link = a.href.substring(0, p);
        if (link.endsWith('/')) {
          link = link.substring(0, link.length - 1);
        }
        link += a.href.substring(p);
      } else if (link.endsWith('/')) {
        link = link.substring(0, link.length - 1);
      }
      a.href = targetDomain + link;
    }
  });
}

function addTagsBlock(document) {
  const section = document.querySelector('.ss-tag-container');

  if (section) {
    const tagLabel = section.querySelector('.tag-label');
    const tagAnchors = section.querySelectorAll('.tag-link');

    if (tagAnchors && tagAnchors.length) {
      const cells = [['Tags']];

      [...tagAnchors].forEach((x) => {
        cells.push([x]);
      });

      const table = WebImporter.DOMUtils.createTable(cells, document);
      section.before(document.createElement('hr'));
      section.before(tagLabel);
      section.after(createSectionMetadata({ Style: 'Narrow' }, document));
      section.replaceWith(table);
    }
  }
}

function customImportLogic(document) {
  addBreadCrumb(document);
  addTagsBlock(document);
  createCardsBlockFromSection(document);
  createFeatureBlockFromSection(document);
  extractEmbed(document);
  addSocialBlock(document);
  fixRelativeLinks(document);
}

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

    if (pathname.includes('/newsroom/')) {
      metadataDetails.Category = 'Newsroom';

      const span = document.querySelector('span.tag');
      if (span) {
        metadataDetails.Topic = span.textContent;
      }
    }

    if (pathname.includes('/healthy-thinking/')) {
      metadataDetails.Category = 'Healthy Thinking';

      const firstH6 = document.querySelector('h6.rabel');
      if (firstH6) {
        metadataDetails.Topic = firstH6.textContent;
      }
    }

    const tags = document.querySelectorAll('.tag-pill');

    if (tags && tags.length) {
      metadataDetails.Tags = [...tags].map((x) => x.textContent).join(', ');
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
