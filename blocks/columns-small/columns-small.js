import { wrapImgsInLinks } from '../../scripts/scripts.js';

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-small-${cols.length}-cols`);
  const textOnlyColBlock = !block.querySelector('picture');

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      wrapImgsInLinks(col);
      if (!textOnlyColBlock) {
        const pics = col.querySelectorAll('picture');
        if (pics.length) {
          const picWrapper = pics[0].closest('div');
          if (picWrapper && picWrapper.children.length === pics.length) {
            // pictures (either wrapped in achors, or otherwise)
            // are only content in the column
            picWrapper.classList.add('columns-small-img-col');
          }
        }
      }
    });
  });

  // decorate columns-small with description content
  [...block.children].forEach((row) => {
    const cells = row.querySelectorAll('div:not(.columns-small-img-col)');
    if (cells.length) {
      [...cells].forEach((content) => {
        content.classList.add('description');
        const contentWrapper = document.createElement('div');
        contentWrapper.classList.add('description-wrapper');
        const contentParent = content.parentElement;
        contentParent.insertBefore(contentWrapper, content);
        contentWrapper.appendChild(content);
        if (textOnlyColBlock) {
          content.classList.add('text-only');
        }
      });
    }
  });
}
