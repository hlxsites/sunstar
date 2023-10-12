/*
* Fragment Block
* Include content from one Helix page in another.
* https://www.hlx.live/developer/block-collection/fragment
*/
import { loadFragment } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment = await loadFragment(path);
  if (fragment) {
    const fragmentSection = fragment.querySelector(':scope .section');
    if (fragmentSection) {
      block.closest('.section').classList.add(...fragmentSection.classList);
      fragmentSection.childNodes.forEach((childNode) => {
        if (childNode.classList?.contains('section-container')) {
          // Remving extra section container which is getting added
          childNode.replaceWith(...childNode.children);
        }
      });
      block.closest('.fragment-wrapper').replaceWith(...fragmentSection.childNodes);
    }
  }
}
