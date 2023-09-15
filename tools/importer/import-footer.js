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

const createMetadata = (main, document) => {
  const meta = {};
  meta.robots = 'noindex';
  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);

  return meta;
};

function createSectionMetadata(cfg, document) {
  const cells = [['Section Metadata']];
  Object.keys(cfg).forEach((key) => {
    cells.push([key, cfg[key]]);
  });
  return WebImporter.DOMUtils.createTable(cells, document);
}

function changeLinks(document) {
  const detailPageNav = document.querySelector('.ss-footer');
  if (detailPageNav) {
    detailPageNav.querySelectorAll('a').forEach((a) => {
      if (!a.href.includes('sunstar-engineering') && !a.href.includes('sunstarfoundation')) {
        a.href = 'https://main--sunstar--hlxsites.hlx.live'.concat(a.href).replace(/\/$/, '');
      }
    });
  }
}

function addFooterTop(document) {
  const footerTop = document.querySelector('.footer-top');

  if (footerTop) {
    const topDiv = document.createElement('div');
    const footerTopNavContainers = footerTop.querySelectorAll('.nav-container');

    if (footerTopNavContainers) {
      Array.from(footerTopNavContainers).forEach((navContainer) => {
        [...navContainer.children].forEach((navChild) => {
          if ([...navChild.classList].indexOf('menu-title') > -1 || [...navChild.classList].indexOf('menu-title-two') > -1) {
            const h5 = document.createElement('h5');
            h5.innerHTML = navChild.innerHTML;
            topDiv.append(h5);
          } else if (navChild.tagName === 'NAV') {
            const innerNavs = navChild.querySelectorAll('nav');

            if (innerNavs.length !== 0) {
              [...innerNavs].forEach((innerNav) => {
                const ul = document.createElement('ul');

                [...innerNav.children].forEach((innerNavChild) => {
                  if (innerNavChild.tagName === 'H6') {
                    const h6 = document.createElement('h6');
                    h6.innerHTML = innerNavChild.innerHTML;
                    topDiv.append(h6);
                  } else {
                    const li = document.createElement('li');
                    li.append(innerNavChild);
                    ul.append(li);
                  }
                });

                topDiv.append(ul);
              });
            } else {
              const ul = document.createElement('ul');
              const anchors = navChild.querySelectorAll('a');

              if (anchors) {
                anchors.forEach((a) => {
                  const li = document.createElement('li');
                  li.append(a);
                  ul.append(li);
                });

                topDiv.append(ul);
              }
            }
          }
        });
      });
    }

    footerTop.replaceWith(topDiv);
    topDiv.after(document.createElement('hr'));
    topDiv.after(createSectionMetadata({ Style: 'Footer Top' }, document));
  }
}

function addFooterMiddle(document) {
  const footerMid = document.querySelector('.footer-mid');
  const midDiv = document.createElement('div');

  if (footerMid) {
    midDiv.innerHTML = footerMid.innerHTML;
    footerMid.replaceWith(midDiv);
    midDiv.after(document.createElement('hr'));
    midDiv.after(createSectionMetadata({ Style: 'Footer Middle' }, document));
  }
}

function addFooterBottom(document) {
  const footerBottom = document.querySelector('.footer-nav-bottom');
  const bottomDiv = document.createElement('div');

  if (footerBottom) {
    bottomDiv.innerHTML = footerBottom.innerHTML;
    footerBottom.replaceWith(bottomDiv);
    bottomDiv.after(document.createElement('hr'));
    bottomDiv.after(createSectionMetadata({ Style: 'Footer Bottom' }, document));
  }
}

function customImportLogic(document) {
  changeLinks(document);
  addFooterTop(document);
  addFooterMiddle(document);
  addFooterBottom(document);
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
  transformDOM: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    // define the main element: the one that will be transformed to Markdown
    const main = document.body;

    // use helper method to remove header, footer, etc.
    WebImporter.DOMUtils.remove(main, [
      'noscript',
      'main > section',
      'main > div',
      'header',
    ]);

    customImportLogic(document);
    // create the metadata block and append it to the main element
    createMetadata(main, document);

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
  }) => WebImporter.FileUtils.sanitizePath(new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, '')),
};
