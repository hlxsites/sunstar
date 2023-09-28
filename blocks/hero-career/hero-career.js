import {
  createOptimizedPicture,
  getMetadata,
  readBlockConfig,
} from '../../scripts/lib-franklin.js';

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
  const section = document.querySelector('.section.hero-career-container');
  if (section) {
    section.classList.add('full-width');
  }

  const cfg = readBlockConfig($block);

  const bgimg = cfg['hero-background'];
  const s = `background-image: url(${bgimg})`;
  $block.style = s;

  const heroDiv = document.createElement('div');
  heroDiv.classList.add('hero-career-top');
  $block.appendChild(heroDiv);

  const heroLeft = document.createElement('div');
  heroLeft.classList.add('hero-career-left');
  heroDiv.appendChild(heroLeft);

  const photoURL = getMetadata('og:image');
  const pic = createOptimizedPicture(photoURL, cfg.name);
  heroLeft.append(pic);
  addTextEl('h6', cfg.name, heroLeft, 'hero-career-name');
  addTextEl('p', cfg.title, heroLeft, 'hero-career-title');

  const heroRight = document.createElement('div');
  heroRight.classList.add('hero-career-right');
  heroDiv.appendChild(heroRight);
  addTextEl('blockquote', cfg.quote, heroRight, 'hero-career-quote');
  addTextEl('h6', 'Career background', heroRight, 'hero-career-careerbgtitle'); // TODO i18n
  addTextEl('p', cfg['career-background'], heroRight, 'hero-career-careerbg');

  deleteConfigBlock($block, heroDiv);
}
