import {
  loadFragment,
  MODAL_FRAGMENTS_ANCHOR_SELECTOR,
} from '../../scripts/scripts.js';

function getModalId(path) {
  const segments = path.split('/');
  return `#${segments.pop()}-modal`;
}

const openModal = async (a, url, block, hasSearchParam = false) => {
  a.addEventListener('click', async (e) => {
    e.preventDefault();

    const path = new URL(url).pathname;
    const modalId = getModalId(path);
    const elem = document.getElementById(modalId);

    if (!elem || hasSearchParam) {
      if (hasSearchParam) block.innerHTML = '';
      const wrapper = document.createElement('div');
      wrapper.className = 'modal-wrapper';
      wrapper.id = modalId;
      wrapper.dataset.url = url;

      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.innerHTML = '<div class="modal-close"></div>';
      const modalContent = document.createElement('div');
      modalContent.classList.add('modal-content');
      modal.append(modalContent);

      if (path) {
        const fragment = await loadFragment(path);
        const formTitleEl = fragment.querySelector('h2');
        if (formTitleEl) formTitleEl.outerHTML = `<div class="modal-form-title typ-title1">${formTitleEl.innerHTML}</div>`;
        const formSubTitleEl = fragment.querySelector('h3');
        if (formSubTitleEl) formSubTitleEl.outerHTML = `<p class="modal-form-subtitle">${formSubTitleEl.innerHTML}</p>`;
        modalContent.append(fragment);
      }

      wrapper.append(modal);
      block.append(wrapper);
      wrapper.classList.add('visible');
      const close = modal.querySelector('.modal-close');
      close.addEventListener('click', () => {
        wrapper.remove();
      });
    } else {
      elem.classList.add('visible');
    }
  });
};

export default async function decorate(block) {
  document.querySelectorAll(MODAL_FRAGMENTS_ANCHOR_SELECTOR).forEach((a) => {
    const path = new URL(a.href).pathname;
    a.dataset.path = path;
    const modalId = getModalId(path);
    a.dataset.modal = modalId;
    const url = a.href;
    a.href = '#';
    if (path.includes('videos')) {
      a.classList.add('video-link');
    }
    const hasSearchParam = new URL(url).search.length > 0;
    openModal(a, url, block, hasSearchParam);
  });
}
