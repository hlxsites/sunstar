import { getMetadata } from '../../scripts/lib-franklin.js';
import { decorateAnchors, getLanguage, fetchTagsOrCategories } from '../../scripts/scripts.js';

const getSocialPaths = (type) => {
  let anchorHref = '';
  const currPath = document.location.href;
  const pageName = getMetadata('pagename') || '';

  if (type === 'facebook') {
    anchorHref = `https://www.facebook.com/sharer?u=${currPath}&t=${pageName}`;
  } else if (type === 'twitter') {
    anchorHref = `http://twitter.com/intent/tweet?text=${pageName}&url=${currPath}`;
  } else if (type === 'linkedin') {
    const source = 'Sunstar Group';
    anchorHref = `http://www.linkedin.com/shareArticle?mini=true&url=${currPath}&title=${pageName}&source=${source}`;
  }

  return anchorHref;
};

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

    if (childs.length === 0) {
      const socialIcons = ['facebook', 'twitter', 'linkedin'];
      socialIcons.forEach((x) => {
        const outerDiv = document.createElement('div');
        const firstInnerDiv = document.createElement('div');
        firstInnerDiv.textContent = x;
        const secondInnerDiv = document.createElement('div');
        const anchor = document.createElement('a');
        anchor.href = getSocialPaths(x);
        secondInnerDiv.appendChild(anchor);
        outerDiv.appendChild(firstInnerDiv);
        outerDiv.appendChild(secondInnerDiv);
        childs.push(outerDiv);
      });
    }

    childs.forEach((x) => {
      const anchor = x.querySelector('a');
      const span = document.createElement('span');
      const newAnchor = document.createElement('a');
      const firstGrandChild = x.querySelector('div');
      const firstGrandChildLower = firstGrandChild.innerText.toLowerCase();
      const anchorHref = anchor?.href || getSocialPaths(firstGrandChildLower);
      newAnchor.href = anchorHref.replaceAll(/%5C%5C&/g, '&'); // Replacing extra backslash which is getting appended
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
      const a = document.createElement('a');
      a.classList.add('category-title');
      a.setAttribute('aria-label', 'Category Title');
      a.href = hrefVal || '#';
      a.textContent = category?.name ?? categoryMetadata;
      firstH1.insertAdjacentElement('beforebegin', a);
    }

    decorateAnchors(block);
  }
}
