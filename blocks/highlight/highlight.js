export default async function decorate(block) {
  let spotlight = document.createElement('div');
  const check = (block.classList.contains('feed-newsroom'));
  spotlight.classList.add('spotlight');
  const others = document.createElement('div');
  others.classList.add('others');
  block.querySelectorAll(':scope > div').forEach((div, index) => {
    if (index === 0) {
      spotlight = div;
    } else {
      div.classList.add('other');
      others.appendChild(div);
    }
  });
  block.innerHTML = '';
  if (!check) block.appendChild(spotlight);
  block.appendChild(others);
}
