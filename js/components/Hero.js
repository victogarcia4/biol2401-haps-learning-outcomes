/**
 * Hero Component
 * Landing page with project branding and navigation
 */

import { getImageStats } from '../imageLoader.js';
import { getGlobalStats } from '../dataService.js';
import { disclaimerMarkup } from './disclaimer.js';

export class Hero {
  constructor(container, chapterData) {
    this.container = container;
    this.chapterData = chapterData;
  }

  /**
   * Render hero section
   */
  render() {
    const stats = getGlobalStats(this.chapterData);
    const imageStats = getImageStats();

    const html = `
      <section class="hero">
        <div>
          <p class="eyebrow">BIOL 2401 • Anatomy & Physiology I</p>
          <h1>HAPS Learning Outcomes</h1>
          <p style="margin-top: 1rem; max-width: 600px;">
            Interactive repository of ${imageStats.total} medical infographics aligned to
            ${stats.outcomeCount} student learning outcomes across ${stats.chapterCount} chapters.
          </p>
          <div style="display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap;">
            <button class="btn" data-action="explore">Explore Chapters</button>
          </div>
          <div style="margin-top: 1.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <span class="badge">${stats.chapterCount} Chapters</span>
            <span class="badge">${imageStats.total} Infographics</span>
            <span class="badge">${stats.outcomeCount} Learning Outcomes</span>
          </div>
        </div>
        <div class="media-frame">
          <img src="public/VitruvianMan.png" alt="Vitruvian Man — study of human proportion" style="width: 100%; height: auto; border-radius: var(--ds-radius-sm);">
        </div>
      </section>

      <section style="margin-top: var(--ds-space-7); padding: var(--ds-space-6); background: var(--ds-bg-card); border: var(--ds-border-thin); border-radius: var(--ds-radius-md);">
        <div class="eyebrow">About This Repository</div>
        <h2 style="margin-top: 1rem;">Comprehensive Anatomy & Physiology Study Guide</h2>
        <p style="margin-top: 1rem; max-width: 800px;">
          This interactive repository maps specific Human Anatomy and Physiology Society (HAPS)
          Student Learning Outcomes to localized infographic assets. Each chapter presents learning
          objectives organized by modules and subjects, followed by high-quality visual aids designed
          to reinforce understanding.
        </p>

        <div style="margin-top: 2rem;">
          <h3 class="highlight">What You'll Find</h3>
          <ul style="margin-top: 1rem; list-style: none; padding: 0;">
            <li style="margin-bottom: 0.75rem;">
              <span style="color: var(--ds-lime); margin-right: 0.5rem;">▸</span>
              <strong>Structured Learning Objectives:</strong> Organized hierarchically by module and subject
            </li>
            <li style="margin-bottom: 0.75rem;">
              <span style="color: var(--ds-lime); margin-right: 0.5rem;">▸</span>
              <strong>Visual Infographics:</strong> ${imageStats.total} professional medical illustrations
            </li>
            <li style="margin-bottom: 0.75rem;">
              <span style="color: var(--ds-lime); margin-right: 0.5rem;">▸</span>
              <strong>Easy Navigation:</strong> Chapter-based organization with intuitive browsing
            </li>
            <li style="margin-bottom: 0.75rem;">
              <span style="color: var(--ds-lime); margin-right: 0.5rem;">▸</span>
              <strong>Mobile Responsive:</strong> Study on any device, anywhere
            </li>
          </ul>
        </div>
      </section>

      <section style="margin-top: var(--ds-space-7);">
        <div class="eyebrow">Quick Navigation</div>
        <h2 style="margin-top: 1rem;">Jump to a Chapter</h2>
        <div class="grid" style="margin-top: 2rem;">
          ${this.renderChapterCards()}
        </div>
      </section>

      ${disclaimerMarkup()}
    `;

    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  /**
   * Render chapter cards grid
   */
  renderChapterCards() {
    const chapters = Object.values(this.chapterData).sort((a, b) => a.number - b.number);

    return chapters.map(chapter => {
      const imageCount = getImageStats().perChapter[chapter.number];
      const outcomeCount = this.getChapterOutcomeCount(chapter);

      return `
        <div class="card" style="cursor: pointer; transition: transform var(--ds-fast), box-shadow var(--ds-fast);"
             data-chapter="${chapter.number}"
             onmouseenter="this.style.transform='translateY(-4px)'; this.style.boxShadow='var(--ds-shadow-float)'"
             onmouseleave="this.style.transform=''; this.style.boxShadow=''">
          <div class="eyebrow">Chapter ${String(chapter.number).padStart(2, '0')}</div>
          <h3 style="margin-top: 0.5rem; font-size: 1.25rem;">${chapter.title}</h3>
          <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <span class="badge">${imageCount} Images</span>
            <span class="badge">${outcomeCount} LOs</span>
          </div>
          <button class="btn-secondary" style="margin-top: 1.5rem; width: 100%;" data-chapter-btn="${chapter.number}">
            View Chapter →
          </button>
        </div>
      `;
    }).join('');
  }

  /**
   * Get count of learning outcomes in a chapter
   */
  getChapterOutcomeCount(chapter) {
    let count = 0;
    chapter.modules.forEach(module => {
      module.subjects.forEach(subject => {
        count += subject.outcomes.length;
      });
    });
    return count;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Explore button
    const exploreBtn = this.container.querySelector('[data-action="explore"]');
    if (exploreBtn) {
      exploreBtn.addEventListener('click', () => {
        window.location.hash = 'chapter-1';
      });
    }

    // Chapter cards
    const chapterCards = this.container.querySelectorAll('[data-chapter]');
    chapterCards.forEach(card => {
      card.addEventListener('click', (e) => {
        // Don't navigate if clicking the button (it has its own handler)
        if (e.target.closest('[data-chapter-btn]')) return;

        const chapter = card.dataset.chapter;
        window.location.hash = `chapter-${chapter}`;
      });
    });

    // Chapter buttons
    const chapterBtns = this.container.querySelectorAll('[data-chapter-btn]');
    chapterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const chapter = btn.dataset.chapterBtn;
        window.location.hash = `chapter-${chapter}`;
      });
    });
  }

  /**
   * Destroy component and remove event listeners
   */
  destroy() {
    this.container.innerHTML = '';
  }
}
