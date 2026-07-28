(() => {
  'use strict';

  const variants = new Set(['run-list', 'chat-list', 'content']);
  const controller = window.AIOneLayerFactory.create({
    type: 'sidepop',
    layerSelector: '[data-sidepop]',
    openAttribute: 'data-sidepop-open',
    closeAttribute: 'data-sidepop-close',
    closeOnLayerClick: false
  });

  function resolveLayer(target) {
    if (target instanceof Element) return target.closest('[data-sidepop]') || target;
    if (typeof target !== 'string') return null;
    return target.startsWith('#')
      ? document.querySelector(target)
      : document.getElementById(target);
  }

  function setVariant(target, variant = 'run-list') {
    const layer = resolveLayer(target);
    const sidepop = layer?.querySelector('.sidepop');
    if (!sidepop || !variants.has(variant)) return false;

    variants.forEach(name => sidepop.classList.toggle(`sidepop-variant-${name}`, name === variant));
    sidepop.dataset.sidepopVariant = variant;
    layer.dispatchEvent(new CustomEvent('sidepop:variant-change', {
      bubbles: true,
      detail: { variant }
    }));
    return true;
  }

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-sidepop-open][data-sidepop-variant]');
    if (!trigger) return;
    setVariant(trigger.getAttribute('data-sidepop-open'), trigger.dataset.sidepopVariant);
  }, true);

  window.AIOneSidePop = Object.freeze({
    init: controller.init,
    open: controller.open,
    close: controller.close,
    setVariant
  });
  document.addEventListener('DOMContentLoaded', () => controller.init());
  document.addEventListener('app:includes-ready', event => controller.init(event.target));
})();
