/**
 * Main Application Entry Point
 * Initializes the BIOL 2401 HAPS Learning Outcomes Repository
 */

import { parseCSV } from './csvParser.js';
import { transformToChapterData, getChapterData } from './dataService.js';
import { getChapterImages, getAllChapterImages } from './imageLoader.js';
import { appState } from './state.js';
import { createRouter } from './router.js';
import { initKeyboardNav } from './utils/keyboard.js';
import { $, show, hide } from './utils/dom.js';

import { Hero } from './components/Hero.js';
import { LearningOutcomes } from './components/LearningOutcomes.js';
import { disclaimerMarkup } from './components/disclaimer.js';
import { InfographicViewer } from './components/InfographicViewer.js';
import { Footer } from './components/Footer.js';

/**
 * Application class
 */
class App {
  constructor() {
    this.router = null;
    this.chapterData = null;
    this.components = {
      hero: null,
      learningOutcomes: null,
      infographicViewer: null,
      footer: null
    };

    // DOM containers
    this.containers = {
      loading: $('#loading'),
      content: $('#content'),
      footer: $('#app-footer')
    };
  }

  /**
   * Initialize application
   */
  async init() {
    try {
      // Show loading screen
      this.setLoadingState(true, 'Loading HAPS learning outcomes...');

      // Load and parse CSV data
      const csvPath = 'public/haps-learning-outcomes.csv';
      const csvData = await parseCSV(csvPath);

      // Transform data into chapter structure
      this.chapterData = transformToChapterData(csvData);

      // Store chapter data in state
      appState.setState({
        chapterData: this.chapterData,
        csvData,
        loading: false
      });

      // Load all chapter images into state
      const allImages = getAllChapterImages();
      appState.setState({ infographics: allImages });

      // Initialize router
      this.router = createRouter((route) => this.handleRouteChange(route));

      // Initialize keyboard navigation
      initKeyboardNav();

      // Subscribe to state changes
      appState.subscribe((state, prevState) => this.handleStateChange(state, prevState));

      // Render persistent footer (Da Vinci quote, shown on every view)
      this.renderFooter();

      // Hide loading screen
      this.setLoadingState(false);

      // Show content
      show(this.containers.content, 'block');

      console.log('✓ App initialized successfully');
    } catch (error) {
      console.error('Error initializing app:', error);
      this.showError('Failed to load application data. Please refresh the page.');
    }
  }

  /**
   * Handle route changes
   * @param {Object} route - Route object { view, chapter }
   */
  handleRouteChange(route) {
    if (route.view === 'hero') {
      this.renderHeroView();
    } else if (route.view === 'chapter') {
      this.renderChapterView(route.chapter);
    }
  }

  /**
   * Handle state changes
   * @param {Object} state - New state
   * @param {Object} prevState - Previous state
   */
  handleStateChange(state, prevState) {
    // Update infographic viewer when image index changes
    if (
      state.currentView === 'chapter' &&
      state.currentImageIndex !== prevState.currentImageIndex &&
      this.components.infographicViewer
    ) {
      this.components.infographicViewer.update(state.currentImageIndex);
    }

  }

  /**
   * Render hero view
   */
  renderHeroView() {
    // Destroy existing components
    this.destroyComponents();

    // Create hero component
    this.components.hero = new Hero(this.containers.content, this.chapterData);
    this.components.hero.render();

    // Update page title
    document.title = 'BIOL 2401 | HAPS Learning Outcomes Repository';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Render chapter view
   * @param {number} chapterNumber - Chapter number (1-12)
   */
  renderChapterView(chapterNumber) {
    // Get chapter data
    const chapter = getChapterData(this.chapterData, chapterNumber);

    if (!chapter) {
      this.showError(`Chapter ${chapterNumber} not found.`);
      return;
    }

    // Get chapter images
    const images = getChapterImages(chapterNumber);

    // Destroy existing components
    this.destroyComponents();

    // Create the notebook-style chapter page (no left sidebar — the left
    // edge shows the spiral binding instead, matching style.css).
    this.containers.content.innerHTML = `
      <div class="chapter-page">
        <div class="chapter-page-inner">
          <div id="learning-outcomes-container"></div>
          <div id="infographic-viewer-container"></div>
          ${this.renderChapterPager(chapterNumber)}
          ${disclaimerMarkup()}
        </div>
      </div>
    `;

    // Get containers
    const outcomesContainer = $('#learning-outcomes-container');
    const viewerContainer = $('#infographic-viewer-container');

    // Render learning outcomes
    this.components.learningOutcomes = new LearningOutcomes(outcomesContainer, chapter);
    this.components.learningOutcomes.render();

    // Render infographic viewer
    const currentImageIndex = appState.get('currentImageIndex') || 0;
    this.components.infographicViewer = new InfographicViewer(viewerContainer, images, chapterNumber);
    this.components.infographicViewer.render(currentImageIndex);

    // Wire up the bottom chapter pager
    this.attachChapterPager(chapterNumber);

    // Update page title
    document.title = `Chapter ${chapterNumber}: ${chapter.title} | BIOL 2401`;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Render the bottom pager (previous / next chapter + home).
   */
  renderChapterPager(currentChapter) {
    const prev = currentChapter > 1 ? currentChapter - 1 : null;
    const next = currentChapter < 12 ? currentChapter + 1 : null;
    const title = (n) => (this.chapterData[n] ? this.chapterData[n].title : '');

    return `
      <nav class="chapter-pager" aria-label="Chapter navigation">
        ${prev
          ? `<button class="pager-btn pager-prev" data-goto-chapter="${prev}">
               <span class="pager-dir">← Previous</span>
               <span class="pager-name">CH${String(prev).padStart(2, '0')} · ${title(prev)}</span>
             </button>`
          : '<span class="pager-spacer"></span>'}
        <button class="pager-btn pager-home" data-goto-home>
          <span class="pager-dir">⌂ Home</span>
          <span class="pager-name">All chapters</span>
        </button>
        ${next
          ? `<button class="pager-btn pager-next" data-goto-chapter="${next}">
               <span class="pager-dir">Next →</span>
               <span class="pager-name">CH${String(next).padStart(2, '0')} · ${title(next)}</span>
             </button>`
          : '<span class="pager-spacer"></span>'}
      </nav>
    `;
  }

  /**
   * Wire up clicks for the top menu and bottom pager.
   */
  attachChapterPager() {
    this.containers.content.querySelectorAll('[data-goto-chapter]').forEach(btn => {
      btn.addEventListener('click', () => {
        window.location.hash = `chapter-${btn.dataset.gotoChapter}`;
      });
    });
    const homeBtn = this.containers.content.querySelector('[data-goto-home]');
    if (homeBtn) {
      homeBtn.addEventListener('click', () => { window.location.hash = ''; });
    }
  }

  /**
   * Render the persistent author credit band (photo + credit).
   * Shown on every view, before the footer. The fullscreen infographic
   * overlay (position: fixed, full-viewport) naturally covers it.
   */
  /**
   * Render footer
   */
  renderFooter() {
    this.components.footer = new Footer(this.containers.footer);
    this.components.footer.render();
  }

  /**
   * Destroy all components
   */
  destroyComponents() {
    Object.values(this.components).forEach(component => {
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
    });

    // Clear references (except footer)
    this.components.hero = null;
    this.components.learningOutcomes = null;
    this.components.infographicViewer = null;
  }

  /**
   * Set loading state
   * @param {boolean} isLoading - Loading state
   * @param {string} message - Loading message
   */
  setLoadingState(isLoading, message = 'Loading...') {
    if (isLoading) {
      if (this.containers.loading) {
        const loadingText = this.containers.loading.querySelector('.meta');
        if (loadingText) {
          loadingText.textContent = message;
        }
        show(this.containers.loading, 'flex');
      }
      hide(this.containers.content);
    } else {
      hide(this.containers.loading);
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    this.containers.content.innerHTML = `
      <div class="error-screen" style="padding: 4rem 2rem; text-align: center;">
        <h2 style="color: var(--ds-red);">Error</h2>
        <p style="margin-top: 1rem;">${message}</p>
        <button class="btn" style="margin-top: 2rem;" onclick="location.reload()">
          Reload Page
        </button>
      </div>
    `;
    show(this.containers.content, 'block');
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
  });
} else {
  const app = new App();
  app.init();
}
