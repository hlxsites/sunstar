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
import { createSectionMetadata } from './utils.js';

/* eslint-disable no-console, class-methods-use-this */

const createMetadata = (main, doc, params, mainImg) => {
  const meta = {};

  const title = doc.querySelector('title');
  if (title) {
    meta.Title = title.textContent.replace(/[\n\t]/gm, '');
  }

  const desc = doc.querySelector('[property="og:description"]');
  if (desc) {
    meta.Description = desc.content;
  }

  meta.Image = mainImg;

  const breadcrumb = doc.querySelector('.section-breadcrumb');
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

  const block = WebImporter.Blocks.getMetadataBlock(doc, meta);
  main.append(block);

  return meta;
};

function addBreadCrumb(doc) {
  const breadcrumb = doc.querySelector('.section-breadcrumb');

  if (breadcrumb) {
    // Not removing breadcrumb section from here because we need to extract breadcrumb title.
    const cells = [['Breadcrumb']];
    const table = WebImporter.DOMUtils.createTable(cells, doc);
    breadcrumb.after(doc.createElement('hr'));
    breadcrumb.replaceWith(table);
  }
}

/**
 * Extract background images from the source node and
 * replace them with foreground images in the target node.
 * @param {Node} sourceNode The node to extract background images from
 * @param {Node} targetNode The node to use for inlining the images
 */
function convertBackgroundImgsToForegroundImgs(sourceNode, targetNode = sourceNode) {
  const bgImgs = sourceNode.querySelectorAll('.background-image, .mobile-content, .bg-image');

  [...bgImgs].forEach((bgImg) => {
    WebImporter.DOMUtils.replaceBackgroundByImg(bgImg, targetNode);
  });
}

function eliminateCommonBlocksFromCareerTestimonials(doc) {
  let md = doc.querySelector('section.make-difference');
  let mdReplace = true;
  if (!md) {
    md = doc.querySelector('section.meet-people');
    mdReplace = false;
  }

  const sectionMetadata = createSectionMetadata({ Style: 'Narrower, Spaced' }, doc);
  md.before(sectionMetadata);

  md.before(doc.createElement('hr'));
  if (md) {
    const table = WebImporter.DOMUtils.createTable([['career-apply']], doc);
    if (mdReplace) {
      md.replaceWith(table);
    } else {
      md.before(table);
    }
    table.after(doc.createElement('hr'));

    table.after(createSectionMetadata({ Style: 'Narrower, Centered' }, doc));

    const p = doc.createElement('p');
    p.innerHTML = 'Read about the backgrounds, current activities and future goals of '
      + 'team members contributing to the spirit of Sunstar around the world.';
    table.after(p);
    const h2 = doc.createElement('h2');
    h2.innerHTML = 'Meet our people';
    table.after(h2);
    table.after(doc.createElement('hr'));
  }

  const mp = doc.querySelector('section.meet-people');
  if (mp) {
    const table = WebImporter.DOMUtils.createTable([['career-carousel']], doc);
    mp.replaceWith(table);
  }
}

function handleCareerTestimonials(doc) {
  let mainImage;
  const heroSect = doc.querySelector('section.hero-three');

  const cells = [['hero-career']];
  if (heroSect) {
    const nameSect = heroSect.querySelector('.hero-card');
    if (nameSect) {
      const nameEl = nameSect.querySelector('h6');
      if (nameEl) {
        cells.push(['Name', nameEl.textContent]);
      }
      const titleEl = nameSect.querySelector('h6 + p');
      if (titleEl) {
        cells.push(['Title', titleEl.textContent]);
      }
    }

    const careerInfo = heroSect.querySelector('.hero-message');
    if (careerInfo) {
      const quoteEl = careerInfo.querySelector('blockquote');
      if (quoteEl) {
        cells.push(['Quote', quoteEl.textContent]);
      }
      const cbEl = careerInfo.querySelector('h6 + p');
      if (cbEl) {
        cells.push(['Career-background', cbEl.textContent]);
      }
    }

    const images = heroSect.querySelectorAll('img');
    images.forEach((i) => {
      const style = i.getAttribute('style');
      if (style != null && style.includes('background-image: none;')) {
        mainImage = i;
      } else {
        cells.push(['Hero-Background', i]);
      }
    });
  }

  const careerHero = WebImporter.DOMUtils.createTable(cells, doc);
  heroSect.after(doc.createElement('hr'));
  heroSect.replaceWith(careerHero);

  eliminateCommonBlocksFromCareerTestimonials(doc);

  doc.querySelectorAll('figcaption').forEach((fc) => {
    const txt = fc.textContent;
    if (txt) {
      const em = doc.createElement('em');
      em.textContent = txt;
      fc.replaceWith(em);
    }
  });
  return mainImage;
}

function getFomattedDate(newsDate) {
  const date = new Date(newsDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function customImportLogic(doc) {
  addBreadCrumb(doc);
  convertBackgroundImgsToForegroundImgs(doc);
  return handleCareerTestimonials(doc);
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

    if (schemaDetails) {
      const jsonSchema = JSON.parse(schemaDetails.innerText);
      const graphNode = jsonSchema['@graph'];

      if (graphNode) {
        graphNode.forEach((node) => {
          const nodeType = node['@type'];
          const { pathname } = new URL(url);

          if (nodeType === 'BreadcrumbList' && node.itemListElement && node.itemListElement.length) {
            const lastItem = node.itemListElement[node.itemListElement.length - 1];
            const lastItemDetails = lastItem.item;

            if (lastItemDetails) {
              metadataDetails.PageName = lastItemDetails.name;
            }
          } else if (nodeType === 'WebPage' && pathname.includes('/news') && node.datePublished) {
            metadataDetails.NewsDate = new Date(node.datePublished).getTime();
          }
        });
      }

      params.preProcessMetadata = metadataDetails;
    }
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
    const mainImg = customImportLogic(document);
    // create the metadata block and append it to the main element
    createMetadata(main, document, params, mainImg);

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
    const { preProcessMetadata } = params;

    const initialReplace = new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, '');

    console.log(`pathname: ${pathname} -> initialReplace: ${initialReplace}`);
    // Custom handling for Japanese news pages
    if (pathname.toLowerCase().indexOf('/ja/news/') !== -1 && preProcessMetadata && preProcessMetadata.NewsDate) {
      return WebImporter.FileUtils.sanitizePath(initialReplace.replace(/\/ja\/news\/.*$/, `/ja/news/${getFomattedDate(preProcessMetadata.NewsDate)}}`));
    }
    return WebImporter.FileUtils.sanitizePath(initialReplace);
  },
};
