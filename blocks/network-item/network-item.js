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

import { readBlockConfig } from '../../scripts/lib-franklin.js';
import { getNamedValueFromTable } from '../../scripts/scripts.js';

function addCareerTagColor(tagDiv) {
  if (tagDiv.innerText === 'Oral Care' || tagDiv.innerText === 'Mouth & Body') {
    tagDiv.classList.add('blue');
  } else if (tagDiv.innerText === 'Safety & Mobility') {
    tagDiv.classList.add('yellow');
  } else if (tagDiv.innerText === 'Living Environment') {
    tagDiv.classList.add('green');
  } else if (tagDiv.innerText === 'Health & Beauty') {
    tagDiv.classList.add('orange');
  }
}

function createTagsDiv(tags) {
  const tagsDiv = document.createElement('div');
  tagsDiv.classList.add('tags');
  tags.forEach((tag) => {
    const tagDiv = document.createElement('div');
    tagDiv.innerText = tag.trim();
    addCareerTagColor(tagDiv);
    tagsDiv.append(tagDiv);
  });
  return tagsDiv;
}

function createWebsiteDiv(website) {
  const websiteDiv = document.createElement('div');
  websiteDiv.classList.add('website');
  const websiteA = document.createElement('a');
  websiteA.href = website;
  websiteA.innerText = 'View Website';
  websiteDiv.append(websiteA);
  return websiteDiv;
}

function createCareerOpportunitiesDiv() {
  const careerOpportunitiesDiv = document.createElement('div');
  const careerOpportunitiesStrong = document.createElement('strong');
  careerOpportunitiesDiv.classList.add('career-opportunities');
  careerOpportunitiesStrong.innerText = 'Career Opportunities';
  careerOpportunitiesDiv.append(careerOpportunitiesStrong);
  return careerOpportunitiesDiv;
}

function createOurHrDiv() {
  const ourHrDiv = document.createElement('div');
  ourHrDiv.classList.add('our-hr');
  const ourHrA = document.createElement('a');
  ourHrA.href = 'https://www.sunstar.com/contact/';
  ourHrA.innerText = 'Our HR Department';
  ourHrDiv.append(ourHrA);
  return ourHrDiv;
}

function createRecruitingLinkDiv(recruitingLink, recruitingLinkText) {
  const recruitingLinkDiv = document.createElement('div');
  recruitingLinkDiv.classList.add('recruiting-link');
  const recruitingLinkA = document.createElement('a');
  recruitingLinkA.href = recruitingLink;
  if (recruitingLinkText) {
    recruitingLinkA.innerText = recruitingLinkText;
  } else {
    recruitingLinkA.innerText = 'View Open Positions';
  }
  recruitingLinkDiv.append(recruitingLinkA);
  return recruitingLinkDiv;
}

function getImage(block) {
  const div = getNamedValueFromTable(block, 'Image');
  if (!div) return null;
  div.classList.add('network-item-img');
  return div;
}

function getText(block) {
  const div = getNamedValueFromTable(block, 'Content');
  if (!div) return null;
  div.classList.add('network-item-text');
  return div;
}

export default function decorate(block) {
  const blockCfg = readBlockConfig(block);
  const image = getImage(block);
  const text = getText(block);
  const hasImage = !!blockCfg.image;

  let { title } = blockCfg;

  if (Array.isArray(blockCfg.title)) {
    title = title.join('\n');
  }

  const tags = [...blockCfg.tags.split(',')];

  const recruitingLink = blockCfg['recruiting-link'];
  const recruitingLinkText = blockCfg['recruiting-link-text'];

  const { website } = blockCfg;
  let websiteDiv;
  let recruitingLinkDiv;

  const titleDiv = document.createElement('h3');
  titleDiv.classList.add('title');
  titleDiv.innerText = title;

  const tagsDiv = createTagsDiv(tags);

  if (recruitingLink) {
    recruitingLinkDiv = createRecruitingLinkDiv(recruitingLink, recruitingLinkText);
  }

  if (website) {
    websiteDiv = createWebsiteDiv(website);
  }

  const ourHrDiv = createOurHrDiv();

  block.replaceChildren(titleDiv, tagsDiv);

  if (website) {
    block.append(websiteDiv);
  }

  const careerOpportunitiesDiv = createCareerOpportunitiesDiv();
  if (!hasImage) {
    block.append(careerOpportunitiesDiv);
  }

  if (recruitingLink) {
    block.append(recruitingLinkDiv);
  }

  if (!hasImage) {
    block.append(ourHrDiv);
  }

  if (hasImage && image) {
    const contentWrapper = document.createElement('div');
    const textContentWrapper = document.createElement('div');
    textContentWrapper.classList.add('text-content-wrapper');

    if (website) {
      textContentWrapper.append(text, websiteDiv);
    } else {
      textContentWrapper.append(text);
    }

    contentWrapper.classList.add('content-wrapper');
    contentWrapper.append(image, textContentWrapper);

    block.replaceChildren(titleDiv, tagsDiv, contentWrapper);
  }

  return block;
}
