import { getMetadata } from '../../scripts/lib-franklin.js';
import { decorateAnchors, getLanguage, fetchTagsOrCategories } from '../../scripts/scripts.js';

/**
 * decorates the social block
 * @param {Element} block The social block element
 */
export default async function decorate(block) {
  if (block.classList.contains('general')) {
    // General Social Block Handling
    const anchors = [];

    [...block.children].forEach((child) => {
      const a = child.querySelector('a');
      a.removeAttribute('title');
      a.removeAttribute('class');
      const innerSpan = a.querySelector('span');
      if (innerSpan) {
        let innerSpanClass = [...innerSpan.classList].filter((x) => x !== 'icon')[0];
        innerSpanClass = innerSpanClass.replaceAll('icon-', '');
        a.classList.add(innerSpanClass);
        a.setAttribute('aria-label', `${innerSpanClass} share`);
      }
      anchors.push(a);
    });

    block.innerHTML = '';
    anchors.forEach((anchor) => {
      block.appendChild(anchor);
    });
  } else {
    const childs = Array.from(block.children);
    const spanWithImg = [];
    let categoryMetadata = getMetadata('category') || '';
    categoryMetadata = categoryMetadata.trim().toLowerCase();
    const type = getMetadata('type') || '';

    childs.forEach((x) => {
      const a = x.querySelector('a');
      const span = document.createElement('span');
      const newAnchor = document.createElement('a');
      const firstGrandChild = x.querySelector('div');
      const firstGrandChildLower = firstGrandChild.innerText.toLowerCase();
      newAnchor.href = a.href.replaceAll(/%5C%5C&/g, '&'); // Replacing extra backslash which is getting appended
      newAnchor.setAttribute('aria-label', `${firstGrandChildLower} share`);
      span.classList.add(`icon-${firstGrandChildLower}`, 'icon');
      newAnchor.appendChild(span);
      spanWithImg.push(newAnchor);
    });

    block.innerHTML = '';
    const span = document.createElement('span');
    span.innerText = 'SHARE';
    block.appendChild(span);

    spanWithImg.forEach((x) => {
      block.appendChild(x);
    });

    const socialContainer = block.closest('.section.social-container>.section-container');
    const firstH1 = socialContainer?.querySelector('h1');
    const typeKey = type
      .toLowerCase().split(' ')
      .filter(Boolean)
      .join('-');

    if (firstH1) {
      const locale = getLanguage();
      const prefix = locale === 'en' ? '/' : `/${locale}/`;
      const hrefVal = `${prefix}${typeKey}/${categoryMetadata}`;
      const categories = await fetchTagsOrCategories([categoryMetadata], 'categories', type, locale);
      const category = categories[0];
      const h4 = document.createElement('h4');
      const a = document.createElement('a');
      a.href = hrefVal || '#';
      a.textContent = category?.name ?? categoryMetadata;
      h4.appendChild(a);
      firstH1.insertAdjacentElement('beforebegin', h4);
    }

    decorateAnchors(block);
  }
}
