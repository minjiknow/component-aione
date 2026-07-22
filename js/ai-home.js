(function () {
  'use strict';

  let historyReturnFocus = null;

  function init() {
    bindSearchEvents();
    bindDisabledServiceCards();
    bindHistoryModalEvents();
  }

  /* ========================================================================
     Home search
     ======================================================================== */
  function submitHomeSearch(searchInput) {
    const query = searchInput.value.trim();

    // 퍼블리싱 동작 확인용입니다. 개발 연동 시 대화/API 호출로 교체합니다.
    if (query) window.alert(`검색: ${query}`);
  }

  function bindSearchEvents() {
    const searchForm = document.getElementById('homeSearchForm');
    const searchInput = document.getElementById('homeSearch');
    if (!searchForm || !searchInput) return;

    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      submitHomeSearch(searchInput);
    });
  }

  /* ========================================================================
     Disabled service cards
     ======================================================================== */
  function bindDisabledServiceCards() {
    document.querySelectorAll('.service-card[aria-disabled="true"]').forEach((card) => {
      card.addEventListener('click', (event) => event.preventDefault());
    });
  }

  /* ========================================================================
     History modal
     ======================================================================== */
  function bindHistoryModalEvents() {
    const historyMoreBtn = document.querySelector('.history-more');
    historyMoreBtn?.addEventListener('click', openHistoryModal);

    document.getElementById('historyModalClose')?.addEventListener('click', closeHistoryModal);
    document.getElementById('historyModal')?.addEventListener('click', (event) => {
      if (event.target === event.currentTarget) closeHistoryModal();
    });
    document.addEventListener('keydown', handleHistoryModalKeydown);
  }

  function getHistoryModalFocusableElements(modal) {
    const selector = [
      'a[href]:not([tabindex="-1"])',
      'button:not([disabled]):not([tabindex="-1"])',
      'input:not([disabled]):not([tabindex="-1"])',
      'select:not([disabled]):not([tabindex="-1"])',
      'textarea:not([disabled]):not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    return [...modal.querySelectorAll(selector)].filter((element) => !element.hidden);
  }

  function handleHistoryModalKeydown(event) {
    const modal = document.getElementById('historyModal');
    if (!modal || modal.hidden) return;

    if (event.key === 'Escape') {
      closeHistoryModal();
      return;
    }
    if (event.key !== 'Tab') return;

    const dialog = modal.querySelector('.history-modal');
    const focusableElements = getHistoryModalFocusableElements(modal);
    if (!focusableElements.length) {
      event.preventDefault();
      dialog?.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey && (activeElement === firstElement || activeElement === dialog || !modal.contains(activeElement))) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  function openHistoryModal() {
    const modal = document.getElementById('historyModal');
    const dialog = modal?.querySelector('.history-modal');
    if (!modal) return;

    historyReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modal.hidden = false;
    document.body.classList.add('history-modal-open');
    dialog?.focus();
  }

  function closeHistoryModal() {
    const modal = document.getElementById('historyModal');
    if (!modal || modal.hidden) return;

    modal.hidden = true;
    document.body.classList.remove('history-modal-open');
    if (historyReturnFocus?.isConnected) historyReturnFocus.focus();
    historyReturnFocus = null;
  }

  window.AppCommon.whenReady(init);
})();
