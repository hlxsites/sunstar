import { readBlockConfig } from '../../scripts/lib-franklin.js';
import { getNamedValueFromTable } from '../../scripts/scripts.js';

function addImage(mediaRow, target, ...classes) {
  const mediaDiv = document.createElement('div');
  classes.forEach((c) => mediaDiv.classList.add(c));
  const pictureTag = mediaRow.querySelector('picture');
  mediaDiv.appendChild(pictureTag);
  target.appendChild(mediaDiv);

  return mediaDiv;
}

function deleteConfigBlock(block, firstNonCfgEl) {
  while (block.children.length > 0 && block.children[0] !== firstNonCfgEl) {
    block.children[0].remove();
  }
}

function addTextEl(tag, txt, parent, ...classes) {
  const newDiv = document.createElement(tag);
  newDiv.textContent = txt;
  classes.forEach((c) => newDiv.classList.add(c));
  parent.appendChild(newDiv);
}

export default function decorate($block) {
  const section = document.querySelector('.section.career-hero-container');
  if (section) {
    section.classList.add('full-width');
  }

  const cfg = readBlockConfig($block);

  const bgimg = cfg['hero-background'];
  const s = `background-image: url(${bgimg})`;
  $block.style = s;

  const heroDiv = document.createElement('div');
  heroDiv.classList.add('career-hero-top');
  $block.appendChild(heroDiv);

  const heroLeft = document.createElement('div');
  heroLeft.classList.add('career-hero-left');
  heroDiv.appendChild(heroLeft);
  const photo = getNamedValueFromTable($block, 'photo');
  addImage(photo, heroLeft, 'career-hero-photo');
  addTextEl('h6', cfg.name, heroLeft, 'career-hero-name');
  addTextEl('p', cfg.title, heroLeft, 'career-hero-title');

  const heroRight = document.createElement('div');
  heroRight.classList.add('career-hero-right');
  heroDiv.appendChild(heroRight);
  addTextEl('blockquote', cfg.quote, heroRight, 'career-hero-quote');
  addTextEl('h6', 'Career background', heroRight, 'career-hero-careerbgtitle'); // TODO i18n
  addTextEl('p', cfg['career-background'], heroRight, 'career-hero-careerbg');

  deleteConfigBlock($block, heroDiv);
}
