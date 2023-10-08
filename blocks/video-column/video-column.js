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

function getVideo(block, videoImage) {
  const video = getNamedValueFromTable(block, 'Video');
  const div = document.createElement('div');
  div.classList.add('video-column-img');
  div.append(video.children[0]);

  if (videoImage) {
    const picture = videoImage.querySelector('picture');
    picture.classList.add('video-column-img', 'video-image');
    const a = div.querySelector('a');
    a.replaceChildren(picture);
    a.classList.remove('button');
  }

  return div;
}

function applyAnchorToWholeBlock(block, video) {
  const videoA = block.querySelector('a');
  video.remove(videoA);
  const blockChildren = block.children;
  videoA.appendChild(...blockChildren);
  block.replaceChildren(videoA);
}

function getVideoImage(block) {
  const div = getNamedValueFromTable(block, 'Video-image');
  if (!div) return null;
  div.classList.add('video-column-img');
  return div;
}

function getText(block) {
  const div = getNamedValueFromTable(block, 'Content');
  if (!div) return null;
  div.classList.add('video-column-text');
  return div;
}

export default function decorate(block) {
  const videoImage = getVideoImage(block);
  const video = getVideo(block, videoImage);
  const text = getText(block);

  const container = document.createElement('div');
  container.classList.add('video-column-container');

  container.appendChild(video);
  container.appendChild(text);

  block.replaceChildren(container);
  applyAnchorToWholeBlock(container, video);

  return block;
}
