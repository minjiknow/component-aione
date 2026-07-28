(() => {
  'use strict';

  const timers = new WeakMap();

  function resolve(target) {
    if (target instanceof Element) return target;
    if (typeof target === 'string') return document.querySelector(target);
    return document.querySelector('[data-toast]');
  }

  function hide(target) {
    const toast = resolve(target);
    if (!toast) return;

    const currentTimers = timers.get(toast);
    if (currentTimers) {
      clearTimeout(currentTimers.hide);
      clearTimeout(currentTimers.hidden);
    }

    toast.classList.remove('is-visible');
    const hiddenTimer = window.setTimeout(() => {
      if (!toast.classList.contains('is-visible')) toast.hidden = true;
    }, 200);
    timers.set(toast, { hide: 0, hidden: hiddenTimer });
  }

  function show(message, options = {}) {
    const toast = resolve(options.target);
    if (!toast) return null;

    const messageElement = toast.querySelector('[data-toast-message]') || toast;
    messageElement.textContent = String(message ?? '');
    toast.hidden = false;
    toast.setAttribute('role', toast.getAttribute('role') || 'status');
    toast.setAttribute('aria-live', toast.getAttribute('aria-live') || 'polite');
    toast.setAttribute('aria-atomic', 'true');

    const currentTimers = timers.get(toast);
    if (currentTimers) {
      clearTimeout(currentTimers.hide);
      clearTimeout(currentTimers.hidden);
    }

    window.requestAnimationFrame(() => toast.classList.add('is-visible'));

    const duration = Number.isFinite(Number(options.duration))
      ? Math.max(0, Number(options.duration))
      : 2000;
    const hideTimer = duration > 0
      ? window.setTimeout(() => hide(toast), duration)
      : 0;
    timers.set(toast, { hide: hideTimer, hidden: 0 });
    return toast;
  }

  window.AIOneToast = Object.freeze({ show, hide });
})();
