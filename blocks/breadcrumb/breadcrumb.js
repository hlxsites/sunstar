import {
  fetchIndex,
  fixExcelFilterZeroes,
  getLanguage,
  getLanguangeSpecificPath,
  fetchTagsOrCategories,
} from '../../scripts/scripts.js';
import { fetchPlaceholders, getMetadata } from '../../scripts/lib-franklin.js';

function prependSlash(path) {
  return path.startsWith('/') ? path : `/${path}`;
}

function renderBreadcrumb(breadcrumbs) {
  const li = document.createElement('li');
  li.classList.add('breadcrumb-item');

  li.innerHTML = (breadcrumbs.category_url_path || breadcrumbs.url_path) ? `
    <a href="${prependSlash(breadcrumbs.category_url_path ?? breadcrumbs.url_path)}">
        ${breadcrumbs.category_name ?? breadcrumbs.name}
    </a>
  ` : `${breadcrumbs.category_name ?? breadcrumbs.name}`;
  return li;
}

async function getTagPageTitle() {
  const type = getMetadata('type') || '';
  const locale = getLanguage();
  const tags = await fetchTagsOrCategories([], 'tags', type, locale);
  const queryString = window.location.search;
  const queryParams = new URLSearchParams(queryString);
  const feedTags = queryParams.get('feed-tags');
  let tagPageTitle = '';
  if (feedTags && tags.length) {
    const tag = tags.find((tagItem) => (feedTags.trim() === tagItem.id));
    if (tag && tag.name) {
      tagPageTitle = tag.name;
    }
  }
  return tagPageTitle;
}

async function createAutoBreadcrumb(block, placeholders) {
  const pageIndex = (await fetchIndex('query-index')).data;
  fixExcelFilterZeroes(pageIndex);
  const { pathname } = window.location;
  const pathSeparator = '/';
  // eslint-disable-next-line max-len
  const urlForIndex = (index) => prependSlash(pathname.split(pathSeparator).slice(1, index + 2).join(pathSeparator));
  const pathSplit = pathname.split(pathSeparator);
  const pageType = getMetadata('pagetype');
  let tagPageTitle = '';
  if (pageType && pageType.trim().toLowerCase() === 'tagpage') {
    tagPageTitle = await getTagPageTitle();
  }
  const currentTitle = tagPageTitle !== '' ? tagPageTitle : getMetadata('breadcrumbtitle');

  const breadcrumbs = [
    {
      name: placeholders.hometext,
      url_path: `${getLanguangeSpecificPath(pathSeparator)}`,
    },
    ...pathSplit.slice(1, -1).map((part, index) => ({
      // get the breadcrumb title from the index; if the index does not contain it,
      // use the placeholders by appending '-title' to the part
      // if no breadcrumb title is found, skip the part (empty string)
      // eslint-disable-next-line max-len
      name: pageIndex.find((page) => page.path === urlForIndex(index))?.breadcrumbtitle ?? (placeholders[`${part}-title`] ?? ''),
      url_path: urlForIndex(index),
    })),
    {
      // get the breadcrumb title from the metadata; if the metadata does not contain it,
      // the last part of the path is used as the breadcrumb title
      name: currentTitle || pathSplit[pathSplit.length - 1],
    },
  ];

  const ul = document.createElement('ul');
  breadcrumbs.forEach((crumb) => {
    if (crumb.name) {
      ul.appendChild(renderBreadcrumb(crumb));
    }
  });

  block.append(ul);
  const breadcrumbContainer = document.querySelector('.section.breadcrumb-container');
  if (breadcrumbContainer) {
    breadcrumbContainer.classList.add('visible');
  }
  block.classList.add('visible');
}

export default async function decorate(block) {
  const placeholders = await fetchPlaceholders(getLanguage());
  createAutoBreadcrumb(block, placeholders);
}
