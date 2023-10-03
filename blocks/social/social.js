/**
 * decorates the social block
 * @param {Element} block The social block element
 */
export default async function decorate(block) {
  const childs = Array.from(block.children);
  const spanWithImg = [];

  childs.forEach((x) => {
    const a = x.querySelector('a');
    const span = document.createElement('span');
    const newAnchor = document.createElement('a');
    newAnchor.href = a.href.replaceAll(/%5C%5C&/g, '&'); // Replacing extra backslash which is getting appended
    const firstGrandChild = x.querySelector('div');
    span.classList.add(`icon-${firstGrandChild.innerText.toLowerCase()}`, 'icon');
    newAnchor.appendChild(span);
    spanWithImg.push(newAnchor);
  });

  block.innerHTML = '';
  const span = document.createElement('span');
  span.innerText = 'SHARE';
  block.appendChild(span);

  spanWithImg.forEach((x) => {
    block.appendChild(x);
  });

  const socialContainer = block.closest('.section.social-container>.section-container');
  const firstP = socialContainer ? socialContainer.querySelector('p') : null;

  if (firstP && firstP.nextElementSibling?.tagName === 'H1') {
    const innerSpan = document.createElement('span');
    innerSpan.textContent = firstP.textContent;
    innerSpan.classList.add('tag-name');
    firstP.replaceWith(innerSpan);
  }
}
