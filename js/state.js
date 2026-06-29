/**
 * State Management Module
 * Centralized state with observer pattern for reactive UI updates
 */

class AppState {
  constructor() {
    this.state = {
      currentView: 'hero',        // 'hero' | 'chapter'
      currentChapter: null,       // 1-12 | null
      chapterData: {},            // Indexed by chapter number
      infographics: {},           // Indexed by chapter number
      currentImageIndex: 0,       // Current infographic index in viewer
      loading: true,              // Global loading state
      error: null,                // Error message if any
      csvData: null,              // Raw CSV data
      mobileMenuOpen: false       // Mobile navigation menu state
    };

    this.listeners = [];
  }

  /**
   * Subscribe to state changes
   * @param {Function} listener - Callback function to execute on state change
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Listener must be a function');
    }

    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Update state and notify all listeners
   * @param {Object} updates - Partial state updates
   */
  setState(updates) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...updates };

    // Notify all listeners with new state and previous state
    this.listeners.forEach(listener => {
      try {
        listener(this.state, prevState);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
  }

  /**
   * Get current state (immutable copy)
   * @returns {Object} Current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Get a specific state property
   * @param {string} key - State property key
   * @returns {*} State property value
   */
  get(key) {
    return this.state[key];
  }

  /**
   * Reset state to initial values
   */
  reset() {
    this.setState({
      currentView: 'hero',
      currentChapter: null,
      currentImageIndex: 0,
      loading: false,
      error: null,
      mobileMenuOpen: false
    });
  }

  /**
   * Set loading state
   * @param {boolean} isLoading - Loading state
   * @param {string|null} message - Optional loading message
   */
  setLoading(isLoading, message = null) {
    this.setState({ loading: isLoading, error: message });
  }

  /**
   * Set error state
   * @param {string|null} error - Error message
   */
  setError(error) {
    this.setState({ error, loading: false });
  }

  /**
   * Navigate to a specific view
   * @param {string} view - View name ('hero' | 'chapter')
   * @param {Object} params - View parameters (e.g., { chapter: 1 })
   */
  navigateTo(view, params = {}) {
    const updates = { currentView: view };

    if (view === 'hero') {
      updates.currentChapter = null;
      updates.currentImageIndex = 0;
    } else if (view === 'chapter' && params.chapter) {
      updates.currentChapter = params.chapter;
      updates.currentImageIndex = 0;
    }

    this.setState(updates);
  }

  /**
   * Set current chapter
   * @param {number} chapterNumber - Chapter number (1-12)
   */
  setChapter(chapterNumber) {
    if (chapterNumber < 1 || chapterNumber > 12) {
      console.error('Invalid chapter number:', chapterNumber);
      return;
    }

    this.setState({
      currentView: 'chapter',
      currentChapter: chapterNumber,
      currentImageIndex: 0,
      mobileMenuOpen: false
    });
  }

  /**
   * Set current infographic index
   * @param {number} index - Image index
   */
  setImageIndex(index) {
    this.setState({ currentImageIndex: index });
  }

  /**
   * Navigate to next infographic
   */
  nextImage() {
    const { currentChapter, currentImageIndex, infographics } = this.state;
    if (!currentChapter || !infographics[currentChapter]) return;

    const images = infographics[currentChapter];
    const nextIndex = Math.min(currentImageIndex + 1, images.length - 1);
    this.setImageIndex(nextIndex);
  }

  /**
   * Navigate to previous infographic
   */
  prevImage() {
    const { currentImageIndex } = this.state;
    const prevIndex = Math.max(currentImageIndex - 1, 0);
    this.setImageIndex(prevIndex);
  }

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu() {
    this.setState({ mobileMenuOpen: !this.state.mobileMenuOpen });
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu() {
    this.setState({ mobileMenuOpen: false });
  }
}

// Create singleton instance
export const appState = new AppState();

// Export class for testing purposes
export { AppState };
