import { fetchPlaceholders, getMetadata } from '../../scripts/lib-franklin.js';
import buildNavTree from '../../scripts/nav-tree-utils.js';
import
{
  getLanguage,
  getSearchWidget,
  fetchIndex,
  decorateAnchors,
} from '../../scripts/scripts.js';

async function decorateWebsitePicker(websitePicker) {
  websitePicker.classList.add('picker');
  websitePicker.classList.add('website-picker');
  websitePicker.innerHTML = websitePicker.innerHTML.replace(/\[websites\]/, '');
  const title = 'Sunstar Websites';
  websitePicker.querySelectorAll(':scope>ul>li').forEach((li) => {
    li.classList.add('picker-item');
    li.classList.add('website-picker-item');
  });

  const a = document.createElement('a');
  a.textContent = title;
  websitePicker.prepend(a);

  if (websitePicker.querySelectorAll(':scope>ul>li').length === 0 && websitePicker.querySelector('ul')) {
    websitePicker.querySelector('ul').remove();
  }
}

async function decorateLangPicker(langPicker) {
  const lang = getLanguage() || '';
  let langName = 'English'; // default to English
  langPicker.classList.add('picker');
  langPicker.classList.add('lang-picker');
  langPicker.innerHTML = langPicker.innerHTML.replace(/\[languages\]/, '');

  const currentLang = getLanguage();
  // Get the current path without the language prefix
  const currPath = currentLang === 'en' ? window.location.pathname : window.location.pathname.replace(`/${currentLang}/`, '/');
  const json = await fetchIndex('query-index');

  langPicker.querySelectorAll(':scope>ul>li').forEach((li) => {
    li.classList.add('picker-item');
    li.classList.add('lang-picker-item');
    // Update the language links to point to the current path
    let langRoot = li.querySelector('a').getAttribute('href');
    langRoot = langRoot.endsWith('/') ? langRoot.slice(0, -1) : langRoot;
    const langLink = langRoot + currPath + window.location.search;
    li.querySelector('a').setAttribute('href', langLink);

    /* Remove the current language from the list */
    if (langRoot === `/${lang}`) {
      langName = li.querySelector('a').innerHTML;
      li.remove();
    } else if (lang === 'en' && langRoot === '') {
      // Special Check added to remove english language from the list
      // if selected language is english
      li.remove();
    } else {
      const newUrl = langRoot === '' ? `${currPath}` : `${langRoot}${currPath}`;
      const urlExcludingSlash = newUrl.endsWith('/') ? newUrl.slice(0, -1) : newUrl;
      const data = json.data.find((page) => [newUrl, urlExcludingSlash].includes(page.path));

      if (!data) {
        li.remove();
      }
    }
  });

  const a = document.createElement('a');
  a.textContent = langName;
  langPicker.prepend(a);

  if (langPicker.querySelectorAll(':scope>ul>li').length === 0 && langPicker.querySelector('ul')) {
    langPicker.querySelector('ul').remove();
  }
}

function decorateTopNav(nav) {
  nav.querySelectorAll(':scope>ul>li').forEach((li) => {
    if (li.textContent.includes('[languages]')) {
      decorateLangPicker(li);
    } else if (li.textContent.includes('[websites]')) {
      decorateWebsitePicker(li);
    }
  });
}

function decorateMiddleNav() {
}

function decorateBottomNav(nav, placeholders, navTreeJson) {
  const navTree = buildNavTree(navTreeJson);
  nav.append(navTree);
  nav.append(getSearchWidget(placeholders));
}

const navDecorators = { 'nav-top': decorateTopNav, 'nav-middle': decorateMiddleNav, 'nav-bottom': decorateBottomNav };
/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // fetch nav content
  const navMeta = getMetadata('nav');
  const navPath = navMeta || (getLanguage() === 'en' ? '/_drafts/himanshu/nav' : `/${getLanguage()}/nav`);
  const resp = await fetch(`${navPath}.plain.html`);
  const navTreeResp = await fetch(`/nav-tree.json?sheet=${getLanguage()}`);
  const navTreeJson = await navTreeResp.json();
  if (resp.ok) {
    const placeholders = await fetchPlaceholders(getLanguage());
    block.innerHTML = '';
    const html = await resp.text();
    const fetchedNav = document.createElement('div');
    fetchedNav.innerHTML = html;
    const navClasses = ['nav-top', 'nav-middle'];
    navClasses.forEach((navClass, idx) => {
      const nav = document.createElement('nav');
      nav.classList.add(navClass);
      nav.innerHTML = fetchedNav.querySelectorAll(':scope>div')[idx].innerHTML;
      navDecorators[navClass](nav, placeholders);
      block.appendChild(nav);
    });
    const nav = document.createElement('nav');
    nav.classList.add('nav-bottom');
    navDecorators['nav-bottom'](nav, placeholders, navTreeJson);
    block.appendChild(nav);

    window.addEventListener('scroll', () => {
      if (document.documentElement.scrollTop > document.querySelector('nav.nav-top').offsetHeight + document.querySelector('nav.nav-middle').offsetHeight) {
        document.querySelector('header').classList.add('fixed');
      } else {
        document.querySelector('header').classList.remove('fixed');
      }
    });

    const backdrop = document.createElement('div');
    backdrop.classList.add('backdrop');
    document.body.appendChild(backdrop);

    decorateAnchors(block);
  }

  block.parentElement.classList.add('appear');
}
