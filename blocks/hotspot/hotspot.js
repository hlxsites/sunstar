export default function decorate(block) {
  [...block.children].forEach((row, r) => {
    if (r > 0) {
      const nexticondiv = document.createElement('div');
      nexticondiv.style.left = [...row.children][1].textContent;
      nexticondiv.style.top = [...row.children][2].textContent;
      nexticondiv.innerText = [...row.children][0].textContent;
      row.after(nexticondiv);
      row.remove();
    }
  });
}
