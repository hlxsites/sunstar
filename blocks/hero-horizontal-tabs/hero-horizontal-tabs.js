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
import { createTabs, addTabs } from '../../scripts/blocks-utils.js';

function getImage(block) {
  const div = getNamedValueFromTable(block, 'Image');
  if (!div) return null;
  div.classList.add('hero-horiz-tabs-img');
  return div;
}

function getbutton(block) {
  const div = getNamedValueFromTable(block, 'Button');
  if (!div) return null;
  const p = div.querySelectorAll('p');
  if (!p) return null;

  const botton = document.createElement('div');
  botton.classList.add('hero-horiz-tabs-text-button');
  const buttonLeft = document.createElement('div');
  buttonLeft.classList.add('hero-horiz-tabs-text-button-left');
  const buttonRight = document.createElement('div');
  buttonRight.classList.add('hero-horiz-tabs-text-button-right');
  p.forEach((item, index) => {
    if (index < 2) {
      buttonLeft.appendChild(item);
    } else if (index > 1 && index < 4) {
      buttonRight.appendChild(item);
    }
  });
  botton.appendChild(buttonLeft);
  botton.appendChild(buttonRight);
  block.classList.add('hero-horiz-tabs-with-button');
  return botton;
}

function getText(block) {
  const div = getNamedValueFromTable(block, 'Contents');
  if (!div) return null;
  const buttons = getbutton(block);
  if (buttons) div.appendChild(buttons);
  div.classList.add('hero-horiz-tabs-text');
  return div;
}

export default function decorate(block) {
  const image = getImage(block);
  const text = getText(block);
  const tabs = createTabs(block, text);

  if (tabs) {
  // move the tab riders in front
    const wrapper = block.parentElement;
    const container = wrapper.parentElement;
    container.insertBefore(wrapper, container.firstElementChild);

    addTabs(tabs, block);
  } else {
    block.firstElementChild.remove();
    const divs = document.querySelectorAll('div'); // Select all div elements
    divs.forEach((div) => {
      if (div.textContent.trim() === 'Contents' || div.textContent.trim() === 'Button') {
        div.remove(); // Remove the div with the exact text content "Contents" and "Button"
      }
    });
  }
  if (image) {
    block.append(image);
  } else {
    block.classList.add('no-image');
  }
}
