/**
 * main.js
 * Shared behaviour for every page: mobile nav toggle, active-link
 * highlighting, and a small toast helper other scripts reuse.
 */

(function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => links.classList.remove('open'))
    );
  }

  // Highlight the current page in the nav based on data-page attribute
  const current = document.body.getAttribute('data-page');
  if (current) {
    document.querySelectorAll(`.nav-links a[data-page="${current}"]`).forEach((a) =>
      a.classList.add('active')
    );
  }
})();

/** Reusable toast notification. Call window.showToast('Message'). */
window.showToast = function showToast(message) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = '<span class="dot"></span><span class="msg"></span>';
    document.body.appendChild(el);
  }
  el.querySelector('.msg').textContent = message;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 3200);
};

/** Small helper: format a JS date as DD Mon YYYY */
window.fmtDate = function fmtDate(d) {
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
