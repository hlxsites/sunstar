export default async function decorate(block) {
  if (block.classList.contains('large-background-button')) {
    if (block.children[0] && block.children[0].children[0]) {
      const a = document.createElement('a');
      a.classList.add('download-link');
      const icon = document.createElement('img');
      icon.src = '/icons/download-orange.svg';
      icon.classList.add('download-icon');
      let href = '';
      const contents = block.children[0].children[0];
      [...contents.children].forEach((item) => {
        const link = block.querySelector('a');
        if (link) {
          item.textContent = link.textContent;
          if (link.href && !href) {
            href = link.href;
          }
          link.remove();
        }
      });
      contents.classList.add('download-details');
      a.href = href;
      a.target = '_blank';
      a.appendChild(icon);
      a.appendChild(contents);
      block.replaceChildren(a);
    }
  } else if (block.classList.contains('breadcrumb')) {
    const anchorElements = block.querySelectorAll('.button-container a');

    const navElement = document.createElement('nav');

    anchorElements.forEach((anchor) => {
      const href = anchor.getAttribute('href');
      const title = anchor.getAttribute('title');

      const newAnchor = document.createElement('a');
      newAnchor.setAttribute('href', `/${href.split('/').pop()}/`);
      newAnchor.innerHTML = `${title}`;

      navElement.appendChild(newAnchor);
    });

    block.replaceChildren(navElement);
  }
}
