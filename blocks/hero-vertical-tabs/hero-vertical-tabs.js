function buildTaglist(taglist, ul, tagTitle) {
  const tagListTitle = document.createElement('div');
  tagListTitle.classList.add('hero-vertical-tabs-dropdown-title');
  tagListTitle.textContent = tagTitle;
  taglist.append(tagListTitle);
  ul.classList.add('hero-vertical-tabs-dropdown');
  taglist.addEventListener('click', () => {
    ul.classList.toggle('visible');
    taglist.classList.toggle('visible');
  });

  document.addEventListener('click', (evt) => {
    if (!evt.target.classList.contains('hero-vertical-tabs-taglist-vertical')
      && ul.classList.contains('visible')) {
      ul.classList.remove('visible');
      taglist.classList.remove('visible');
    }
  });

  const listener = (evt) => {
    if (evt.detail.deviceType !== 'Mobile') {
      // For Tablet & Desktop View
      ul.classList.remove('visible');
      taglist.classList.remove('visible');
    }
  };
  window.addEventListener('viewportResize', listener);
  taglist.append(ul);
}

function buildImageAndContent(heroImage, block) {
  const content = document.createElement('div');
  content.classList.add('hero-vertical-tabs-content');
  if ([...block.children][2] != null && [...[...block.children][2].children][1] != null) {
    content.append([...[...block.children][2].children][1]);
  }
  const picture = block.querySelectorAll('picture')[0];
  const imageContent = document.createElement('div');
  imageContent.classList.add('hero-vertical-tabs-bg-right');
  const backgroundLeft = document.createElement('div');
  backgroundLeft.classList.add('hero-vertical-tabs-bg-left');

  imageContent.append(picture);
  imageContent.append(content);
  heroImage.append(backgroundLeft);
  heroImage.append(imageContent);
}

function buildUl(ul, block) {
  let textContent = '';
  block.querySelectorAll('ul li').forEach((li) => {
    if (li.querySelector('strong') !== null) {
      const aLink = li.querySelectorAll('a')[0];
      textContent = aLink.textContent;
      li.innerHTML = '';
      li.append(aLink);
      li.classList.add('active');
      ul.append(li);
    }
    ul.append(li);
  });
  return textContent;
}

export default async function decorate(block) {
  const taglistDropdown = document.createElement('div');
  const heroImage = document.createElement('div');
  const taglistMenu = document.createElement('div');
  const ul = document.createElement('ul');
  taglistDropdown.classList.add('hero-vertical-tabs-taglist-vertical');
  heroImage.classList.add('hero-vertical-tabs-background-image');
  taglistMenu.classList.add('hero-vertical-tabs-taglist-horizontal');
  const tagTitle = buildUl(ul, block);
  const ulPc = ul.cloneNode(true);
  taglistMenu.append(ulPc);
  buildTaglist(taglistDropdown, ul, tagTitle);
  buildImageAndContent(heroImage, block);
  block.replaceChildren(taglistDropdown);
  block.append(heroImage);
  block.append(taglistMenu);
}
