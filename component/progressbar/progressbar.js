(() => {
  'use strict';

  function resolveProgressbar(target) {
    if (target instanceof Element) return target;
    if (typeof target === 'string') return document.querySelector(target);
    return null;
  }

  function setValue(target, nextValue) {
    const progressbar = resolveProgressbar(target);
    if (!progressbar) return null;

    const min = Number(progressbar.getAttribute('aria-valuemin') ?? 0);
    const max = Number(progressbar.getAttribute('aria-valuemax') ?? 100);
    const safeMin = Number.isFinite(min) ? min : 0;
    const safeMax = Number.isFinite(max) && max > safeMin ? max : 100;
    const numericValue = Number(nextValue);
    const value = Math.min(safeMax, Math.max(
      safeMin,
      Number.isFinite(numericValue) ? numericValue : safeMin
    ));
    const percent = ((value - safeMin) / (safeMax - safeMin)) * 100;

    progressbar.style.setProperty('--progressbar-value', `${percent}%`);
    progressbar.dataset.value = String(value);
    progressbar.setAttribute('role', 'progressbar');
    progressbar.setAttribute('aria-valuemin', String(safeMin));
    progressbar.setAttribute('aria-valuemax', String(safeMax));
    progressbar.setAttribute('aria-valuenow', String(value));
    progressbar.classList.toggle('is-high', percent >= 90);
    progressbar.classList.toggle('is-low', percent < 90);
    progressbar.closest('.progressbar-row')
      ?.querySelector('[data-progressbar-value]')
      ?.replaceChildren(`${Math.round(percent)}%`);
    progressbar.dispatchEvent(new CustomEvent('progressbar:change', {
      bubbles: true,
      detail: { value, percent }
    }));
    return progressbar;
  }

  function init(root = document) {
    const progressbars = [];
    if (root instanceof Element && root.matches('[data-progressbar]')) progressbars.push(root);
    root.querySelectorAll?.('[data-progressbar]').forEach(progressbar => progressbars.push(progressbar));
    progressbars.forEach(progressbar => {
      setValue(
        progressbar,
        progressbar.dataset.value ?? progressbar.getAttribute('aria-valuenow') ?? 0
      );
    });
  }

  window.AIOneProgressBar = Object.freeze({ init, setValue });
  document.addEventListener('DOMContentLoaded', () => init());
  document.addEventListener('app:includes-ready', event => init(event.target));
})();
