/**
 * Keyboard Navigation Module
 * Handles keyboard shortcuts and navigation
 */

import { appState } from '../state.js';

/**
 * Keyboard event handlers
 */
const handlers = {
  ArrowLeft: handleArrowLeft,
  ArrowRight: handleArrowRight,
  Escape: handleEscape,
  Home: handleHome,
  End: handleEnd
};

/**
 * Initialize keyboard navigation
 */
export function initKeyboardNav() {
  document.addEventListener('keydown', handleKeyDown);
}

/**
 * Remove keyboard navigation
 */
export function destroyKeyboardNav() {
  document.removeEventListener('keydown', handleKeyDown);
}

/**
 * Handle keydown events
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyDown(event) {
  const { key, ctrlKey, metaKey, altKey } = event;

  // Ignore if modifier keys are pressed (except Escape)
  if ((ctrlKey || metaKey || altKey) && key !== 'Escape') {
    return;
  }

  // Ignore if user is typing in input field
  if (isTypingInInput(event.target)) {
    return;
  }

  // Defer to the fullscreen overlay when it's open (it has its own
  // Escape / arrow-key handling) to avoid double navigation.
  if (document.querySelector('.fullscreen-overlay')) {
    return;
  }

  // Get handler for key
  const handler = handlers[key];

  if (handler) {
    const preventDefault = handler(event);
    if (preventDefault !== false) {
      event.preventDefault();
    }
  }
}

/**
 * Check if user is typing in an input field
 * @param {HTMLElement} target - Event target
 * @returns {boolean} True if typing in input
 */
function isTypingInInput(target) {
  const tagName = target.tagName.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target.isContentEditable
  );
}

/**
 * Handle Arrow Left key
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleArrowLeft(event) {
  const state = appState.getState();

  if (state.currentView === 'chapter') {
    appState.prevImage();
    return true; // Prevent default
  }

  return false; // Don't prevent default
}

/**
 * Handle Arrow Right key
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleArrowRight(event) {
  const state = appState.getState();

  if (state.currentView === 'chapter') {
    appState.nextImage();
    return true; // Prevent default
  }

  return false; // Don't prevent default
}

/**
 * Handle Escape key
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleEscape(event) {
  const state = appState.getState();

  // Close mobile menu if open
  if (state.mobileMenuOpen) {
    appState.closeMobileMenu();
    return true;
  }

  // Go to hero view if on chapter view
  if (state.currentView === 'chapter') {
    window.location.hash = '';
    return true;
  }

  return false;
}

/**
 * Handle Home key
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleHome(event) {
  const state = appState.getState();

  if (state.currentView === 'chapter') {
    appState.setImageIndex(0);
    return true; // Prevent default
  }

  return false;
}

/**
 * Handle End key
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleEnd(event) {
  const state = appState.getState();

  if (state.currentView === 'chapter' && state.currentChapter) {
    const images = state.infographics[state.currentChapter] || [];
    if (images.length > 0) {
      appState.setImageIndex(images.length - 1);
      return true; // Prevent default
    }
  }

  return false;
}

/**
 * Add custom keyboard shortcut
 * @param {string} key - Key name
 * @param {Function} handler - Handler function
 */
export function addShortcut(key, handler) {
  if (typeof handler !== 'function') {
    throw new Error('Handler must be a function');
  }
  handlers[key] = handler;
}

/**
 * Remove custom keyboard shortcut
 * @param {string} key - Key name
 */
export function removeShortcut(key) {
  delete handlers[key];
}

/**
 * Get all registered shortcuts
 * @returns {Array<string>} Array of key names
 */
export function getShortcuts() {
  return Object.keys(handlers);
}
