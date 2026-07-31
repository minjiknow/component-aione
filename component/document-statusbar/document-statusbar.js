(() => {
	'use strict';

	const rootSelector = '[data-document-statusbar]';
	const fullscreenClass = 'document-statusbar-fullscreen';

	function resolveRoot(target) {
		if (target instanceof Element) {
			return target.matches(rootSelector) ? target : target.closest(rootSelector);
		}
		if (typeof target === 'string') return document.querySelector(target);
		return null;
	}

	function resolveSelector(root, selector) {
		if (!selector) return null;
		try {
			return document.querySelector(selector);
		} catch (error) {
			return null;
		}
	}

	function readNumber(value, fallback) {
		const number = Number(value);
		return Number.isFinite(number) ? number : fallback;
	}

	function stateFor(root) {
		if (!root) return null;
		const min = readNumber(root.dataset.documentMinZoom, 50);
		const max = Math.max(min, readNumber(root.dataset.documentMaxZoom, 200));
		const step = Math.max(1, readNumber(root.dataset.documentZoomStep, 10));
		const target = resolveSelector(root, root.dataset.documentTarget);
		const scrollTarget = resolveSelector(root, root.dataset.documentScrollTarget);
		const fullscreenTarget = resolveSelector(root, root.dataset.documentFullscreenTarget)
			|| root.parentElement;
		return {
			root,
			min,
			max,
			step,
			target,
			scrollTarget,
			fullscreenTarget
		};
	}

	function updatePage(state) {
		const selector = state.root.dataset.documentPageSelector;
		if (!selector || !state.scrollTarget) return;

		let pages = [];
		try {
			pages = Array.from(state.target?.querySelectorAll(selector) || []);
		} catch (error) {
			return;
		}
		if (!pages.length) return;

		const pageTotal = state.root.querySelector('[data-document-page-total]');
		const pageCurrent = state.root.querySelector('[data-document-page-current]');
		const currentTop = state.scrollTarget.scrollTop + 40;
		let current = 1;
		pages.forEach((page, index) => {
			if (currentTop >= page.offsetTop) current = index + 1;
		});
		if (pageCurrent) pageCurrent.textContent = String(current);
		if (pageTotal) pageTotal.textContent = String(pages.length);
	}

	function setZoom(target, nextZoom) {
		const root = resolveRoot(target);
		const state = stateFor(root);
		if (!state) return null;

		const zoom = Math.min(state.max, Math.max(
			state.min,
			readNumber(nextZoom, readNumber(root.dataset.documentZoom, 100))
		));
		root.dataset.documentZoom = String(zoom);
		if (state.target) {
			state.target.style.zoom = String(zoom / 100);
			state.target.dataset.documentZoom = String(zoom);
		}

		const value = root.querySelector('[data-document-statusbar-zoom-value]');
		const zoomOut = root.querySelector('[data-document-statusbar-action="zoom-out"]');
		const zoomIn = root.querySelector('[data-document-statusbar-action="zoom-in"]');
		if (value) value.textContent = `${zoom}%`;
		if (zoomOut) zoomOut.disabled = zoom <= state.min;
		if (zoomIn) zoomIn.disabled = zoom >= state.max;
		window.requestAnimationFrame(() => updatePage(state));

		root.dispatchEvent(new CustomEvent('document-statusbar:zoomchange', {
			bubbles: true,
			detail: { zoom, target: state.target }
		}));
		return root;
	}

	function syncFullscreenState(root) {
		const state = stateFor(root);
		if (!state) return;
		const isFullscreen = state.fullscreenTarget?.classList.contains(fullscreenClass) || false;
		const button = root.querySelector('[data-document-statusbar-action="fullscreen"]');
		if (!button) return;
		button.setAttribute('aria-pressed', String(isFullscreen));
		button.setAttribute('aria-label', isFullscreen ? '문서 전체보기 종료' : '문서 전체보기');
		button.title = isFullscreen ? '문서 전체보기 종료' : '문서 전체보기';
	}

	function toggleFullscreen(target, force) {
		const root = resolveRoot(target);
		const state = stateFor(root);
		if (!state?.fullscreenTarget) return null;

		const nextState = typeof force === 'boolean'
			? force
			: !state.fullscreenTarget.classList.contains(fullscreenClass);
		document.querySelectorAll(`.${fullscreenClass}`).forEach(element => {
			if (element !== state.fullscreenTarget) element.classList.remove(fullscreenClass);
		});
		state.fullscreenTarget.classList.toggle(fullscreenClass, nextState);
		document.querySelectorAll(rootSelector).forEach(syncFullscreenState);
		root.dispatchEvent(new CustomEvent('document-statusbar:fullscreenchange', {
			bubbles: true,
			detail: { fullscreen: nextState, target: state.fullscreenTarget }
		}));
		return root;
	}

	function init(root = document) {
		const statusbars = [];
		if (root instanceof Element && root.matches(rootSelector)) statusbars.push(root);
		root.querySelectorAll?.(rootSelector).forEach(statusbar => statusbars.push(statusbar));

		statusbars.forEach(statusbar => {
			if (statusbar.dataset.documentStatusbarReady !== 'true') {
				statusbar.dataset.documentStatusbarReady = 'true';
				statusbar.addEventListener('click', event => {
					const actionButton = event.target.closest('[data-document-statusbar-action]');
					if (!actionButton || !statusbar.contains(actionButton)) return;
					const action = actionButton.dataset.documentStatusbarAction;
					const state = stateFor(statusbar);
					if (!state) return;
					if (action === 'zoom-out') {
						setZoom(statusbar, readNumber(statusbar.dataset.documentZoom, 100) - state.step);
					}
					if (action === 'zoom-in') {
						setZoom(statusbar, readNumber(statusbar.dataset.documentZoom, 100) + state.step);
					}
					if (action === 'fullscreen') toggleFullscreen(statusbar);
				});

				const state = stateFor(statusbar);
				if (state?.scrollTarget && statusbar.dataset.documentPageSelector) {
					state.scrollTarget.addEventListener('scroll', () => updatePage(state), { passive: true });
				}
			}
			setZoom(statusbar, statusbar.dataset.documentZoom);
			syncFullscreenState(statusbar);
		});
	}

	document.addEventListener('keydown', event => {
		if (event.key !== 'Escape') return;
		const fullscreenTarget = document.querySelector(`.${fullscreenClass}`);
		if (!fullscreenTarget) return;
		fullscreenTarget.classList.remove(fullscreenClass);
		document.querySelectorAll(rootSelector).forEach(syncFullscreenState);
	});

	window.AIOneDocumentStatusBar = Object.freeze({
		init,
		setZoom,
		toggleFullscreen
	});
	document.addEventListener('DOMContentLoaded', () => init());
	document.addEventListener('app:includes-ready', event => init(event.target));
})();
