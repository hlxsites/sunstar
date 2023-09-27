/* eslint-disable no-unused-expressions */
/* global describe before it */

import { expect } from '@esm-bundle/chai';
import { readFile } from '@web/test-runner-commands';
import sinon from 'sinon';

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
    const tags = '/tags.json';
    const mf = sinon.stub(window, 'fetch');
    mf.callsFake((v) => {
      if (v.startsWith(tags)) {
        return {
          ok: true,
          json: () => ({
            data: [
              { Name: 'COVID-19', Link: 'abcd' },
              { Name: 'Global Healthy Thinking Report', Link: 'aadad' },
            ],
          }),
        };
      }

      return {
        ok: false, json: () => ({ data: [] }), text: () => '',
      };
    });

    const block = document.querySelector('.tags');
    try {
      await scripts.default(block); // The decorate method is the default one
    } finally {
      mf.restore();
      window.index = {}; // Reset cache
    }

    const anchors = block.querySelectorAll('a');
    expect(anchors.length).to.equal(2);
  });
});
