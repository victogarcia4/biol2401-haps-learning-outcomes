/**
 * Router Module
 * Hash-based SPA routing without external dependencies
 */

import { appState } from './state.js';

export class Router {
  constructor(onRouteChange) {
    this.onRouteChange = onRouteChange;
    this.currentRoute = null;

    // Listen for hash changes
    window.addEventListener('hashchange', () => this.handleRoute());

    // Render the initial route immediately. The app's module script is
    // deferred and init() awaits the CSV fetch, so by the time the router
    // is created the window 'load' event has usually already fired — relying
    // on it alone would leave the page blank. Render now, deterministically.
    this.handleRoute();
  }

  /**
   * Parse current hash and trigger route change
   */
  handleRoute() {
    const hash = window.location.hash.slice(1) || ''; // Remove '#' prefix
    const route = this.parseHash(hash);

    // Update current route
    this.currentRoute = route;

    // Notify callback
    if (this.onRouteChange && typeof this.onRouteChange === 'function') {
      this.onRouteChange(route);
    }

    // Update state
    if (route.view === 'hero') {
      appState.navigateTo('hero');
    } else if (route.view === 'chapter') {
      appState.setChapter(route.chapter);
    }
  }

  /**
   * Parse hash string into route object
   * @param {string} hash - Hash string (without '#')
   * @returns {Object} Route object { view, chapter }
   */
  parseHash(hash) {
    if (!hash) {
      return { view: 'hero', chapter: null };
    }

    // Match pattern: chapter-N (where N is 1-12)
    const chapterMatch = hash.match(/^chapter-(\d+)$/);

    if (chapterMatch) {
      const chapterNum = parseInt(chapterMatch[1], 10);

      // Validate chapter number
      if (chapterNum >= 1 && chapterNum <= 12) {
        return { view: 'chapter', chapter: chapterNum };
      }
    }

    // Invalid hash - default to hero
    console.warn(`Invalid hash: #${hash}, redirecting to hero`);
    return { view: 'hero', chapter: null };
  }

  /**
   * Navigate to a route
   * @param {string} path - Path to navigate to (e.g., '', 'chapter-1')
   */
  navigate(path) {
    window.location.hash = path;
  }

  /**
   * Navigate to hero view
   */
  goToHero() {
    this.navigate('');
  }

  /**
   * Navigate to a specific chapter
   * @param {number} chapterNumber - Chapter number (1-12)
   */
  goToChapter(chapterNumber) {
    if (chapterNumber < 1 || chapterNumber > 12) {
      console.error('Invalid chapter number:', chapterNumber);
      return;
    }
    this.navigate(`chapter-${chapterNumber}`);
  }

  /**
   * Get current route
   * @returns {Object} Current route object
   */
  getCurrentRoute() {
    return this.currentRoute;
  }

  /**
   * Check if currently on hero view
   * @returns {boolean}
   */
  isHeroView() {
    return this.currentRoute && this.currentRoute.view === 'hero';
  }

  /**
   * Check if currently on chapter view
   * @param {number|null} chapterNumber - Optional specific chapter to check
   * @returns {boolean}
   */
  isChapterView(chapterNumber = null) {
    if (!this.currentRoute || this.currentRoute.view !== 'chapter') {
      return false;
    }

    if (chapterNumber !== null) {
      return this.currentRoute.chapter === chapterNumber;
    }

    return true;
  }

  /**
   * Go back in browser history
   */
  back() {
    window.history.back();
  }

  /**
   * Go forward in browser history
   */
  forward() {
    window.history.forward();
  }
}

// Helper function to create router instance
export function createRouter(onRouteChange) {
  return new Router(onRouteChange);
}
