(() => {
  'use strict';

  const controller = window.AIOneLayerFactory.create({
    type: 'modal',
    layerSelector: '[data-modal]',
    openAttribute: 'data-modal-open',
    closeAttribute: 'data-modal-close',
    closeOnLayerClick: true
  });

  window.AIOneModal = controller;
  document.addEventListener('DOMContentLoaded', () => controller.init());
  document.addEventListener('app:includes-ready', event => controller.init(event.target));
})();
