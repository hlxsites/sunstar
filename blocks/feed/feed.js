import {
  buildBlock, decorateBlock, loadBlock, readBlockConfig,
} from '../../scripts/lib-franklin.js';
import { queryIndex } from '../../scripts/scripts.js';

const resultParsers = {
  cards: (results) => {
    const blockContents = [];
    results.forEach((result) => {
      const resultTitle = document.createElement('div');
      resultTitle.textContent = result.title;
      blockContents.push([resultTitle]);
    });
    return blockContents;
  },
};

export default async function decorate(block) {
  const blockCfg = readBlockConfig(block);
  const blockType = blockCfg['block-type'];
  const queryObj = await queryIndex();

  const results = queryObj.where((el) => {
    let match = true;
    if (match && blockCfg.category) {
      match = el.category === blockCfg.category;
    }
    if (match && blockCfg.topic) {
      match = el.type === blockCfg.topic;
    }
    return match;
  }).take(blockCfg.count).toList();
  block.innerHTML = '';
  const blockContents = resultParsers[blockType](results);
  const builtBlock = buildBlock(blockType, blockContents);
  block.parentNode.replaceChild(builtBlock, block);
  decorateBlock(builtBlock);
  await loadBlock(builtBlock);
  return builtBlock;
}
