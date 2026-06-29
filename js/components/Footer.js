/**
 * Footer Component
 * Persistent footer with developer credit
 */

export class Footer {
  constructor(container) {
    this.container = container;
  }

  /**
   * Render footer
   */
  render() {
    const html = `
      <div class="footer-quote">
        <p class="footer-eyebrow">Anatomy &amp; Physiology I</p>
        <blockquote class="footer-cite">
          “It is necessary for a painter to be a good anatomist.”
        </blockquote>
        <p class="footer-author">— Leonardo Da Vinci</p>
      </div>
    `;

    this.container.innerHTML = html;
  }

  /**
   * Destroy component
   */
  destroy() {
    this.container.innerHTML = '';
  }
}
