export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 0) div.className = 'boxes-card-title';
      else div.className = 'boxes-card-body';
    });
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
