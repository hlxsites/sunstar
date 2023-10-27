export default function decorate(block) {
  const background = block.classList.contains('backgroundimage');
  if (background) {
    // remove first column if background is enabled and use the image
    // as background for the section
    const imageRef = block.firstElementChild.querySelector('img');
    if (imageRef != null) {
      block.firstElementChild.remove();
      const backgroundDiv = document.createElement('div');
      backgroundDiv.classList.add('backgroundimage');
      backgroundDiv.style.backgroundImage = `url(${imageRef.src})`;
      const section = block.parentElement.parentElement.parentElement;
      section.classList.add('backgroundimage');
      section.insertBefore(backgroundDiv, section.firstChild);
    }
  }
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);
  const textOnlyColBlock = !block.querySelector('picture');

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      if (!textOnlyColBlock) {
        const pics = col.querySelectorAll('picture');
        if (pics.length) {
          const picWrapper = pics[0].closest('div');
          if (picWrapper && picWrapper.children.length === pics.length) {
            // pictures (either wrapped in achors, or otherwise)
            // are only content in the column
            picWrapper.classList.add('img-col');
          }
        }

        // add video modal support if there is an anchor (to a video) and a picture
        const anchor = col.querySelector('a');
        const picture = col.querySelector('picture');
        const anchorIsModal = anchor && anchor.classList.contains('video-link');
        if (picture && anchorIsModal) {
          const contentWrapper = document.createElement('div');
          contentWrapper.classList.add('img-col-wrapper');

          col.classList.add('img-col');
          col.classList.add('video-modal');

          // add the picture inside the anchor tag and remove the text
          anchor.textContent = '';
          anchor.classList.add('video-modal');
          picture.classList.add('video-modal');
          anchor.appendChild(picture);

          // remove empty paragraphs
          col.querySelectorAll('p').forEach((p) => {
            if (!p.querySelector('a')) {
              p.remove();
            }
          });

          picture.querySelector('img').classList.add('video-modal');
          col.parentElement.insertBefore(contentWrapper, col);
          contentWrapper.appendChild(col);
        }
      }
    });
  });

  // decorate columns with non-singleton-image content
  [...block.children].forEach((row) => {
    const cells = row.querySelectorAll('div:not(.img-col):not(.img-col-wrapper)');
    if (cells.length) {
      [...cells].forEach((content) => {
        content.classList.add('text-col');
        const contentWrapper = document.createElement('div');
        contentWrapper.classList.add('text-col-wrapper');
        const contentParent = content.parentElement;
        contentParent.insertBefore(contentWrapper, content);
        contentWrapper.appendChild(content);
        if (textOnlyColBlock) {
          content.classList.add('text-only');
        }
      });
    }
  });

  // stylize anchors unless block has no-buttons class
  if (!block.classList.contains('no-buttons')) {
    [...block.firstElementChild.children].forEach((row) => {
      [...row.children].forEach((col) => {
        const anchors = col.querySelectorAll('a');
        if (anchors.length) {
          [...anchors].forEach((a) => {
            a.title = a.title || a.textContent;
            const up = a.parentElement;
            if (!a.querySelector('img') && up.tagName !== 'LI') {
              if (up.tagName === 'P') {
                up.classList.add('button-container');
              }
              a.classList.add('button');
              if (a.previousElementSibling?.tagName === 'A') {
                a.classList.add('tertiary');
              } else {
                a.classList.add('primary');
              }
            }
          });
        }
      });
    });
  }

  // style headings if collapse is enabled
  const collapseEnabled = block.classList.contains('collapse');
  if (collapseEnabled) {
    [...block.children].forEach((row) => {
      const headings = row.querySelectorAll('h6');
      if (headings.length) {
        [...headings].forEach((h) => {
          h.parentElement.addEventListener('click', () => {
            h.classList.toggle('active');
            const list = h.nextElementSibling;
            if (list) {
              list.classList.toggle('active');
            }
          });
        });
      }
    });
  }
}
