/* eslint-disable no-unused-expressions */
/* global describe before it after */

import { expect, assert } from '@esm-bundle/chai';
import { readFile } from '@web/test-runner-commands';
import sinon from 'sinon';

document.write(await readFile({ path: './feed.plain.html' }));
const feed = {};

describe('Feed Block', async () => {
  before(async () => {
    const mod = await import('../../../blocks/feed/feed.js');
    Object
      .keys(mod)
      .forEach((func) => {
        feed[func] = mod[func];
      });

    const index = JSON.parse(await readFile({ path: './query-index.json' }));

    sinon.stub(window, 'fetch').callsFake((v) => {
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

  after(() => {
    sinon.restore();
  });

  it('Feed Block Decoration', async () => {
    const block = document.querySelector('.feed');
    try {
      const decoratedBlock = await feed.default(block); // The decorate method is the default one
      const parser = new DOMParser();
      const expected = parser.parseFromString(await readFile({ path: './feed.decorated.html' }), 'text/html');
      expect(decoratedBlock.outerHTML.replace(/\n/g, '')).to.equal(expected.body.innerHTML.replace(/\n/g, ''));
    } catch (e) {
      assert.fail(e);
    } finally {
      window.index = {}; // Reset cache
    }
  });
});
