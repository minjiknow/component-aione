(() => {
	'use strict';

	let pendingModalRequest = null;
	const accountMenuStates = new WeakMap();

	function setAccountMenuOpen(sidebar, isOpen, trigger = null) {
		const state = accountMenuStates.get(sidebar);
		if (!state) return;

		if (isOpen) window.AIOneUserProfileTooltip?.hide(state.userCard);
		state.menu.hidden = !isOpen;
		state.menu.classList.toggle('hidden', !isOpen);
		state.triggers.forEach(item => item.setAttribute('aria-expanded', String(isOpen)));
		if (isOpen) {
			state.lastTrigger = trigger;
			window.requestAnimationFrame(() => state.menu.querySelector('[role="menuitem"]')?.focus());
		}
	}

	function openModal(trigger) {
		const targetId = trigger?.getAttribute('data-modal-open');
		const modal = targetId ? document.getElementById(targetId) : null;
		const sidebar = trigger?.closest('.app-sidebar');
		if (sidebar) setAccountMenuOpen(sidebar, false);
		if (!modal || !window.AIOneModal) {
			pendingModalRequest = targetId ? { targetId, trigger } : null;
			return false;
		}

		pendingModalRequest = null;
		window.AIOneModal.open(modal, trigger);
		return true;
	}

	function bindAccountMenu(sidebar) {
		const menu = sidebar.querySelector('.user-account-menu');
		const triggers = Array.from(sidebar.querySelectorAll('[data-sidebar-account-toggle]'));
		if (!menu || !triggers.length) return;

		const userCard = menu.closest('.user-card');
		if (userCard) {
			userCard.dataset.accountMenuReady = 'true';
			window.AIOneUserProfileTooltip?.bind(userCard);
		}

		const state = { menu, triggers, lastTrigger: null, userCard };
		accountMenuStates.set(sidebar, state);

		triggers.forEach(trigger => {
			trigger.addEventListener('click', event => {
				event.preventDefault();
				event.stopPropagation();
				setAccountMenuOpen(sidebar, menu.hidden, trigger);
			});
		});

		menu.addEventListener('click', event => {
			const actionButton = event.target.closest('[data-sidebar-account-action]');
			if (!actionButton) return;

			event.preventDefault();
			event.stopPropagation();
			setAccountMenuOpen(sidebar, false);
			if (actionButton.hasAttribute('data-modal-open')) openModal(actionButton);
			sidebar.dispatchEvent(new CustomEvent('sidebar:account-action', {
				bubbles: true,
				detail: {
					action: actionButton.dataset.sidebarAccountAction,
					trigger: actionButton
				}
			}));
		});

		document.addEventListener('click', event => {
			if (event.target.closest('.user-account-menu, [data-sidebar-account-toggle]')) return;
			setAccountMenuOpen(sidebar, false);
		});

		document.addEventListener('keydown', event => {
			if (event.key !== 'Escape' || menu.hidden) return;
			setAccountMenuOpen(sidebar, false);
			state.lastTrigger?.focus();
		});
	}

	function bindNavTooltips(sidebar) {
		if (!sidebar || sidebar.dataset.navTooltipsReady === 'true') return;

		let tooltip = document.getElementById('navTooltip');
		if (!tooltip) {
			tooltip = document.createElement('div');
			tooltip.id = 'navTooltip';
			tooltip.className = 'nav-tooltip';
			tooltip.setAttribute('role', 'tooltip');
			document.body.appendChild(tooltip);
		}

		sidebar.querySelectorAll('.nav-link[data-tooltip]').forEach(link => {
			link.addEventListener('mouseenter', () => {
				if (!sidebar.classList.contains('collapsed')) return;
				const rect = link.getBoundingClientRect();
				tooltip.textContent = link.dataset.tooltip;
				tooltip.style.left = `${rect.right + 10}px`;
				tooltip.style.top = `${rect.top + rect.height / 2}px`;
				tooltip.classList.add('visible');
			});
			link.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
			link.addEventListener('focusout', () => tooltip.classList.remove('visible'));
		});
		sidebar.dataset.navTooltipsReady = 'true';
	}

	function bindSidebar(sidebar) {
		if (!sidebar || sidebar.dataset.modalTriggersReady === 'true') return;

		sidebar.dataset.modalTriggersReady = 'true';
		bindNavTooltips(sidebar);
		bindAccountMenu(sidebar);
		sidebar.querySelectorAll('[data-modal-open]:not([data-sidebar-account-action])').forEach(trigger => {
			trigger.addEventListener('click', event => {
				event.preventDefault();
				event.stopPropagation();
				openModal(trigger);
			});
		});
	}

	function init(root = document) {
		if (root.matches?.('.app-sidebar, .sidebar')) bindSidebar(root);
		root.querySelectorAll?.('.app-sidebar, .sidebar').forEach(bindSidebar);
	}

	window.AIOneSidebar = Object.freeze({ init, openModal, bindNavTooltips });

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => init(), { once: true });
	} else {
		init();
	}

	document.addEventListener('component:ready', event => {
		if (event.detail?.name === 'sidebar') init(event.target);
		if (pendingModalRequest
			&& event.detail?.name === 'modal'
			&& event.detail?.id === pendingModalRequest.targetId) {
			openModal(pendingModalRequest.trigger);
		}
	});
})();
