/* eslint-disable no-unused-expressions */
/* global describe before it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import { shuffleArray } from '../../scripts/scripts.js';

const scripts = {};

document.body.innerHTML = await readFile({ path: './dummy.html' });
function mockElement(name) {
  const el = {
    tagName: name,
    classList: new Set(),
    children: [],
  };
  el.appendChild = (c) => {
    el.children.push(c);
  };
  return el;
}

describe('Scripts', () => {
  before(async () => {
    const mod = await import('../../scripts/scripts.js');
    Object
      .keys(mod)
      .forEach((func) => {
        scripts[func] = mod[func];
      });
  });

  it('Converts HTML to an element', () => {
    const el = scripts.htmlToElement('<div>hi</div>');
    expect(el.constructor.name).to.equal('HTMLDivElement');
  });

  it('Creates the Search widget without value', () => {
    const placeholders = {
      emptysearchtext: 'Cannot be empty',
      searchtext: 'MySearch',
    };

    const form = scripts.getSearchWidget(placeholders);
    expect(new URL(form.action).pathname).to.equal('/search');

    const div = form.children[0];
    const it = div.getElementsByClassName('search-text');
    expect(it[0].type).to.equal('text');
    expect(it[0].value).to.equal('');
    expect(it[0].placeholder).to.equal('MySearch');
    expect(it[0].oninvalid.toString().replace(/(\r\n|\n|\r)/gm, ''))
      .to.equal('function oninvalid(event) {this.setCustomValidity(\'Cannot be empty\')}');
  });

  it('Creates the Search widget with value', () => {
    const form = scripts.getSearchWidget({}, 'hello', true, 'de');
    expect(new URL(form.action).pathname).to.equal('/de/search');

    const div = form.children[0];
    const it = div.getElementsByClassName('search-text');
    expect(it[0].type).to.equal('search');
    expect(it[0].value).to.equal('hello');
  });

  it('Fix Excel Filter Zeroes', () => {
    const data = [
      {
        unrelated: 0,
        description: '0',
        breadcrumbtitle: '0',
        newsdate: '0',
      },
      {
        unrelated: 0,
        description: '0 Mydesc 0',
        breadcrumbtitle: '',
        newsdate: '12345',
      },
    ];

    scripts.fixExcelFilterZeroes(data);

    expect(data[0].unrelated).to.equal(0);
    expect(data[0].description).to.equal('');
    expect(data[0].breadcrumbtitle).to.equal('');
    expect(data[0].newsdate).to.equal('');

    expect(data[1].unrelated).to.equal(0);
    expect(data[1].description).to.equal('0 Mydesc 0');
    expect(data[1].breadcrumbtitle).to.equal('');
    expect(data[1].newsdate).to.equal('12345');
  });

  it('Extracts the correct language from the path', () => {
    let lang = scripts.getLanguageFromPath('/en/');
    expect(lang).to.equal('en');
    lang = scripts.getLanguageFromPath('/de/foo');
    expect(lang).to.equal('en');
    lang = scripts.getLanguageFromPath('/de/foo', true);
    expect(lang).to.equal('de');
  });

  it('Paging widget 1', () => {
    const parentDiv = mockElement('div');
    const doc = {
      createElement: mockElement,
    };
    const loc = {
      search: '?lang=de',
      pathname: '/search',
    };

    scripts.addPagingWidget(parentDiv, 0, 2, doc, loc);

    const navEl = parentDiv.children[0];
    expect(navEl.tagName).to.equal('ul');
    expect(navEl.classList).to.deep.equal(new Set(['pagination']));

    const prevPg = navEl.children[0];
    expect(prevPg.tagName).to.equals('li');
    expect(prevPg.classList).to.deep.equal(new Set(['page', 'prev', 'disabled']));
    const prevPgA = prevPg.children[0];
    expect(prevPgA.tagName).to.equal('a');
    expect(prevPgA.href).to.be.undefined;

    const pg1 = navEl.children[1];
    expect(pg1.tagName).to.equal('li');
    expect(pg1.classList).to.deep.equal(new Set(['active']));
    const pg1a = pg1.children[0];
    expect(pg1a.innerText).to.equal(1);
    expect(pg1a.href).to.equal('/search?lang=de&pg=0');

    const pg2 = navEl.children[2];
    expect(pg2.tagName).to.equal('li');
    const pg2a = pg2.children[0];
    expect(pg2a.innerText).to.equal(2);
    expect(pg2a.href).to.equal('/search?lang=de&pg=1');

    const nextPg = navEl.children[3];
    expect(nextPg.tagName).to.equal('li');
    expect(nextPg.classList).to.deep.equal(new Set(['page', 'next']));
    const nextPgA = nextPg.children[0];
    expect(nextPgA.tagName).to.equal('a');
    expect(nextPgA.href).to.equal('/search?lang=de&pg=1');
  });

  it('Paging widget 2', () => {
    const parentDiv = mockElement('div');
    const doc = {
      createElement: mockElement,
    };
    const loc = {
      search: '?s=xyz&pg=1',
      pathname: '/search',
    };

    scripts.addPagingWidget(parentDiv, 1, 3, doc, loc);

    const navEl = parentDiv.children[0];
    expect(navEl.tagName).to.equal('ul');
    expect(navEl.classList).to.deep.equal(new Set(['pagination']));

    const prevPg = navEl.children[0];
    expect(prevPg.tagName).to.equals('li');
    expect(prevPg.classList).to.deep.equal(new Set(['page', 'prev']));
    const prevPgA = prevPg.children[0];
    expect(prevPgA.tagName).to.equal('a');
    expect(prevPgA.href).to.equal('/search?s=xyz&pg=0');

    const pg1 = navEl.children[1];
    expect(pg1.classList).to.not.include('active');
    const pg2 = navEl.children[2];
    expect(pg2.classList).to.include('active');
    const pg3 = navEl.children[3];
    expect(pg3.classList).to.not.include('active');

    const nextPg = navEl.children[4];
    expect(nextPg.classList).to.deep.equal(new Set(['page', 'next']));
    const nextPgA = nextPg.children[0];
    expect(nextPgA.href).to.equal('/search?s=xyz&pg=2');
  });

  it('Paging widget 3', () => {
    const parentDiv = mockElement('div');
    const doc = {
      createElement: mockElement,
    };
    const loc = {
      search: '?s=xyz&pg=999&lang=fr',
      pathname: '/search',
    };

    scripts.addPagingWidget(parentDiv, 0, 1, doc, loc);
    const navEl = parentDiv.children[0];
    expect(navEl.tagName).to.equal('ul');
    expect(navEl.classList).to.deep.equal(new Set(['pagination']));

    const prevPg = navEl.children[0];
    expect(prevPg).to.be.undefined;

    const pg1 = navEl.children[1];
    expect(pg1).to.be.undefined;
  });

  it('Handles Image Collage autoblock with next para <em>', async () => {
    const parentEnclosingDiv = {};

    const enclosingDiv = {};

    let newChild;
    enclosingDiv.replaceChild = (n) => {
      newChild = n;
      enclosingDiv.lastChild = n;
      delete enclosingDiv.o;
    };

    enclosingDiv.parentElement = parentEnclosingDiv;

    const parentP = {};

    const picture = {};
    const captionP = {};
    picture.parentElement = parentP;

    parentP.parentElement = enclosingDiv;
    parentP.nextElementSibling = captionP;

    const emChild = {};
    emChild.localName = 'em';
    captionP.children = [{}, emChild];
    enclosingDiv.children = [parentP, captionP];

    captionP.remove = () => {
      delete captionP.children[1];
    };

    const mockMain = {};
    mockMain.querySelectorAll = () => [picture];

    let blockName;
    let blockObj;
    const mockBBFunction = (n, e) => {
      blockName = n;
      blockObj = e;
      captionP.children[1] = document.createElement('p');
      blockObj.elems = [picture, captionP];
      return document.createElement('myblock');
    };

    scripts.buildImageWithCaptionBlocks(mockMain, mockBBFunction);

    expect(newChild).to.not.be.undefined;

    expect(blockName).to.equal('image-collage');
    expect(blockObj.elems[0]).to.equal(picture);
    expect(blockObj.elems[1].children[1].localName).to.equal('p');

    expect(enclosingDiv.lastChild.localName).to
      .equal('myblock', 'Should have appended the block to the section');
    expect(newChild.classList.contains('boxy-col-1')).to
      .be.true;
  });

  it('Handles Image Collage autoblock with directly following <em>', async () => {
    const insertedEls = [];
    const enclosingDiv = { els: [] };
    enclosingDiv.append = (e) => insertedEls.push(e);
    let newChild;
    enclosingDiv.replaceChild = (n) => {
      newChild = n;
    };
    const parentP = {};

    const em = {};
    em.localName = 'em';

    const picture = {};
    picture.parentElement = parentP;
    picture.nextElementSibling = em;
    parentP.parentElement = enclosingDiv;

    em.remove = () => {
      delete picture.nextElementSibling;
    };

    const mockdoc = {};
    mockdoc.querySelectorAll = () => [picture];

    let blockName;
    let blockObj;
    const mockBBFunction = (n, e) => {
      blockName = n;
      blockObj = e;
      em.children = document.createElement('p');
      blockObj.elems = [picture, em];
      return document.createElement('myblock');
    };

    scripts.buildImageWithCaptionBlocks(mockdoc, mockBBFunction);

    expect(blockName).to.equal('image-collage');
    expect(newChild.classList.contains('boxy-col-1')).to
      .be.true;
    const [actualPic, actualCaption] = blockObj.elems;
    expect(actualPic).to.equal(picture);
    expect(actualCaption).to.equal(em);
  });

  it('No Image Collage autoblock when no <em>', async () => {
    let insertedElement;
    const parentEnclosingDiv = {};
    parentEnclosingDiv.insertBefore = (s) => {
      insertedElement = s;
    };

    const enclosingDiv = {};
    enclosingDiv.parentElement = parentEnclosingDiv;

    const parentP = {};

    const picture = {};
    const captionP = {};
    picture.parentElement = parentP;

    parentP.parentElement = enclosingDiv;
    parentP.nextElementSibling = captionP;

    const emChild = {};
    emChild.localName = 'strong';
    captionP.children = [{}, emChild];
    enclosingDiv.children = [parentP, captionP];

    const mockMain = {};
    mockMain.querySelectorAll = () => [picture];

    let blockName;
    let blockObj;
    const mockBBFunction = (n, e) => {
      blockName = n;
      blockObj = e;

      return document.createElement('myblock');
    };

    scripts.buildImageWithCaptionBlocks(mockMain, mockBBFunction);

    expect(insertedElement).to.be.undefined;
    expect(blockName).to.be.undefined;
    expect(blockObj).to.undefined;
  });

  it('Shuffles arrays', () => {
    expect(shuffleArray([]).length).to.equal(0);
    expect(shuffleArray(['hi'])).to.deep.equal(['hi']);

    const arr1 = [1, 2, 3, 4, 5, 6, 7];
    const arr1b = shuffleArray(arr1);
    expect(arr1b).to.equal(arr1, 'Should have returned the same object');
    expect(arr1).to.not.deep.equal([1, 2, 3, 4, 5, 6, 7], 'Contents should have been shuffled');

    const arr2 = [1, 2, 3, 4, 5, 6, 7];
    shuffleArray(arr2);
    expect(arr2).to.not.deep.equal([1, 2, 3, 4, 5, 6, 7], 'Contents should have been shuffled');
    expect(arr2).to.not.deep.equal(arr1, 'Shuffle result should be different given the same input');

    const arr3 = [{ foo: 'bar' }, { test: true }];
    shuffleArray(arr3);
    expect(arr3).to.deep.contain({ foo: 'bar' });
    expect(arr3).to.deep.contain({ test: true });
  });
});
