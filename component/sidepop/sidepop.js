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

  function getRuleItems(list) {
    return Array.from(list?.children || []).filter(item => item.matches('.rule-item'));
  }

  function activateRuleItem(item, shouldFocus = false) {
    const list = item?.closest('.rule-list');
    const items = getRuleItems(list);
    if (!list || !items.includes(item)) return false;

    items.forEach(ruleItem => {
      const isActive = ruleItem === item;
      ruleItem.classList.toggle('active', isActive);
      ruleItem.setAttribute('aria-selected', String(isActive));
      ruleItem.tabIndex = isActive ? 0 : -1;
    });
    if (shouldFocus) item.focus();
    return true;
  }

  function initRuleLists(root = document) {
    const lists = [];
    if (root.matches?.('.rule-list')) lists.push(root);
    root.querySelectorAll?.('.rule-list').forEach(list => lists.push(list));

    lists.forEach(list => {
      const items = getRuleItems(list);
      if (!items.length) return;

      list.setAttribute('role', 'tablist');
      list.setAttribute('aria-orientation', 'vertical');
      items.forEach(item => item.setAttribute('role', 'tab'));
      activateRuleItem(items.find(item => item.classList.contains('active')) || items[0]);
    });
  }

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-sidepop-open][data-sidepop-variant]');
    if (trigger) {
      setVariant(trigger.getAttribute('data-sidepop-open'), trigger.dataset.sidepopVariant);
      return;
    }

    const ruleItem = event.target.closest('.rule-list > .rule-item');
    if (ruleItem) activateRuleItem(ruleItem);
  }, true);

  document.addEventListener('keydown', event => {
    const currentItem = event.target.closest?.('.rule-list > .rule-item');
    if (!currentItem) return;

    const items = getRuleItems(currentItem.closest('.rule-list'));
    const currentIndex = items.indexOf(currentItem);
    let nextItem = null;

    if (event.key === 'ArrowDown') nextItem = items[(currentIndex + 1) % items.length];
    if (event.key === 'ArrowUp') nextItem = items[(currentIndex - 1 + items.length) % items.length];
    if (event.key === 'Home') nextItem = items[0];
    if (event.key === 'End') nextItem = items[items.length - 1];
    if (['Enter', ' '].includes(event.key)) nextItem = currentItem;
    if (!nextItem) return;

    event.preventDefault();
    activateRuleItem(nextItem, true);
  });

  window.AIOneSidePop = Object.freeze({
    init: controller.init,
    open: controller.open,
    close: controller.close,
    setVariant,
    initRuleLists
  });
  document.addEventListener('DOMContentLoaded', () => {
    controller.init();
    initRuleLists();
  });
  document.addEventListener('app:includes-ready', event => {
    controller.init(event.target);
    initRuleLists(event.target);
  });
})();
