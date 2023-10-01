import {
  buildBlock, createOptimizedPicture, decorateBlock, loadBlock, readBlockConfig, getMetadata,
} from '../../scripts/lib-franklin.js';
import { formatDateFromUnixTimestamp, queryIndex } from '../../scripts/scripts.js';

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
            div.textContent = formatDateFromUnixTimestamp(result[fieldName]);
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
  const blockType = blockCfg['block-type'].trim().toLowerCase();
  const queryObj = await queryIndex();

  const results = queryObj.where((el) => {
    let match = true;
    const category = blockCfg.category || getMetadata('category');
    if (match && category) {
      match = el.category === category;
    }

    const topic = blockCfg.topic || getMetadata('topic');
    if (match && topic) {
      match = el.topic === topic;
    }
    if (match && blockCfg.modifier) {
      match = el.modifier === blockCfg.modifier;
    }
    return match;
  }).orderByDescending((el) => {
    if (blockCfg.sort) {
      return el[blockCfg.sort];
    }
    return el.path;
  }).take(blockCfg.count)
    .toList();
  block.innerHTML = '';
  const blockContents = resultParsers[blockType](results, blockCfg);
  const builtBlock = buildBlock(blockType, blockContents);
  block.parentNode.replaceChild(builtBlock, block);
  decorateBlock(builtBlock);
  await loadBlock(builtBlock);
  return builtBlock;
}
