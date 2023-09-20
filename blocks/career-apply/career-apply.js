import { getLanguage } from '../../scripts/scripts.js';
import { fetchPlaceholders } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const placeholders = await fetchPlaceholders(getLanguage());

  const section = document.querySelector('.section.career-apply-container');
  if (section) {
    section.classList.add('full-width');
  }

  const title = document.createElement('h2');
  title.innerText = placeholders['career-apply-title'];
  block.appendChild(title);

  const msg = document.createElement('p');
  msg.innerText = placeholders['career-apply-msg'];
  block.appendChild(msg);

  const buttonBar = document.createElement('p');
  buttonBar.classList.add('button-container');
  const search = document.createElement('a');
  search.innerText = placeholders['career-apply-search'];
  search.classList.add('button', 'primary');
  search.href = placeholders['career-apply-search-href'];
  buttonBar.appendChild(search);

  const linkedin = document.createElement('a');
  linkedin.innerText = placeholders['career-apply-linkedin'];
  linkedin.classList.add('button', 'primary', 'linkedin');
  linkedin.href = placeholders['career-apply-linkedin-href'];
  const sprite = document.createElement('span');
  sprite.classList.add('icon', 'icon-linkedin');
  linkedin.appendChild(sprite);
  buttonBar.append(linkedin);
  block.appendChild(buttonBar);
}
