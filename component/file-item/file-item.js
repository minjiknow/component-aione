(() => {
  'use strict';

  const ACTION_SCOPE_SELECTOR = '[data-file-actions]';
  const FILE_ITEM_SELECTOR = '.file-list > li';
  const PINNED_META_SUFFIX = ' · 목록 고정';
  let pendingDelete = null;

  function getItems(list) {
    return Array.from(list?.children || [])
      .filter(item => item.matches('li:not(.file-list-empty)'));
  }

  function assignInitialOrder(list) {
    const items = getItems(list);
    const usedOrders = items
      .map(item => Number(item.dataset.fileInitialIndex))
      .filter(Number.isFinite);
    let nextOrder = usedOrders.length ? Math.max(...usedOrders) + 1 : 0;

    items.forEach(item => {
      if (Number.isFinite(Number(item.dataset.fileInitialIndex))) return;
      item.dataset.fileInitialIndex = String(nextOrder);
      nextOrder += 1;
    });
  }

  function syncPinnedState(item, isPinned) {
    item.classList.toggle('pinned', isPinned);

    const pinButton = item.querySelector('[data-menu-value="pin"]');
    if (pinButton) {
      pinButton.textContent = isPinned ? '목록 고정 해제' : '목록 고정';
      pinButton.setAttribute('aria-pressed', String(isPinned));
    }

    const meta = item.querySelector('.file-meta');
    if (meta) {
      meta.dataset.fileMetaBase ||= meta.textContent
        .replace(/\s*·\s*목록 고정$/, '')
        .trim();
      meta.textContent = `${meta.dataset.fileMetaBase}${isPinned ? PINNED_META_SUFFIX : ''}`;
    }
  }

  function sortPinnedItems(list) {
    assignInitialOrder(list);
    getItems(list)
      .sort((first, second) => (
        Number(second.classList.contains('pinned')) - Number(first.classList.contains('pinned'))
        || Number(first.dataset.fileInitialIndex) - Number(second.dataset.fileInitialIndex)
      ))
      .forEach(item => list.append(item));
  }

  function syncListState(list) {
    if (!list || list.classList.contains('simple')) return;

    const count = getItems(list).length;
    const section = list.closest('.file-list-section');
    const countElement = section?.querySelector('.upload-summary-file-count');
    if (countElement) countElement.textContent = String(count);
    const summaryMessage = section?.querySelector('.upload-summary-footer-copy em');
    if (summaryMessage) summaryMessage.textContent = `${count}건 질의 확인`;

    const scope = list.closest(ACTION_SCOPE_SELECTOR);
    const emptyTarget = list.dataset.fileEmptyTarget
      ? scope?.querySelector(list.dataset.fileEmptyTarget)
      : null;
    if (emptyTarget) {
      emptyTarget.classList.toggle('hidden', count > 0);
      list.classList.toggle('hidden', count === 0);
    }
  }

  function selectItem(item) {
    const list = item.closest('.file-list');
    if (!list || list.classList.contains('simple')) return;
    getItems(list).forEach(candidate => {
      candidate.classList.toggle('active', candidate === item);
    });
  }

  function getFileName(item) {
    return item.querySelector('.file-name, .file-name-simple')?.textContent.trim()
      || '선택한 파일';
  }

  function getDeleteModal(item) {
    const scope = item.closest(ACTION_SCOPE_SELECTOR);
    const modalId = scope?.dataset.fileDeleteModal;
    return modalId ? document.getElementById(modalId) : null;
  }

  function prepareDelete(item, trigger) {
    const modal = getDeleteModal(item);
    if (!modal || !window.AIOneModal) return;

    const fileName = getFileName(item);
    const nameElement = modal.querySelector('[data-file-delete-name]');
    if (nameElement) nameElement.textContent = fileName;

    pendingDelete = { item, modal, fileName };
    window.AIOneModal.open(modal, trigger);
  }

  function deletePendingItem() {
    const target = pendingDelete;
    if (!target?.item.isConnected) return;

    const { item, modal, fileName } = target;
    const list = item.closest('.file-list');
    const wasActive = item.classList.contains('active');
    const nextItem = item.nextElementSibling || item.previousElementSibling;

    item.remove();
    if (wasActive && nextItem?.matches('li:not(.file-list-empty)')) {
      selectItem(nextItem);
    }
    syncListState(list);

    pendingDelete = null;
    window.AIOneModal?.close(modal);
    list?.dispatchEvent(new CustomEvent('fileitem:delete', {
      bubbles: true,
      detail: { fileName }
    }));
  }

  function togglePinnedItem(item) {
    const list = item.closest('.file-list');
    const isPinned = !item.classList.contains('pinned');
    syncPinnedState(item, isPinned);
    sortPinnedItems(list);
    item.dispatchEvent(new CustomEvent('fileitem:pinchange', {
      bubbles: true,
      detail: { pinned: isPinned, fileName: getFileName(item) }
    }));
  }

  function init(root = document) {
    const scopes = [];
    if (root instanceof Element && root.matches(ACTION_SCOPE_SELECTOR)) scopes.push(root);
    root.querySelectorAll?.(ACTION_SCOPE_SELECTOR).forEach(scope => scopes.push(scope));

    scopes.forEach(scope => {
      scope.querySelectorAll('.file-list:not(.simple)').forEach(list => {
        assignInitialOrder(list);
        getItems(list).forEach(item => {
          syncPinnedState(item, item.classList.contains('pinned'));
        });
        syncListState(list);
      });
    });
  }

  document.addEventListener('dropdownmenu:select', event => {
    const item = event.target.closest(FILE_ITEM_SELECTOR);
    if (!item?.closest(ACTION_SCOPE_SELECTOR)) return;

    if (event.detail?.value === 'pin') togglePinnedItem(item);
    if (event.detail?.value === 'delete') {
      prepareDelete(item, event.detail.item || event.target);
    }
  });

  document.addEventListener('click', event => {
    const confirmButton = event.target.closest('[data-file-delete-confirm]');
    if (confirmButton) {
      if (pendingDelete?.modal.contains(confirmButton)) deletePendingItem();
      return;
    }

    const removeButton = event.target.closest('.file-remove-simple');
    const simpleItem = removeButton?.closest(FILE_ITEM_SELECTOR);
    if (simpleItem?.closest(ACTION_SCOPE_SELECTOR)) {
      prepareDelete(simpleItem, removeButton);
      return;
    }

    const mainButton = event.target.closest('.file-item-main');
    const item = mainButton?.closest(FILE_ITEM_SELECTOR);
    if (item?.closest(ACTION_SCOPE_SELECTOR)) selectItem(item);
  });

  document.addEventListener('modal:close', event => {
    if (pendingDelete?.modal === event.target) pendingDelete = null;
  });

  window.AIOneFileItem = Object.freeze({
    init,
    syncPinnedState,
    prepareDelete
  });
  document.addEventListener('DOMContentLoaded', () => init());
  document.addEventListener('app:includes-ready', event => init(event.target));
})();
