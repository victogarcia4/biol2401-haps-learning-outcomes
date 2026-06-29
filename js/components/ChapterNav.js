/**
 * Chapter Navigation Component
 * Sidebar navigation for chapter selection
 */

import { getChapterStats } from '../dataService.js';
import { appState } from '../state.js';

export class ChapterNav {
  constructor(container, chapterData) {
    this.container = container;
    this.chapterData = chapterData;
    this.currentChapter = null;
  }

  /**
   * Render chapter navigation
   * @param {number} currentChapter - Currently active chapter
   */
  render(currentChapter = null) {
    this.currentChapter = currentChapter;

    const chapters = Object.values(this.chapterData).sort((a, b) => a.number - b.number);

    const html = `
      <nav class="chapter-nav" role="navigation" aria-label="Chapter navigation">
        <div class="nav-header">
          <h2 id="nav-heading" class="display" style="font-size: 1.5rem; margin-bottom: 1rem;">
            Chapters
          </h2>
          <button class="btn-secondary nav-close" aria-label="Close navigation">
            ✕
          </button>
        </div>
        <ul class="chapter-list" aria-labelledby="nav-heading">
          ${chapters.map(chapter => this.renderChapterItem(chapter)).join('')}
        </ul>
        <div class="nav-footer">
          <button class="btn-dark" data-action="home" style="width: 100%;">
            ← Back to Home
          </button>
        </div>
      </nav>
    `;

    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  /**
   * Render individual chapter list item
   */
  renderChapterItem(chapter) {
    const stats = getChapterStats(chapter);
    const isActive = this.currentChapter === chapter.number;
    const activeClass = isActive ? 'active' : '';
    const ariaCurrent = isActive ? 'page' : 'false';

    return `
      <li>
        <a href="#chapter-${chapter.number}"
           class="chapter-link ${activeClass}"
           data-chapter="${chapter.number}"
           aria-current="${ariaCurrent}">
          <span class="chapter-number">CH${String(chapter.number).padStart(2, '0')}</span>
          <span class="chapter-title">${this.truncateTitle(chapter.title, 30)}</span>
          <span class="badge badge-small">${stats.outcomeCount}</span>
        </a>
      </li>
    `;
  }

  /**
   * Truncate title if too long
   */
  truncateTitle(title, maxLength) {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength - 3) + '...';
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Chapter links
    const chapterLinks = this.container.querySelectorAll('[data-chapter]');
    chapterLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Let the hash change event handle navigation
        // but close mobile menu immediately
        appState.closeMobileMenu();
      });
    });

    // Home button
    const homeBtn = this.container.querySelector('[data-action="home"]');
    if (homeBtn) {
      homeBtn.addEventListener('click', () => {
        window.location.hash = '';
        appState.closeMobileMenu();
      });
    }

    // Close button (mobile)
    const closeBtn = this.container.querySelector('.nav-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        appState.closeMobileMenu();
      });
    }
  }

  /**
   * Update active chapter highlight
   * @param {number} chapterNumber - Chapter to highlight
   */
  updateActive(chapterNumber) {
    this.currentChapter = chapterNumber;

    // Remove all active classes
    const allLinks = this.container.querySelectorAll('.chapter-link');
    allLinks.forEach(link => {
      link.classList.remove('active');
      link.setAttribute('aria-current', 'false');
    });

    // Add active class to current chapter
    const activeLink = this.container.querySelector(`[data-chapter="${chapterNumber}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
      activeLink.setAttribute('aria-current', 'page');

      // Scroll into view if not visible
      activeLink.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }

  /**
   * Destroy component
   */
  destroy() {
    this.container.innerHTML = '';
  }
}
