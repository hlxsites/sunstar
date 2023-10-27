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
      }
    });
  });

  // decorate columns with non-singleton-image content
  [...block.children].forEach((row) => {
    const cells = row.querySelectorAll('div:not(.img-col)');
    if (cells.length) {
      [...cells].forEach((content) => {
        content.classList.add('text-col');
        const contentWrapper = document.createElement('div');
        contentWrapper.classList.add('text-col-wrapper');
        const contentParent = content.parentElement;

        // add video modal support if there is an anchor tag after the picture
        if (content.querySelector('picture') && content.querySelector('a')) {
          content.classList.remove('text-col');
          contentWrapper.classList.remove('text-col-wrapper');
          content.classList.add('img-col');
          content.classList.add('video-modal');
          contentWrapper.classList.add('img-col-wrapper');

          // add the picture inside the anchor tag and remove the text
          const anchor = content.querySelector('a');
          anchor.textContent = '';
          anchor.classList.add('video-modal');
          const picture = content.querySelector('picture');
          picture.classList.add('video-modal');
          anchor.appendChild(picture);

          // remove empty paragraphs
          content.querySelectorAll('p').forEach((p) => {
            if (!p.querySelector('a')) {
              p.remove();
            }
          });

          picture.querySelector('img').classList.add('video-modal');
        }

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
