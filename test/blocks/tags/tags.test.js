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
      const queryIndex = '/tags-categories.json';
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
    window.tagsCategories = {
      'tags-loaded': {},
      tags: [
        {
          id: 'covid-19',
          name: 'Covid 19',
          type: 'Healthy Thinking',
        },
        {
          id: 'global-healthy-thinking-report',
          name: 'global-healthy-thinking-report',
          type: 'Healthy Thinking',
        },
      ],
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
