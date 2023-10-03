export default function decorate(block) {
  const children = [...block.children];

  const caption = block.classList.contains('image-with-caption');
  const title = block.classList.contains('image-with-title');

  if (caption || title) {
    children.forEach((x) => {
      const img = x.querySelector('picture');

      if (img && img.parentElement && img.parentElement.nextElementSibling && img.parentElement.nextElementSibling.tagName === 'DIV') {
        if (caption) {
          img.parentElement.nextElementSibling.classList.add('image-caption');
        } else if (title) {
          img.parentElement.nextElementSibling.classList.add('image-title');
        }
      }
    });
  }
}
