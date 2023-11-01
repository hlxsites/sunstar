import {
  buildBlock, createOptimizedPicture, decorateBlock,
  getFormattedDate, getMetadata, loadBlock, readBlockConfig,
} from '../../scripts/lib-franklin.js';
import { queryIndex, getLanguage } from '../../scripts/scripts.js';

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
            div.textContent = getFormattedDate(new Date(parseInt(result[fieldName], 10)));
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

  highlight: (results, blockCfg) => {
    const blockContents = [];
    results.forEach((result) => {
      const fields = blockCfg.fields.split(',').map((field) => field.trim().toLowerCase());
      console.log(fields);
      const row = [];
      let cardImage;
      const cardBody = fields.includes('path') ? document.createElement('a') : document.createElement('div');
      fields.forEach((field) => {
        const fieldName = field.trim().toLowerCase();
        if (fieldName === 'path') {
          cardBody.href = result[fieldName];
        } else if (fieldName === 'image') {
          cardImage = createOptimizedPicture(result[fieldName]);
        } else {
          const div = document.createElement('div');
          if (fieldName === 'publisheddate') {
            div.classList.add('date');
            div.textContent = getFormattedDate(new Date(parseInt(result[fieldName], 10)));
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

function getMetadataNullable(key) {
  const meta = getMetadata(key);
  return meta === '' ? null : meta;
}

/**
   * Feed block decorator to build feeds based on block configuration
   */
export default async function decorate(block) {
  const blockCfg = readBlockConfig(block);
  console.log(blockCfg);
  const queryObj = await queryIndex(`${getLanguage()}-search`);
  console.log(queryObj);

  const omitPageTypes = getMetadataNullable('omit-page-types');
  // eslint-disable-next-line prefer-arrow-callback
  const results = queryObj.where(function filterElements(el) {
    const elPageType = (el.pagetype ?? '').trim().toLowerCase();
    let match = false;
    match = (!omitPageTypes || !(omitPageTypes.split(',').includes(elPageType)));
    return match;
  })
  // eslint-disable-next-line
    .orderByDescending((el) => (blockCfg.sort ? parseInt(el[blockCfg.sort.trim().toLowerCase()], 10) : el.path))
    .toList()
    .filter((x) => { const itsDate = getFormattedDate(new Date(parseInt(x[blockCfg.sort.trim().toLowerCase()], 10))).split(', '); return (parseInt(itsDate[itsDate.length - 1], 10) > 2007); });
  console.log(results);
  block.innerHTML = '';
  const blockType = 'highlight';
  const blockContents = resultParsers[blockType](results, blockCfg);
  const builtBlock = buildBlock(blockType, blockContents);

  [...block.classList].forEach((item) => {
    if (item !== 'feed') {
      builtBlock.classList.add(item);
    }
  });

  if (block.parentNode) {
    block.parentNode.replaceChild(builtBlock, block);
  }

  decorateBlock(builtBlock);
  await loadBlock(builtBlock);
  return builtBlock;
}
