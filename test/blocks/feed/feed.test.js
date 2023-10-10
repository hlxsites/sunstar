/* eslint-disable no-unused-expressions */
/* global describe it beforeEach afterEach before after */

import { expect, assert } from '@esm-bundle/chai';
import { readFile } from '@web/test-runner-commands';
import sinon from 'sinon';

const feed = {};
const index = JSON.parse(await readFile({ path: './query-index.json' }));
const parser = new DOMParser();

describe('Feed Block', async () => {
  before(async () => {
    window.noload = true;
    const mod = await import('../../../blocks/feed/feed.js');
    Object
      .keys(mod)
      .forEach((func) => {
        feed[func] = mod[func];
      });
  });

  after(() => {
    window.noload = false;
    window.index = {}; // Reset cache
  });

  beforeEach(async () => {
    document.write(await readFile({ path: './feed.plain.html' }));
    await sinon.stub(window, 'fetch').callsFake((v) => {
      const queryIndex = '/query-index.json';
      if (v.startsWith(queryIndex)) {
        return {
          ok: true,
          json: () => index,
        };
      }
      return {
        ok: false,
        json: () => ({
          limit: 0, offset: 0, total: 0, data: [],
        }),
        text: () => '',
      };
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Feed Block Decoration', async () => {
    const block = document.querySelector('.feed');
    try {
      const decoratedBlock = await feed.default(block); // The decorate method is the default one
      const expected = parser.parseFromString(await readFile({ path: './feed.decorated.html' }), 'text/html');
      expect(decoratedBlock.outerHTML.replace(/\n/g, '')).to.equal(expected.body.innerHTML.replace(/\n/g, ''));
    } catch (e) {
      assert.fail(e);
    }
  });

  it('Feed Block Decoration uses current page metadata', async () => {
    const typeMetaTag = document.createElement('meta');
    typeMetaTag.name = 'type';
    typeMetaTag.content = 'newsroom';
    document.head.appendChild(typeMetaTag);

    const categoryMetaTag = document.createElement('meta');
    categoryMetaTag.name = 'category';
    categoryMetaTag.content = 'corporate';
    document.head.appendChild(categoryMetaTag);

    const block = document.querySelector('.feed');
    try {
      const decoratedBlock = await feed.default(block); // The decorate method is the default one
      //
      const expected = parser.parseFromString(await readFile({ path: './feed.decorated.newsroom.corporate.html' }), 'text/html');
      expect(decoratedBlock.outerHTML.replace(/\n/g, '')).to.equal(expected.body.innerHTML.replace(/\n/g, ''));
    } catch (e) {
      assert.fail(e);
    }
  });
});
