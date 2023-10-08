import { fetchPlaceholders } from '../../scripts/lib-franklin.js';
import { decorateAnchors, getLanguage } from '../../scripts/scripts.js';

const getModifiedVal = (item) => {
  if (item) {
    return item.trim().toLowerCase()
      .split(' ')
      .filter(Boolean)
      .join('-');
  }
  return '';
};

/**
 * decorates the social block
 * @param {Element} block The social block element
 */
export default async function decorate(block) {
  const childs = Array.from(block.children);
  const spanWithImg = [];

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
  const firstP = socialContainer?.querySelector('p');

  if (firstP?.nextElementSibling?.tagName === 'H1') {
    const innerSpan = document.createElement('span');
    innerSpan.textContent = firstP.textContent;
    innerSpan.classList.add('tag-name');
    firstP.replaceWith(innerSpan);
  }

  const firstH4 = socialContainer?.querySelector('h4');

  if (firstH4?.nextElementSibling?.tagName === 'H1') {
    const { textContent } = firstH4;
    const placeholders = await fetchPlaceholders(getLanguage());
    const newMap = {};
    Object.keys(placeholders).forEach((entry) => {
      const newEntry = getModifiedVal(entry);
      newMap[newEntry] = placeholders[entry];
    });

    const modifiedTextContent = getModifiedVal(textContent);
    const val = newMap[`${modifiedTextContent}-href`] || '#';
    const a = document.createElement('a');
    a.href = val;
    a.textContent = textContent;
    firstH4.innerHTML = '';
    firstH4.appendChild(a);
  }

  decorateAnchors(block);
}
