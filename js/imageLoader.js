/**
 * Image Loader Module
 * Generates image paths and handles lazy loading for chapter infographics
 */

/**
 * Verified infographic counts per chapter
 * Based on exploration of actual files in chapter folders
 */
const CHAPTER_COUNTS = {
  1: 17,
  2: 20,
  3: 26,
  4: 13,
  5: 12,
  6: 8,
  7: 23,
  8: 10,
  9: 17,
  10: 19,
  11: 19,
  12: 18
};

/**
 * Get total number of infographics across all chapters
 * @returns {number} Total infographic count
 */
export function getTotalImageCount() {
  return Object.values(CHAPTER_COUNTS).reduce((sum, count) => sum + count, 0);
}

/**
 * Get infographic count for a specific chapter
 * @param {number} chapterNumber - Chapter number (1-12)
 * @returns {number} Number of infographics in the chapter
 */
export function getChapterImageCount(chapterNumber) {
  return CHAPTER_COUNTS[chapterNumber] || 0;
}

/**
 * Generate image metadata for a specific chapter
 * @param {number} chapterNumber - Chapter number (1-12)
 * @returns {Array<Object>} Array of image objects { path, alt, index }
 */
export function getChapterImages(chapterNumber) {
  const count = CHAPTER_COUNTS[chapterNumber];

  if (!count) {
    console.warn(`No images found for chapter ${chapterNumber}`);
    return [];
  }

  const images = [];
  const chapterPadded = String(chapterNumber).padStart(2, '0');

  for (let i = 1; i <= count; i++) {
    const imagePadded = String(i).padStart(2, '0');
    const path = `CH${chapterPadded}/CH${chapterPadded}-${imagePadded}.png`;

    images.push({
      path,
      alt: `Chapter ${chapterNumber} Infographic ${i}`,
      index: i,
      chapter: chapterNumber
    });
  }

  return images;
}

/**
 * Get all chapter image metadata
 * @returns {Object} Object indexed by chapter number
 */
export function getAllChapterImages() {
  const allImages = {};

  for (let chapter = 1; chapter <= 12; chapter++) {
    allImages[chapter] = getChapterImages(chapter);
  }

  return allImages;
}

/**
 * Get specific image from a chapter
 * @param {number} chapterNumber - Chapter number (1-12)
 * @param {number} imageIndex - Image index (1-based)
 * @returns {Object|null} Image object or null if not found
 */
export function getChapterImage(chapterNumber, imageIndex) {
  const images = getChapterImages(chapterNumber);

  if (imageIndex < 1 || imageIndex > images.length) {
    return null;
  }

  return images[imageIndex - 1];
}

/**
 * Check if an image exists for a chapter
 * @param {number} chapterNumber - Chapter number (1-12)
 * @param {number} imageIndex - Image index (1-based)
 * @returns {boolean} True if image exists
 */
export function imageExists(chapterNumber, imageIndex) {
  const count = CHAPTER_COUNTS[chapterNumber];
  return imageIndex >= 1 && imageIndex <= count;
}

/**
 * Preload image
 * @param {string} src - Image source path
 * @returns {Promise<HTMLImageElement>} Promise that resolves when image loads
 */
export function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));

    img.src = src;
  });
}

/**
 * Preload multiple images
 * @param {Array<string>} sources - Array of image source paths
 * @returns {Promise<Array<HTMLImageElement>>} Promise that resolves with array of loaded images
 */
export function preloadImages(sources) {
  return Promise.all(sources.map(src => preloadImage(src)));
}

/**
 * Preload chapter images (first N images for faster initial display)
 * @param {number} chapterNumber - Chapter number (1-12)
 * @param {number} count - Number of images to preload (default: 3)
 * @returns {Promise<Array<HTMLImageElement>>} Promise that resolves with preloaded images
 */
export async function preloadChapterImages(chapterNumber, count = 3) {
  const images = getChapterImages(chapterNumber);
  const imagesToPreload = images.slice(0, count).map(img => img.path);

  try {
    return await preloadImages(imagesToPreload);
  } catch (error) {
    console.error(`Error preloading chapter ${chapterNumber} images:`, error);
    return [];
  }
}

/**
 * Initialize lazy loading for images using Intersection Observer
 * @param {string} selector - CSS selector for images to lazy load (default: 'img[data-src]')
 * @param {Object} options - Intersection Observer options
 */
export function initLazyLoading(selector = 'img[data-src]', options = {}) {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.01
  };

  const observerOptions = { ...defaultOptions, ...options };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;

        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      }
    });
  }, observerOptions);

  // Observe all matching images
  const images = document.querySelectorAll(selector);
  images.forEach(img => observer.observe(img));

  return observer;
}

/**
 * Get chapter statistics
 * @returns {Object} Statistics about chapters and images
 */
export function getImageStats() {
  const chapters = Object.keys(CHAPTER_COUNTS).length;
  const total = getTotalImageCount();
  const average = Math.round(total / chapters);
  const min = Math.min(...Object.values(CHAPTER_COUNTS));
  const max = Math.max(...Object.values(CHAPTER_COUNTS));

  return {
    chapters,
    total,
    average,
    min,
    max,
    perChapter: { ...CHAPTER_COUNTS }
  };
}
