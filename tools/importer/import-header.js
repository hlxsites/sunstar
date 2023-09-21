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

function getLanguage(url) {
  return `${url.split('/')[1]}`;
}

function addTopNav(document) {
  const ul = document.createElement('ul');
  Array.from(document.querySelector('nav.ss-header-top').children).forEach((el) => {
    const li = document.createElement('li');
    if (el.tagName === 'A') {
      if (el.classList.contains('other-site-menu')) {
        el.innerHTML = '<a href="https://www.sunstar.com/">Sunstar Group</a><a href="https://www.sunstar.com/"><span>:link-black:</span></a>';
      }
      li.append(el);
    } else if (el.tagName === 'SPAN' && el.classList.contains('links-social')) {
      li.textContent = '[social]';
      const social = document.createElement('ul');
      const linkedin = '<li><a class="link" target="_blank" href="https://www.linkedin.com/company/sunstar">:linkedin:</a></li>';
      const youtube = '<li><a class="link" target="_blank" href="https://www.youtube.com/channel/UCM7etMw7LLy-MlNmk9xPrdQ">:youtube:</a></li>';
      social.innerHTML = linkedin + youtube;
      li.append(social);
    } else if (el.tagName === 'SPAN' && el.classList.contains('lang-menu')) {
      li.textContent = '[languages]';
      const languages = document.createElement('ul');
      languages.innerHTML = `
        <li><a href="/">English</a></li>
        <li><a href="/cn/">简体中文</a></li>
        <li><a href="/th/">ไทย</a></li>
        <li><a href="/it/">Italiano</a></li>
        <li><a href="/ja/">日本語</a></li>
        <li><a href="/id/">Bahasa Indonesia</a></li>
        <li><a href="/de/">Deutsch</a></li>
      `;
      li.append(languages);
    }

    ul.append(li);
  });
  document.querySelector('nav.ss-header-top').after(document.createElement('hr'));
  document.querySelector('nav.ss-header-top').replaceWith(ul);
}

function addMidNav(document, url) {
  let lang = getLanguage(url);
  if (lang) {
    lang = `${lang}/`;
  }
  const midNav = document.querySelector('nav.ss-header-middle');
  if (midNav) {
    midNav.innerHTML = `
    <a href='https://main--sunstar--hlxsites.hlx.page/${lang}'>:sunstar-logo:</a>
    <h4>Sunstar</h4>
  `;
    midNav.after(document.createElement('hr'));
  }
}

function addBottomNav(document) {
  const ul = document.createElement('ul');
  const bottmNav = document.querySelector('nav.ss-header-bottom');
  bottmNav.querySelectorAll(':scope > ul > li:not(.d-lg-none):not(.mobile-content)').forEach((li) => {
    const a = li.querySelector('a');
    const newLi = document.createElement('li');
    newLi.append(a);
    ul.append(newLi);

    const megaSubMenu = li.querySelectorAll(':scope .mega .mega-sub-menu');
    if (megaSubMenu) {
      const level2UL = document.createElement('ul');
      megaSubMenu.forEach((item) => {
        const level2Li = document.createElement('li');
        level2Li.append(item.querySelector(':scope > h6 > a'));
        level2Li.querySelector('a').textContent += ':ang-white:';
        level2UL.append(level2Li);

        const level3UL = document.createElement('ul');
        item.querySelectorAll(':scope > a').forEach((item2) => {
          const level3Li = document.createElement('li');
          level3Li.append(item2);
          level3UL.append(level3Li);
        });
        level2Li.append(level3UL);
      });
      newLi.append(level2UL);
    }
  });
  bottmNav.replaceWith(ul);
}

function customImportLogic(document, url) {
  addTopNav(document);
  addMidNav(document, url);
  addBottomNav(document);
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
      'main',
      'footer',
    ]);

    customImportLogic(document, url);
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
