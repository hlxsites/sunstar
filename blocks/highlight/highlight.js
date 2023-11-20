export default async function decorate(block) {
  let spotlight = document.createElement('div');
  const hideSpotlight = (block.classList.contains('feed-newsroom'));
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
  if (!hideSpotlight) block.appendChild(spotlight);
  block.appendChild(others);
}
