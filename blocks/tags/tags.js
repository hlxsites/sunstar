/**
* decorates the tags block
* @param {Element} block The social block element
*/
export default async function decorate(block) {
  const tags = block.querySelectorAll('a');
  block.innerHTML = '';

  [...tags].forEach((tag) => {
    block.appendChild(tag);
  });
}
