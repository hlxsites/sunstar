function buildMutipleTables(block) {
  const mainContent = block.parentNode.parentNode;
  if (mainContent.querySelectorAll(':scope > .flat-table').length < 2) return;
  const mainChildren = [...mainContent.children];
  const mainTmp = document.createElement('div');
  for (let i = 0; i < mainChildren.length; i += 1) {
    if ((mainChildren[i].classList.contains('flat-table') && i === 0)
      || (mainChildren[i].classList.contains('flat-table') && !mainChildren[i - 1].classList.contains('flat-table'))) {
      const multiTable = document.createElement('div');
      multiTable.classList.add('multiple-table');
      for (let j = i; j < mainChildren.length; j += 1) {
        const currentIsFlatTable = mainChildren[j].classList.contains('flat-table');
        if (currentIsFlatTable && j === mainChildren.length - 1) {
          multiTable.append(mainChildren[j]);
          break;
        }
        const nextIsFlatTable = mainChildren[j + 1].classList.contains('flat-table');
        if (currentIsFlatTable && nextIsFlatTable) {
          multiTable.append(mainChildren[j]);
        }
        if (currentIsFlatTable && !nextIsFlatTable) {
          multiTable.append(mainChildren[j]);
          i = j;
          break;
        }
      }
      mainTmp.append(multiTable);
    } else {
      mainTmp.append(mainChildren[i]);
    }
  }
  mainContent.replaceChildren(...mainTmp.childNodes);
}

export default async function decorate(block) {
  const tableDiv = document.createElement('div');
  tableDiv.classList.add('table-item');
  const tableTitle = document.createElement('h3');
  tableTitle.classList.add('table-title');
  const tableAnnotation = document.createElement('p');
  tableAnnotation.classList.add('table-annotation');
  [...block.children].forEach((child, i) => {
    if (i === 0) {
      tableTitle.innerHTML = [...child.children][1].innerHTML;
    } else if (i === 1) {
      tableAnnotation.innerHTML = [...child.children][1].innerHTML;
    } else {
      if (tableDiv.getAttribute('style') === null) {
        const rowLength = ([...block.children].length - 2).toString();
        const colLength = ([...child.children].length - 1).toString();
        tableDiv.setAttribute('style', `--row:${rowLength};--col:${colLength}`);
      }
      [...child.children].forEach((childDiv, x) => {
        if (x) {
          if (i === 2) childDiv.classList.add('table-head');
          tableDiv.append(childDiv);
        }
      });
    }
  });
  if (tableTitle.innerHTML === '') {
    block.replaceChildren(tableDiv);
    if (tableAnnotation.innerHTML !== '') block.append(tableAnnotation);
  } else {
    block.replaceChildren(tableTitle);
    block.append(tableDiv);
    if (tableAnnotation.innerHTML !== '') block.append(tableAnnotation);
  }
  if (block.classList.contains('flat')) block.parentElement.classList.add('flat-table');
  buildMutipleTables(block);
}
