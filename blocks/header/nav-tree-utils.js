import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { htmlToElement } from '../../scripts/scripts.js';

function getBackButton() {
  const backButton = htmlToElement(`<div class="menu-back-btn">
    <span class="icon icon-angle-left"></span>
    <a>Back To Menu</a>
  </div>`);
  return backButton;
}

function attachBackButtonEventListeners(backButton, element) {
  backButton.addEventListener('click', () => {
    document.querySelector('.navbar-toggler').classList.add('visible');
    element.parentElement.querySelector('.mega-dropdown').classList.remove('visible');
    backButton.classList.remove('visible');
    backButton.remove();
  });
}

function addDropdownEventListeners(element) {
  const widerScreenWidth = window.matchMedia('(min-width: 77rem)');
  element.addEventListener('click', (evt) => {
    if (element !== evt.target) return;
    if (!widerScreenWidth.matches) {
      const backButton = getBackButton();
      attachBackButtonEventListeners(backButton, element);
      evt.preventDefault();
      evt.stopPropagation();
      element.closest('nav').insertBefore(backButton, document.querySelector('.navbar-toggler'));
      document.querySelector('.menu-back-btn').classList.add('visible');
      document.querySelector('.navbar-toggler').classList.remove('visible');
      element.parentElement.querySelector('.mega-dropdown').classList.add('visible');
    }
  });
}

function addBackdropEventListeners(element) {
  element.addEventListener('mouseover', () => {
    const backdrop = document.querySelector('.backdrop');
    backdrop.classList.add('visible');
  });
  element.addEventListener('mouseleave', () => {
    const backdrop = document.querySelector('.backdrop');
    backdrop.classList.remove('visible');
  });
}

function decorateChildNodes(parent, json, level) {
  const nodes = json.reduce((accumalator, data) => {
    if (data.parent?.toLowerCase() === parent.category.toLowerCase()) {
      const children = data.hasChild === 'true' ? decorateChildNodes(data, json, level + 1) : '';
      if (data.link && !children) {
        return `${accumalator} <a class="link" href=${data.link}>${data.category}</a>`;
      } if (!data.link && children) {
        return `${accumalator} <div class="menu-level-${level}-item"><h6 class="subtitle">${data.category}</h6>${children}</div>`;
      }
      return accumalator;
    }
    return accumalator;
  }, '');
  return `<div class="menu-level-${level}">${nodes}</div>`;
}

function decorateNodes(json, level) {
  const ul = htmlToElement(`<ul class=menu-level-${level}></ul>`);
  json.forEach((data) => {
    if (!data.parent || data.parent === '') {
      const children = data.hasChild === 'true' ? decorateChildNodes(data, json, level + 1) : '';
      let li;
      if (children) {
        const picture = createOptimizedPicture(data.image, '', false, [{ width: '800' }]);
        li = htmlToElement(`<li class="drop menu-level-${level}-item"> 
          <a class="link" href=${data.link}>${data.category}</a>
          <div class="mega mega-dropdown">
            <div class="mega-container">
              <div class="left-content">
                <div class="left-content-container">
                  <div class="main-item-summary">
                    <a href="${data.link}">
                      <h2>${data.category}
                      <span class="icon angle-right"></span>
                      </h2>
                    </a>
                    <p>${data.description}</p>
                  </div>
                  <nav class="mega-sub-menu">
                    <h3 class="mobile-menu-header">
                      <a class="link" href="${data.link}">${data.category}</a>
                    </h3>
                    ${children}
                  </nav>
                </div>
              </div>
              <div class="right-content">
                ${picture.outerHTML}
            </div>
          </div>
        </li>`);
        addBackdropEventListeners(li);
        addDropdownEventListeners(li.querySelector('a:first-child'));
      } else {
        li = htmlToElement(`<li class="menu-level-${level}-item"><a class="link" href=${data.link}>${data.category}</a></li>`);
      }
      ul.appendChild(li);
    }
  });
  return ul;
}

export default function buildNavTree(navTreeJson) {
  return decorateNodes(navTreeJson.data, 1);
}
