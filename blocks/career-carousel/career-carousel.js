import { fetchIndex } from '../../scripts/scripts.js';

function filterIncompleteEntries(json) {
  return json.data.filter((e) => e.image !== '' && e['career-quote'] !== '0' && e['career-jobtitle'] !== '0');
}

function scrollToCard(idx, card, prevCard, slides) {
  const rect = card.getBoundingClientRect();

  // Compute the gap to add to the location
  let gap = 0;
  if (prevCard) {
    const prevRect = prevCard.getBoundingClientRect();
    gap = rect.x - (prevRect.x + prevRect.width);
  }

  slides.scrollTo(idx * (rect.width + gap), slides.scrollHeight);
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
    const fig = document.createElement('figure');
    const img = document.createElement('img');
    img.src = data[i].image;
    img.alt = data[i].pagename;
    fig.appendChild(img);
    a.appendChild(fig);

    const bq = document.createElement('blockquote');
    bq.textContent = data[i]['career-quote'];
    a.appendChild(bq);

    const nm = document.createElement('h6');
    nm.textContent = data[i].pagename;
    a.appendChild(nm);

    const role = document.createElement('p');
    role.textContent = data[i]['career-jobtitle'];
    a.appendChild(role);

    const link = document.createElement('button');
    link.textContent = 'Read More '; // TODO
    const arrow = document.createElement('img');
    arrow.src = '/icons/angle-right-blue.svg';
    arrow.classList.add('icon-angle-right-blue');
    link.appendChild(arrow);
    a.appendChild(link);
    div.appendChild(a);

    careerSlides.appendChild(div);
    slideDivs.push(div);
  }
  careerSlider.appendChild(careerSlides);

  const navButtons = document.createElement('div');
  navButtons.classList.add('career-slides-nav');

  const al = document.createElement('a');
  al.textContent = '<';
  al.onclick = () => careerSlides.scrollTo(0, careerSlides.scrollHeight);
  navButtons.appendChild(al);

  for (let i = 0; i < data.length; i += 1) {
    const a = document.createElement('a');
    a.textContent = `${i}`;
    const prevDiv = i > 0 ? slideDivs[i - 1] : null;
    a.onclick = () => scrollToCard(i, slideDivs[i], prevDiv, careerSlides);
    navButtons.appendChild(a);
  }

  const ar = document.createElement('a');
  ar.textContent = '>';
  ar.onclick = () => {
    const div = slideDivs[slideDivs.length - 1];
    const rect = div.getBoundingClientRect();
    careerSlides.scrollTo(rect.right, careerSlides.scrollHeight);
  };
  navButtons.appendChild(ar);
  careerSlider.appendChild(navButtons);

  block.appendChild(careerSlider);
}
