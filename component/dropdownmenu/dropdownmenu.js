(() => {
  'use strict';

  function getEnabledItems(menu) {
    return Array.from(menu.querySelectorAll('[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]'))
      .filter(item => !item.disabled && item.getAttribute('aria-disabled') !== 'true');
  }

  function setOpen(component, isOpen, focusTarget = 'first') {
    const trigger = component?.querySelector('[data-dropdown-trigger]');
    const menu = component?.querySelector('[role="menu"]');
    if (!trigger || !menu) return;

    if (isOpen) {
      document.querySelectorAll('[data-dropdown-menu]').forEach(other => {
        if (other !== component) setOpen(other, false);
      });
    }

    menu.hidden = !isOpen;
    trigger.setAttribute('aria-expanded', String(isOpen));
    component.classList.toggle('is-open', isOpen);

    if (isOpen) {
      const items = getEnabledItems(menu);
      const focusItem = focusTarget === 'last' ? items.at(-1) : items[0];
      focusItem?.focus();
    }

    component.dispatchEvent(new CustomEvent('dropdownmenu:toggle', {
      bubbles: true,
      detail: { open: isOpen }
    }));
  }

  function init(root = document) {
    const components = [];
    if (root instanceof Element && root.matches('[data-dropdown-menu]')) components.push(root);
    root.querySelectorAll?.('[data-dropdown-menu]').forEach(component => components.push(component));

    components.forEach(component => {
      if (component.dataset.dropdownMenuReady === 'true') return;
      const trigger = component.querySelector('[data-dropdown-trigger]');
      const menu = component.querySelector('[role="menu"]');
      if (!trigger || !menu) return;

      menu.hidden = trigger.getAttribute('aria-expanded') !== 'true';
      component.dataset.dropdownMenuReady = 'true';
    });

    if (document.documentElement.dataset.dropdownMenuEventsReady === 'true') return;

    document.addEventListener('click', event => {
      const trigger = event.target.closest('[data-dropdown-trigger]');
      const triggerComponent = trigger?.closest('[data-dropdown-menu]');
      if (trigger && triggerComponent) {
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
        setOpen(triggerComponent, !isOpen);
        return;
      }

      const item = event.target.closest('[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]');
      const itemComponent = item?.closest('[data-dropdown-menu]');
      if (item && itemComponent) {
        if (item.disabled || item.getAttribute('aria-disabled') === 'true') return;
        if (item.matches('[role="menuitemradio"]')) {
          item.closest('[role="menu"]')
            ?.querySelectorAll('[role="menuitemradio"]')
            .forEach(option => option.setAttribute('aria-checked', String(option === item)));
          const label = itemComponent.querySelector('[data-dropdown-label]');
          if (label) label.textContent = item.dataset.menuLabel || item.textContent.trim();
        }
        if (item.matches('[role="menuitemcheckbox"]')) {
          item.setAttribute('aria-checked', String(item.getAttribute('aria-checked') !== 'true'));
        }
        itemComponent.dispatchEvent(new CustomEvent('dropdownmenu:select', {
          bubbles: true,
          detail: {
            value: item.dataset.menuValue || item.textContent.trim(),
            item
          }
        }));
        if (!item.hasAttribute('data-menu-keep-open')) {
          setOpen(itemComponent, false);
          itemComponent.querySelector('[data-dropdown-trigger]')?.focus();
        }
        return;
      }

      document.querySelectorAll('[data-dropdown-menu].is-open')
        .forEach(component => setOpen(component, false));
    });

    document.addEventListener('keydown', event => {
      const trigger = event.target.closest('[data-dropdown-trigger]');
      const component = event.target.closest('[data-dropdown-menu]');
      if (!component) return;
      const menu = component.querySelector('[role="menu"]');
      if (!menu) return;

      if (trigger && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
        setOpen(component, true, event.key === 'ArrowUp' ? 'last' : 'first');
        return;
      }

      const items = getEnabledItems(menu);
      const currentIndex = items.indexOf(document.activeElement);
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) && currentIndex >= 0) {
        event.preventDefault();
        let nextIndex = currentIndex;
        if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % items.length;
        if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + items.length) % items.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = items.length - 1;
        items[nextIndex]?.focus();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(component, false);
        component.querySelector('[data-dropdown-trigger]')?.focus();
      }
    });

    document.documentElement.dataset.dropdownMenuEventsReady = 'true';
  }

  window.AIOneDropdownMenu = Object.freeze({ init, setOpen });
  document.addEventListener('DOMContentLoaded', () => init());
  document.addEventListener('app:includes-ready', event => init(event.target));
})();
