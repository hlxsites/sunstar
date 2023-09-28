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

import { getNamedValueFromTable } from '../../scripts/scripts.js';

export function createTabs(block, text) {
  const ul = block.querySelector('ul');
  if (!ul) return null;

  const tabs = [...ul.querySelectorAll('li')].map((li) => {
    const title = li.textContent;
    const name = title.toLowerCase().trim();
    return {
      title,
      name,
      $tab: li,
    };
  });

  const panel = document.createElement('div');
  panel.classList.add('hero-horiz-tabs-panel');
  if (text) panel.appendChild(text);

  const nav = document.createElement('nav');
  nav.classList.add('hero-horiz-tabs-nav');

  nav.replaceChildren(ul);
  panel.appendChild(nav);
  block.replaceChildren(panel);

  // search referenced sections and move them inside the tab-container
  const wrapper = block.parentElement;
  const container = wrapper.parentElement;
  const sections = document.querySelectorAll('[data-tab]');

  // move the tab's sections before the tab riders.
  [...sections].forEach((tabContent) => {
    const name = tabContent.dataset.tab.toLowerCase().trim();

    const tab = tabs.find((t) => t.name === name);
    if (tab) {
      const sectionWrapper = document.createElement('div');

      // copy the classes from the section to the wrapper
      [...tabContent.classList].forEach((c) => {
        sectionWrapper.classList.add(c);
      });

      const tabDiv = document.createElement('div');
      tabDiv.classList.add('tab-item');
      tabDiv.append(...tabContent.children);
      sectionWrapper.append(tabDiv);
      container.insertBefore(sectionWrapper, wrapper);

      // remove it from the dom
      tabContent.remove();
      tab.$content = tabDiv;
    }
  });
  return tabs;
}

function getImage(block) {
  const div = getNamedValueFromTable(block, 'Image');
  if (!div) return null;
  div.classList.add('hero-horiz-tabs-img');
  return div;
}

function getText(block) {
  const div = getNamedValueFromTable(block, 'Contents');
  if (!div) return null;
  div.classList.add('hero-horiz-tabs-text');
  return div;
}

export default function decorate(block) {
  const image = getImage(block);
  const text = getText(block);
  const tabs = createTabs(block, text);

  // move the tab riders in front
  const wrapper = block.parentElement;
  const container = wrapper.parentElement;
  container.insertBefore(wrapper, container.firstElementChild);

  tabs.forEach((tab, index) => {
    const button = document.createElement('button');
    const { $tab, title, name } = tab;
    button.textContent = title.split(',');
    button.classList.add('tab');

    $tab.replaceChildren(button);

    $tab.addEventListener('click', () => {
      const activeButton = block.querySelector('button.active');

      if (activeButton !== $tab) {
        activeButton.classList.remove('active');
        // remove active class from parent li
        activeButton.parentElement.classList.remove('active');
        button.classList.add('active');
        // add active class to parent li
        $tab.classList.add('active');

        tabs.forEach((t) => {
          if (name === t.name) {
            t.$content.classList.add('active');
          } else {
            t.$content.classList.remove('active');
          }
        });
      }
    });

    if (index === 0) {
      button.classList.add('active');
      // add active class to parent li
      $tab.classList.add('active');
      if (tab.$content) {
        tab.$content.classList.add('active');
      }
    }
  });

  if (image) {
    block.append(image);
  } else {
    block.classList.add('no-image');
  }
}
