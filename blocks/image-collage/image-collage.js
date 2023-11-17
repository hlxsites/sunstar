import { wrapImgsInLinks } from '../../scripts/scripts.js';

export default function decorate(block) {
  const children = [...block.children];

  const caption = block.classList.contains('image-with-caption');
  const title = block.classList.contains('image-with-title');

  if (caption || title) {
    children.forEach((x) => {
      const img = x.querySelector('picture');
      wrapImgsInLinks(x);
      if (img && img.parentElement && img.parentElement.nextElementSibling && img.parentElement.nextElementSibling.tagName === 'DIV') {
        if (caption) {
          img.parentElement.nextElementSibling.classList.add('image-caption');
        } else if (title) {
          img.parentElement.nextElementSibling.classList.add('image-title');
        }
      }
    });
  }

  const iconTitleList = block.classList.contains('icon-title-list');
  if (iconTitleList) {
    const textDiv = block.querySelectorAll(':scope>div>div:last-of-type');
    if (textDiv.length) {
      [...textDiv].forEach((div) => {
        if (!div.querySelector('p') && !div.querySelector('img') && div.textContent) {
          const p = document.createElement('p');
          p.textContent = div.textContent;
          div.textContent = '';
          div.appendChild(p);
        }
      });
    }
  }

  const iconTitleText = block.classList.contains('icon-title-text');
  if (iconTitleText) {
    [...block.children].forEach((row) => {
      const h4 = row.querySelector('h4');
      if (h4) {
        const firstDiv = row.querySelector(':scope>div:first-of-type');
        if (firstDiv && firstDiv.querySelector('img')) {
          firstDiv.appendChild(h4);
        }
      }
    });
  }
}
