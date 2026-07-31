(() => {
  'use strict';

  const returnFocus = new WeakMap();
  const registeredTypes = new Map();

  function getOpenLayers() {
    return Array.from(registeredTypes.values())
      .flatMap(config => Array.from(document.querySelectorAll(`${config.layerSelector}:not([hidden])`)));
  }

  function syncBodyState() {
    document.body.classList.toggle('is-component-layer-open', getOpenLayers().length > 0);
  }

  function getConfigForLayer(layer) {
    return Array.from(registeredTypes.values())
      .find(config => layer.matches(config.layerSelector));
  }

  function setOpen(layer, isOpen, trigger = null) {
    const config = layer && getConfigForLayer(layer);
    if (!layer || !config) return;

    layer.hidden = !isOpen;
    document.querySelectorAll(`[${config.openAttribute}="${layer.id}"]`).forEach(button => {
      button.setAttribute('aria-expanded', String(isOpen));
    });

    if (isOpen) {
      returnFocus.set(layer, trigger || document.activeElement);
      window.requestAnimationFrame(() => {
        const focusScope = layer.querySelector('[role="dialog"]') || layer;
        const focusTarget = focusScope.querySelector('[autofocus]')
          || focusScope.querySelector(
            'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
          );
        focusTarget?.focus();
      });
    } else {
      const returnTarget = returnFocus.get(layer);
      if (returnTarget instanceof HTMLElement && returnTarget.isConnected) returnTarget.focus();
      returnFocus.delete(layer);
    }

    syncBodyState();
    layer.dispatchEvent(new CustomEvent(`${config.type}:${isOpen ? 'open' : 'close'}`, {
      bubbles: true
    }));
  }

  function initType(root, config) {
    root.querySelectorAll?.(`[${config.openAttribute}]`).forEach(trigger => {
      if (!trigger.hasAttribute('aria-haspopup')) trigger.setAttribute('aria-haspopup', 'dialog');
      if (!trigger.hasAttribute('aria-expanded')) trigger.setAttribute('aria-expanded', 'false');
    });
    syncBodyState();
  }

  function bindGlobalEvents() {
    if (document.documentElement.dataset.componentLayerEventsReady === 'true') return;

    document.addEventListener('click', event => {
      for (const config of registeredTypes.values()) {
        const trigger = event.target.closest(`[${config.openAttribute}]`);
        if (trigger) {
          setOpen(document.getElementById(trigger.getAttribute(config.openAttribute)), true, trigger);
          return;
        }

        const close = event.target.closest(`[${config.closeAttribute}]`);
        if (close) {
          setOpen(close.closest(config.layerSelector), false);
          return;
        }

        const layer = event.target.closest(config.layerSelector);
        if (layer && config.closeOnLayerClick && event.target === layer) {
          setOpen(layer, false);
          return;
        }
      }
    });

    document.addEventListener('keydown', event => {
      const layer = getOpenLayers().at(-1);
      if (!layer) return;
      if (event.defaultPrevented) return;

      if (event.key === 'Escape') {
        if (event.target.closest?.('[data-dropdown-menu].is-open')) return;
        event.preventDefault();
        setOpen(layer, false);
        return;
      }
      if (event.key !== 'Tab') return;

      const focusScope = layer.querySelector('[role="dialog"]') || layer;
      const focusable = Array.from(focusScope.querySelectorAll(
        'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
      )).filter(element => element.getClientRects().length > 0);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    document.documentElement.dataset.componentLayerEventsReady = 'true';
  }

  function create(config) {
    registeredTypes.set(config.type, Object.freeze({ ...config }));
    bindGlobalEvents();

    return Object.freeze({
      init(root = document) {
        initType(root, config);
      },
      open(target, trigger = null) {
        const layer = target instanceof Element ? target : document.querySelector(target);
        setOpen(layer, true, trigger);
      },
      close(target) {
        const layer = target instanceof Element ? target : document.querySelector(target);
        setOpen(layer, false);
      }
    });
  }

  window.AIOneLayerFactory = Object.freeze({ create });
})();
