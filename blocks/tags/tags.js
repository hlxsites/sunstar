import { fetchPlaceholders, getMetadata } from '../../scripts/lib-franklin.js';
import { getLanguage } from '../../scripts/scripts.js';

/**
* decorates the tags block
* @param {Element} block The social block element
*/

const getModifiedVal = (item) => {
  if (item) {
    return item.trim().toLowerCase()
      .split(' ')
      .filter(Boolean)
      .join('-');
  }
  return '';
};

export default async function decorate(block) {
  const tags = getMetadata('article:tag');
  const placeholders = await fetchPlaceholders(getLanguage());

  if (placeholders && tags) {
    const newMap = {};
    Object.keys(placeholders).forEach((entry) => {
      const newEntry = getModifiedVal(entry);
      newMap[newEntry] = placeholders[entry];
    });

    tags.split(', ').forEach((tag) => {
      const newTag = getModifiedVal(tag);
      const val = newMap[`${newTag}-href`] || '#';
      const a = document.createElement('a');
      a.href = val;
      a.textContent = tag;
      a.classList.add('button', 'primary');
      block.appendChild(a);
    });

    const tagsSectionContainer = block.closest('.section.tags-container>.section-container');
    const p = tagsSectionContainer?.querySelector('p');

    if (p) {
      tagsSectionContainer.classList.add('para-present');
    }
  }
}
