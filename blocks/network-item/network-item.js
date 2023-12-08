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

import { readBlockConfig, fetchPlaceholders } from '../../scripts/lib-franklin.js';
import { getNamedValueFromTable, getLanguage, decorateExternalAnchors } from '../../scripts/scripts.js';

function addTagColors(tagDiv) {
  if (tagDiv.innerText === 'Oral Care' || tagDiv.innerText === 'Mouth & Body') {
    tagDiv.classList.add('blue');
  } else if (tagDiv.innerText === 'Safety & Mobility') {
    tagDiv.classList.add('yellow');
  } else if (tagDiv.innerText === 'Living Environment') {
    tagDiv.classList.add('green');
  } else if (tagDiv.innerText === 'Health & Beauty') {
    tagDiv.classList.add('orange');
  } else {
    tagDiv.classList.add('gray');
  }
}

function createTagsDiv(tags) {
  if (!tags) return null;
  const tagsDiv = document.createElement('div');
  tagsDiv.classList.add('tags');
  tags.forEach((tag) => {
    const tagDiv = document.createElement('div');
    tagDiv.innerText = tag.trim();
    addTagColors(tagDiv);
    tagsDiv.append(tagDiv);
  });
  return tagsDiv;
}

function createWebsiteDiv(website, placeholders) {
  if (!website) return null;
  const websiteDiv = document.createElement('div');
  websiteDiv.classList.add('website');
  const websiteA = document.createElement('a');
  websiteA.href = website;
  websiteA.innerText = placeholders['network-item-website-text'];
  decorateExternalAnchors([websiteA]);
  websiteDiv.append(websiteA);
  return websiteDiv;
}

function createCareerOpportunitiesDiv(placeholders) {
  const careerOpportunitiesDiv = document.createElement('div');
  const careerOpportunitiesStrong = document.createElement('strong');
  careerOpportunitiesDiv.classList.add('career-opportunities');
  careerOpportunitiesStrong.innerText = placeholders['career-opportunities-text'];
  careerOpportunitiesDiv.append(careerOpportunitiesStrong);
  return careerOpportunitiesDiv;
}

function createOurHrDiv(placeholders) {
  const ourHrDiv = document.createElement('div');
  ourHrDiv.classList.add('our-hr');
  const ourHrA = document.createElement('a');
  if (placeholders['our-hr-href']) {
    const url = new URL(placeholders['our-hr-href']);
    url.hostname = window.location.hostname;
    if (window.location.port) {
      url.port = window.location.port;
    }
    ourHrA.href = url.href;
  }

  ourHrA.innerText = placeholders['our-hr-text'];
  ourHrDiv.append(ourHrA);
  return ourHrDiv;
}

function createRecruitingLinkDiv(recruitingLink, recruitingLinkText) {
  if (!recruitingLink) return null;
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

function createTitle(title) {
  const titleH3 = document.createElement('h3');
  titleH3.classList.add('title');
  titleH3.innerText = title;
  return titleH3;
}

function getVideo(block, videoImage) {
  const video = getNamedValueFromTable(block, 'Video');
  const div = document.createElement('div');
  div.classList.add('network-item-img');
  div.append(video.children[0]);

  if (videoImage) {
    const picture = videoImage.querySelector('picture');
    picture.classList.add('network-item-img', 'video-image');
    const a = div.querySelector('a');
    a.replaceChildren(picture);
    a.classList.remove('button');
  }

  return div;
}

function getVideoImage(block) {
  const div = getNamedValueFromTable(block, 'Video-image');
  if (!div) return null;
  div.classList.add('network-item-img');
  return div;
}

export default async function decorate(block) {
  const placeholders = await fetchPlaceholders(getLanguage());
  const blockCfg = readBlockConfig(block);
  const hasMultimediaContent = !!blockCfg.image || !!blockCfg.video;
  const hasVideo = block.classList.contains('video');
  const hasVideoImage = hasVideo && !!blockCfg['video-image'];

  const image = blockCfg.image ? getImage(block) : null;
  const text = blockCfg.content ? getText(block) : null;
  const videoImage = hasVideoImage ? getVideoImage(block) : null;
  const video = hasVideo ? getVideo(block, videoImage) : null;
  const title = Array.isArray(blockCfg.title) ? blockCfg.title.join('\n') : blockCfg.title;
  const tags = blockCfg.tags ? [...blockCfg.tags.split(',')] : null;
  const recruitingLink = blockCfg['recruiting-link'];
  const recruitingLinkText = blockCfg['recruiting-link-text'];
  /* eslint-disable-next-line prefer-destructuring */
  const website = blockCfg.website;

  const websiteDiv = createWebsiteDiv(website, placeholders);
  const recruitingLinkDiv = createRecruitingLinkDiv(recruitingLink, recruitingLinkText);
  const titleH3 = createTitle(title);
  const tagsDiv = createTagsDiv(tags);
  const ourHrDiv = createOurHrDiv(placeholders);
  const careerOpportunitiesDiv = createCareerOpportunitiesDiv(placeholders);

  block.replaceChildren(titleH3);

  if (tags) {
    block.append(tagsDiv);
  }

  if (website) {
    block.append(websiteDiv);
  }

  if (!hasMultimediaContent) {
    block.append(careerOpportunitiesDiv);
  }

  if (recruitingLink) {
    block.append(recruitingLinkDiv);
  }

  if (!hasMultimediaContent) {
    block.append(ourHrDiv);
  }

  if (hasMultimediaContent) {
    const contentWrapper = document.createElement('div');
    const textContentWrapper = document.createElement('div');

    textContentWrapper.classList.add('text-content-wrapper');
    textContentWrapper.append(text);

    if (website) {
      textContentWrapper.append(websiteDiv);
    }

    contentWrapper.classList.add('content-wrapper');
    if (image) {
      contentWrapper.append(image);
    } else if (video) {
      contentWrapper.append(video);
    }
    contentWrapper.append(textContentWrapper);
    block.append(contentWrapper);
  }
  return block;
}
