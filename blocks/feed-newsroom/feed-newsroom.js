import {
  buildBlock, createOptimizedPicture, decorateBlock,
  getFormattedDate, getMetadata, loadBlock, readBlockConfig,
} from '../../scripts/lib-franklin.js';
import { queryIndex, getLanguage, fetchTagsOrCategories } from '../../scripts/scripts.js';

// Result parsers parse the query results into a format that can be used by the block builder for
// the specific block types
const resultParsers = {
// Parse results into a highlight block

  highlight: (results, blockCfg, locale) => {
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
          } else if (fieldName === 'description') {
            const firstJpLine = (locale === 'jp') ? result[fieldName].split('。')[0] : result[fieldName].split('. ')[0];
            div.textContent = firstJpLine;
          } else {
            div.textContent = result[fieldName];
          }
          cardBody.appendChild(div);
        }
      });
      if (cardImage) {
        const pathImg = document.createElement('a');
        pathImg.href = result.path;
        pathImg.append(cardImage);
        row.push(pathImg);
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

// The below function is leveraged for View More button functionality
// eslint-disable-next-line
async function loadMoreResults(block, blockType, results, blockCfg, loadMoreContainer, chunk, locale) {
  const currentResults = document.querySelectorAll('.other').length;
  const slicedResults = results.slice(currentResults, currentResults + chunk);
  const blockContents = resultParsers[blockType](slicedResults, blockCfg, locale);
  const builtBlock = buildBlock(blockType, blockContents);
  [...block.classList].forEach((item) => {
    if (item !== 'feed') {
      builtBlock.classList.add(item);
    }
  });
  // await loadBlock(builtBlock);
  builtBlock.querySelectorAll(':scope > div').forEach((div) => {
    div.classList.add('other');
  });
  const parentBlock = document.querySelector('.block.feed-newsroom > .others');
  parentBlock.append(...builtBlock.childNodes);
  if ((results.length - currentResults) > chunk) {
    parentBlock.append(loadMoreContainer);
  } else loadMoreContainer.remove();
}

// This is the default loading of the results
async function loadResults(block, blockType, results, blockCfg, chunk, filterDiv, locale) {
  let slicedResults = 0;
  let loadMoreContainer = 0;
  let currentResults = 0;
  if (results.length > chunk) {
    currentResults = document.querySelectorAll('.other').length;
    slicedResults = results.slice(currentResults, currentResults + chunk);
    loadMoreContainer = document.createElement('div');
    loadMoreContainer.innerHTML = '<button class="load-more-button">View more</button>';
    loadMoreContainer.classList.add('load-more-container');
    loadMoreContainer.addEventListener('click', () => {
      loadMoreResults(block, blockType, results, blockCfg, loadMoreContainer, chunk, locale);
    });
  } else slicedResults = results;
  const blockContents = resultParsers[blockType](slicedResults, blockCfg, locale);
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
  builtBlock.before(filterDiv);

  // In order to place fragment block to the right side of the page
  const downloadCenter = document.querySelectorAll('.feed-newsroom-container > .section-container > div:not(.feed-newsroom-wrapper)');
  const rightDiv = document.createElement('div');
  downloadCenter.forEach((x) => { rightDiv.append(x); });
  rightDiv.classList.add('others');
  builtBlock.append(rightDiv);

  if (results.length > currentResults) {
    const mobileMedia = window.matchMedia('(max-width: 992px)');
    if (mobileMedia.matches) {
      builtBlock.querySelector('.others').after(loadMoreContainer);
    } else builtBlock.after(loadMoreContainer);
  } else loadMoreContainer.remove();

  return builtBlock;
}

// The Below function is leveraged for loading results when any year is selected in the dropdown
async function loadYearResults(block, blockType, results, blockCfg, locale) {
  let slicedResults = 0;
  const parentBlock = document.querySelector('.block.feed-newsroom > .others');
  if (parentBlock.parentNode.nextElementSibling) parentBlock.parentNode.nextElementSibling.remove();
  parentBlock.innerHTML = '';
  slicedResults = results;
  const blockContents = resultParsers[blockType](slicedResults, blockCfg, locale);
  const builtBlock = buildBlock(blockType, blockContents);

  [...block.classList].forEach((item) => {
    if (item !== 'feed') {
      builtBlock.classList.add(item);
    }
  });
  builtBlock.querySelectorAll(':scope > div').forEach((div) => {
    div.classList.add('other');
  });
  parentBlock.append(...builtBlock.childNodes);
}

/**
   * Feed block decorator to build feeds based on block configuration
   */
export default async function decorate(block) {
  const chunk = 15;
  const blockType = 'highlight';
  const blockCfg = readBlockConfig(block);
  const locale = getLanguage();
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
  // Creation of Category, Year and filter
  const filterDiv = document.createElement('div');
  filterDiv.innerHTML = `<form action="#results">
  <div class="filter-nav">
    <span>
      <select class="form-control" name="" id="news_category">
        <option value="">Category</option>
        </select>
    </span>
    <span>
      <select class="form-control" name="" id="news_year">
        <option value="">Year</option>
        </select>
    </span>
    <button data-nonce="8411f43402" data-post_type="news" " id="news_filter">FILTER</button>
  </div>
</form>`;
  const uniqYears = Array.from(new Set(results.map((x) => { const itsDate = getFormattedDate(new Date(parseInt(x[blockCfg.sort.trim().toLowerCase()], 10))).split(', '); return parseInt(itsDate[itsDate.length - 1], 10); })));
  // eslint-disable-next-line
  const yroptions = uniqYears.reduce((accum, current) => { accum += "<option value='" + current + "'>" + current + "</option>"; return accum; }, "");
  filterDiv.querySelector('#news_year').innerHTML = filterDiv.querySelector('#news_year').innerHTML + yroptions;
  const categoryDetails = await fetchTagsOrCategories('', 'categories', 'newsroom', locale);
  // eslint-disable-next-line
  const categoryOptions = categoryDetails.reduce((accum, current) => { accum += "<option value='" + current.id + "'>" + current.name + "</option>"; return accum; }, "");
  filterDiv.querySelector('#news_category').innerHTML = filterDiv.querySelector('#news_category').innerHTML + categoryOptions;

  filterDiv.querySelector('form .filter-nav button').addEventListener('click', () => {
    const searchYear = Number(filterDiv.querySelector('form .filter-nav #news_year').value);
    const searchCategory = filterDiv.querySelector('form .filter-nav #news_category').value;
    let filteredResults = window.jslinq(results);
    if (searchYear) {
      filteredResults = filteredResults.where((el) => {
        const itsDate = getFormattedDate(new Date(parseInt(el[blockCfg.sort.trim().toLowerCase()], 10))).split(', ');
        return (parseInt(itsDate[itsDate.length - 1], 10) === searchYear);
      });
    }
    if (searchCategory) {
      filteredResults = filteredResults.where((el) => el.category === searchCategory);
    }
    loadYearResults(block, blockType, filteredResults.toList(), blockCfg, locale);
    if (searchYear && !searchCategory) {
      const { options } = filterDiv.querySelector('#news_category');
      for (let index = 0; index < options.length; index += 1) {
        if (options[index].text === 'News') {
          options[index].selected = true;
          break;
        }
      }
    }
  });
  loadResults(block, blockType, results, blockCfg, chunk, filterDiv, locale);
}
