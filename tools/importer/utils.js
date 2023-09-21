/* global WebImporter */

export const createMetadata = (main, document, params) => {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.textContent.replace(/[\n\t]/gm, '');
  }

  const desc = document.querySelector('[property="og:description"]');
  if (desc) {
    meta.Description = desc.content;
  }

  const img = document.querySelector('[property="og:image"]');
  if (img && img.content) {
    const el = document.createElement('img');
    el.src = img.content;
    meta.Image = el;
  }

  const breadcrumb = document.querySelector('.section-breadcrumb');
  if (breadcrumb) {
    const breadcrumbItems = breadcrumb.querySelectorAll('.ss-breadcrumb .breadcrumb-item');
    if (breadcrumbItems && breadcrumbItems.length) {
      const breadcrumbText = breadcrumbItems[breadcrumbItems.length - 1].textContent.trim();
      meta.BreadcrumbTitle = breadcrumbText;
    }
  }

  if (params.preProcessMetadata && Object.keys(params.preProcessMetadata).length) {
    Object.assign(meta, params.preProcessMetadata);
  }

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);

  return meta;
};

/**
 * Prefixes relative links with the target domain
 * @param {HTMLDocument} document The document
 */
export const fixRelativeLinks = (document) => {
  document.querySelectorAll('a').forEach((a) => {
    const targetDomain = 'https://main--sunstar--hlxsites.hlx.page';
    // if the link is relative, make it absolute
    if (a.href.startsWith('/')) {
      let link = a.href;
      const p1 = a.href.indexOf('#');
      const p2 = a.href.indexOf('?');
      let p = p1;
      if (p1 < 0 || (p2 > 0 && p2 < p1)) {
        p = p2;
      }
      if (p > 0) {
        link = a.href.substring(0, p);
        if (link.endsWith('/')) {
          link = link.substring(0, link.length - 1);
        }
        link += a.href.substring(p);
      } else if (link.endsWith('/')) {
        link = link.substring(0, link.length - 1);
      }
      a.href = targetDomain + link;
    }
  });
};

export function addBreadCrumb(doc) {
  const breadcrumb = doc.querySelector('.section-breadcrumb');

  if (breadcrumb) {
    // Not removing breadcrumb section from here because we need to extract breadcrumb title.
    const cells = [['Breadcrumb']];
    const table = WebImporter.DOMUtils.createTable(cells, doc);
    breadcrumb.after(doc.createElement('hr'));
    breadcrumb.replaceWith(table);
  }
}

export function createSectionMetadata(cfg, doc) {
  const cells = [['Section Metadata']];
  Object.keys(cfg).forEach((key) => {
    cells.push([key, cfg[key]]);
  });
  return WebImporter.DOMUtils.createTable(cells, doc);
}

export function buildBlock(name, qualifiers, content, doc) {
  let cells;
  if (qualifiers) {
    cells = [[`${name}(${qualifiers.join(', ')})`]];
  } else {
    cells = [[name]];
  }

  content.querySelectorAll('.row').forEach((rowDiv) => {
    const row = [];
    rowDiv.querySelectorAll('.cell').forEach((cellDiv) => {
      if (cellDiv.textContent.trim() !== '') {
        row.push(cellDiv);
      }
    });
    if (row.length > 0) {
      cells.push(row);
    }
  });
  return WebImporter.DOMUtils.createTable(cells, doc);
}
