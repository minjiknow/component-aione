(function () {
  'use strict';

  const STORAGE_KEY = 'ai-one-color-theme';
  const NOTIFICATION_KEY = 'ai-one-long-task-notification';
  const MENU_COMPLETION_KEY = 'ai-one-menu-completion-state';
  const VALID_THEMES = ['system', 'dark', 'light'];
  const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  let currentPreference = 'system';
  let activeMenu = null;
  let activeButton = null;
  let settingsLayerBackdrop = null;
  let accountLayerBackdrop = null;
  let accountLayerConfirmHandler = null;
  let notificationEnabled = readNotificationPreference();
  let menuCompletionState = readMenuCompletionState();

  function readMenuCompletionState() {
    try {
      const saved = JSON.parse(localStorage.getItem(MENU_COMPLETION_KEY) || '{}');
      return saved && typeof saved === 'object' ? saved : {};
    } catch (e) {
      return {};
    }
  }

  function persistMenuCompletionState() {
    try { localStorage.setItem(MENU_COMPLETION_KEY, JSON.stringify(menuCompletionState)); }
    catch (e) { /* 현재 화면에만 적용 */ }
  }

  function resolveMenuKeyFromLink(link) {
    if (!link) return '';
    if (link.dataset.page) return link.dataset.page;
    const href = link.getAttribute('href') || '';
    if (href.includes('ai-intake')) return 'intake';
    if (href.includes('ai-answer')) return 'answer';
    if (href.includes('ai-chatbot')) return 'chatbot';
    if (href.includes('ai-economy')) return 'economy';
    if (href.includes('ai-home')) return 'home';
    return '';
  }

  function inferMenuKeyFromNotification(title) {
    const text = String(title || '');
    if (text.includes('질의 분류') || text.includes('질의 재분류')) return 'intake';
    if (text.includes('답변서') || text.includes('관련자료')) return 'answer';
    if (text.includes('경제')) return 'economy';
    if (text.includes('챗봇')) return 'chatbot';
    return '';
  }

  function renderMenuCompletionDots() {
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
      const menuKey = resolveMenuKeyFromLink(link);
      if (!menuKey) return;

      let dot = link.querySelector('.nav-complete-dot');
      if (!dot) {
        dot = document.createElement('span');
        dot.className = 'nav-complete-dot';
        dot.setAttribute('aria-label', '완료된 작업 있음');
        dot.setAttribute('title', '완료된 작업이 있습니다.');
        link.appendChild(dot);
      }

      const isVisible = notificationEnabled && Boolean(menuCompletionState[menuKey]);
      dot.classList.toggle('hidden', !isVisible);
      link.classList.toggle('has-complete-status', isVisible);

      if (link.dataset.completionBound !== 'true') {
        link.dataset.completionBound = 'true';
        link.addEventListener('click', () => {
          const key = resolveMenuKeyFromLink(link);
          if (!key || !menuCompletionState[key]) return;
          delete menuCompletionState[key];
          persistMenuCompletionState();
          renderMenuCompletionDots();
        });
      }
    });
  }

  function markMenuCompletion(menuKey) {
    if (!notificationEnabled || !menuKey) return;
    menuCompletionState[menuKey] = { completedAt: Date.now() };
    persistMenuCompletionState();
    renderMenuCompletionDots();
  }

  function clearMenuCompletionState() {
    menuCompletionState = {};
    persistMenuCompletionState();
    renderMenuCompletionDots();
  }

  function readNotificationPreference() {
    try { return localStorage.getItem(NOTIFICATION_KEY) === 'true'; }
    catch (e) { return false; }
  }

  function saveNotificationPreference(enabled) {
    notificationEnabled = Boolean(enabled);
    try { localStorage.setItem(NOTIFICATION_KEY, String(notificationEnabled)); } catch (e) { /* 현재 화면에만 적용 */ }
    if (!notificationEnabled) clearMenuCompletionState();
    else renderMenuCompletionDots();
    document.dispatchEvent(new CustomEvent('ai-one-notification-change', { detail: { enabled: notificationEnabled } }));
  }

  function readPreference() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return VALID_THEMES.includes(saved) ? saved : 'system';
    } catch (e) {
      return 'system';
    }
  }

  function resolveTheme(preference) {
    if (preference === 'system') return systemThemeQuery.matches ? 'dark' : 'light';
    return preference;
  }

  function updateMenuSelection() {
    document.querySelectorAll('.theme-option').forEach(option => {
      const isActive = option.dataset.themeValue === currentPreference;
      option.classList.toggle('active', isActive);
      option.setAttribute('aria-checked', String(isActive));
      const check = option.querySelector('.theme-option-check');
      if (check) check.textContent = isActive ? '✓' : '';
    });
  }

  function applyTheme(preference, persist) {
    const normalized = VALID_THEMES.includes(preference) ? preference : 'system';
    const resolved = resolveTheme(normalized);
    currentPreference = normalized;

    document.documentElement.dataset.themePreference = normalized;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;

    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, normalized); } catch (e) { /* 현재 화면에만 적용 */ }
    }

    updateMenuSelection();
    document.dispatchEvent(new CustomEvent('ai-one-theme-change', {
      detail: { preference: normalized, resolvedTheme: resolved }
    }));
  }

  // 페이지가 그려지기 전에 저장된 테마를 먼저 적용한다.
  currentPreference = readPreference();
  applyTheme(currentPreference, false);

  function themeIcon(type) {
    if (type === 'system') {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 21h8M12 18v3"/></svg>';
    }
    if (type === 'dark') {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.5 6.5 0 0 0 21 12.8z"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"/></svg>';
  }

  function createThemeMenu() {
    const menu = document.createElement('div');
    menu.className = 'settings-theme-menu hidden';
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-label', '환경설정');
    menu.innerHTML = `
      <div class="settings-theme-head">
        <div>
          <strong>환경설정</strong>
        </div>
        <button type="button" class="settings-theme-close" aria-label="설정 메뉴 닫기">×</button>
      </div>
      <div class="settings-section-title">화면 모드</div>
      <div class="theme-option-list" role="radiogroup" aria-label="화면 모드 선택">
        <button type="button" class="theme-option" data-theme-value="system" role="radio">
          <span class="theme-option-icon">${themeIcon('system')}</span>
          <span class="theme-option-text"><strong>시스템</strong><small>기기 설정에 맞춤</small></span>
          <span class="theme-option-check" aria-hidden="true"></span>
        </button>
        <button type="button" class="theme-option" data-theme-value="dark" role="radio">
          <span class="theme-option-icon">${themeIcon('dark')}</span>
          <span class="theme-option-text"><strong>다크 모드</strong><small>어두운 화면</small></span>
          <span class="theme-option-check" aria-hidden="true"></span>
        </button>
        <button type="button" class="theme-option" data-theme-value="light" role="radio">
          <span class="theme-option-icon">${themeIcon('light')}</span>
          <span class="theme-option-text"><strong>라이트 모드</strong><small>밝은 화면</small></span>
          <span class="theme-option-check" aria-hidden="true"></span>
        </button>
      </div>
      <div class="settings-divider"></div>
      <div class="settings-section-title">알림</div>
      <div class="notification-setting-row">
        <div class="notification-setting-text">
          <strong>응답 완료 알림</strong>
          <small>시간이 걸리는 요청에 응답할 때 알림을 받습니다.</small>
          <span class="notification-setting-status" aria-live="polite"></span>
        </div>
        <button type="button" class="notification-toggle" role="switch" aria-checked="false" aria-label="응답 완료 알림 설정"><span></span></button>
      </div>
      <button type="button" class="notification-test-btn hidden">알림 테스트</button>`;
    document.body.appendChild(menu);

    menu.querySelector('.settings-theme-close').addEventListener('click', closeMenu);
    menu.querySelectorAll('.theme-option').forEach(option => {
      option.addEventListener('click', () => {
        applyTheme(option.dataset.themeValue, true);
      });
    });

    const notificationToggle = menu.querySelector('.notification-toggle');
    const notificationStatus = menu.querySelector('.notification-setting-status');
    const notificationTest = menu.querySelector('.notification-test-btn');

    function updateNotificationUI(message) {
      const isEnabled = notificationEnabled;
      notificationToggle.classList.toggle('active', isEnabled);
      notificationToggle.setAttribute('aria-checked', String(isEnabled));
      notificationTest.classList.toggle('hidden', !isEnabled);
      notificationStatus.textContent = message || (isEnabled ? '알림이 켜져 있습니다.' : '알림이 꺼져 있습니다.');
    }

    notificationToggle.addEventListener('click', async () => {
      if (notificationEnabled) {
        saveNotificationPreference(false);
        updateNotificationUI();
        return;
      }

      if ('Notification' in window && Notification.permission === 'default') {
        try { await Notification.requestPermission(); } catch (e) { /* 브라우저 알림 미지원 */ }
      }
      if ('Notification' in window && Notification.permission === 'denied') {
        saveNotificationPreference(false);
        updateNotificationUI('브라우저 알림 권한이 차단되어 있습니다.');
        return;
      }
      saveNotificationPreference(true);
      updateNotificationUI();
      showInAppNotification('알림 설정 완료', '시간이 걸리는 요청의 응답 완료 알림을 받습니다.');
    });

    notificationTest.addEventListener('click', () => {
      notifyLongTask('AI-ONE 알림 테스트', '응답 완료 알림이 정상적으로 설정되었습니다.');
    });

    menu._updateNotificationUI = updateNotificationUI;
    updateNotificationUI();
    menu.addEventListener('click', event => event.stopPropagation());
    return menu;
  }


  function ensureSettingsLayerBackdrop() {
    if (settingsLayerBackdrop) return settingsLayerBackdrop;
    settingsLayerBackdrop = document.createElement('div');
    settingsLayerBackdrop.className = 'settings-layer-backdrop hidden';
    settingsLayerBackdrop.setAttribute('aria-hidden', 'true');
    settingsLayerBackdrop.addEventListener('click', closeMenu);
    document.body.appendChild(settingsLayerBackdrop);
    return settingsLayerBackdrop;
  }

  function ensureAccountLayer() {
    if (accountLayerBackdrop) return accountLayerBackdrop;

    accountLayerBackdrop = document.createElement('div');
    accountLayerBackdrop.className = 'account-layer-backdrop hidden';
    accountLayerBackdrop.setAttribute('aria-hidden', 'true');
    accountLayerBackdrop.innerHTML = `
      <div class="account-layer-dialog" role="dialog" aria-modal="true" aria-labelledby="accountLayerTitle">
        <div class="account-layer-head">
          <h3 id="accountLayerTitle"></h3>
          <button type="button" class="account-layer-close" aria-label="레이어 닫기">×</button>
        </div>
        <div class="account-layer-body"></div>
        <div class="account-layer-footer">
          <button type="button" class="account-layer-cancel">취소</button>
          <button type="button" class="account-layer-confirm">확인</button>
        </div>
      </div>`;

    accountLayerBackdrop.addEventListener('click', event => {
      if (event.target === accountLayerBackdrop) closeAccountLayer();
    });
    accountLayerBackdrop.querySelector('.account-layer-close').addEventListener('click', closeAccountLayer);
    accountLayerBackdrop.querySelector('.account-layer-cancel').addEventListener('click', closeAccountLayer);
    accountLayerBackdrop.querySelector('.account-layer-confirm').addEventListener('click', () => {
      const handler = accountLayerConfirmHandler;
      closeAccountLayer();
      if (typeof handler === 'function') handler();
    });
    document.body.appendChild(accountLayerBackdrop);
    return accountLayerBackdrop;
  }

  function closeAccountLayer() {
    if (!accountLayerBackdrop) return;
    accountLayerBackdrop.classList.add('hidden');
    accountLayerBackdrop.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('account-layer-open');
    accountLayerConfirmHandler = null;
  }

  function openAccountLayer(options = {}) {
    const layer = ensureAccountLayer();
    const title = layer.querySelector('#accountLayerTitle');
    const body = layer.querySelector('.account-layer-body');
    const cancel = layer.querySelector('.account-layer-cancel');
    const confirm = layer.querySelector('.account-layer-confirm');

    title.textContent = options.title || '';
    body.innerHTML = options.body || '';
    cancel.textContent = options.cancelText || '취소';
    confirm.textContent = options.confirmText || '확인';
    cancel.classList.toggle('hidden', options.hideCancel === true);
    confirm.classList.toggle('danger', options.danger === true);
    accountLayerConfirmHandler = options.onConfirm || null;

    layer.classList.remove('hidden');
    layer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('account-layer-open');
    requestAnimationFrame(() => confirm.focus());
  }

  function positionMenu(button, menu) {
    const sidebar = button.closest('.sidebar');
    const buttonRect = button.getBoundingClientRect();
    const sidebarRect = sidebar ? sidebar.getBoundingClientRect() : buttonRect;
    const menuWidth = 292;
    const viewportPadding = 8;
    const left = Math.max(viewportPadding, Math.min(sidebarRect.left + 8, window.innerWidth - menuWidth - viewportPadding));
    const bottom = Math.max(viewportPadding, window.innerHeight - buttonRect.top + 8);
    menu.style.left = left + 'px';
    menu.style.bottom = bottom + 'px';
  }

  function openMenu(button) {
    if (!activeMenu) activeMenu = createThemeMenu();
    const backdrop = ensureSettingsLayerBackdrop();
    activeButton = button;
    activeMenu.classList.add('settings-layer-popup');
    activeMenu.style.left = '';
    activeMenu.style.bottom = '';
    activeMenu.classList.remove('hidden');
    backdrop.classList.remove('hidden');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.classList.add('settings-layer-open');
    if (button) {
      button.classList.add('active');
      button.setAttribute('aria-expanded', 'true');
    }
    updateMenuSelection();
    if (activeMenu._updateNotificationUI) activeMenu._updateNotificationUI();
    requestAnimationFrame(() => activeMenu.querySelector('.settings-theme-close')?.focus());
  }

  function closeMenu() {
    if (activeMenu) activeMenu.classList.add('hidden');
    if (settingsLayerBackdrop) {
      settingsLayerBackdrop.classList.add('hidden');
      settingsLayerBackdrop.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('settings-layer-open');
    if (activeButton) {
      activeButton.classList.remove('active');
      activeButton.setAttribute('aria-expanded', 'false');
    }
    activeButton = null;
  }

  function showInAppNotification(title, body) {
    let toast = document.querySelector('.ai-one-notification-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'ai-one-notification-toast';
      toast.innerHTML = '<div class="ai-one-notification-icon">✓</div><div class="ai-one-notification-copy"><strong></strong><span></span></div><button type="button" aria-label="알림 닫기">×</button>';
      document.body.appendChild(toast);
      toast.querySelector('button').addEventListener('click', () => toast.classList.remove('show'));
    }
    toast.querySelector('strong').textContent = title;
    toast.querySelector('span').textContent = body;
    toast.classList.add('show');
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 4500);
  }

  function notifyLongTask(title, body, menuKey) {
    if (!notificationEnabled) return false;
    const resolvedMenuKey = menuKey || inferMenuKeyFromNotification(title);
    if (resolvedMenuKey) markMenuCompletion(resolvedMenuKey);
    showInAppNotification(title, body);
    if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
      try { new Notification(title, { body: body, tag: 'ai-one-long-task' }); } catch (e) { /* 인앱 알림으로 대체 */ }
    }
    return true;
  }

  window.AIOneNotifications = {
    isEnabled: () => notificationEnabled,
    notifyLongTask
  };

  function initSettingsButtons() {
    renderMenuCompletionDots();
    document.querySelectorAll('.settings-btn').forEach(button => {
      if (button.dataset.themeBound === 'true') return;
      button.dataset.themeBound = 'true';
      button.setAttribute('aria-haspopup', 'dialog');
      button.setAttribute('aria-expanded', 'false');
      button.addEventListener('click', event => {
        event.stopPropagation();
        if (activeButton === button && activeMenu && !activeMenu.classList.contains('hidden')) {
          closeMenu();
        } else {
          openMenu(button);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initSettingsButtons);
  document.addEventListener('click', event => {
    if (
      activeMenu &&
      !activeMenu.classList.contains('hidden') &&
      !activeMenu.contains(event.target) &&
      !event.target.closest('.settings-btn') &&
      event.target !== settingsLayerBackdrop
    ) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', () => {
    if (
      activeButton &&
      activeMenu &&
      !activeMenu.classList.contains('hidden') &&
      !activeMenu.classList.contains('settings-layer-popup')
    ) positionMenu(activeButton, activeMenu);
  });

  const onSystemThemeChange = () => {
    if (currentPreference === 'system') applyTheme('system', false);
  };
  if (systemThemeQuery.addEventListener) systemThemeQuery.addEventListener('change', onSystemThemeChange);
  else if (systemThemeQuery.addListener) systemThemeQuery.addListener(onSystemThemeChange);

  // ─── 공통 보조도구 ───
  const ACCESSORY_FONT_KEY = 'ai-one-font-scale';
  const ACCESSORY_WINDOW_PARAM = 'aiOneFullscreenWindow';
  const ACCESSORY_LAYOUT_KEYS = [
    'panel-layout-intake-v8', 'panel-layout-intake-v7', 'panel-layout-intake-v6',
    'panel-layout-answer-v7', 'panel-layout-answer-v6', 'panel-layout-answer-v5',
    'panel-layout-economy-v4', 'panel-layout-economy-v3', 'panel-layout-economy-v2'
  ];

  function accessoryIcon(type) {
    const icons = {
      tools: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><path d="M17 14v6M14 17h6"/></svg>',
      'tools-open': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
      font: '<span class="accessory-font-symbol" aria-hidden="true"><small>A</small><strong>A</strong></span>',
      swap: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7H4m0 0 4 4M4 7l4-4M16 17h4m0 0-4-4m4 4-4 4"/></svg>',
      layout: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18"/></svg>',
      reset: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v6h6"/></svg>',
      fullscreen: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></svg>'
    };
    return icons[type] || '';
  }

  function isAccessoryFullscreen() {
    return Boolean(document.fullscreenElement || document.webkitFullscreenElement);
  }

  async function toggleAccessoryFullscreen() {
    try {
      if (isAccessoryFullscreen()) {
        const exit = document.exitFullscreen || document.webkitExitFullscreen;
        if (exit) await exit.call(document);
        return;
      }
      const target = document.documentElement;
      const request = target.requestFullscreen || target.webkitRequestFullscreen;
      if (!request) {
        window.alert('현재 브라우저에서는 전체화면 기능을 사용할 수 없습니다.');
        return;
      }
      try {
        await request.call(target, { navigationUI: 'hide' });
      } catch (optionError) {
        await request.call(target);
      }
    } catch (error) {
      window.alert('전체화면 전환에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  }

  function readAccessoryFontPercent() {
    try {
      const scale = Number(localStorage.getItem(ACCESSORY_FONT_KEY));
      if (Number.isFinite(scale)) return Math.min(150, Math.max(100, Math.round(scale * 100)));
    } catch (e) { /* 현재 화면에만 적용 */ }
    return 100;
  }

  function applyAccessoryFontPercent(percent) {
    const next = Math.min(150, Math.max(100, Math.round(Number(percent) || 100)));
    const scale = next / 100;
    document.documentElement.style.setProperty('--ui-font-scale', String(scale));
    try { localStorage.setItem(ACCESSORY_FONT_KEY, String(scale)); } catch (e) { /* 현재 화면에만 적용 */ }

    document.querySelectorAll('[data-accessory-font-value]').forEach(el => { el.textContent = `${next}%`; });
    document.querySelectorAll('[data-accessory-font-decrease]').forEach(el => { el.disabled = next <= 100; });
    document.querySelectorAll('[data-accessory-font-increase]').forEach(el => { el.disabled = next >= 150; });

    const hiddenValue = document.getElementById('fontSizeValue');
    const hiddenInput = document.getElementById('fontSizeDirectInput');
    if (hiddenValue) hiddenValue.textContent = `${next}%`;
    if (hiddenInput) hiddenInput.value = String(next);

    document.dispatchEvent(new CustomEvent('ai-one-font-size-change', { detail: { percent: next, scale } }));
  }

  function findAccessoryAnchor() {
    const topbarRight = document.querySelector('.topbar-right');
    if (topbarRight) return { anchor: topbarRight, floating: false };

    const chatActions = document.getElementById('chatWindowActions') || document.querySelector('.chat-window-actions');
    if (chatActions) return { anchor: chatActions, floating: false };

    const floating = document.createElement('div');
    floating.className = 'global-accessory-floating';
    document.body.appendChild(floating);
    return { anchor: floating, floating: true };
  }

  function sourceControl(id) {
    return document.getElementById(id);
  }

  function closeAllAccessoryTools(except) {
    document.querySelectorAll('.accessory-tool.open').forEach(tool => {
      if (tool === except) return;
      tool.classList.remove('open');
      tool.querySelector('.accessory-trigger')?.classList.remove('active');
      tool.querySelector('.accessory-trigger')?.setAttribute('aria-expanded', 'false');
      const closedTrigger = tool.querySelector('.accessory-trigger');
      if (closedTrigger) { closedTrigger.title = '보조도구 모음'; closedTrigger.setAttribute('aria-label', '보조도구 모음'); }
      tool.querySelector('.accessory-font-panel')?.classList.add('hidden');
    });
  }

  function runAccessoryAction(action, tool) {
    const fontPanel = tool.querySelector('.accessory-font-panel');

    if (action === 'font') {
      fontPanel.classList.toggle('hidden');
      return;
    }

    fontPanel.classList.add('hidden');

    if (action === 'fullscreen') {
      toggleAccessoryFullscreen();
    } else {
      const sourceMap = {
        swap: 'panelSwapBtn',
        layout: 'layoutResetBtn',
        reset: 'resetBtn'
      };
      const source = sourceControl(sourceMap[action]);

      if (source && !source.disabled) {
        source.click();
      } else if (action === 'layout') {
        ACCESSORY_LAYOUT_KEYS.forEach(key => {
          try { localStorage.removeItem(key); } catch (e) { /* 현재 화면에만 적용 */ }
        });
        window.location.reload();
      } else if (action === 'reset') {
        window.location.reload();
      }
    }

    // 기능 실행 후에도 보조도구 레일은 열린 상태를 유지합니다.
    // 보조도구 트리거를 다시 클릭하거나 ESC를 눌렀을 때만 닫힙니다.
  }

  function initAccessoryTools() {
    if (
      document.body.classList.contains('login-page')
      || document.body.classList.contains('button-preview-page')
      || /(^|\/)login\.html(?:$|\?)/.test(location.pathname + location.search)
    ) return;
    if (document.querySelector('[data-accessory-tools]')) return;

    ['fontSizeTool', 'panelSwapBtn', 'layoutResetBtn', 'resetBtn', 'fullscreenBtn'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('accessory-source-control');
    });

    const { anchor, floating } = findAccessoryAnchor();
    const tool = document.createElement('div');
    tool.className = `accessory-tool${floating ? ' accessory-tool-floating' : ''}`;
    tool.dataset.accessoryTools = 'true';
    tool.innerHTML = `
      <button type="button" class="accessory-trigger" aria-label="보조도구 모음" title="보조도구 모음" aria-haspopup="true" aria-expanded="false">
        <span class="accessory-icon-closed">${accessoryIcon('tools')}</span><span class="accessory-icon-open">${accessoryIcon('tools-open')}</span>
      </button>
      <div class="accessory-rail" role="toolbar" aria-label="보조도구 기능">
        <button type="button" class="accessory-action" data-accessory-action="font" aria-label="전체 글자크기" title="전체 글자크기">
          <span class="accessory-action-icon">${accessoryIcon('font')}</span>
        </button>
        <button type="button" class="accessory-action" data-accessory-action="swap" aria-label="패널 위치 변경" title="패널 위치 변경">
          <span class="accessory-action-icon">${accessoryIcon('swap')}</span>
        </button>
        <button type="button" class="accessory-action" data-accessory-action="layout" aria-label="레이아웃 초기화" title="레이아웃 초기화">
          <span class="accessory-action-icon">${accessoryIcon('layout')}</span>
        </button>
        <button type="button" class="accessory-action" data-accessory-action="reset" aria-label="초기화" title="초기화">
          <span class="accessory-action-icon">${accessoryIcon('reset')}</span>
        </button>
        <button type="button" class="accessory-action" data-accessory-action="fullscreen" aria-label="전체화면" title="전체화면">
          <span class="accessory-action-icon">${accessoryIcon('fullscreen')}</span>
        </button>
      </div>
      <div class="accessory-font-panel hidden" role="group" aria-label="전체 글자크기">
        <div class="accessory-font-head"><strong>전체 글자크기</strong><span>100~150%</span></div>
        <div class="accessory-font-control">
          <button type="button" data-accessory-font-decrease aria-label="글자 작게">−</button>
          <span data-accessory-font-value>100%</span>
          <button type="button" data-accessory-font-increase aria-label="글자 크게">＋</button>
        </div>
        <button type="button" class="accessory-font-default">기본 크기로</button>
      </div>`;

    // 보조도구는 우측 상단 액션 영역의 가장 마지막에 배치합니다.
    anchor.appendChild(tool);

    const trigger = tool.querySelector('.accessory-trigger');
    const fontPanel = tool.querySelector('.accessory-font-panel');
    const swapAction = tool.querySelector('[data-accessory-action="swap"]');
    const layoutAction = tool.querySelector('[data-accessory-action="layout"]');

    const supportsPanelTools = Boolean(sourceControl('panelSwapBtn'));
    if (!supportsPanelTools) {
      [swapAction, layoutAction].forEach(button => {
        button.classList.add('is-disabled');
        button.setAttribute('aria-disabled', 'true');
        button.title = '패널형 화면에서 사용할 수 있습니다.';
      });
    }

    trigger.addEventListener('click', event => {
      event.stopPropagation();
      const opening = !tool.classList.contains('open');
      closeAllAccessoryTools(opening ? tool : null);
      tool.classList.toggle('open', opening);
      trigger.classList.toggle('active', opening);
      trigger.setAttribute('aria-expanded', String(opening));
      trigger.title = '보조도구 모음';
      trigger.setAttribute('aria-label', '보조도구 모음');
      if (!opening) fontPanel.classList.add('hidden');
    });

    tool.querySelectorAll('[data-accessory-action]').forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        if (button.classList.contains('is-disabled')) return;
        runAccessoryAction(button.dataset.accessoryAction, tool);
      });
    });

    tool.querySelector('[data-accessory-font-decrease]').addEventListener('click', event => {
      event.stopPropagation();
      applyAccessoryFontPercent(readAccessoryFontPercent() - 10);
    });
    tool.querySelector('[data-accessory-font-increase]').addEventListener('click', event => {
      event.stopPropagation();
      applyAccessoryFontPercent(readAccessoryFontPercent() + 10);
    });
    tool.querySelector('.accessory-font-default').addEventListener('click', event => {
      event.stopPropagation();
      applyAccessoryFontPercent(100);
    });

    fontPanel.addEventListener('click', event => event.stopPropagation());
    applyAccessoryFontPercent(readAccessoryFontPercent());

    // 외부 영역을 클릭해도 보조도구는 접히지 않습니다.
    // 보조도구 버튼을 다시 누르거나 ESC를 눌렀을 때 숨깁니다.
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeAllAccessoryTools(null);
    });
  }


  function initUserAccountMenus() {
    document.querySelectorAll('.sidebar .user-card').forEach((card, index) => {
      if (card.dataset.accountMenuReady === 'true') return;
      card.dataset.accountMenuReady = 'true';
      const avatar = card.querySelector('.user-avatar');
      const info = card.querySelector('.user-info');
      const settings = card.querySelector('.settings-btn');
      const originalLogout = card.querySelector('.logout-btn');
      const triggerParts = [avatar, info].filter(Boolean);
      triggerParts.forEach(part => {
        part.classList.add('user-profile-trigger');
        part.setAttribute('role', 'button');
        part.setAttribute('tabindex', '0');
        part.setAttribute('aria-haspopup', 'menu');
        part.setAttribute('aria-expanded', 'false');
      });

      const menu = document.createElement('div');
      menu.className = 'user-account-menu hidden';
      menu.setAttribute('role', 'menu');
      menu.innerHTML = `
        <div class="user-account-summary">
          <strong>${card.querySelector('.user-name, .user-name-sm')?.textContent || '담당자'}</strong>
          <span>${card.querySelector('.user-dept')?.textContent || ''}</span>
        </div>
        <button type="button" role="menuitem" data-account-action="profile">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/></svg><span>내 정보</span>
        </button>
        <button type="button" role="menuitem" data-account-action="settings">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.8-.3A1.7 1.7 0 0 0 14 20.8V21h-4v-.2A1.7 1.7 0 0 0 8.9 19.3a1.7 1.7 0 0 0-1.8.3l-.1.1-2.8-2.8.1-.1a1.7 1.7 0 0 0 .3-1.8A1.7 1.7 0 0 0 3.2 14H3v-4h.2A1.7 1.7 0 0 0 4.7 8.9a1.7 1.7 0 0 0-.3-1.8L4.3 7 7.1 4.2l.1.1a1.7 1.7 0 0 0 1.8.3A1.7 1.7 0 0 0 10 3.2V3h4v.2a1.7 1.7 0 0 0 1.1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.4 1.1h.2v4h-.2a1.7 1.7 0 0 0-1.4 1z"/></svg><span>환경설정</span>
        </button>
        <button type="button" role="menuitem" data-account-action="logout" class="danger">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"/></svg><span>로그아웃</span>
        </button>`;
      card.appendChild(menu);

      const setOpen = open => {
        document.querySelectorAll('.user-account-menu:not(.hidden)').forEach(other => {
          if (other !== menu) other.classList.add('hidden');
        });
        menu.classList.toggle('hidden', !open);
        triggerParts.forEach(part => part.setAttribute('aria-expanded', String(open)));
      };
      const toggle = event => {
        event.stopPropagation();
        setOpen(menu.classList.contains('hidden'));
      };
      triggerParts.forEach(part => {
        part.addEventListener('click', toggle);
        part.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggle(event);
          }
        });
      });
      menu.addEventListener('click', event => {
        event.stopPropagation();
        const button = event.target.closest('[data-account-action]');
        if (!button) return;
        const action = button.dataset.accountAction;
        setOpen(false);

        const userName = card.querySelector('.user-name, .user-name-sm')?.textContent?.trim() || '박재정 주무관';
        const userDept = card.querySelector('.user-dept')?.textContent?.trim() || '재정분석과';
        const userRole = card.querySelector('.user-role-badge')?.textContent?.trim() || '국회담당자';

        if (action === 'settings') {
          openMenu(settings || button);
        } else if (action === 'logout') {
          openAccountLayer({
            title: '로그아웃',
            body: `
              <div class="account-logout-message">
                <span class="account-layer-icon danger" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"/></svg>
                </span>
                <div>
                  <strong>AI-ONE에서 로그아웃하시겠습니까?</strong>
                </div>
              </div>`,
            confirmText: '로그아웃',
            cancelText: '취소',
            danger: true,
            onConfirm: () => {
              localStorage.removeItem('sidebar-collapsed');
              window.location.href = 'login.html';
            }
          });
        } else if (action === 'profile') {
          openAccountLayer({
            title: '내 정보',
            body: `
              <div class="account-profile-summary">
                <span class="account-profile-avatar" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/></svg>
                </span>
                <div><strong>${userName}</strong><span>${userDept}</span></div>
              </div>
              <dl class="account-profile-list">
                <div><dt>이름·직위</dt><dd>${userName}</dd></div>
                <div><dt>소속 부서</dt><dd>${userDept}</dd></div>
                <div><dt>사용자 권한</dt><dd><span class="account-role-tag">${userRole}</span></dd></div>
                <div><dt>로그인 방식</dt><dd>통합 ID · SSO</dd></div>
              </dl>`,
            confirmText: '확인',
            hideCancel: true
          });
        }
      });
    });

    document.addEventListener('click', event => {
      if (!event.target.closest('.user-card')) {
        document.querySelectorAll('.user-account-menu').forEach(menu => menu.classList.add('hidden'));
        document.querySelectorAll('.user-profile-trigger').forEach(part => part.setAttribute('aria-expanded', 'false'));
      }
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      document.querySelectorAll('.user-account-menu').forEach(menu => menu.classList.add('hidden'));
      document.querySelectorAll('.user-profile-trigger').forEach(part => part.setAttribute('aria-expanded', 'false'));
      closeAccountLayer();
    });
  }

  function observeDrawerLayering() {
    const selectors = '.run-drawer, .chat-drawer, .rule-drawer, .report-drawer';
    const update = () => {
      const open = Array.from(document.querySelectorAll(selectors)).some(drawer => !drawer.classList.contains('hidden'));
      document.body.classList.toggle('drawer-layer-open', open);
      if (open) closeAllAccessoryTools(null);
    };
    const drawers = document.querySelectorAll(selectors);
    drawers.forEach(drawer => new MutationObserver(update).observe(drawer, { attributes: true, attributeFilter: ['class'] }));
    update();
  }

  function initFormFields(root = document) {
    root.querySelectorAll('[data-character-count]').forEach(field => {
      if (field.dataset.characterCountReady === 'true') return;

      const textarea = field.querySelector('textarea[maxlength]');
      const currentCount = field.querySelector('[data-character-current]');
      if (!textarea || !currentCount) return;

      const syncCharacterCount = () => {
        currentCount.textContent = String(textarea.value.length);
      };

      textarea.addEventListener('input', syncCharacterCount);
      field.dataset.characterCountReady = 'true';
      syncCharacterCount();
    });
  }

  function initFilterButtons(root = document) {
    root.querySelectorAll('.filter-bar').forEach(list => {
      const getButtons = () => Array.from(list.querySelectorAll('.filter-btn'))
        .filter(button => button.closest('.filter-bar') === list);
      if (!getButtons().length) return;

      const selectedButton = getButtons().find(button => button.classList.contains('active')) || getButtons().find(button => !button.disabled);
      getButtons().forEach(button => button.setAttribute('aria-pressed', String(button === selectedButton)));
      selectedButton?.classList.add('active');
      list.dataset.filterButtonReady = 'true';
    });

    if (document.documentElement.dataset.filterButtonEventsReady === 'true') return;
    document.addEventListener('click', event => {
      const button = event.target.closest('.filter-btn');
      const list = button?.closest('.filter-bar');
      if (!button || !list || button.disabled || button.getAttribute('aria-disabled') === 'true') return;

      const buttons = Array.from(list.querySelectorAll('.filter-btn'))
        .filter(item => item.closest('.filter-bar') === list);
      buttons.forEach(item => {
        const isSelected = item === button;
        item.classList.toggle('active', isSelected);
        item.setAttribute('aria-pressed', String(isSelected));
      });

      list.dispatchEvent(new CustomEvent('filter-btn:change', {
        bubbles: true,
        detail: {
          filter: button.dataset.filter || button.value || button.textContent.trim(),
          button
        }
      }));
    });
    document.documentElement.dataset.filterButtonEventsReady = 'true';
  }

  function initMessageReactionButtons(root = document) {
    root.querySelectorAll('.icon-button-message[data-action="like"], .icon-button-message[data-action="dislike"]').forEach(button => {
      if (button.dataset.reactionButtonReady === 'true') return;

      if (!button.hasAttribute('aria-pressed')) button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => {
        const isPressed = button.getAttribute('aria-pressed') === 'true';
        button.setAttribute('aria-pressed', String(!isPressed));
      });
      button.dataset.reactionButtonReady = 'true';
    });
  }

  function initFileUploadZones(root = document) {
    root.querySelectorAll('[data-file-upload-zone]').forEach(zone => {
      if (zone.dataset.fileUploadReady === 'true') return;

      const input = zone.querySelector('input[type="file"]');
      if (!input) return;

      const emitFiles = (fileList, source) => {
        const files = Array.from(fileList || []);
        if (!files.length) return;
        zone.dispatchEvent(new CustomEvent('app:file-upload', {
          bubbles: true,
          detail: { files, source }
        }));
      };

      zone.addEventListener('click', event => {
        if (event.target === input) return;
        input.click();
      });
      zone.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        input.click();
      });
      input.addEventListener('change', () => {
        emitFiles(input.files, 'picker');
        input.value = '';
      });
      zone.addEventListener('dragenter', event => {
        event.preventDefault();
        zone.classList.add('dragover');
      });
      zone.addEventListener('dragover', event => {
        event.preventDefault();
        zone.classList.add('dragover');
      });
      zone.addEventListener('dragleave', event => {
        if (event.relatedTarget && zone.contains(event.relatedTarget)) return;
        zone.classList.remove('dragover');
      });
      zone.addEventListener('drop', event => {
        event.preventDefault();
        zone.classList.remove('dragover');
        emitFiles(event.dataTransfer?.files, 'drop');
      });

      zone.dataset.fileUploadReady = 'true';
    });
  }

  document.addEventListener('app:includes-ready', () => {
    initFormFields();
    initFilterButtons();
    initMessageReactionButtons();
    initFileUploadZones();
  });
  document.addEventListener('DOMContentLoaded', () => {
    initAccessoryTools();
    initUserAccountMenus();
    observeDrawerLayering();
    initFormFields();
    initFilterButtons();
    initMessageReactionButtons();
    initFileUploadZones();
  });

})();
