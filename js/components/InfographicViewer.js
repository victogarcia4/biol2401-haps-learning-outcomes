/**
 * Infographic Viewer Component
 * Carousel for viewing chapter infographics with navigation and thumbnails
 */

import { appState } from '../state.js';

export class InfographicViewer {
  constructor(container, images, chapterNumber) {
    this.container = container;
    this.images = images;
    this.chapterNumber = chapterNumber;
    this.currentIndex = 0;
    this.overlay = null; // fullscreen overlay element
    this.handleOverlayKeydown = this.handleOverlayKeydown.bind(this);
  }

  /**
   * Render infographic viewer
   * @param {number} currentIndex - Current image index
   */
  render(currentIndex = 0) {
    this.currentIndex = currentIndex;

    if (!this.images || this.images.length === 0) {
      this.container.innerHTML = '<p class="meta">No infographics available for this chapter.</p>';
      return;
    }

    const currentImage = this.images[this.currentIndex];

    const html = `
      <section class="infographic-viewer" id="infographic-viewer">
        <div class="viewer-header">
          <div>
            <h3>Chapter ${this.chapterNumber} Infographics</h3>
            <span class="meta">Image ${this.currentIndex + 1} of ${this.images.length}</span>
          </div>
          <div class="viewer-header-actions">
            <button class="btn-secondary" data-action="back" aria-label="Back to previous view">← Back</button>
            <button class="btn" data-action="fullscreen" aria-label="View infographic full screen">⛶ Full screen</button>
          </div>
        </div>

        <div class="viewer-main">
          <button
            class="btn-nav btn-prev"
            aria-label="Previous infographic"
            ${this.currentIndex === 0 ? 'disabled' : ''}
            data-action="prev">
            ← Prev
          </button>

          <div class="image-container">
            <img
              src="${currentImage.path}"
              alt="${currentImage.alt}"
              loading="lazy"
              class="current-image">
          </div>

          <button
            class="btn-nav btn-next"
            aria-label="Next infographic"
            ${this.currentIndex === this.images.length - 1 ? 'disabled' : ''}
            data-action="next">
            Next →
          </button>
        </div>

        <div class="thumbnail-strip">
          ${this.renderThumbnails()}
        </div>

        <div class="viewer-controls" style="margin-top: 1.5rem; text-align: center;">
          <p class="small">
            Use ← → arrow keys to navigate • Press <kbd>Home</kbd> for first image • Press <kbd>End</kbd> for last image
          </p>
        </div>
      </section>
    `;

    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  /**
   * Render thumbnail strip
   */
  renderThumbnails() {
    return this.images.map((image, index) => {
      const isActive = index === this.currentIndex;
      const activeClass = isActive ? 'active' : '';

      return `
        <button
          class="thumbnail ${activeClass}"
          data-index="${index}"
          aria-label="View infographic ${index + 1}"
          aria-current="${isActive ? 'true' : 'false'}">
          <img src="${image.path}" alt="Thumbnail ${index + 1}" loading="lazy">
          <span class="thumbnail-label">${index + 1}</span>
        </button>
      `;
    }).join('');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Previous button
    const prevBtn = this.container.querySelector('[data-action="prev"]');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        appState.prevImage();
      });
    }

    // Next button
    const nextBtn = this.container.querySelector('[data-action="next"]');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        appState.nextImage();
      });
    }

    // Thumbnail clicks
    const thumbnails = this.container.querySelectorAll('.thumbnail[data-index]');
    thumbnails.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const index = parseInt(thumb.dataset.index, 10);
        appState.setImageIndex(index);
      });
    });

    // Fullscreen button
    const fsBtn = this.container.querySelector('[data-action="fullscreen"]');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => this.openFullscreen());
    }

    // Back to previous view button
    const backBtn = this.container.querySelector('[data-action="back"]');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.hash = '';
        }
      });
    }
  }

  /**
   * Open the current infographic in a full-screen overlay with navigation.
   */
  openFullscreen() {
    if (this.overlay) return;

    const overlay = document.createElement('div');
    overlay.className = 'fullscreen-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Infographic full screen viewer');

    const current = this.images[this.currentIndex];
    overlay.innerHTML = `
      <button class="fs-close" data-fs="close" aria-label="Close full screen">✕</button>
      <button class="fs-nav fs-prev" data-fs="prev" aria-label="Previous infographic" ${this.currentIndex === 0 ? 'disabled' : ''}>‹</button>
      <div class="fs-stage">
        <img class="fs-image" src="${current.path}" alt="${current.alt}">
        <p class="fs-counter">Image ${this.currentIndex + 1} of ${this.images.length}</p>
      </div>
      <button class="fs-nav fs-next" data-fs="next" aria-label="Next infographic" ${this.currentIndex === this.images.length - 1 ? 'disabled' : ''}>›</button>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    this.overlay = overlay;

    overlay.addEventListener('click', (e) => {
      const action = e.target.dataset.fs;
      if (action === 'close' || e.target === overlay || e.target.classList.contains('fs-stage')) {
        this.closeFullscreen();
      } else if (action === 'prev') {
        appState.prevImage();
      } else if (action === 'next') {
        appState.nextImage();
      }
    });

    document.addEventListener('keydown', this.handleOverlayKeydown);
  }

  /**
   * Keyboard handling while the overlay is open.
   */
  handleOverlayKeydown(e) {
    if (!this.overlay) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      this.closeFullscreen();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      appState.prevImage();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      appState.nextImage();
    }
  }

  /**
   * Close the full-screen overlay.
   */
  closeFullscreen() {
    if (!this.overlay) return;
    document.removeEventListener('keydown', this.handleOverlayKeydown);
    this.overlay.remove();
    this.overlay = null;
    document.body.style.overflow = '';
  }

  /**
   * Sync the overlay image/counter/buttons to the current index.
   */
  updateOverlay() {
    if (!this.overlay) return;
    const current = this.images[this.currentIndex];
    const img = this.overlay.querySelector('.fs-image');
    if (img) {
      img.src = current.path;
      img.alt = current.alt;
    }
    const counter = this.overlay.querySelector('.fs-counter');
    if (counter) {
      counter.textContent = `Image ${this.currentIndex + 1} of ${this.images.length}`;
    }
    const prev = this.overlay.querySelector('.fs-prev');
    const next = this.overlay.querySelector('.fs-next');
    if (prev) prev.disabled = this.currentIndex === 0;
    if (next) next.disabled = this.currentIndex === this.images.length - 1;
  }

  /**
   * Update viewer to show specific image
   * @param {number} index - Image index
   */
  update(index) {
    if (index < 0 || index >= this.images.length) {
      return;
    }

    this.currentIndex = index;

    // Keep the fullscreen overlay (if open) in sync
    this.updateOverlay();

    // Update main image
    const currentImage = this.images[this.currentIndex];
    const imgElement = this.container.querySelector('.current-image');
    if (imgElement) {
      imgElement.src = currentImage.path;
      imgElement.alt = currentImage.alt;
    }

    // Update counter
    const counter = this.container.querySelector('.meta');
    if (counter) {
      counter.textContent = `Image ${this.currentIndex + 1} of ${this.images.length}`;
    }

    // Update buttons
    const prevBtn = this.container.querySelector('[data-action="prev"]');
    const nextBtn = this.container.querySelector('[data-action="next"]');

    if (prevBtn) {
      prevBtn.disabled = this.currentIndex === 0;
    }

    if (nextBtn) {
      nextBtn.disabled = this.currentIndex === this.images.length - 1;
    }

    // Update thumbnails
    const thumbnails = this.container.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb, idx) => {
      if (idx === this.currentIndex) {
        thumb.classList.add('active');
        thumb.setAttribute('aria-current', 'true');

        // Scroll thumbnail into view
        thumb.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      } else {
        thumb.classList.remove('active');
        thumb.setAttribute('aria-current', 'false');
      }
    });
  }

  /**
   * Destroy component
   */
  destroy() {
    this.closeFullscreen();
    this.container.innerHTML = '';
  }
}
