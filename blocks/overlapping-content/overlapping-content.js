import { decorateRenderHints } from '../../scripts/lib-franklin.js';

function decorateAnchors(row, shouldHaveButtons) {
  const anchors = row.querySelectorAll('a');
  if (anchors.length) {
    [...anchors].forEach((a) => {
      a.title = a.title || a.textContent;
      const up = a.parentElement;
      if (up.tagName === 'P') {
        up.classList.add('button-container');
      }
      if (!shouldHaveButtons) {
        a.classList.add('tertiary');
        a.classList.remove('primary');
      }
    });
  }
}

function decorateImgContainer(row) {
  const pic = row.querySelector('picture');
  if (pic) {
    const picWrapper = pic.closest('div');
    if (picWrapper && picWrapper.children.length === 1) {
      // picture is only item in row
      picWrapper.classList.add('singleton-img-container');
    }
  } else {
    // insert empty div to identify non-image content
    const div = document.createElement('div');
    div.classList.add('non-img-container');
    const descendent = row.firstElementChild;
    row.insertBefore(div, row.firstElementChild);
    div.appendChild(descendent);
  }
}

function injectItemWidthVar(row) {
  let itemWidth = '100%';
  row.classList.forEach((cls) => {
    if (/\d%/.test(cls)) {
      itemWidth = cls;
    }
  });
  if (itemWidth !== '100%') {
    row.style.setProperty('--item-width', itemWidth);
  }
}

function injectBackgroundDivForText(row) {
  const hasBg = row.classList.contains('background');
  if (hasBg && row.innerText.trim().length) {
    const bgWrapper = document.createElement('div');
    const descendentRoot = row.querySelector(':scope > div > div');
    descendentRoot.parentElement.insertBefore(bgWrapper, descendentRoot);
    bgWrapper.appendChild(descendentRoot);
    bgWrapper.classList.add('background-wrapper');
  }
}

export default function decorate(block) {
  const shouldHaveButtons = !block.classList.contains('no-buttons');
  decorateRenderHints(block);

  [...block.children].forEach((row) => {
    row.classList.add('overlapping-content-item');
    injectItemWidthVar(row);
    decorateImgContainer(row);
    decorateAnchors(row, shouldHaveButtons);
    injectBackgroundDivForText(row);
  });
}
