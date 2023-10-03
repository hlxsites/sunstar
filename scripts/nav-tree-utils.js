import { createOptimizedPicture } from './lib-franklin.js';

function addBackdropEventListeners(element) {
  element.addEventListener('mouseover', () => {
    document.querySelector('.backdrop').classList.add('visible');
  });
  element.addEventListener('mouseleave', () => {
    document.querySelector('.backdrop').classList.remove('visible');
  });
}

/**
 * @param {String} HTML representing a single element
 * @return {Element}
 */
function htmlToElement(html) {
  const template = document.createElement('template');
  const trimmedHtml = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = trimmedHtml;
  return template.content.firstChild;
}

function decorateChildNodes(parent, json, level) {
  const nodes = json.reduce((accumalator, data) => {
    if (data.parent && data.parent.toLowerCase() === parent.category.toLowerCase()) {
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
