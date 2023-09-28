import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { fetchIndex } from '../../scripts/scripts.js';

function filterIncompleteEntries(json) {
  return json.data.filter((e) => e.image !== '' && e['career-quote'] !== '0' && e['career-jobtitle'] !== '0');
}

function scrollToCard(idx, card, precedingCard, slides, span) {
  const rect = card.getBoundingClientRect();

  // set the style on the active button
  const buttons = document.querySelectorAll('.career-slides-nav span');
  buttons.forEach((b) => b.classList.remove('active-nav'));
  span.classList.add('active-nav');

  // Compute the gap to add to the location
  let gap = 0;
  if (precedingCard) {
    const prevRect = precedingCard.getBoundingClientRect();
    gap = rect.x - (prevRect.x + prevRect.width);
  }

  slides.scrollTo(idx * (rect.width + gap), slides.scrollHeight);
}

function scrollToAdjecent(spans, slideDivs, slides, next) {
  let curActive;
  for (let i = 0; i < spans.length; i += 1) {
    if (spans[i].classList.contains('active-nav')) {
      curActive = i;
      break;
    }
  }

  if (curActive === undefined) {
    return;
  }

  const newActive = curActive + (next ? 1 : -1);
  if (newActive < 0 || newActive >= spans.length) {
    return;
  }

  if (slideDivs.length <= newActive) {
    return;
  }

  scrollToCard(
    newActive,
    slideDivs[newActive],
    newActive > 0 ? slideDivs[newActive - 1] : null,
    slides,
    spans[newActive],
  );
}

export default async function decorate(block) {
  const json = await fetchIndex('query-index', 'career-testimonials');
  const data = filterIncompleteEntries(json);

  const careerSlider = document.createElement('div');
  careerSlider.classList.add('career-slider');

  const careerSlides = document.createElement('div');
  careerSlides.classList.add('career-slides');

  const slideDivs = [];
  for (let i = 0; i < data.length; i += 1) {
    const div = document.createElement('div');
    div.classList.add('career-card');
    const a = document.createElement('a');
    a.href = data[i].path;
    const pic = createOptimizedPicture(data[i].image, data[i].pagename);
    a.append(pic);

    const bq = document.createElement('blockquote');
    bq.textContent = data[i]['career-quote'];
    a.append(bq);

    const nm = document.createElement('h6');
    nm.textContent = data[i].pagename;
    a.append(nm);

    const role = document.createElement('p');
    role.textContent = data[i]['career-jobtitle'];
    a.append(role);

    const link = document.createElement('button');
    link.textContent = 'Read More '; // TODO
    const arrow = document.createElement('img');
    arrow.src = '/icons/angle-right-blue.svg';
    arrow.alt = 'Read more';
    arrow.classList.add('icon-angle-right-blue');
    link.append(arrow);
    a.append(link);
    div.append(a);

    careerSlides.append(div);
    slideDivs.push(div);
  }
  careerSlider.append(careerSlides);

  const navBar = document.createElement('div');
  navBar.classList.add('career-slides-navbar');
  const navButtons = document.createElement('div');
  navButtons.classList.add('career-slides-nav');

  const buttons = [];
  for (let i = 0; i < data.length; i += 1) {
    const prevDiv = i > 0 ? slideDivs[i - 1] : null;

    const s = document.createElement('span');
    if (i === 0) {
      s.classList.add('active-nav');
    }
    s.tabIndex = '-1';
    s.onclick = () => scrollToCard(i, slideDivs[i], prevDiv, careerSlides, s);
    navButtons.append(s);

    buttons.push(s);
  }
  const la = document.createElement('img');
  la.src = '/icons/angle-left-blue.svg';
  la.alt = 'Previous person card';
  la.classList.add('btn-angle');
  la.onclick = () => scrollToAdjecent(buttons, slideDivs, careerSlides, false);
  navButtons.prepend(la);

  const ra = document.createElement('img');
  ra.src = '/icons/angle-right-blue.svg';
  ra.alt = 'Next person card';
  ra.classList.add('btn-angle');
  ra.onclick = () => scrollToAdjecent(buttons, slideDivs, careerSlides, true);
  navButtons.append(ra);
  navBar.append(navButtons);

  block.append(careerSlider);
  block.append(navBar);
}
