/* eslint-disable no-unused-expressions */
/* global describe before it */

import { expect } from '@esm-bundle/chai';
import { readFile } from '@web/test-runner-commands';

const scripts = {};

document.write(await readFile({ path: './career-carousel.plain.html' }));

describe('Career Carousel', () => {
  before(async () => {
    const mod = await import('../../../blocks/career-carousel/career-carousel.js');
    Object
      .keys(mod)
      .forEach((func) => {
        scripts[func] = mod[func];
      });
  });

  it('Filter incomplete career data entries', () => {
    const json = {
      foo: 'bar',
      data: [
        {
          label: 'l1', image: '', 'career-quote': '0', 'career-jobtitle': '0',
        },
        {
          label: 'l2', image: 'img', 'career-quote': 'quote 2', 'career-jobtitle': '0',
        },
        {
          label: 'l3', image: '', 'career-quote': 'quote 3', 'career-jobtitle': 'title',
        },
        {
          label: 'l4', image: 'image 4', 'career-quote': 'quote 4', 'career-jobtitle': 'title 4',
        },
        {
          label: 'l5', image: 'image 5', 'career-quote': 'quote 5', 'career-jobtitle': 'title 5',
        },
      ],
    };

    const data = scripts.filterIncompleteEntries(json);
    expect(data.length).to.equal(2);
    expect(data[0].label).to.equal('l4');
    expect(data[0].image).to.equal('image 4');
    expect(data[0]['career-quote']).to.equal('quote 4');
    expect(data[0]['career-jobtitle']).to.equal('title 4');
    expect(data[1].label).to.equal('l5');
    expect(data[1].image).to.equal('image 5');
    expect(data[1]['career-quote']).to.equal('quote 5');
    expect(data[1]['career-jobtitle']).to.equal('title 5');
  });

  function mockClassList(el) {
    el.classList = {};
    el.classList.els = [];
    el.classList.add = (...s) => el.classList.els.push(...s);
    el.classList.contains = (s) => el.classList.els.includes(s);
    el.classList.remove = (s) => { el.classList.els = el.classList.els.filter((e) => e !== s); };
  }

  it('Can scroll to a specific card', () => {
    const card = {};
    card.getBoundingClientRect = () => ({ x: 348, width: 100 });

    const prevCard = {};
    prevCard.getBoundingClientRect = () => ({ x: 232, width: 100 });

    const span1 = {};
    mockClassList(span1);
    span1.classList.add('blah');
    const span2 = {};
    mockClassList(span2);
    span2.classList.add('active-nav', 'blah');

    const doc = {};
    doc.querySelectorAll = () => [span1, span2];

    const span = {};
    mockClassList(span);

    let scrolledX;
    let scrolledY;
    const slides = {};
    slides.scrollHeight = 259;
    slides.scrollTo = (x, y) => {
      scrolledX = x;
      scrolledY = y;
    };

    scripts.scrollToCard(3, card, prevCard, slides, span, doc);

    expect(scrolledX).to.equal(348);
    expect(scrolledY).to.equal(259);
    expect(span.classList.els).to.deep.equal(['active-nav']);
    expect(span1.classList.els).to.deep.equal(['blah']);
    expect(span2.classList.els).to.deep.equal(['blah']);
  });

  it('Can scroll to the first card', () => {
    const card = {};
    card.getBoundingClientRect = () => ({ x: 25, width: 100 });

    const span = {};
    mockClassList(span);

    const doc = {};
    doc.querySelectorAll = () => [];

    let scrolledX;
    let scrolledY;
    const slides = {};
    slides.scrollHeight = 765;
    slides.scrollTo = (x, y) => {
      scrolledX = x;
      scrolledY = y;
    };

    scripts.scrollToCard(0, card, null, slides, span, doc);

    expect(scrolledX).to.equal(0);
    expect(scrolledY).to.equal(765);
    expect(span.classList.els).to.deep.equal(['active-nav']);
  });

  function setupAdjacentTest(activeSpan) {
    const doc = {};
    doc.querySelectorAll = () => [];

    const span1 = {};
    mockClassList(span1);
    const span2 = {};
    mockClassList(span2);
    const span3 = {};
    mockClassList(span3);
    const spans = [span1, span2, span3];
    spans[activeSpan].classList.add('active-nav');

    const div1 = {};
    div1.getBoundingClientRect = () => ({ x: 0, width: 100 });
    const div2 = {};
    div2.getBoundingClientRect = () => ({ x: 110, width: 100 });
    const div3 = {};
    div3.getBoundingClientRect = () => ({ x: 220, width: 100 });
    const divs = [div1, div2, div3];

    return {
      doc,
      spans,
      divs,
    };
  }

  it('Can scroll to next adjacent card', () => {
    const { doc, spans, divs } = setupAdjacentTest(0);

    let scrolledX;
    let scrolledY;
    const slides = {};
    slides.scrollHeight = 256;
    slides.scrollTo = (x, y) => {
      scrolledX = x;
      scrolledY = y;
    };

    scripts.scrollToAdjacent(spans, divs, slides, true, doc);

    expect(scrolledX).to.equal(110);
    expect(scrolledY).to.equal(256);
  });

  it('Can scroll to next adjacent card, rotating to start', () => {
    const { doc, spans, divs } = setupAdjacentTest(2);

    let scrolledX;
    let scrolledY;
    const slides = {};
    slides.scrollHeight = 256;
    slides.scrollTo = (x, y) => {
      scrolledX = x;
      scrolledY = y;
    };

    scripts.scrollToAdjacent(spans, divs, slides, true, doc);

    expect(scrolledX).to.equal(0);
    expect(scrolledY).to.equal(256);
  });

  it('Can scroll to previous adjacent card, rotating to end', () => {
    const { doc, spans, divs } = setupAdjacentTest(0);

    let scrolledX;
    let scrolledY;
    const slides = {};
    slides.scrollHeight = 256;
    slides.scrollTo = (x, y) => {
      scrolledX = x;
      scrolledY = y;
    };

    scripts.scrollToAdjacent(spans, divs, slides, false, doc);

    expect(scrolledX).to.equal(220);
    expect(scrolledY).to.equal(256);
  });

  it('Can scroll to an adacent card', () => {
    const span1 = {};
    mockClassList(span1);
    const span2 = {};
    mockClassList(span2);
    const span3 = {};
    mockClassList(span3);
    const spans = [span1, span2, span3];

    let scrolledX;
    let scrolledY;
    const slides = {};
    slides.scrollHeight = 256;
    slides.scrollTo = (x, y) => {
      scrolledX = x;
      scrolledY = y;
    };

    scripts.scrollToAdjacent(spans, undefined, undefined, true, undefined);

    expect(scrolledX).to.be.undefined;
    expect(scrolledY).to.be.undefined;
  });
});
