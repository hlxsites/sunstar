import {
  decorateButtons,
  decorateSections,
  getMetadata,
  updateSectionsStatus,
} from '../../scripts/lib-franklin.js';

import {
  getLanguage,
  decorateAnchors,
} from '../../scripts/scripts.js';

function decorateFooterTop(block) {
  const footerTop = block.querySelector('.footer-top');
  const tempDiv = footerTop.querySelector('.section-container>div');
  const children = [...footerTop.querySelector('.section-container>div').children];
  let index = 0;
  tempDiv.innerHTML = '';

  while (index < children.length) {
    const topItem = document.createElement('div');
    topItem.classList.add('footer-top-item');
    topItem.appendChild(children[index]);
    index += 1;

    while (index < children.length) {
      if (children[index].tagName === 'H5') {
        if (!children[index + 1] || (children[index - 1].tagName === 'H5' && children[index + 1].tagName !== 'UL')) {
          topItem.appendChild(children[index]);
        } else {
          break;
        }
      } else {
        topItem.appendChild(children[index]);
      }
      index += 1;
    }

    tempDiv.appendChild(topItem);
  }
}

function decorateFooter(block) {
  decorateFooterTop(block);
  block.parentElement.classList.add('appear');
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  block.textContent = '';

  // fetch footer content
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta || (getLanguage() === 'en' ? '/footer' : `/${getLanguage()}/footer`);
  const resp = await fetch(`${footerPath}.plain.html`, window.location.pathname.endsWith('/footer') ? { cache: 'reload' } : {});

  if (resp.ok) {
    const html = await resp.text();

    // decorate footer DOM
    const footer = document.createElement('div');
    footer.innerHTML = html;
    decorateSections(footer);
    updateSectionsStatus(footer);

    block.append(footer);

    decorateButtons(block);
    decorateFooter(block);
    decorateAnchors(block);
  }
}
