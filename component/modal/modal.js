(() => {
  'use strict';

  const MENU_GAP = 10;
  const VIEWPORT_MARGIN = 16;
  const menuAnchors = new WeakMap();
  const baseController = window.AIOneLayerFactory.create({
    type: 'modal',
    layerSelector: '[data-modal]',
    openAttribute: 'data-modal-open',
    closeAttribute: 'data-modal-close',
    closeOnLayerClick: true
  });

  function resolveLayer(target) {
    if (target instanceof Element) return target;
    if (typeof target === 'string') return document.querySelector(target);
    return null;
  }

  function isActionMenu(layer) {
    return layer?.classList.contains('modal-menu-backdrop')
      && Boolean(layer.querySelector('.custom-modal.modal-small'));
  }

  function positionActionMenu(layer, trigger) {
    if (!isActionMenu(layer) || !(trigger instanceof Element)) return;

    const dialog = layer.querySelector('.custom-modal.modal-small');
    const triggerRect = trigger.getBoundingClientRect();
    const dialogRect = dialog.getBoundingClientRect();
    const maxLeft = window.innerWidth - dialogRect.width - VIEWPORT_MARGIN;
    const maxTop = window.innerHeight - dialogRect.height - VIEWPORT_MARGIN;
    const belowPosition = triggerRect.bottom + MENU_GAP;
    const abovePosition = triggerRect.top - dialogRect.height - MENU_GAP;
    const left = Math.min(
      Math.max(VIEWPORT_MARGIN, triggerRect.right - dialogRect.width),
      Math.max(VIEWPORT_MARGIN, maxLeft)
    );
    const top = belowPosition <= maxTop
      ? belowPosition
      : Math.max(VIEWPORT_MARGIN, abovePosition);

    layer.style.setProperty('--modal-menu-left', `${Math.round(left)}px`);
    layer.style.setProperty('--modal-menu-top', `${Math.round(top)}px`);
    layer.classList.add('is-anchored');
    menuAnchors.set(layer, trigger);
  }

  function repositionOpenMenus() {
    document.querySelectorAll('.modal-menu-backdrop:not([hidden])').forEach(layer => {
      const trigger = menuAnchors.get(layer);
      if (trigger?.isConnected) positionActionMenu(layer, trigger);
    });
  }

  const controller = Object.freeze({
    init: baseController.init,
    open(target, trigger = null) {
      const layer = resolveLayer(target);
      baseController.open(layer, trigger);
      if (trigger) positionActionMenu(layer, trigger);
    },
    close: baseController.close
  });

  window.AIOneModal = controller;
  document.addEventListener('DOMContentLoaded', () => controller.init());
  document.addEventListener('app:includes-ready', event => controller.init(event.target));
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-modal-open]');
    if (!trigger) return;

    const layer = document.getElementById(trigger.getAttribute('data-modal-open'));
    if (isActionMenu(layer)) positionActionMenu(layer, trigger);
  });
  document.addEventListener('modal:close', event => {
    if (!isActionMenu(event.target)) return;
    menuAnchors.delete(event.target);
    event.target.classList.remove('is-anchored');
  });
  window.addEventListener('resize', repositionOpenMenus);
  document.addEventListener('scroll', repositionOpenMenus, true);
})();
