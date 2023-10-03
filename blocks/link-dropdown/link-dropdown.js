import { getNamedValueFromTable } from '../../scripts/scripts.js';

function getTitle(block) {
  const div = getNamedValueFromTable(block, 'Title');
  div.classList.add('link-dropdown-title');
  return div;
}

function getLinks(block) {
  const ul = block.querySelector('ul');
  ul.querySelectorAll('li a').forEach((a) => {
    a.target = '_self';
  });
  return ul;
}

function addEvent(title, ul) {
  title.addEventListener('click', () => {
    ul.classList.toggle('visible');
    title.classList.toggle('visible');
  });
}

export default async function decorate(block) {
  const title = getTitle(block);
  const links = getLinks(block);
  addEvent(title, links);
  block.replaceChildren(title);
  block.append(links);
}
