/**
 * DOM Utilities Module
 * Helper functions for DOM manipulation
 */

/**
 * Create element with attributes and content
 * @param {string} tag - HTML tag name
 * @param {Object} attributes - Element attributes
 * @param {string|HTMLElement|Array} content - Element content
 * @returns {HTMLElement} Created element
 */
export function createElement(tag, attributes = {}, content = null) {
  const element = document.createElement(tag);

  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.substring(2).toLowerCase();
      element.addEventListener(eventName, value);
    } else {
      element.setAttribute(key, value);
    }
  });

  // Set content
  if (content !== null) {
    if (typeof content === 'string') {
      element.innerHTML = content;
    } else if (Array.isArray(content)) {
      content.forEach(child => {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        } else if (child instanceof HTMLElement) {
          element.appendChild(child);
        }
      });
    } else if (content instanceof HTMLElement) {
      element.appendChild(content);
    }
  }

  return element;
}

/**
 * Query selector with error handling
 * @param {string} selector - CSS selector
 * @param {HTMLElement} parent - Parent element (default: document)
 * @returns {HTMLElement|null} Selected element or null
 */
export function $(selector, parent = document) {
  try {
    return parent.querySelector(selector);
  } catch (error) {
    console.error(`Error selecting "${selector}":`, error);
    return null;
  }
}

/**
 * Query selector all with error handling
 * @param {string} selector - CSS selector
 * @param {HTMLElement} parent - Parent element (default: document)
 * @returns {Array<HTMLElement>} Array of selected elements
 */
export function $$(selector, parent = document) {
  try {
    return Array.from(parent.querySelectorAll(selector));
  } catch (error) {
    console.error(`Error selecting all "${selector}":`, error);
    return [];
  }
}

/**
 * Add event listener with delegation
 * @param {HTMLElement|string} target - Target element or selector
 * @param {string} eventType - Event type
 * @param {string} selector - Delegated selector
 * @param {Function} handler - Event handler
 */
export function delegate(target, eventType, selector, handler) {
  const element = typeof target === 'string' ? $(target) : target;

  if (!element) {
    console.error('Delegate target not found:', target);
    return;
  }

  element.addEventListener(eventType, (event) => {
    const matchingElement = event.target.closest(selector);
    if (matchingElement) {
      handler.call(matchingElement, event);
    }
  });
}

/**
 * Remove all children from an element
 * @param {HTMLElement} element - Element to clear
 */
export function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Show element
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} display - Display value (default: 'block')
 */
export function show(element, display = 'block') {
  const el = typeof element === 'string' ? $(element) : element;
  if (el) el.style.display = display;
}

/**
 * Hide element
 * @param {HTMLElement|string} element - Element or selector
 */
export function hide(element) {
  const el = typeof element === 'string' ? $(element) : element;
  if (el) el.style.display = 'none';
}

/**
 * Toggle element visibility
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} display - Display value when showing (default: 'block')
 */
export function toggle(element, display = 'block') {
  const el = typeof element === 'string' ? $(element) : element;
  if (!el) return;

  if (el.style.display === 'none' || !el.style.display) {
    show(el, display);
  } else {
    hide(el);
  }
}

/**
 * Add class to element
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} className - Class name
 */
export function addClass(element, className) {
  const el = typeof element === 'string' ? $(element) : element;
  if (el) el.classList.add(className);
}

/**
 * Remove class from element
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} className - Class name
 */
export function removeClass(element, className) {
  const el = typeof element === 'string' ? $(element) : element;
  if (el) el.classList.remove(className);
}

/**
 * Toggle class on element
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} className - Class name
 * @returns {boolean} True if class was added, false if removed
 */
export function toggleClass(element, className) {
  const el = typeof element === 'string' ? $(element) : element;
  return el ? el.classList.toggle(className) : false;
}

/**
 * Check if element has class
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} className - Class name
 * @returns {boolean} True if element has class
 */
export function hasClass(element, className) {
  const el = typeof element === 'string' ? $(element) : element;
  return el ? el.classList.contains(className) : false;
}

/**
 * Set HTML content
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} html - HTML content
 */
export function setHTML(element, html) {
  const el = typeof element === 'string' ? $(element) : element;
  if (el) el.innerHTML = html;
}

/**
 * Append HTML content
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} html - HTML content
 */
export function appendHTML(element, html) {
  const el = typeof element === 'string' ? $(element) : element;
  if (el) el.insertAdjacentHTML('beforeend', html);
}

/**
 * Get element attribute
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} attr - Attribute name
 * @returns {string|null} Attribute value or null
 */
export function getAttr(element, attr) {
  const el = typeof element === 'string' ? $(element) : element;
  return el ? el.getAttribute(attr) : null;
}

/**
 * Set element attribute
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} attr - Attribute name
 * @param {string} value - Attribute value
 */
export function setAttr(element, attr, value) {
  const el = typeof element === 'string' ? $(element) : element;
  if (el) el.setAttribute(attr, value);
}

/**
 * Scroll element into view
 * @param {HTMLElement|string} element - Element or selector
 * @param {Object} options - Scroll options
 */
export function scrollIntoView(element, options = { behavior: 'smooth', block: 'start' }) {
  const el = typeof element === 'string' ? $(element) : element;
  if (el) el.scrollIntoView(options);
}
