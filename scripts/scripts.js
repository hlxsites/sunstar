import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  getMetadata,
  isInternalPage,
} from './lib-franklin.js';

const LCP_BLOCKS = [
  'hero',
  'hero-banner',
  'hero-horizontal-tabs',
  'hero-vertical-tabs',
  'overlapping-content',
  'carousel',
  'career-hero',
]; // add your LCP blocks to the list
const SKIP_FROM_LCP = ['breadcrumb']; // add blocks that shouldn't ever be LCP candidates to the list
// search for at least these many blocks (post-skipping-non-candidates) to find LCP candidates
const MAX_LCP_CANDIDATE_BLOCKS = 2;

const LANGUAGES = new Set(['en', 'de', 'cn', 'th', 'id', 'it', 'ja']);

const MODAL_FRAGMENTS_PATH_SEGMENT = '/fragments/modals/';
export const MODAL_FRAGMENTS_ANCHOR_SELECTOR = `a[href*="${MODAL_FRAGMENTS_PATH_SEGMENT}"]`;

let language;

export function getLanguageFromPath(pathname, resetCache = false) {
  if (resetCache) {
    language = undefined;
  }

  if (language !== undefined) return language;

  const segs = pathname.split('/');
  if (segs.length > 1) {
    const l = segs[1];
    if (LANGUAGES.has(l)) {
      language = l;
    }
  }

  if (language === undefined) {
    language = 'en'; // default to English
  }

  return language;
}

export function getLanguage(curPath = window.location.pathname, resetCache = false) {
  return getLanguageFromPath(curPath, resetCache);
}

export function getLanguangeSpecificPath(path) {
  const lang = getLanguage();
  if (lang === 'en') return path;
  return `/${lang}${path}`;
}

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  const hasHeroBlockVariant = main.querySelector('[class^="hero-"]');
  // omit to build hero block here for other hero blocks variants like hero-banner,
  // hero-horizontal-tabs and hero-vertical-tabs
  if (hasHeroBlockVariant) {
    return;
  }
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

function buildModalFragmentBlock(main) {
  const MODAL_FRAGMENT_BLOCK_NAME = 'modal-fragment';
  if (main.querySelector(MODAL_FRAGMENTS_ANCHOR_SELECTOR)
    && !main.querySelector(MODAL_FRAGMENT_BLOCK_NAME)) {
    const section = document.createElement('div');
    const blockEl = buildBlock(MODAL_FRAGMENT_BLOCK_NAME, { elems: [] });
    section.append(blockEl);
    main.prepend(section);
  }
}

/**
 * Split children of this div up into 1, 2 or 3 separate divs with cut points as specified in
 * the from and to indexes, separating the elements from-to into
 * a separate div on the same level and putting the remaining elements in new divs surrounding it.
 * @param {HTMLElement} div The element to work on.
 * @param {number} from The index from from which to put element into the middle div.
 * @param {number} to The index up-to-but-not-including the element that marks then end of the
 * middle div.
 * @returns Returns the middle div.
 */
export function splitChildDiv(div, from, to) {
  // run backwards because moving element will delete them from the original

  let afterDiv;
  if (to < div.children.length - 1) {
    afterDiv = document.createElement('div');
    for (let i = div.children.length - 1; i >= to; i -= 1) {
      afterDiv.prepend(div.children[i]);
    }
  }

  const midDiv = document.createElement('div');
  for (let i = to - 1; i >= from; i -= 1) {
    midDiv.prepend(div.children[i]);
  }

  let beforeDiv;
  if (from > 0) {
    beforeDiv = document.createElement('div');
    for (let i = from - 1; i >= 0; i -= 1) {
      beforeDiv.prepend(div.children[i]);
    }
  }

  if (beforeDiv) {
    div.parentElement.insertBefore(beforeDiv, div);
  }
  div.parentElement.insertBefore(midDiv, div);
  if (afterDiv) {
    div.parentElement.insertBefore(afterDiv, div);
  }
  div.parentElement.removeChild(div);

  return midDiv;
}

function buildImageCollageForPicture(picture, caption, buildBlockFunction) {
  const newBlock = buildBlockFunction('image-collage', { elems: [picture, caption] });
  newBlock.classList.add('boxy-col-1');
  return newBlock;
}

function buildImageWithCaptionForPicture(parentP, picture, buildBlockFunction) {
  const enclosingDiv = parentP.parentElement;

  if (enclosingDiv) {
    // The caption could either be right next to, or right before the picture (if on the same line)
    // or it could be in an adjacent sibling element (if 'enter' was pressed between)
    const captionP = [
      picture.previousElementSibling,
      picture.nextElementSibling,
      parentP.nextElementSibling,
    ];

    // eslint-disable-next-line no-restricted-syntax
    for (const cp of captionP) {
      if (!cp) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (cp.localName === 'em') {
        // It's on the same line
        const newBlock = buildImageCollageForPicture(picture, cp, buildBlockFunction);
        newBlock.classList.add('autoblocked');
        // caption before picture
        if (cp === captionP[0]) {
          newBlock.classList.add('caption-above');
        }
        // insert the new block at the position the old image was at
        enclosingDiv.replaceChild(newBlock, parentP);
        return;
      }

      // Maybe the 'em' is on the next line, which means its in a separate <p> element
      let hasEMChild = false;
      // eslint-disable-next-line no-restricted-syntax
      for (const c of cp.children) {
        if (c.localName === 'em') {
          hasEMChild = true;
          break;
        }
      }

      if (hasEMChild) {
        const newBlock = buildImageCollageForPicture(picture, cp, buildBlockFunction);
        newBlock.classList.add('autoblocked');
        enclosingDiv.replaceChild(newBlock, parentP);
        return;
      }
    }
  }
}

export function buildImageWithCaptionBlocks(main, buildBlockFunction) {
  // Find blocks that contain a picture followed by an em text block. These are
  // single-column image collage blocks (with a caption)
  const pictures = main.querySelectorAll('picture');

  pictures.forEach((p) => {
    const parentP = p.parentElement;
    if (parentP) {
      buildImageWithCaptionForPicture(parentP, p, buildBlockFunction);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
    buildModalFragmentBlock(main);
    buildImageWithCaptionBlocks(main, buildBlock);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * decorates anchors with video links
 * for styling updates via CSS
 * @param {Element}s anchor elements to decorate
 * @returns {void}
 */
export function decorateVideoLinks(youTubeAnchors) {
  // currently only youtube links are supported
  if (youTubeAnchors.length) {
    youTubeAnchors.forEach((a) => {
      a.classList.add('video-link');
      a.classList.add('youtube');
    });
  }
}

/**
 * decorates external links to open in new window
 * for styling updates via CSS
 * @param {Element}s element The element to decorate
 * @returns {void}
 */
export function decorateExternalAnchors(externalAnchors) {
  if (externalAnchors.length) {
    externalAnchors.forEach((a) => {
      a.target = '_blank';
    });
  }
}

/**
 * Gets the extension of a URL.
 * @param {string} url The URL
 * @returns {string} The extension
 * @private
 * @example
 * get_url_extension('https://example.com/foo.jpg');
 * // returns 'jpg'
 * get_url_extension('https://example.com/foo.jpg?bar=baz');
 * // returns 'jpg'
 * get_url_extension('https://example.com/foo');
 * // returns ''
 * get_url_extension('https://example.com/foo.jpg#qux');
 * // returns 'jpg'
 */
function getUrlExtension(url) {
  return url.split(/[#?]/)[0].split('.').pop().trim();
}

/**
 * decorates anchors
 * for styling updates via CSS
 * @param {Element} element The element to decorate
 * @returns {void}
 */
export function decorateAnchors(element = document) {
  const anchors = element.getElementsByTagName('a');
  decorateVideoLinks(Array.from(anchors).filter(
    (a) => a.href.includes('youtu'),
  ));
  decorateExternalAnchors(Array.from(anchors).filter(
    (a) => a.href && (!a.href.match(`^http[s]*://${window.location.host}/`)
    || ['pdf'].includes(getUrlExtension(a.href).toLowerCase())),
  ));
}

// Function to get the current window size
export function getWindowSize() {
  const windowWidth = window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth;
  const windowHeight = window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight;
  return {
    width: windowWidth,
    height: windowHeight,
  };
}

export function addTopSpacingStyleToFirstMatchingSection(main) {
  const excludedClasses = ['static', 'feed-container', 'modal-fragment-container', 'hero-banner-container', 'hero-career-container', 'breadcrumb-container', 'hero-horizontal-tabs-container', 'carousel-container'];
  const sections = [...main.querySelectorAll(':scope > div')];
  let added = false;

  sections.every((section) => {
    if (added || sections.indexOf(section) >= 2) return false;
    const sectionClasses = [...section.classList];
    const matchesExcluded = excludedClasses.filter((excluded) => sectionClasses.includes(excluded));
    const incompatible = matchesExcluded.length > 0;
    if (!incompatible) {
      section.classList.add('auto-top-spacing');
      added = true;
      return false;
    }
    return true;
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateAnchors(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  addTopSpacingStyleToFirstMatchingSection(main);
}

function decoratePageStyles() {
  const pageStyle = getMetadata('page-style');
  if (pageStyle && pageStyle.trim().length > 0) {
    loadCSS(`${`${window.location.protocol}//${window.location.host}`}/styles/pages/${pageStyle.toLowerCase()}.css`);
    document.body.classList.add(pageStyle.toLowerCase());
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  decoratePageStyles();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS, SKIP_FROM_LCP, MAX_LCP_CANDIDATE_BLOCKS);
    try {
      /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
      if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
        loadFonts();
      }
    } catch (e) {
      // do nothing
    }
  }
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.replaceWith(link);
  } else {
    document.head.append(link);
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(decodeURIComponent(hash.substring(1))) : null;
  if (hash && element) element.scrollIntoView();
  if (!isInternalPage()) {
    loadHeader(doc.querySelector('header'));
    loadFooter(doc.querySelector('footer'));

    loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
    loadFonts();
    addFavIcon(`${window.hlx.codeBasePath}/icons/favicon.ico`);
    sampleRUM('lazy');
    sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
    sampleRUM.observe(main.querySelectorAll('picture > img'));
  }
}

/**
 * Results returned from {@link fetchIndex} come from a derived Excel sheet that is constructed
 * with the FILTER function. This FILTER function has the unwanted side effect of returning '0' in
 * cells that are empty in the original sheet.
 *
 * This function replaces those '0' values with empty cells again.
 *
 * @see fetchIndex
 * @param {Object} data - the data returned from the fetchIndex function.
 */
export function fixExcelFilterZeroes(data) {
  data.forEach((line) => {
    Object.keys(line).forEach((k) => {
      line[k] = line[k] === '0' ? '' : line[k];
    });
  });
}

export async function fetchIndex(indexFile, sheet, pageSize = 500) {
  const idxKey = indexFile.concat(sheet || '');

  const handleIndex = async (offset) => {
    const sheetParam = sheet ? `&sheet=${sheet}` : '';

    const resp = await fetch(`/${indexFile}.json?limit=${pageSize}&offset=${offset}${sheetParam}`);
    const json = await resp.json();

    const newIndex = {
      complete: (json.limit + json.offset) === json.total,
      offset: json.offset + pageSize,
      promise: null,
      data: [...window.index[idxKey].data, ...json.data],
    };

    return newIndex;
  };

  window.index = window.index || {};
  window.index[idxKey] = window.index[idxKey] || {
    data: [],
    offset: 0,
    complete: false,
    promise: null,
  };

  if (window.index[idxKey].complete) {
    return window.index[idxKey];
  }

  if (window.index[idxKey].promise) {
    return window.index[idxKey].promise;
  }

  window.index[idxKey].promise = handleIndex(window.index[idxKey].offset);
  const newIndex = await (window.index[idxKey].promise);
  window.index[idxKey] = newIndex;

  return newIndex;
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

/**
 * Convert html in text form to document element
 * @param {string} html the html to process
 * @returns A document element
 */
export function htmlToElement(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.firstElementChild;
}

/**
 * This function finds an element with the given name specified as text in the block
 * It then returns the sibling element _after_ it, which is the data associated with
 * the named element in a MD/Document table.
 *
 * @param {HTMLElement} block The block to look in
 * @param {string} name The name (case-insensitive)
 * @returns The element after the element that contains the name as text
 */
export function getNamedValueFromTable(block, name) {
  // This XPath finds the div that has the name. It uses the XPath translate function to make
  // the lookup case-insensitive.
  return document.evaluate(
    `//div/text()[translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz') = '${name.toLowerCase()}']/parent::div/parent::div/div[2]`,
    block,
    null,
    XPathResult.ANY_TYPE,
    null,
  ).iterateNext();
}

function getSearchWidgetHTML(placeholders, initialVal, searchbox, lang) {
  const langPrefix = lang === 'en' ? '' : `/${lang}`;
  const searchType = searchbox ? 'search' : 'text';

  return `
    <form method="get" class="search" action="${langPrefix}/search">
      <div>
        <input type="${searchType}" name="s" value="${initialVal ?? ''}" class="search-text"
          placeholder="${placeholders.searchtext}" required="true" oninput="this.setCustomValidity('')"
          oninvalid="this.setCustomValidity('${placeholders.emptysearchtext}')">
        <button class="icon search-icon" aria-label="Search"></button>
      </div>
    </form>`;
}

export function getSearchWidget(placeholders, initialVal, searchbox, lang = getLanguage()) {
  const widget = getSearchWidgetHTML(placeholders, initialVal, searchbox, lang);
  return htmlToElement(widget);
}

/*
  * Returns the environment type based on the hostname.
*/
export function getEnvType(hostname = window.location.hostname) {
  const fqdnToEnvType = {
    'sunstar.com': 'live',
    'www.sunstar.com': 'live',
    'main--sunstar--hlxsites.hlx.page': 'preview',
    'main--sunstar--hlxsites.hlx.live': 'live',
  };
  return fqdnToEnvType[hostname] || 'dev';
}

export async function loadFragment(path) {
  const resp = await fetch(`${path}.plain.html`);
  if (resp.ok) {
    const main = document.createElement('main');
    main.innerHTML = await resp.text();
    decorateMain(main);
    await loadBlocks(main);
    return main;
  }
  return null;
}

export async function loadScript(url, attrs = {}) {
  const script = document.createElement('script');
  script.src = url;
  // eslint-disable-next-line no-restricted-syntax
  for (const [name, value] of Object.entries(attrs)) {
    script.setAttribute(name, value);
  }
  const loadingPromise = new Promise((resolve, reject) => {
    script.onload = resolve;
    script.onerror = reject;
  });
  document.head.append(script);
  return loadingPromise;
}

export async function queryIndex(sheet) {
  await loadScript('/ext-libs/jslinq/jslinq.min.js');
  const index = await fetchIndex('query-index', sheet);
  // Fetch the index until it is complete
  while (!index.complete) {
    // eslint-disable-next-line no-await-in-loop
    await fetchIndex('query-index', sheet);
  }
  const { jslinq } = window;
  return jslinq(index.data);
}
/**
 * Add a paging widget to the div. The paging widget looks like this:
 * <pre><code>
 * &lt; 1 2 3 &gt;
 * </code></pre>
 * The numbers are hyperlinks to the repective pages and the &lt; and &gt;
 * buttons are links to next and previous pages. If this is the first page
 * then the &lt; link has the style 'disabled' and if this is the lase one
 * the &gt; link is disabled.
 * @param {HTMLElement} div - The div to add the widget to
 * @param {number} curpage - The current page number (starting at 0)
 * @param {number} totalPages - The total number of pages
 * @param {Document} doc - The current Document
 * @param {Location} curLocation - THe current window.location to use
 */
export function addPagingWidget(
  div,
  curpage,
  totalPages,
  doc = document,
  curLocation = window.location,
) {
  const queryParams = new URLSearchParams(curLocation.search);
  const nav = doc.createElement('ul');
  nav.classList.add('pagination');

  if (totalPages > 1) {
    const lt = doc.createElement('li');
    lt.classList.add('page');
    lt.classList.add('prev');
    const lta = doc.createElement('a');
    if (curpage === 0) {
      lt.classList.add('disabled');
    } else {
      queryParams.set('pg', curpage - 1);
      lta.href = `${curLocation.pathname}?${queryParams}`;
    }
    lt.appendChild(lta);
    nav.appendChild(lt);

    for (let i = 0; i < totalPages; i += 1) {
      const numli = doc.createElement('li');
      if (i === curpage) {
        numli.classList.add('active');
      }

      const a = doc.createElement('a');
      a.innerText = i + 1;

      queryParams.set('pg', i);
      a.href = `${curLocation.pathname}?${queryParams}`;
      numli.appendChild(a);

      nav.appendChild(numli);
    }

    const rt = doc.createElement('li');
    rt.classList.add('page');
    rt.classList.add('next');
    const rta = doc.createElement('a');
    if (curpage === totalPages - 1) {
      rt.classList.add('disabled');
    } else {
      queryParams.set('pg', curpage + 1);
      rta.href = `${curLocation.pathname}?${queryParams}`;
    }

    rt.appendChild(rta);
    nav.appendChild(rt);
  }

  div.appendChild(nav);
}

export function wrapImgsInLinks(container) {
  const pictures = container.querySelectorAll('p picture');
  pictures.forEach((pic) => {
    const parent = pic.parentNode;
    const link = parent.nextElementSibling.querySelector('a');
    if (link && link.href) {
      link.parentElement.remove();
      link.innerHTML = pic.outerHTML;
      parent.replaceWith(link);
    }
  });
}

/**
 * Loads the user consent manager and dispatches a `consentmanager` window event when loaded.
 * Note: that this is currently invoked in `delayed.js` and could be moved there.
 * @returns {Promise<void>}
 */
export async function loadConsentManager() {
  const ccmConfig = {
    id: 'usercentrics-cmp',
    'data-settings-id': '_2XSaYDrpo',
    async: 'async',
  };

  if (getEnvType() !== 'live') {
    ccmConfig['data-version'] = 'preview';
  }

  await Promise.all([
    loadScript('https://app.usercentrics.eu/browser-ui/latest/loader.js', ccmConfig),
    loadScript('https://privacy-proxy.usercentrics.eu/latest/uc-block.bundle.js'),
  ]);
  window.dispatchEvent(new CustomEvent('consentmanager'));
}

/**
 * Crop a given string to a specified maximum length without cutting words in half.
 * If the string is longer than the specified length, it will be cropped at the
 * nearest space or punctuation.
 *
 * @param {string} str - The input string to be cropped.
 * @param {number} maxLength - The maximum length the string should be cropped to.
 * @returns {string} - The cropped string.
 */
export function cropString(inputString, maxLength) {
  if (inputString.length <= maxLength) {
    return inputString;
  }

  const words = inputString.split(/\s+/); // Split the string into words
  let croppedString = '';
  let currentLength = 0;

  words.every((word) => {
    if (currentLength + word.length + 1 <= maxLength) {
      // Add the word and a space if it doesn't exceed the maxLength
      croppedString += `${word} `;
      currentLength += word.length + 1;
      return true;
    }
    // Otherwise, stop the loop
    return false;
  });

  // Remove trailing space and add an ellipsis if needed
  croppedString = croppedString.trim();
  if (croppedString.length < inputString.length) {
    croppedString += '...';
  }

  return croppedString;
}

if (!window.noload) { loadPage(); }
