let observerLazyLoad;
let imagesToLazyLoad;

launchLazyLoadObserver = () => {
  // Get all of the images that are marked up to lazy load
  imagesToLazyLoad = document.querySelectorAll('.js-lazy-image')
  const config = {
    // If the image gets within 50px in the Y axis, start the download.
    rootMargin: '50px 0px',
    threshold: 0.01
  };
  detectLazyLoadObserver(imagesToLazyLoad, config);
}

detectLazyLoadObserver = (images, config) => {
  // If we don't have support for intersection observer, loads the images immediately
  if (!('IntersectionObserver' in window)) {
    loadImagesImmediately(images);
  } else {
    // It is supported, load the images
    observerLazyLoad = new IntersectionObserver(onIntersection, images, config);

    // foreach() is not supported in IE
    for (let i = 0; i < images.length; i++) {
      let image = images[i];
      if (image.classList.contains('js-lazy-image--handled')) {
        continue;
      }

      observerLazyLoad.observe(image);
    }
  }
}

/**
 * Fetchs the image for the given URL
 * @param {string} url 
 */
fetchImage = (url) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = resolve;
    image.onerror = reject;
  });
}

/**
 * Preloads the image
 * @param {object} image 
 */
preloadImage = (image) => {
  const src = image.dataset.src;
  if (!src) {
    return;
  }

  return fetchImage(src).then(() => { applyImage(image, src); });
}

/**
 * Load all of the images immediately
 * @param {NodeListOf<Element>} images 
 */
loadImagesImmediately = (images) => {
  // foreach() is not supported in IE
  for (let i = 0; i < images.length; i++) { 
    let image = images[i];
    preloadImage(image);
  }
}

/**
 * Disconnect the observer
 */
disconnect = () => {
  if (!observerLazyLoad) {
    return;
  }

  observerLazyLoad.disconnect();
}

/**
 * On intersection
 * @param {array} entries 
 */
onIntersection = (entries, images) => {
  // Disconnect if we've already loaded all of the images
  if (images.length === 0) {
    observerLazyLoad.disconnect();
  }

  // Loop through the entries
  for (let i = 0; i < entries.length; i++) { 
    let entry = entries[i];
    // Are we in viewport?
    if (entry.intersectionRatio > 0) {
      images.length--;

      // Stop watching and load the image
      observerLazyLoad.unobserve(entry.target);
      preloadImage(entry.target);
    }
  }
}

/**
 * Apply the image
 * @param {object} img 
 * @param {string} src 
 */
applyImage = (img, src) => {
  // Prevent this from being lazy loaded a second time.
  img.classList.add('js-lazy-image--handled');
  img.src = src;
  img.classList.add('fade-in');
}

// Launch observer when DOM is ready
document.addEventListener('DOMContentLoaded', function(){
    launchLazyLoadObserver();
});
