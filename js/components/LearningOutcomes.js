/**
 * Learning Outcomes Component
 * Displays hierarchical learning outcomes: Module → Subject → Outcome
 */

export class LearningOutcomes {
  constructor(container, chapterData) {
    this.container = container;
    this.chapterData = chapterData;
  }

  /**
   * Render learning outcomes for a chapter
   */
  render() {
    if (!this.chapterData) {
      this.container.innerHTML = '<p class="error">Chapter data not found.</p>';
      return;
    }

    const stats = this.getStats();

    const html = `
      <section class="learning-outcomes" id="learning-outcomes">
        <div class="eyebrow">Chapter ${String(this.chapterData.number).padStart(2, '0')}</div>
        <h2 style="margin-top: 0.5rem;">${this.chapterData.title}</h2>
        <p class="meta" style="margin-top: 1rem;">
          ${stats.modules} module${stats.modules === 1 ? '' : 's'} •
          ${stats.subjects} subject${stats.subjects === 1 ? '' : 's'}
        </p>

        ${this.renderModules()}
      </section>
    `;

    this.container.innerHTML = html;
  }

  /**
   * Render all modules
   */
  renderModules() {
    if (!this.chapterData.modules || this.chapterData.modules.length === 0) {
      return '<p class="meta">No learning outcomes available for this chapter.</p>';
    }

    return this.chapterData.modules.map((module, index) => `
      <div class="module-section" style="margin-top: ${index === 0 ? '2rem' : '2.5rem'};">
        ${module.title ? `<h3 class="highlight">${this.cleanTitle(module.title)}</h3>` : ''}
        ${module.description ? `<p class="meta" style="margin-top: 0.5rem;">${module.description}</p>` : ''}
        ${this.renderSubjects(module.subjects)}
      </div>
    `).join('');
  }

  /**
   * Render subjects within a module (titles only, no individual outcomes —
   * the specific learning outcomes are covered by the infographics below).
   */
  renderSubjects(subjects) {
    if (!subjects || subjects.length === 0) {
      return '';
    }

    return `
      <ul class="subject-list" style="margin-top: 1rem;">
        ${subjects.map(subject => this.renderSubject(subject)).join('')}
      </ul>
    `;
  }

  /**
   * Render individual subject as a list item
   */
  renderSubject(subject) {
    return `
      <li class="subject-item">
        <span class="subject-marker">▸</span>
        <span class="subject-text">${this.cleanTitle(subject.title)}</span>
      </li>
    `;
  }

  /**
   * Strip leading outcome codes like "A02 - " or "C01 -" from a title.
   */
  cleanTitle(title) {
    return (title || '').replace(/^[A-Za-z]{1,3}\d{1,2}\s*-\s*/, '').trim();
  }

  /**
   * Get module/subject counts for the chapter
   */
  getStats() {
    let modules = 0;
    let subjects = 0;
    if (this.chapterData.modules) {
      this.chapterData.modules.forEach(module => {
        if (module.title) modules += 1;
        if (module.subjects) subjects += module.subjects.length;
      });
    }
    return { modules, subjects };
  }

  /**
   * Destroy component
   */
  destroy() {
    this.container.innerHTML = '';
  }
}
