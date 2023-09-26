import { fetchIndex } from '../../scripts/scripts.js';

function filterIncompleteEntries(json) {
  return json.data.filter((e) => e.image !== '' && e['career-quote'] !== '0' && e['career-jobtitle'] !== '0');
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

  const al = document.createElement('a');
  al.textContent = '<';
  al.onclick = () => careerSlides.scrollTo(0, careerSlides.scrollHeight);
  careerSlider.appendChild(al);

  for (let i = 0; i < data.length; i += 1) {
    const a = document.createElement('a');
    a.textContent = `${i}`;
    a.onclick = () => slideDivs[i].scrollIntoView();
    careerSlider.appendChild(a);
  }

  const ar = document.createElement('a');
  ar.textContent = '>';
  ar.onclick = () => {
    const div = slideDivs[slideDivs.length - 1];
    const rect = div.getBoundingClientRect();
    careerSlides.scrollTo(rect.right, careerSlides.scrollHeight);
  };

  careerSlider.appendChild(ar);

  block.appendChild(careerSlider);
}
