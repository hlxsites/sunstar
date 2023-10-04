import {
  buildBlock, createOptimizedPicture, decorateBlock, loadBlock, readBlockConfig,
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
      fields.forEach((field) => {
        const div = document.createElement('div');
        const fieldName = field.trim().toLowerCase();
        if (fieldName === 'image') {
          div.append(createOptimizedPicture(result[fieldName]));
        } else {
          div.textContent = result[fieldName];
        }
        row.push(div);
      });
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

  const results = queryObj.where((el) => (!blockCfg.type || blockCfg.type === el.type)
    && (!blockCfg.category || blockCfg.category === el.category)
    && (!blockCfg.modifier || el.modifier === blockCfg.modifier))
    .orderByDescending((el) => (blockCfg.sort ? el[blockCfg.sort] : el.path)).take(blockCfg.count)
    .toList();
  block.innerHTML = '';
  const blockContents = resultParsers[blockType](results, blockCfg);
  const builtBlock = buildBlock(blockType, blockContents);
  block.parentNode.replaceChild(builtBlock, block);
  decorateBlock(builtBlock);
  await loadBlock(builtBlock);
  return builtBlock;
}
