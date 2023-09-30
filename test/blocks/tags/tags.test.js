/* eslint-disable no-unused-expressions */
/* global describe before it */

import { expect } from '@esm-bundle/chai';
import { readFile } from '@web/test-runner-commands';

const scripts = {};

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

  it('Count of Tags should be 2', async () => {
    const placeholders = {
      'covid-19-href': 'aaaadad',
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
