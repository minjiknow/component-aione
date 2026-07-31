(() => {
  'use strict';

  const variants = new Set(['run-list', 'chat-list', 'content', 'rule-settings']);
  const listTypes = Object.freeze({
    run: {
      itemSelector: '.sidepop-run-item',
      titleSelector: '.sidepop-run-title',
      renameLabel: '제목 변경',
      menuLabel: '실행 건 관리',
      eventName: 'sidepop:run-action'
    },
    chat: {
      itemSelector: '.sidepop-chat-item',
      titleSelector: '.sidepop-chat-name',
      renameLabel: '이름 변경',
      menuLabel: '대화 관리',
      eventName: 'sidepop:chat-action'
    }
  });
  const actions = Object.freeze([
    { value: 'pin', label: '고정', icon: 'pin' },
    { value: 'rename', icon: 'edit' },
    { value: 'delete', label: '삭제', icon: 'delete', danger: true }
  ]);
  const modalContexts = new WeakMap();
  const modalOrigins = new WeakMap();
  let pinSequence = 0;
  const currentScriptUrl = document.currentScript?.src;
  const iconBaseUrl = currentScriptUrl
    ? new URL('../../assets/icons/', currentScriptUrl)
    : null;
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

  function syncPositionControl(layer) {
    const buttons = layer?.querySelectorAll('[data-sidepop-position-toggle]');
    if (!buttons?.length) return;

    const isLeft = layer.classList.contains('sidepop-position-left');
    const destination = isLeft ? '오른쪽' : '왼쪽';
    buttons.forEach(button => {
      const label = button.querySelector('span');
      if (label) label.textContent = `${isLeft ? '우측' : '좌측'}으로 이동`;
      button.setAttribute('aria-label', `Drawer를 ${destination}으로 이동`);
    });
  }

  function setPosition(target, position = 'right') {
    const layer = resolveLayer(target);
    if (!layer) return false;

    const isLeft = position === 'left';
    layer.classList.toggle('sidepop-position-left', isLeft);
    syncPositionControl(layer);
    layer.dispatchEvent(new CustomEvent('sidepop:position-change', {
      bubbles: true,
      detail: { position: isLeft ? 'left' : 'right' }
    }));
    return true;
  }

  function initPositionControls(root = document) {
    const layers = [];
    if (root.matches?.('[data-sidepop]')) layers.push(root);
    root.querySelectorAll?.('[data-sidepop]').forEach(layer => layers.push(layer));
    layers.forEach(syncPositionControl);
  }

  function getListType(item) {
    if (item?.matches(listTypes.run.itemSelector)) return 'run';
    if (item?.matches(listTypes.chat.itemSelector)) return 'chat';
    return '';
  }

  function getListItems(container, type) {
    const selector = listTypes[type]?.itemSelector;
    if (!container || !selector) return [];
    return Array.from(container.children).filter(item => item.matches(selector));
  }

  function getItemTitle(item, type = getListType(item)) {
    const title = item?.querySelector(listTypes[type]?.titleSelector);
    if (!title) return '';
    if (type !== 'chat') return title.textContent.trim();

    return Array.from(title.childNodes)
      .filter(node => !(node instanceof Element && node.classList.contains('sidepop-chat-icon')))
      .map(node => node.textContent)
      .join('')
      .trim();
  }

  function setItemTitle(item, type, value) {
    const title = item?.querySelector(listTypes[type]?.titleSelector);
    if (!title) return;

    if (type === 'chat') {
      const icon = title.querySelector('.sidepop-chat-icon');
      title.replaceChildren();
      if (icon) title.append(icon);
      title.append(document.createTextNode(value));
      item.querySelector('.sidepop-chat-select')
        ?.setAttribute('aria-label', `${value} 대화 열기`);
      return;
    }
    title.textContent = value;
  }

  function createMoreIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    [5, 12, 19].forEach(cy => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '12');
      circle.setAttribute('cy', String(cy));
      circle.setAttribute('r', '1.7');
      svg.append(circle);
    });
    return svg;
  }

  function normalizeLegacyChatItems(root = document) {
    const items = [];
    if (root.matches?.('button.sidepop-chat-item')) items.push(root);
    root.querySelectorAll?.('button.sidepop-chat-item').forEach(item => items.push(item));

    items.forEach(legacyItem => {
      const wrapper = document.createElement('div');
      const select = document.createElement('button');
      const trigger = document.createElement('button');
      const more = legacyItem.querySelector('.sidepop-chat-more');
      const title = getItemTitle(legacyItem, 'chat');

      wrapper.className = legacyItem.className;
      Object.entries(legacyItem.dataset).forEach(([key, value]) => {
        wrapper.dataset[key] = value;
      });

      select.type = 'button';
      select.className = 'sidepop-chat-select';
      select.setAttribute('aria-label', `${title} 대화 열기`);
      Array.from(legacyItem.childNodes).forEach(node => {
        if (node !== more) select.append(node);
      });

      trigger.type = 'button';
      trigger.className = 'sidepop-item-more sidepop-chat-more';
      trigger.setAttribute('aria-label', '대화 작업 메뉴');
      trigger.append(createMoreIcon());

      wrapper.append(select, trigger);
      legacyItem.replaceWith(wrapper);
    });
  }

  function createListActionMenu(trigger, item, type, itemIndex, itemCount) {
    const definition = listTypes[type];
    const layerId = item.closest('[data-sidepop]')?.id || 'sidepop';
    const menuId = `${layerId}-${type}-action-${itemIndex + 1}`;
    const component = document.createElement('div');
    const menu = document.createElement('div');

    component.className = `sidepop-list-action sidepop-${type}-action dropdown-menu-component`;
    component.dataset.dropdownMenu = '';

    trigger.before(component);
    component.append(trigger);
    trigger.dataset.dropdownTrigger = '';
    trigger.setAttribute('aria-label', '더보기');
    trigger.setAttribute('title', '더보기');
    trigger.setAttribute('aria-haspopup', 'menu');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', menuId);

    menu.className = `dropdown-menu sidepop-list-action-menu sidepop-${type}-action-menu`;
    menu.id = menuId;
    menu.hidden = true;
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', definition.menuLabel);
    menu.dataset.placement = itemCount > 3 && itemIndex >= itemCount - 2
      ? 'top-end'
      : 'bottom-end';

    actions.forEach(action => {
      const button = document.createElement('button');
      const icon = document.createElement('img');
      const label = document.createElement('span');
      const isPinned = item.classList.contains('is-pinned');

      button.type = 'button';
      button.className = `dropdown-menu-item${action.danger ? ' danger' : ''}`;
      button.dataset.menuValue = action.value;
      button.setAttribute('role', 'menuitem');
      if (action.value === 'pin') button.setAttribute('aria-pressed', String(isPinned));

      icon.className = 'icon sidepop-list-action-icon';
      icon.dataset.icon = action.icon;
      icon.alt = '';
      icon.setAttribute('aria-hidden', 'true');
      if (iconBaseUrl) icon.src = new URL(`${action.icon}.svg`, iconBaseUrl).href;

      label.className = 'sidepop-list-action-label';
      label.textContent = action.value === 'pin'
        ? (isPinned ? '고정 해제' : '고정')
        : (action.value === 'rename' ? definition.renameLabel : action.label);
      button.append(icon, label);
      menu.append(button);
    });

    component.append(menu);
  }

  function initListActionMenus(root = document) {
    normalizeLegacyChatItems(root);

    Object.entries(listTypes).forEach(([type, definition]) => {
      const items = [];
      if (root.matches?.(definition.itemSelector)) items.push(root);
      root.querySelectorAll?.(definition.itemSelector).forEach(item => items.push(item));

      items.forEach(item => {
        const container = item.parentElement;
        const siblings = getListItems(container, type);
        if (!item.dataset.sidepopOriginalOrder) {
          item.dataset.sidepopOriginalOrder = String(siblings.indexOf(item));
        }
        if (item.classList.contains('is-pinned') && !item.dataset.sidepopPinOrder) {
          pinSequence += 1;
          item.dataset.sidepopPinOrder = String(pinSequence);
        }

        const select = item.querySelector(':scope > .sidepop-chat-select');
        if (type === 'chat' && select && !select.getAttribute('aria-label')) {
          select.setAttribute('aria-label', `${getItemTitle(item, type)} 대화 열기`);
        }

        const trigger = item.querySelector('.sidepop-item-more');
        if (!trigger || trigger.closest('[data-dropdown-menu]')) return;
        createListActionMenu(trigger, item, type, siblings.indexOf(item), siblings.length);
      });
    });

    window.AIOneDropdownMenu?.init(root);
  }

  function reorderList(item, type) {
    const container = item?.parentElement;
    const items = getListItems(container, type);
    items.sort((left, right) => {
      const leftPinned = left.classList.contains('is-pinned');
      const rightPinned = right.classList.contains('is-pinned');
      if (leftPinned !== rightPinned) return rightPinned - leftPinned;
      if (leftPinned) {
        return Number(right.dataset.sidepopPinOrder || 0) - Number(left.dataset.sidepopPinOrder || 0);
      }
      return Number(left.dataset.sidepopOriginalOrder || 0) - Number(right.dataset.sidepopOriginalOrder || 0);
    });
    items.forEach(listItem => container.append(listItem));
  }

  function updatePinControl(item, isPinned) {
    const button = item.querySelector('.sidepop-list-action [data-menu-value="pin"]');
    button?.setAttribute('aria-pressed', String(isPinned));
    const label = button?.querySelector('.sidepop-list-action-label');
    if (label) label.textContent = isPinned ? '고정 해제' : '고정';
  }

  function dispatchListAction(item, type, action, detail = {}) {
    const payload = {
      action,
      type,
      item,
      title: getItemTitle(item, type),
      ...detail
    };
    item.dispatchEvent(new CustomEvent('sidepop:list-action', {
      bubbles: true,
      detail: payload
    }));
    item.dispatchEvent(new CustomEvent(listTypes[type].eventName, {
      bubbles: true,
      detail: payload
    }));
  }

  function togglePinned(item, type) {
    const isPinned = !item.classList.contains('is-pinned');
    item.classList.toggle('is-pinned', isPinned);
    item.dataset.pinned = String(isPinned);
    if (isPinned) {
      pinSequence += 1;
      item.dataset.sidepopPinOrder = String(pinSequence);
    } else {
      delete item.dataset.sidepopPinOrder;
    }
    updatePinControl(item, isPinned);
    reorderList(item, type);
    dispatchListAction(item, type, 'pin', { completed: true, pinned: isPinned });
  }

  function bindActionModal(modal) {
    if (!modal || modal.dataset.sidepopActionsReady === 'true') return;
    modal.querySelector('[data-sidepop-rename-confirm]')?.addEventListener('click', event => {
      event.preventDefault();
      completeRename(modal);
    });
    modal.querySelector('[data-sidepop-delete-confirm]')?.addEventListener('click', event => {
      event.preventDefault();
      completeDelete(modal);
    });
    modal.dataset.sidepopActionsReady = 'true';
  }

  function openItemModal(item, type, action, trigger) {
    const layer = item.closest('[data-sidepop]');
    const modalId = action === 'rename'
      ? layer?.dataset.sidepopRenameModal
      : layer?.dataset.sidepopDeleteModal;
    const modal = modalId ? document.getElementById(modalId) : null;

    if (!modal || !window.AIOneModal) {
      dispatchListAction(item, type, action, { completed: false, modalAvailable: false });
      return;
    }

    bindActionModal(modal);
    modalContexts.set(modal, { action, item, type });
    modalOrigins.set(modal, layer);
    layer.classList.add('has-child-modal');
    modal.classList.add('modal-over-sidepop');
    if (action === 'rename') {
      const input = modal.querySelector('[data-sidepop-rename-input]');
      const error = modal.querySelector('[data-sidepop-rename-error]');
      if (input) {
        input.value = getItemTitle(item, type);
        input.removeAttribute('aria-invalid');
      }
      if (error) error.hidden = true;
    } else {
      const title = modal.querySelector('[data-sidepop-delete-title]');
      if (title) title.textContent = getItemTitle(item, type);
    }

    window.AIOneModal.open(modal, trigger);
    if (action === 'rename') {
      window.setTimeout(() => {
        const input = modal.querySelector('[data-sidepop-rename-input]');
        input?.focus();
        input?.select();
      }, 0);
    }
    dispatchListAction(item, type, action, { completed: false, modalAvailable: true });
  }

  function completeRename(modal) {
    const context = modalContexts.get(modal);
    const input = modal.querySelector('[data-sidepop-rename-input]');
    const error = modal.querySelector('[data-sidepop-rename-error]');
    const value = input?.value.trim() || '';
    if (!context || context.action !== 'rename') return;

    if (!value) {
      if (error) error.hidden = false;
      input?.setAttribute('aria-invalid', 'true');
      input?.focus();
      return;
    }

    const previousTitle = getItemTitle(context.item, context.type);
    setItemTitle(context.item, context.type, value);
    dispatchListAction(context.item, context.type, 'rename', {
      completed: true,
      previousTitle,
      title: value
    });
    window.AIOneModal?.close(modal);
  }

  function decrementPanelCounts(item) {
    const panel = item.closest('.sidepop-variant-panel');
    const counters = new Set(panel?.querySelectorAll('.sidepop-list-count, .sidepop-list-meta strong') || []);
    counters.forEach(counter => {
      const current = Number(counter.textContent.match(/\d+/)?.[0]);
      if (!Number.isFinite(current)) return;
      counter.textContent = counter.textContent.replace(/\d+/, String(Math.max(0, current - 1)));
    });
  }

  function completeDelete(modal) {
    const context = modalContexts.get(modal);
    if (!context || context.action !== 'delete') return;

    const { item, type } = context;
    const container = item.parentElement;
    const siblings = getListItems(container, type).filter(candidate => candidate !== item);
    const wasActive = item.classList.contains('is-active');
    const title = getItemTitle(item, type);

    dispatchListAction(item, type, 'delete', {
      completed: true,
      removed: true,
      title
    });
    window.AIOneModal?.close(modal);
    decrementPanelCounts(item);
    item.remove();
    if (wasActive) siblings[0]?.classList.add('is-active');
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
    const positionButton = event.target.closest('[data-sidepop-position-toggle]');
    if (positionButton) {
      const layer = positionButton.closest('[data-sidepop]');
      setPosition(
        layer,
        layer?.classList.contains('sidepop-position-left') ? 'right' : 'left'
      );
      return;
    }

    const trigger = event.target.closest('[data-sidepop-open][data-sidepop-variant]');
    if (trigger) {
      setVariant(trigger.getAttribute('data-sidepop-open'), trigger.dataset.sidepopVariant);
      return;
    }

    const ruleItem = event.target.closest('.rule-list > .rule-item');
    if (ruleItem) activateRuleItem(ruleItem);
  }, true);

  document.addEventListener('input', event => {
    const input = event.target.closest('[data-sidepop-rename-input]');
    if (!input) return;
    input.removeAttribute('aria-invalid');
    const error = input.closest('[data-modal]')?.querySelector('[data-sidepop-rename-error]');
    if (error) error.hidden = true;
  });

  document.addEventListener('dropdownmenu:select', event => {
    const actionComponent = event.target.closest?.('.sidepop-list-action');
    const item = actionComponent?.closest('.sidepop-run-item, .sidepop-chat-item');
    const type = getListType(item);
    const action = event.detail?.value;
    if (!item || !type || !actions.some(candidate => candidate.value === action)) return;

    if (action === 'pin') {
      togglePinned(item, type);
      return;
    }

    const trigger = actionComponent.querySelector('[data-dropdown-trigger]');
    queueMicrotask(() => openItemModal(item, type, action, trigger));
  });

  document.addEventListener('keydown', event => {
    const renameInput = event.target.closest?.('[data-sidepop-rename-input]');
    if (renameInput && event.key === 'Enter') {
      event.preventDefault();
      renameInput.closest('[data-modal]')
        ?.querySelector('[data-sidepop-rename-confirm]')
        ?.click();
      return;
    }

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

  document.addEventListener('modal:close', event => {
    const origin = modalOrigins.get(event.target);
    if (!origin) return;
    origin.classList.remove('has-child-modal');
    event.target.classList.remove('modal-over-sidepop');
    modalOrigins.delete(event.target);
  });

  window.AIOneSidePop = Object.freeze({
    init: controller.init,
    open: controller.open,
    close: controller.close,
    setVariant,
    setPosition,
    initRuleLists,
    initListActionMenus,
    initRunActionMenus: initListActionMenus
  });
  document.addEventListener('DOMContentLoaded', () => {
    controller.init();
    initPositionControls();
    initRuleLists();
    initListActionMenus();
  });
  document.addEventListener('app:includes-ready', event => {
    controller.init(event.target);
    initPositionControls(event.target);
    initRuleLists(event.target);
    initListActionMenus(event.target);
  });
})();
