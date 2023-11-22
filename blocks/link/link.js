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
  }
}
