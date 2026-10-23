// Empyrean Intelligence Site - Client script
// Zero tracking. Zero external dependencies.

(function () {
  'use strict';

  // 1. Copy button functionality for terminal blocks
  function initCopyButtons() {
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        const textToCopy = this.getAttribute('data-clipboard-text') || '';
        if (!textToCopy) return;

        navigator.clipboard.writeText(textToCopy).then(
          function () {
            const originalText = button.textContent;
            button.textContent = 'COPIED';
            button.classList.add('copied');
            setTimeout(function () {
              button.textContent = originalText;
              button.classList.remove('copied');
            }, 1800);
          },
          function () {
            button.textContent = 'FAILED';
            setTimeout(function () {
              button.textContent = 'COPY';
            }, 1800);
          }
        );
      });
    });
  }

  // 2. Theme toggle
  function initThemeToggle() {
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;

    // Check localStorage or default to system preference
    const savedTheme = localStorage.getItem('turing-theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
      updateToggleText(toggle, savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      updateToggleText(toggle, prefersDark ? 'dark' : 'light');
    }

    toggle.addEventListener('click', function () {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      let nextTheme;
      if (currentTheme === 'dark') {
        nextTheme = 'light';
      } else if (currentTheme === 'light') {
        nextTheme = 'dark';
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        nextTheme = prefersDark ? 'light' : 'dark';
      }

      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('turing-theme', nextTheme);
      updateToggleText(toggle, nextTheme);
    });
  }

  function updateToggleText(button, theme) {
    if (button) {
      button.textContent = theme === 'dark' ? 'LIGHT' : 'DARK';
    }
  }

  // 3. Typing effect for hero install command (respecting reduced motion)
  function initTypewriter() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const typewriterEl = document.querySelector('[data-typewriter]');
    if (!typewriterEl) return;

    const targetText = typewriterEl.getAttribute('data-typewriter');
    if (!targetText) return;

    typewriterEl.textContent = '';
    let index = 0;
    const speed = 25; // ms per char

    function typeChar() {
      if (index < targetText.length) {
        typewriterEl.textContent += targetText.charAt(index);
        index++;
        setTimeout(typeChar, speed);
      }
    }

    // Small delay before starting
    setTimeout(typeChar, 200);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initCopyButtons();
    initThemeToggle();
    initTypewriter();
  });
})();
