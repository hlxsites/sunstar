/* eslint-disable no-unused-expressions */
/* global describe before it */

import { expect } from '@esm-bundle/chai';
import { readFile } from '@web/test-runner-commands';
import sinon from 'sinon';

const scripts = {};

document.write(await readFile({ path: './search-results.plain.html' }));

describe('Search Results', () => {
  before(async () => {
    const mod = await import('../../../blocks/search-results/search-results.js');
    Object
      .keys(mod)
      .forEach((func) => {
        scripts[func] = mod[func];
      });
  });

  it('Get Search Params', () => {
    const res = scripts.getSearchParams('?s=e+a&pg=1');
    expect(res.searchTerm).to.equal('e a');
    expect(res.curPage).to.equal(1);
  });

  it('Get Search Params Empty', () => {
    const res = scripts.getSearchParams('?');
    expect(res.curPage).to.equal(0);
    expect(res.searchTerm).to.be.null;
  });

  it('Page generation', async () => {
    const placeholders = {
      resultstext_postfix: 'matches for',
      'news-page-title-text': 'News & Articles',
    };
    window.placeholders = {
      'translation-loaded': {},
      translation: {
        en: placeholders,
      },
    };

    const queryIndex = /query-index.json\\?(.*)&sheet=en-search/;
    const mf = sinon.stub(window, 'fetch');
    mf.callsFake((v) => {
      if (queryIndex.test(v)) {
        return {
          ok: true,
          json: () => ({
            data: [
              { path: '/news/a/', pagename: 'a text', lastModified: 1685443971 },
              { path: '/news/b/', title: 'some b', lastModified: 1685443972 },
              { path: '/news/c/', breadcrumbtitle: 'c text', lastModified: 1685443973 },
              { path: '/news/d/', description: 'text of d', lastModified: 1685443974 },
            ],
          }),
        };
      }

      return {
        ok: false, json: () => ({ data: [] }), text: () => '',
      };
    });

    const block = document.querySelector('.search-results');
    const loc = {
      search: '?s=tex',
      pathname: '/search',
    };

    try {
      await scripts.default(block, loc);
    } finally {
      mf.restore();
    }

    const searchForm = block.children[0];
    expect(searchForm.nodeName).to.equal('FORM');
    expect(searchForm.classList.toString()).to.equal('search');

    const searchSummary = block.children[1];
    expect(searchSummary.nodeName).to.equal('H3');
    expect(searchSummary.classList.toString()).to.equal('search-summary');
    expect(searchSummary.innerHTML.trim()).to.equal('3 matches for "<strong>tex</strong>"');

    const res1 = block.children[2];
    expect(res1.nodeName).to.equal('DIV');
    expect(res1.classList.toString()).to.equal('search-result');
    const res1h3 = res1.children[1];
    expect(res1h3.nodeName).to.equal('H3');
    const res1h3a = res1h3.children[0];
    expect(res1h3a.nodeName).to.equal('A');
    expect(res1h3a.href.endsWith('/news/a/')).to.be.true;

    const res2 = block.children[3];
    expect(res2.nodeName).to.equal('DIV');
    expect(res2.classList.toString()).to.equal('search-result');
    const res2h3 = res2.children[1];
    expect(res2h3.nodeName).to.equal('H3');
    const res2h3a = res2h3.children[0];
    expect(res2h3a.nodeName).to.equal('A');
    expect(res2h3a.href.endsWith('/news/c/')).to.be.true;

    const res3 = block.children[4];
    expect(res3.nodeName).to.equal('DIV');
    expect(res3.classList.toString()).to.equal('search-result');
    const res3h3 = res3.children[1];
    expect(res3h3.nodeName).to.equal('H3');
    const res3h3a = res3h3.children[0];
    expect(res3h3a.nodeName).to.equal('A');
    expect(res3h3a.href.endsWith('/news/d/')).to.be.true;

    const pageWidget = block.children[5];
    expect(pageWidget.className.toString()).to.equal('pagination');
  });

  it('Page generation alt language', async () => {
    const placeholders = {
      resultstext_prefix: 'の検索結果',
      resultstext_postfix: '件',
      searchtext: '検索',
      'news-page-title-text': 'News & Articles',
    };
    window.placeholders = {
      'translation-loaded': {},
      translation: {
        jp: placeholders,
      },
    };

    const queryIndex = /query-index.json\\?(.*)&sheet=jp-search/;
    const mf = sinon.stub(window, 'fetch');
    mf.callsFake((v) => {
      if (queryIndex.test(v)) {
        return {
          ok: true,
          json: () => ({
            data: [
              { path: '/jp/news/a/', title: 'a text', lastModified: 1685443971 },
              { path: '/jp/news/b/', title: 'some b', lastModified: 1685443972 },
              { path: '/jp/news/c/', title: 'c text', lastModified: 1685443973 },
            ],
          }),
        };
      }

      return {
        ok: false, json: () => ({ data: [] }), text: () => '',
      };
    });

    const block = document.querySelector('.search-results');
    const loc = {
      search: '?s=a',
      pathname: '/jp/search',
    };

    try {
      await scripts.default(block, loc, true);
    } finally {
      mf.restore();
    }

    const searchForm = block.children[0];
    expect(searchForm.nodeName).to.equal('FORM');
    expect(searchForm.classList.toString()).to.equal('search');

    const searchSummary = block.children[1];
    expect(searchSummary.nodeName).to.equal('H3');
    expect(searchSummary.classList.toString()).to.equal('search-summary');
    expect(searchSummary.innerHTML).to.equal('「<strong>a</strong>」 の検索結果 1件');

    const res1 = block.children[2];
    expect(res1.nodeName).to.equal('DIV');
    expect(res1.classList.toString()).to.equal('search-result');
    const res1h3 = res1.children[1];
    expect(res1h3.nodeName).to.equal('H3');
    const res1h3a = res1h3.children[0];
    expect(res1h3a.nodeName).to.equal('A');
    expect(res1h3a.href.endsWith('/jp/news/a/')).to.be.true;

    const pageWidget = block.children[3];
    expect(pageWidget.className.toString()).to.equal('pagination');
  });
});
