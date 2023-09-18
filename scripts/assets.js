function replaceParams(src, tgt) {
  const srcURL = new URL(src, window.location.href);
  const queryParams = new URLSearchParams(srcURL.search);
  const widthParam = queryParams.get('width');

  const tgtURL = new URL(tgt, window.location.href);
  // Create or update the "width" query parameter
  const params = new URLSearchParams(tgtURL.search);
  params.set('width', widthParam || params.get('width'));
  tgtURL.search = params.toString();
  return tgtURL;
}

function replaceImageSrc(pictureElement, newSrc) {
  const imgElement = pictureElement.querySelector('img');

  if (imgElement) {
    // Copy over the query parameters from the existing src
    const imgSrc = imgElement.getAttribute('src');

    // Update the src attribute of the img element
    imgElement.setAttribute('src', replaceParams(imgSrc, newSrc));
  }

  // Update the srcset attribute of source elements
  const sourceElements = pictureElement.querySelectorAll('source');
  sourceElements.forEach((sourceElement) => {
    const existingSrcset = sourceElement.getAttribute('srcset');
    // Update the srcset attribute of the source element
    sourceElement.setAttribute('srcset', replaceParams(existingSrcset, newSrc));
  });
}

export default function decoratePictures(main, deliveryMarker = '//External Image//') {
  const pictureElements = main.querySelectorAll('picture');

  // Iterate over each picture element
  pictureElements.forEach((pictureElement) => {
    const nextSibling = pictureElement.parentNode.nextElementSibling;

    if (nextSibling) {
      if (nextSibling.tagName === 'A' && nextSibling.textContent.trim() === deliveryMarker) {
        const newSrc = nextSibling.getAttribute('href');
        replaceImageSrc(pictureElement, newSrc);
        nextSibling.parentNode.removeChild(nextSibling);
      } else if (nextSibling.tagName === 'P') {
        const anchorElement = nextSibling.querySelector('a:first-child');
        if (anchorElement && anchorElement.textContent.trim() === deliveryMarker) {
          const newSrc = anchorElement.getAttribute('href');
          replaceImageSrc(pictureElement, newSrc);
          anchorElement.parentNode.removeChild(anchorElement);
        }
      }
    }
  });
}
