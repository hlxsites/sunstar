export default function decorate(block) {
  if (!block.classList.contains('history-title')) return block;
  let text = block.innerText.trim();
  text = text.split(' ');

  const wrapper = document.createElement('div');
  wrapper.classList.add('history-title-wrapper');
  const textDivs = [];
  const rightDiv = document.createElement('div');
  rightDiv.classList.add('history-title-right');

  text.forEach((element) => {
    const div = document.createElement('div');
    div.innerHTML = element;
    if (text.indexOf(element) === 0 || text.indexOf(element) === 1) {
      textDivs.push(div);
    } else {
      rightDiv.append(div);
    }
  });

  wrapper.replaceChildren(...textDivs, rightDiv);
  block.replaceChildren(wrapper);
  return block;
}
