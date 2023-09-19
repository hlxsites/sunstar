/* eslint-disable no-unused-expressions */
/* global describe before beforeEach it */

import { expect } from '@esm-bundle/chai';
import { readFile } from '@web/test-runner-commands';

const scripts = {};

document.write(await readFile({ path: './hero-horizontal-tabs.plain.html' }));

describe('Hero Horizontal Tabs', () => {
  before(async () => {
    const mod = await import('../../../blocks/hero-horizontal-tabs/hero-horizontal-tabs.js');
    Object
      .keys(mod)
      .forEach((func) => {
        scripts[func] = mod[func];
      });
  });

  beforeEach(async () => {
    const body = document.querySelector('body');
    body.innerHTML = '';
    document.write(await readFile({ path: './hero-horizontal-tabs.plain.html' }));
  });

  it('Render Tabs', async () => {
    const block = document.querySelector('.hero-horizontal-tabs');

    await scripts.default(block);

    expect(block.children.length).to.equals(2);
    expect(['hero-horiz-tabs-panel']).to.deep.equal([...block.children[0].classList]);
    expect(block.children[0].children.length).to.equal(2);
    expect(['hero-horiz-tabs-text']).to.deep.equal([...block.children[0].children[0].classList]);
    const nav = block.children[0].children[1];
    expect(nav.tagName).to.equal('NAV');
    const tabs = [...nav.querySelectorAll('li')];
    expect(tabs.length).to.equal(3);

    expect(tabs[0].innerText).to.equal('The Americas');
    expect([...tabs[0].classList]).to.include('active');
    expect([...tabs[1].classList]).to.not.include('active');
    expect([...tabs[2].classList]).to.not.include('active');

    expect(['hero-horiz-tabs-img']).to.deep.equal([...block.children[1].classList]);
  });

  it('Render Tabs2', async () => {
    const block = document.querySelector('.hero-horizontal-tabs');

    await scripts.default(block);

    const nav = block.children[0].children[1];
    expect(nav.tagName).to.equal('NAV');

    const tabs = [...nav.querySelectorAll('li')];
    expect(tabs.length).to.equal(3);

    expect([...tabs[0].classList]).to.include('active');
    expect([...tabs[1].classList]).to.not.include('active');
    expect([...tabs[2].classList]).to.not.include('active');

    expect(['hero-horiz-tabs-img']).to.deep.equal([...block.children[1].classList]);
  });
});
