const images = [
  'https://www.sunstar.com/wp-content/uploads/2019/12/person-4.png',
  'https://www.sunstar.com/wp-content/uploads/2019/12/person-1.png',
  'https://www.sunstar.com/wp-content/uploads/2019/12/laura.png',
  'https://www.sunstar.com/wp-content/uploads/2019/12/person-2.png',
  'https://www.sunstar.com/wp-content/uploads/2020/03/ce%CC%81cile.png',
];
const links = [
  'https://www.sunstar.com/career/hu-jie/',
  'https://www.sunstar.com/career/gilles-pichon/',
  'https://www.sunstar.com/career/laura-borsari/',
  'https://www.sunstar.com/career/supinda-watcharotone/',
  'https://www.sunstar.com/career/cecile-rigal/',
];
const quotes = [
  'Sunstar provides me with plenty of opportunities to expand my skills into new areas, in a supportive environment.',
  'What’s important to me? Working somewhere that’s positive, collaborative and motivating, within a human-scale…',
  'Sunstar allows you to learn and grow, trusting each person immensely. You’re free to aim higher and achieve more.',
  'Sunstar is supportive of me in gaining new skills and expanding my expertise, which speak volumes about how much…',
  'In the end, I’m happy to come here every morning, and I think it’s vital because, if you feel like part of the…',
];
const names = [
  'Hu Jie',
  'Gilles Pichon',
  'Laura Borsari',
  'Supinda Watcharotone',
  'Cécile Rigal',
];
const roles = [
  'Marketing Manager in the Retail Business Group at Sunstar China',
  'Gerente de ventas en Dental Profesional en Sunstar Francia',
  'Managing Director at Sunstar Engineering Italy',
  'Senior R&D Engineer at Sunstar Americas',
  'Sr Brand Manager at Sunstar France',
];

export default function decorate(block) {
  const careerSlider = document.createElement('div');
  careerSlider.classList.add('career-slider');

  const careerSlides = document.createElement('div');
  careerSlides.classList.add('career-slides');

  const slideDivs = [];
  for (let i = 0; i < images.length; i += 1) {
    const div = document.createElement('div');
    div.id = `cs-${i}`;
    div.classList.add('career-card');
    const a = document.createElement('a');
    a.href = links[i];
    const fig = document.createElement('figure');
    const img = document.createElement('img');
    img.src = images[i];
    img.alt = names[i];
    fig.appendChild(img);
    a.appendChild(fig);

    const bq = document.createElement('blockquote');
    bq.textContent = quotes[i];
    a.appendChild(bq);

    const nm = document.createElement('h6');
    nm.textContent = names[i];
    a.appendChild(nm);

    const role = document.createElement('p');
    role.textContent = roles[i];
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

  for (let i = 0; i < images.length; i += 1) {
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
