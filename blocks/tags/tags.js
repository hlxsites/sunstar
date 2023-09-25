import { getMetadata } from '../../scripts/lib-franklin.js';
import { fetchIndex } from '../../scripts/scripts.js';

/**
* decorates the tags block
* @param {Element} block The social block element
*/
export default async function decorate(block) {
  let tags = getMetadata('article:tag');
  const { data } = await fetchIndex('tags');

  if (data && tags) {
    tags = tags.split(', ');
    const tagsList = data;
    const tagsMap = {};

    tagsList.forEach((entry) => {
      tagsMap[entry.Name.trim()] = entry.Link.trim();
    });

    tags.forEach((tag) => {
      const newTag = tag.trim();
      if (tagsMap[newTag]) {
        const a = document.createElement('a');
        a.href = tagsMap[newTag];
        a.textContent = newTag;
        a.classList.add('button', 'primary');
        block.appendChild(a);
      }
    });

    const tagsSectionContainer = block.closest('.section.tags-container>.section-container');
    const p = tagsSectionContainer ? tagsSectionContainer.querySelector('p') : null;

    if (p) {
      tagsSectionContainer.classList.add('para-present');
    }
  }
}
