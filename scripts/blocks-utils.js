export function createTabs(block, text) {
  const ul = block.querySelector('ul');
  if (!ul) return null;

  const tabs = [...ul.querySelectorAll('li')].map((li) => {
    const title = li.textContent;
    const name = title.toLowerCase().trim();
    return {
      title,
      name,
      tabButton: li,
    };
  });

  const panel = document.createElement('div');
  panel.classList.add('hero-horiz-tabs-panel');
  if (text) panel.appendChild(text);

  const nav = document.createElement('nav');
  nav.classList.add('hero-horiz-tabs-nav');

  nav.replaceChildren(ul);
  panel.appendChild(nav);
  block.replaceChildren(panel);

  // search referenced sections and move them inside the tab-container
  const wrapper = block.parentElement;
  const container = wrapper.parentElement;
  const sections = document.querySelectorAll('[data-tab]');

  // move the tab's sections before the tab riders.
  [...sections].forEach((tabContent) => {
    const name = tabContent.dataset.tab.toLowerCase().trim();

    const tab = tabs.find((t) => t.name === name);
    if (tab) {
      const sectionWrapper = document.createElement('div');

      // copy the classes from the section to the wrapper
      [...tabContent.classList].forEach((c) => {
        sectionWrapper.classList.add(c);
      });

      const tabDiv = document.createElement('div');
      tabDiv.classList.add('tab-item');
      tabDiv.append(...tabContent.children);
      sectionWrapper.append(tabDiv);
      container.insertBefore(sectionWrapper, wrapper);

      // remove it from the dom
      tabContent.remove();
      tab.content = tabDiv;
    }
  });
  return tabs;
}

export function addTabs(tabs, block) {
  tabs.forEach((tab, index) => {
    const button = document.createElement('button');
    const { tabButton, title, name } = tab;
    button.textContent = title.split(',');
    button.classList.add('tab');

    tabButton.replaceChildren(button);

    tabButton.addEventListener('click', () => {
      const activeButton = block.querySelector('button.active');

      if (activeButton !== tabButton) {
        activeButton.classList.remove('active');
        // remove active class from parent li
        activeButton.parentElement.classList.remove('active');
        button.classList.add('active');
        // add active class to parent li
        tabButton.classList.add('active');

        tabs.forEach((t) => {
          if (name === t.name) {
            t.content.classList.add('active');
          } else {
            t.content.classList.remove('active');
          }
        });
      }
    });

    if (index === 0) {
      button.classList.add('active');
      // add active class to parent li
      tabButton.classList.add('active');
      if (tab.content) {
        tab.content.classList.add('active');
      }
    }
  });
}

export function setMetaTag(tagType, propertyKey, propertyValue, url) {
  const tag = document.querySelector(`${tagType}[${propertyKey}='${propertyValue}']`);
  if (tag) {
    if (tagType === 'link') {
      tag.href = url;
    } else {
      tag.content = url;
    }
  } else {
    const meta = document.createElement(tagType);
    meta.setAttribute(propertyKey, propertyValue);
    if (tagType === 'link') {
      meta.href = url;
    } else {
      meta.content = url;
    }
    document.head.appendChild(meta);
  }
}

export function setOgImages(picture) {
  if (picture && picture.outerHTML) {
    const imageUrl = window.location.origin + picture.outerHTML.match(/<img [^>]*src="[^"]*"[^>]*>/gm)
      .map((x) => x.replace(/.*src="([^"]*)".*/, '$1'));
    if (imageUrl) {
      const OgTags = ['og:image', 'og:image:secure_url'];
      OgTags.forEach((tag) => {
        setMetaTag('meta', 'property', tag, imageUrl);
      });
      setMetaTag('meta', 'name', 'twitter:image', imageUrl);
    }
  }
}

export function setTagPageTitles(tagTitle) {
  if (tagTitle) {
    window.document.title = tagTitle;
    setMetaTag('meta', 'property', 'og:title', tagTitle);
    setMetaTag('meta', 'name', 'twitter:title', tagTitle);
    const lastBreadcrumb = document.querySelector('.breadcrumb.block>ul>li:last-child');
    lastBreadcrumb.textContent = tagTitle;
    const h1 = document.createElement('h1');
    h1.textContent = tagTitle;
    document.querySelector('.create-tagpage-title>.section-container>.default-content-wrapper').appendChild(h1);
  }
}
