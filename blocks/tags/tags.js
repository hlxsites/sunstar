import { getMetadata } from '../../scripts/lib-franklin.js';
import { getLanguage, fetchTagsOrCategories } from '../../scripts/scripts.js';

/**
* decorates the tags block
* @param {Element} block The social block element
*/
export default async function decorate(block) {
  const metadataTag = getMetadata('article:tag') || [];
  let ids = [];
  const type = getMetadata('type') || '';

  if (!block.classList.contains('all') && metadataTag) {
    ids = metadataTag.toLowerCase().split(',').map((tag) => tag.trim());
  }

  const locale = getLanguage();
  const tags = await fetchTagsOrCategories(ids, 'tags', type, locale);

  if (tags.length) {
    const typeKey = type
      .toLowerCase().split(' ')
      .filter(Boolean)
      .join('-');
    tags.forEach((tag) => {
      const prefix = locale === 'en' ? '/' : `/${locale}/`;
      const hrefVal = `${prefix}${typeKey}/tag?feed-tags=${tag.id}`;
      const a = document.createElement('a');
      a.href = hrefVal || '#';
      a.textContent = tag.name || tag.id;
      a.classList.add('button', 'primary');
      block.appendChild(a);
    });
  }

  const tagsSectionContainer = block.closest('.section.tags-container>.section-container');
  const p = tagsSectionContainer?.querySelector('p');

  if (p) {
    tagsSectionContainer.classList.add('para-present');
  }
}
