"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    keys.push.apply(keys, Object.getOwnPropertySymbols(object));
  }
  if (enumerableOnly)
    keys = keys.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
  return keys;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
      ownKeys(source, true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function(key) {
        Object.defineProperty(
          target,
          key,
          Object.getOwnPropertyDescriptor(source, key)
        );
      });
    }
  }
  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

var defaults = {
  imageLoadedClass: "js-lazy-image--handled",
  imageSelector: ".js-lazy-image",
  // If the image gets within 50px in the Y axis, start the download.
  rootMargin: "50px 0px",
  threshold: 0.01
};
var config, images, imageCount, observer;
/**
 * Fetches the image for the given URL
 * @param {string} url
 */

function fetchImage(url) {
  return new Promise(function(resolve, reject) {
    var image = new Image();
    image.src = url;
    image.onload = resolve;
    image.onerror = reject;
  });
}
/**
 * Preloads the image
 * @param {object} image
 */

function preloadImage(image) {
  var src = image.dataset.src;

  if (!src) {
    return;
  }

  return fetchImage(src).then(function() {
    applyImage(image, src);
  });
}
/**
 * Load all of the images immediately
 * @param {NodeListOf<Element>} images
 */

function loadImagesImmediately(images) {
  // foreach() is not supported in IE
  for (var i = 0; i < images.length; i++) {
    var image = images[i];
    preloadImage(image);
  }
}
/**
 * Disconnect the observer
 */

function disconnect() {
  if (!observer) {
    return;
  }

  observer.disconnect();
}
/**
 * On intersection
 * @param {array} entries
 */

function onIntersection(entries) {
  // Disconnect if we've already loaded all of the images
  if (imageCount === 0) {
    disconnect();
    return;
  } // Loop through the entries

  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i]; // Are we in viewport?

    if (entry.intersectionRatio > 0) {
      imageCount--; // Stop watching and load the image

      observer.unobserve(entry.target);
      preloadImage(entry.target);
    }
  }
}
/**
 * Apply the image
 * @param {object} img
 * @param {string} src
 */

function applyImage(img, src) {
  // Prevent this from being lazy loaded a second time.
  img.classList.add(config.imageLoadedClass);
  img.src = src;
}

var LazyLoad = {
  init: function init(options) {
    config = _objectSpread({}, defaults, {}, options);
    images = document.querySelectorAll(config.imageSelector);
    imageCount = images.length; // If we don't have support for intersection observer, loads the images immediately

    if (!("IntersectionObserver" in window)) {
      loadImagesImmediately(images);
    } else {
      // It is supported, load the images
      observer = new IntersectionObserver(onIntersection, config); // foreach() is not supported in IE

      for (var i = 0; i < images.length; i++) {
        var image = images[i];

        if (image.classList.contains(config.imageLoadedClass)) {
          continue;
        }

        observer.observe(image);
      }
    }
  }
};
var _default = LazyLoad;
exports.default = _default;
