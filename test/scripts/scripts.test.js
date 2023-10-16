/* eslint-disable no-unused-expressions */
/* global describe before it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

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

    expect(newChild).to.not.be.undefined;

    expect(blockName).to.equal('image-collage');
    expect(blockObj.elems[0]).to.equal(picture);
    expect(blockObj.elems[1].children[1]).to.equal(emChild);

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

    const mockdoc = {};
    mockdoc.querySelectorAll = () => [picture];

    let blockName;
    let blockObj;
    const mockBBFunction = (n, e) => {
      blockName = n;
      blockObj = e;

      return document.createElement('myblock');
    };

    scripts.buildImageWithCaptionBlocks(mockdoc, mockBBFunction);

    expect(blockName).to.equal('image-collage');
    expect(newChild.classList.contains('boxy-col-1')).to
      .be.true;
    const [actualPic, actualEM] = blockObj.elems;
    expect(actualPic).to.equal(picture);
    expect(actualEM).to.equal(em);
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

  it('Test splitChildDiv with only picture and caption', async () => {
    const pdiv = document.createElement('div');
    const div = document.createElement('div');
    const ppict = document.createElement('p');
    const picture = document.createElement('picture');
    const pcapt = document.createElement('p');
    const em = document.createElement('em');

    ppict.append(picture);
    pcapt.append(em);
    div.append(ppict, pcapt);
    pdiv.append(div);

    const res = scripts.splitChildDiv(div, 0, 2);
    expect(pdiv.children.length).to.be.equal(1);
    expect(pdiv.children[0]).to.be.equal(res);
    expect(res.children.length).to.be.equal(2);
    expect(res.children[0]).to.be.equal(ppict);
    expect(res.children[1]).to.be.equal(pcapt);
  });

  it('Test splitChildDiv other and picture', async () => {
    const pdiv = document.createElement('div');
    const div = document.createElement('div');
    const pother = document.createElement('p');
    const ppict = document.createElement('p');
    const picture = document.createElement('picture');
    const pcapt = document.createElement('p');
    const em = document.createElement('em');

    ppict.append(picture);
    pcapt.append(em);
    div.append(pother, ppict, pcapt);
    pdiv.append(div);

    const res = scripts.splitChildDiv(div, 1, 3);
    expect(pdiv.children.length).to.be.equal(2);
    const preDiv = pdiv.children[0];
    expect(preDiv.children.length).to.be.equal(1);
    expect(preDiv.children[0]).to.be.equal(pother);
    expect(pdiv.children[1]).to.be.equal(res);
  });

  it('Test splitChildDiv picture and other', async () => {
    const pdiv = document.createElement('div');
    const div = document.createElement('div');
    const ppict = document.createElement('p');
    const picture = document.createElement('picture');
    const pcapt = document.createElement('p');
    const em = document.createElement('em');
    const pother1 = document.createElement('p');
    const pother2 = document.createElement('p');

    ppict.append(picture);
    pcapt.append(em);
    div.append(ppict, pcapt, pother1, pother2);
    pdiv.append(div);

    const res = scripts.splitChildDiv(div, 0, 2);
    expect(pdiv.children.length).to.be.equal(2);
    expect(pdiv.children[0]).to.be.equal(res);
    const postDiv = pdiv.children[1];
    expect(postDiv.children.length).to.be.equal(2);
    expect(postDiv.children[0]).to.be.equal(pother1);
    expect(postDiv.children[1]).to.be.equal(pother2);
  });

  it('Test splidChildDiv other-picture-other', async () => {
    const pdiv = document.createElement('div');
    const div = document.createElement('div');
    const pother = document.createElement('p');
    const ppict = document.createElement('p');
    const picture = document.createElement('picture');
    const pcapt = document.createElement('p');
    const em = document.createElement('em');
    const pother1 = document.createElement('p');
    const pother2 = document.createElement('p');

    ppict.append(picture);
    pcapt.append(em);
    div.append(pother, ppict, pcapt, pother1, pother2);
    pdiv.append(div);

    const res = scripts.splitChildDiv(div, 1, 3);
    expect(pdiv.children.length).to.be.equal(3);
    const preDiv = pdiv.children[0];
    expect(preDiv.children.length).to.be.equal(1);
    expect(preDiv.children[0]).to.be.equal(pother);
    expect(pdiv.children[1]).to.be.equal(res);
    const postDiv = pdiv.children[2];
    expect(postDiv.children.length).to.be.equal(2);
    expect(postDiv.children[0]).to.be.equal(pother1);
    expect(postDiv.children[1]).to.be.equal(pother2);
  });
});
