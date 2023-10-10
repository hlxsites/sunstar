import { fetchPlaceholders, getMetadata } from '../../scripts/lib-franklin.js';
import
{
  getLanguage,
  getLanguangeSpecificPath,
  getSearchWidget,
  getWindowSize,
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

/* Add levels to the menu items */
function addLevels(root) {
  const ulElements = root.querySelectorAll('ul');

  ulElements.forEach((ul) => {
    let level = 1;
    let currentElement = ul;

    while (currentElement.parentElement) {
      if (currentElement.parentElement.tagName === 'UL') {
        level += 1;
      }

      currentElement = currentElement.parentElement;
    }

    ul.classList.add(`menu-level-${level}`);
    ul.querySelectorAll(':scope>li').forEach((li) => {
      li.classList.add(`menu-level-${level}-item`);
    });
  });
}

function buildDropDownMenu(l1menuItem, placeholders) {
  if (l1menuItem.querySelectorAll('ul').length === 0) return;
  const dropDownMenu = document.createElement('div');
  dropDownMenu.classList.add('dropdown-menu');
  const dropDownHeader = document.createElement('div');
  dropDownHeader.classList.add('dropdown-menu-header');
  dropDownHeader.innerHTML = `
    <h2>${l1menuItem.querySelector('a').innerHTML}</h2>
    <a href="${getLanguangeSpecificPath('/global-network')}">
      ${placeholders['learn-about-regional-availability']}
      <span class="icon icon-ang-white"></span>
    </a>
  `;
  dropDownMenu.appendChild(dropDownHeader);
  dropDownMenu.appendChild(l1menuItem.querySelector('ul'));
  l1menuItem.appendChild(dropDownMenu);

  // Create an intersection observer instance for the dropdown menu
  // Bring the backdrop in and out of view depending on the dropdown menu's visibility
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        document.querySelector('.backdrop').classList.add('visible');
      } else {
        document.querySelector('.backdrop').classList.remove('visible');
      }
    });
  });

  observer.observe(dropDownMenu);

  l1menuItem.addEventListener('click', (evt) => {
    if (getWindowSize().width < 1232) {
      evt.preventDefault();
      evt.stopPropagation();
      const li = document.createElement('li');
      li.classList.add('menu-level-2-item-header');
      li.innerHTML = l1menuItem.querySelector('a').outerHTML;
      l1menuItem.querySelector(':scope .menu-level-2').prepend(li);
      l1menuItem.querySelector(':scope .menu-level-2').classList.toggle('open');
      document.querySelector('.dropdown-menu').classList.toggle('open');
      document.querySelector('.menu-back-btn').classList.toggle('visible');
      document.querySelector('.mobile-icon').classList.toggle('visible');
    }
  });

  dropDownMenu.addEventListener('click', (evt) => {
    if (getWindowSize().width < 1232) {
      if (evt.target.parentElement.classList.contains('menu-level-1-item')) {
        const level2Menu = evt.target.parentElement.querySelector('ul');
        if (level2Menu) {
          evt.preventDefault();
          const parent = level2Menu.closest('.menu-level-1-item');
          const li = document.createElement('li');
          li.classList.add('menu-level-2-item-header');
          li.innerHTML = parent.querySelector('a').outerHTML;
          level2Menu.prepend(li);
          level2Menu.classList.toggle('open');
        }
      } else if (evt.target.parentElement.classList.contains('menu-level-2-item')) {
        const level3Menu = evt.target.parentElement.querySelector('ul');
        if (level3Menu) {
          evt.preventDefault();
          const parent = level3Menu.closest('.menu-level-2-item');
          const li = document.createElement('li');
          li.classList.add('menu-level-3-item-header');
          li.innerHTML = parent.querySelector('a').outerHTML;
          level3Menu.prepend(li);

          level3Menu.classList.toggle('open');
        }
      }
      evt.stopPropagation();
    }
  });
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

function decorateMiddleNav(nav) {
  const a = nav.querySelector('a');
  a.setAttribute('aria-label', 'Sunstar Home');
}

/* Decorate the other items - which is the items pulled from top nav */
function decorateOtherItems(otherItemsEl) {
  otherItemsEl.classList.add('other-items');

  /* Pull items from the top nav */
  document.querySelector('nav.nav-top').querySelectorAll(':scope>ul>li').forEach((li) => {
    otherItemsEl.appendChild(li.cloneNode(true));
  });

  /* Make a lang picker for mobile */
  const langPicker = document.createElement('li');
  langPicker.classList.add('mobile-lang-picker');
  const langPickerUl = document.createElement('ul');
  langPicker.appendChild(langPickerUl);
  otherItemsEl.querySelector('.lang-picker').querySelectorAll(':scope>ul>li').forEach((li) => {
    langPickerUl.appendChild(li.cloneNode(true));
  });

  langPicker.querySelectorAll(':scope>ul>li').forEach((li) => {
    li.classList.add('mobile-lang-picker-item');
    li.classList.remove('lang-picker-item');
  });

  otherItemsEl.querySelector('.lang-picker').replaceWith(langPicker);
}

function decorateBottomNav(nav, placeholders) {
  addLevels(nav);
  nav.querySelectorAll(':scope .menu-level-1-item').forEach((li) => {
    buildDropDownMenu(li, placeholders);
  });

  /* Add the other items to bottom nav */
  const otherItemsEl = document.createElement('li');
  decorateOtherItems(otherItemsEl);
  nav.querySelector(':scope .menu-level-1').append(otherItemsEl);

  const hamburger = document.createElement('span');
  hamburger.classList.add('mobile-icon');
  hamburger.classList.add('visible');
  hamburger.innerHTML = Array.from({ length: 4 }, () => '<i></i>').join(' ');
  nav.prepend(hamburger);

  hamburger.addEventListener('click', () => {
    nav.classList.toggle('open');
    nav.querySelector(':scope .menu-level-1').classList.toggle('open');
    document.body.classList.toggle('no-scroll');
  });

  const menuBackBtn = document.createElement('div');
  menuBackBtn.classList.add('menu-back-btn');
  menuBackBtn.innerHTML = `<span class="icon icon-angle-left"></span><a>${placeholders['back-to-menu']}</a>`;
  nav.prepend(menuBackBtn);
  nav.append(getSearchWidget(placeholders));

  menuBackBtn.addEventListener('click', () => {
    const level1Open = nav.querySelector(':scope .menu-level-1.open');
    const level2Open = nav.querySelector(':scope .menu-level-2.open');
    const level3Open = nav.querySelector(':scope .menu-level-3.open');

    if (level3Open) {
      level3Open.querySelector(':scope .menu-level-3-item-header').remove();
      level3Open.classList.remove('open');
      return;
    }

    if (level2Open) {
      level2Open.querySelector(':scope .menu-level-2-item-header').remove();
      level2Open.closest('.dropdown-menu').classList.remove('open');
      level2Open.classList.remove('open');
      menuBackBtn.classList.remove('visible');
      hamburger.classList.add('visible');
      return;
    }

    if (level1Open) {
      level1Open.classList.remove('open');
    }
  });
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

  if (resp.ok) {
    const placeholders = await fetchPlaceholders(getLanguage());
    block.innerHTML = '';
    const html = await resp.text();
    const fetchedNav = document.createElement('div');
    fetchedNav.innerHTML = html;
    const navClasses = ['nav-top', 'nav-middle', 'nav-bottom'];
    navClasses.forEach((navClass, idx) => {
      const nav = document.createElement('nav');
      nav.classList.add(navClass);
      nav.innerHTML = fetchedNav.querySelectorAll(':scope>div')[idx].innerHTML;
      navDecorators[navClass](nav, placeholders);

      block.appendChild(nav);
    });

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
