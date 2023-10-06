import {
  buildBlock, createOptimizedPicture, decorateBlock,
  getFormattedDate, getMetadata, loadBlock, readBlockConfig,
} from '../../scripts/lib-franklin.js';
import { queryIndex } from '../../scripts/scripts.js';

// Result parsers parse the query results into a format that can be used by the block builder for
// the specific block types
const resultParsers = {
  // Parse results into a cards block
  cards: (results, blockCfg) => {
    const blockContents = [];
    results.forEach((result) => {
      const fields = blockCfg.fields.split(',');
      const row = [];
      let cardImage;
      const cardBody = document.createElement('div');
      fields.forEach((field) => {
        const fieldName = field.trim().toLowerCase();
        if (fieldName === 'image') {
          cardImage = createOptimizedPicture(result[fieldName]);
        } else {
          const div = document.createElement('div');
          if (fieldName === 'publisheddate') {
            div.classList.add('date');
            div.textContent = getFormattedDate(new Date(parseInt(result[fieldName] * 1000, 10)));
          } else if (fieldName === 'title') {
            div.classList.add('title');
            div.textContent = result[fieldName];
          } else {
            div.textContent = result[fieldName];
          }
          cardBody.appendChild(div);
        }
      });
      if (cardImage) {
        row.push(cardImage);
      }

      if (cardBody) {
        const path = document.createElement('a');
        path.href = result.path;
        cardBody.prepend(path);
        row.push(cardBody);
      }
      blockContents.push(row);
    });
    return blockContents;
  },
};

/**
 * Feed block decorator to build feeds based on block configuration
 */
export default async function decorate(block) {
  const blockCfg = readBlockConfig(block);
  const blockType = (blockCfg['block-type'] ?? 'cards').trim().toLowerCase();
  const queryObj = await queryIndex();

  const type = (blockCfg.type ?? getMetadata('type'))?.trim().toLowerCase();
  const category = (blockCfg.category ?? getMetadata('category'))?.trim().toLowerCase();
  // eslint-disable-next-line prefer-arrow-callback
  const results = queryObj.where(function filterElements(el) {
    const elType = (el.type ?? '').trim().toLowerCase();
    const elCategory = (el.category ?? '').trim().toLowerCase();
    const elFeatured = (el.featured ?? '').trim().toLowerCase();
    return (!type || type === elType)
      && (!category || category === elCategory)
      && (!blockCfg.featured || elFeatured === blockCfg.featured.trim().toLowerCase());
  })
    .orderByDescending((el) => (blockCfg.sort ? el[blockCfg.sort.trim().toLowerCase()] : el.path))
    .take(blockCfg.count ? parseInt(blockCfg.count, 10) : 4)
    .toList();
  block.innerHTML = '';
  const blockContents = resultParsers[blockType](results, blockCfg);
  const builtBlock = buildBlock(blockType, blockContents);
  if (block.parentNode) {
    block.parentNode.replaceChild(builtBlock, block);
  }

  decorateBlock(builtBlock);
  await loadBlock(builtBlock);
  return builtBlock;
}
