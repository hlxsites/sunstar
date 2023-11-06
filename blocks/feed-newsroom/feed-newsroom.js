import {
  buildBlock, createOptimizedPicture, decorateBlock,
  getFormattedDate, getMetadata, loadBlock, readBlockConfig,
} from '../../scripts/lib-franklin.js';
import { queryIndex, getLanguage } from '../../scripts/scripts.js';

// Result parsers parse the query results into a format that can be used by the block builder for
// the specific block types
const resultParsers = {
// Parse results into a highlight block

  highlight: (results, blockCfg) => {
    const blockContents = [];
    results.forEach((result) => {
      const fields = blockCfg.fields.split(',').map((field) => field.trim().toLowerCase());
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

async function loadMoreResults(block, blockType, results, blockCfg, loadMoreContainer, chunk) {
  const currentResults = document.querySelectorAll('.other').length;
  const slicedResults = results.slice(currentResults, currentResults + chunk);
  const blockContents = resultParsers[blockType](slicedResults, blockCfg);
  const builtBlock = buildBlock(blockType, blockContents);
  [...block.classList].forEach((item) => {
    if (item !== 'feed') {
      builtBlock.classList.add(item);
    }
  });
  await loadBlock(builtBlock);
  builtBlock.querySelectorAll(':scope > div').forEach((div) => {
    div.classList.add('other');
  });
  const parentBlock = document.querySelector('.block.feed-newsroom > .others');
  parentBlock.append(...builtBlock.childNodes);
  if ((results.length - currentResults) > chunk) {
    parentBlock.append(loadMoreContainer);
  } else loadMoreContainer.remove();
}

/**
   * Feed block decorator to build feeds based on block configuration
   */
export default async function decorate(block) {
  let slicedResults = 0;
  let loadMoreContainer = 0;
  let currentResults = 0;
  const blockCfg = readBlockConfig(block);
  const queryObj = await queryIndex(`${getLanguage()}-search`);

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
    .filter((x) => { const itsDate = getFormattedDate(new Date(parseInt(x[blockCfg.sort.trim().toLowerCase()], 10))).split(', '); return (parseInt(itsDate[itsDate.length - 1], 10) > 2000); });
  block.innerHTML = '';
  const uniqYears = Array.from(new Set(results.map((x) => { const itsDate = getFormattedDate(new Date(parseInt(x[blockCfg.sort.trim().toLowerCase()], 10))).split(', '); return parseInt(itsDate[itsDate.length - 1], 10); })));
  console.log(uniqYears);
  const blockType = 'highlight';
  const chunk = 15;
  if (results.length > chunk) {
    // const factor = Math.trunc(results.length / chunk);
    currentResults = document.querySelectorAll('.other').length;
    slicedResults = results.slice(currentResults, currentResults + chunk);
    loadMoreContainer = document.createElement('div');
    loadMoreContainer.innerHTML = '<button class="author-list-load-more-button">View more</button>';
    loadMoreContainer.classList.add('load-more-container');
    loadMoreContainer.addEventListener('click', () => {
      loadMoreResults(block, blockType, results, blockCfg, loadMoreContainer, chunk);
    });
  } else slicedResults = results;
  const blockContents = resultParsers[blockType](slicedResults, blockCfg);
  const builtBlock = buildBlock(blockType, blockContents);

  [...block.classList].forEach((item) => {
    if (item !== 'feed') {
      builtBlock.classList.add(item);
    }
  });
  // Creation of filter and year buttons
  const filterDiv = document.createElement('div');
  const div1 = document.createElement('div');
  const div2 = document.createElement('div');
  div1.innerText = 'Year';
  div2.innerText = 'Filter';
  filterDiv.appendChild(div1);
  filterDiv.appendChild(div2);

  if (block.parentNode) {
    block.parentNode.replaceChild(builtBlock, block);
  }

  decorateBlock(builtBlock);
  await loadBlock(builtBlock);
  builtBlock.before(filterDiv);
  if ((results.length - currentResults) > chunk) {
    builtBlock.after(loadMoreContainer);
  } else loadMoreContainer.remove();
  return builtBlock;
}