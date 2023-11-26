/* eslint-disable no-unused-expressions */
/* global describe it beforeEach before */

import { expect } from '@esm-bundle/chai';
import { readFile } from '@web/test-runner-commands';
import sinon from 'sinon';

const scripts = {};
const index = JSON.parse(await readFile({ path: './tags_categories.json' }));

document.write(await readFile({ path: './tags.plain.html' }));

describe('Tags Block', () => {
  before(async () => {
    const mod = await import('../../../blocks/tags/tags.js');
    Object
      .keys(mod)
      .forEach((func) => {
        scripts[func] = mod[func];
      });
  });

  beforeEach(async () => {
    await sinon.stub(window, 'fetch').callsFake((v) => {
      const queryIndex = '/_drafts/piyush/tags-categories.json';
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

  it('Count of Tags should be 2', async () => {
    const placeholders = {
      'covid-19': 'aaaadad',
      'global-healthy-thinking-report': 'adadadad',
    };
    window.placeholders = {
      'translation-loaded': {},
      translation: {
        en: placeholders,
      },
    };

    const block = document.querySelector('.tags');
    try {
      await scripts.default(block); // The decorate method is the default one
    } finally {
      window.index = {}; // Reset cache
    }

    const anchors = block.querySelectorAll('a');
    expect(anchors.length).to.equal(2);
  });
});
