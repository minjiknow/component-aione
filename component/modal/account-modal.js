(() => {
  'use strict';

  function resolveLayer(target) {
    if (target instanceof Element) return target;
    if (typeof target === 'string') return document.querySelector(target);
    return null;
  }

  function getVariant(layer) {
    return layer
      ?.querySelector('.custom-modal[data-modal-variant]')
      ?.getAttribute('data-modal-variant') || '';
  }

  function resolveUserCard(source, layer) {
    if (source instanceof Element) {
      if (source.matches('.user-card')) return source;
      const sourceCard = source.closest('.user-card');
      if (sourceCard) return sourceCard;
      const nestedCard = source.querySelector?.('.user-card');
      if (nestedCard) return nestedCard;
    }
    return layer?.closest('.app-sidebar, .sidebar')?.querySelector('.user-card') || null;
  }

  function getProfileValue(card, selector, fallback) {
    return card?.querySelector(selector)?.textContent?.trim() || fallback;
  }

  function syncProfile(target, source = null) {
    const layer = resolveLayer(target);
    if (!layer || getVariant(layer) !== 'account-profile') return;

    const card = resolveUserCard(source, layer);
    const profile = {
      name: getProfileValue(card, '.user-name, .user-name-sm', '박재정 주무관'),
      department: getProfileValue(card, '.user-dept', '재정분석과'),
      role: getProfileValue(card, '.user-role-badge', '국회담당자')
    };

    layer.querySelectorAll('[data-account-profile-name]').forEach(element => {
      element.textContent = profile.name;
    });
    layer.querySelectorAll('[data-account-profile-dept]').forEach(element => {
      element.textContent = profile.department;
    });
    layer.querySelectorAll('[data-account-profile-role]').forEach(element => {
      element.textContent = profile.role;
    });
  }

  function initSettings(layer) {
    if (getVariant(layer) !== 'account-settings') return;
    window.AIOnePreferences?.init(layer);
  }

  function prepare(target, source = null) {
    const layer = resolveLayer(target);
    if (!layer) return;

    const variant = getVariant(layer);
    if (variant === 'account-profile') syncProfile(layer, source);
    if (variant === 'account-settings') initSettings(layer);
  }

  function bindLayer(layer) {
    const variant = getVariant(layer);
    if (!['account-profile', 'account-settings'].includes(variant)) return;
    if (layer.dataset.accountModalReady === 'true') {
      prepare(layer);
      return;
    }

    layer.dataset.accountModalReady = 'true';
    layer.addEventListener('modal:open', () => prepare(layer));
    prepare(layer);
  }

  function init(root = document) {
    if (root instanceof Element && root.matches('[data-modal]')) bindLayer(root);
    root.querySelectorAll?.('[data-modal]').forEach(bindLayer);
  }

  window.AIOneAccountModal = Object.freeze({
    init,
    prepare,
    syncProfile
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init(), { once: true });
  } else {
    init();
  }

  document.addEventListener('app:includes-ready', event => init(event.target));
  document.addEventListener('component:ready', event => {
    if (event.detail?.name === 'modal') init(event.target);
  });
  document.addEventListener('ai-one-preferences:ready', () => init());
})();
