/* eslint-disable no-unused-expressions */
/* global describe before it */

import { expect } from '@esm-bundle/chai';
import { readFile } from '@web/test-runner-commands';

const scripts = {};

document.write(await readFile({ path: './columns.plain.html' }));

describe('Columns Block', () => {
  before(async () => {
    const mod = await import('../../../blocks/columns/columns.js');
    Object
      .keys(mod)
      .forEach((func) => {
        scripts[func] = mod[func];
      });
  });

  it('Handles split percentages', () => {
    const block = document.querySelector('.columns.split-testratio1');

    scripts.applySplitPercentages(block);

    const ca = block.querySelector('#column-a');
    expect(ca.style.flexBasis).to.equal('80%');
    const cb = block.querySelector('#column-b');
    expect(cb.style.flexBasis).to.equal('20%');
    const cx = block.querySelector('#column-x');
    expect(cx.style.flexBasis).to.equal('80%');
    const cy = block.querySelector('#column-y');
    expect(cy.style.flexBasis).to.equal('20%');
  });

  it('No split percentages if not requested', () => {
    const block = document.querySelector('.columns.other');

    scripts.applySplitPercentages(block);

    const cc = block.querySelector('#column-c');
    expect(cc.style.flexBasis).to.equal('');
    const cd = block.querySelector('#column-d');
    expect(cd.style.flexBasis).to.equal('');
  });

  it('Applies alignment to non-text cells', () => {
    const block = document.querySelector('.columns.split-testratio1');

    scripts.applyCellAlignment(block);

    const ca = block.querySelector('#column-a');
    expect(ca.style.display).to.equal('flex');
    expect(ca.style.alignSelf).to.equal('center');

    const cb = block.querySelector('#column-b');
    expect(cb.style.display).to.equal('flex');
    expect(cb.style.alignSelf).to.equal('flex-end');

    const cx = block.querySelector('#column-x');
    expect(cx.style.display).to.equal('flex');
    expect(cx.style.justifyContent).to.equal('center');

    const cy = block.querySelector('#column-y');
    expect(cy.style.display).to.equal('flex');
    expect(cy.style.justifyContent).to.equal('right');
  });

  it('Applies alignment to text cells', () => {
    const block = document.querySelector('.columns.split-testratio2');

    scripts.applyCellAlignment(block);

    const t1 = block.querySelector('#column-t1');
    expect(t1.style.display).to.not.equal('flex');
    expect(t1.style.textAlign).to.equal('');

    const t2 = block.querySelector('#column-t2');
    expect(t2.style.display).to.not.equal('flex');
    expect(t1.style.textAlign).to.equal('');

    const t3 = block.querySelector('#column-t3');
    expect(t3.style.display).to.not.equal('flex');
    expect(t3.style.textAlign).to.equal('center');

    const t4 = block.querySelector('#column-t4');
    expect(t4.style.display).to.not.equal('flex');
    expect(t4.style.textAlign).to.equal('right');
  });

  it('Applies default alignment', () => {
    const block = document.querySelector('.columns.other');

    scripts.applyCellAlignment(block);

    const cc = block.querySelector('#column-c');
    expect(cc.style.display).to.equal('flex');
    expect(cc.style.alignSelf).to.equal('flex-start');

    const cd = block.querySelector('#column-d');
    expect(cd.style.display).to.not.equal('flex');

    const cd2 = block.querySelector('#column-d');
    expect(cd2.style.display).to.not.equal('flex');
    expect(cd2.style.textAlign).to.equal('');
  });
});
