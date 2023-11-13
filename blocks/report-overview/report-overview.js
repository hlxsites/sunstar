import { getNamedValueFromTable } from '../../scripts/scripts.js';

function createDiv(className) {
  const div = document.createElement('div');
  div.classList.add(className);
  return div;
}

export default async function decorate(block) {
  const overviewText = getNamedValueFromTable(block, 'Overview');
  const countriesSurveyedText = getNamedValueFromTable(block, 'Countries surveyed');
  const overviewLeft = createDiv('overview-left');
  const overviewRight = createDiv('overview-right');
  const countriesSurveyedMobile = createDiv('mobile-visible');
  const countriesSurveyedDesktop = createDiv('desktop-visible');

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      if (col.querySelector('img')) {
        const leftDetail = createDiv('overview-left-details');
        const icon = createDiv('overview-icon');
        const text = createDiv('overview-text');
        [...col.children].forEach((tag) => {
          if (tag.querySelector('img')) {
            icon.appendChild(tag);
          } else {
            text.appendChild(tag);
          }
        });
        leftDetail.appendChild(icon);
        leftDetail.appendChild(text);
        overviewLeft.appendChild(leftDetail);
      }
    });
  });
  countriesSurveyedMobile.append(countriesSurveyedText.cloneNode(true));
  overviewLeft.appendChild(countriesSurveyedMobile);
  overviewRight.append(overviewText);
  countriesSurveyedDesktop.append(countriesSurveyedText);
  overviewRight.appendChild(countriesSurveyedDesktop);

  block.replaceChildren(overviewLeft);
  block.appendChild(overviewRight);
}
