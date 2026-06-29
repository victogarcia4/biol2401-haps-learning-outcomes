/**
 * Shared Disclaimer markup
 * Rendered at the end of every view (hero + each chapter) — never inside the
 * fullscreen infographic overlay. Includes the author credit at the bottom.
 */

export function disclaimerMarkup() {
  return `
    <section class="disclaimer" role="note" aria-label="Content disclaimer">
      <div class="disclaimer-body">
        <div class="disclaimer-icon" aria-hidden="true">⚠️</div>
        <div>
          <h3 class="disclaimer-title">Disclaimer</h3>
          <p class="disclaimer-text">
            This application was created as a study aid to recreate and reinforce
            <strong>Anatomy &amp; Physiology I</strong> knowledge. The infographics were
            <strong>generated using AI</strong> and may contain inaccuracies. It is the
            responsibility of each student or professional using this application to verify the
            accuracy of the content by consulting other, more reliable and authoritative sources.
          </p>
        </div>
      </div>
      <div class="disclaimer-author">
        <img src="public/VHGM traje azul.png"
             alt="Dr. Victor Garcia Martinez"
             class="author-photo">
        <div class="author-text">
          <p class="author-credit">Built by <strong>Dr. Victor Garcia Martinez</strong></p>
          <p class="author-meta">BIOL 2401 • Anatomy &amp; Physiology I</p>
        </div>
      </div>
    </section>
  `;
}
