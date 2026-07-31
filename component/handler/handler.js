(() => {
	'use strict';

	const HANDLE_SELECTOR = [
		'.split-handler-handle',
		'.resize-panel-layout > .panel-resize-handle',
		'.three-panel > .panel-resize-handle'
	].join(', ');
	const DEFAULT_SPLIT_MIN_WIDTH = 160;
	const DEFAULT_PANEL_MIN_WIDTH = 220;
	const PANEL_HANDLE_WIDTH = 2;

	function getDirectChildren(container, predicate) {
		return Array.from(container?.children || []).filter(predicate);
	}

	function getSplitPanes(container) {
		return getDirectChildren(container, element => (
			element.classList.contains('split-handler-left')
			|| element.classList.contains('split-handler-right')
			|| element.classList.contains('split-handler-pane')
		));
	}

	function getTwoPaneParts(handle) {
		const splitContainer = handle.closest('[data-component="split-handler"]');
		if (
			splitContainer
			&& handle.parentElement === splitContainer
			&& handle.classList.contains('split-handler-handle')
		) {
			const panes = getSplitPanes(splitContainer);
			const handles = getDirectChildren(splitContainer, element => (
				element.classList.contains('split-handler-handle')
			));
			const handleIndex = handles.indexOf(handle);
			const left = panes[handleIndex];
			const right = panes[handleIndex + 1];
			return left && right
				? { kind: 'two-pane', container: splitContainer, handle, left, right }
				: null;
		}

		const resizeContainer = handle.closest('[data-component="resize-panel-layout"]');
		if (!resizeContainer || handle.parentElement !== resizeContainer) return null;
		const panels = getDirectChildren(resizeContainer, element => (
			element.classList.contains('resize-panel')
		));
		return panels.length === 2
			? { kind: 'two-pane', container: resizeContainer, handle, left: panels[0], right: panels[1] }
			: null;
	}

	function getThreePanelParts(handle) {
		const container = handle.closest('.three-panel');
		if (!container || handle.parentElement !== container) return null;

		const compareHorizontalPosition = (first, second) => (
			first.getBoundingClientRect().left - second.getBoundingClientRect().left
		);
		const panels = getDirectChildren(container, element => element.hasAttribute('data-slot'))
			.sort(compareHorizontalPosition);
		const handles = getDirectChildren(container, element => (
			element.classList.contains('panel-resize-handle')
		)).sort(compareHorizontalPosition);
		const handleIndex = handles.indexOf(handle);
		const left = panels[handleIndex];
		const right = panels[handleIndex + 1];
		if (handleIndex < 0 || !left || !right) return null;

		return { kind: 'three-panel', container, handle, panels, left, right };
	}

	function getResizeParts(handle) {
		if (
			handle.closest('[data-component="split-handler"]')
			|| handle.closest('[data-component="resize-panel-layout"]')
		) {
			return getTwoPaneParts(handle);
		}
		return getThreePanelParts(handle);
	}

	function getMinimum(container, totalWidth, fallback) {
		const configured = Number.parseFloat(container.dataset.splitMin);
		const minimum = Number.isFinite(configured) ? configured : fallback;
		return Math.min(Math.max(0, minimum), Math.max(0, Math.floor(totalWidth / 2)));
	}

	function syncAria(parts) {
		const leftWidth = Math.round(parts.left.getBoundingClientRect().width);
		const rightWidth = Math.round(parts.right.getBoundingClientRect().width);
		const totalWidth = leftWidth + rightWidth;
		const fallback = parts.kind === 'three-panel'
			? DEFAULT_PANEL_MIN_WIDTH
			: DEFAULT_SPLIT_MIN_WIDTH;
		const minimum = getMinimum(parts.container, totalWidth, fallback);

		parts.handle.setAttribute('aria-valuemin', String(minimum));
		parts.handle.setAttribute('aria-valuemax', String(Math.max(minimum, totalWidth - minimum)));
		parts.handle.setAttribute('aria-valuenow', String(leftWidth));
	}

	function applyTwoPaneWidths(parts, requestedLeftWidth, totalWidth) {
		const minimum = getMinimum(parts.container, totalWidth, DEFAULT_SPLIT_MIN_WIDTH);
		const leftWidth = Math.min(Math.max(Math.round(requestedLeftWidth), minimum), totalWidth - minimum);

		parts.left.style.flex = 'none';
		parts.left.style.width = `${leftWidth}px`;
		parts.right.style.flex = 'none';
		parts.right.style.width = `${totalWidth - leftWidth}px`;
		syncAria(parts);
		parts.container.dispatchEvent(new CustomEvent('split-handler:resize', {
			bubbles: true,
			detail: {
				handle: parts.handle,
				left: parts.left,
				right: parts.right,
				leftWidth,
				rightWidth: totalWidth - leftWidth
			}
		}));
	}

	function readThreePanelWidths(parts) {
		return new Map(parts.panels.map(panel => [
			panel,
			Math.round(panel.getBoundingClientRect().width)
		]));
	}

	function applyThreePanelWidths(parts, requestedLeftWidth, totalWidth, startWidths) {
		const minimum = getMinimum(parts.container, totalWidth, DEFAULT_PANEL_MIN_WIDTH);
		const leftWidth = Math.min(Math.max(Math.round(requestedLeftWidth), minimum), totalWidth - minimum);
		const widths = new Map(startWidths);
		widths.set(parts.left, leftWidth);
		widths.set(parts.right, totalWidth - leftWidth);

		parts.container.style.gridTemplateColumns = parts.panels
			.flatMap((panel, index) => (
				index < parts.panels.length - 1
					? [`${widths.get(panel)}px`, `${PANEL_HANDLE_WIDTH}px`]
					: [`${widths.get(panel)}px`]
			))
			.join(' ');
		getDirectChildren(parts.container, element => (
			element.classList.contains('panel-resize-handle')
		)).forEach(handle => {
			const nextParts = getThreePanelParts(handle);
			if (nextParts) syncAria(nextParts);
		});
	}

	function applyWidths(parts, requestedLeftWidth, totalWidth, startWidths) {
		if (parts.kind === 'three-panel') {
			applyThreePanelWidths(parts, requestedLeftWidth, totalWidth, startWidths);
			return;
		}
		applyTwoPaneWidths(parts, requestedLeftWidth, totalWidth);
	}

	function init(root = document) {
		const handles = [];
		if (root instanceof Element && root.matches(HANDLE_SELECTOR)) handles.push(root);
		root.querySelectorAll?.(HANDLE_SELECTOR).forEach(handle => handles.push(handle));
		handles.forEach(handle => {
			const parts = getResizeParts(handle);
			if (parts) syncAria(parts);
		});
	}

	function reset(container) {
		if (!(container instanceof Element)) return;
		if (container.matches('.three-panel')) {
			container.style.removeProperty('grid-template-columns');
		} else {
			getDirectChildren(container, element => (
				element.classList.contains('split-handler-left')
				|| element.classList.contains('split-handler-right')
				|| element.classList.contains('split-handler-pane')
				|| element.classList.contains('resize-panel')
			)).forEach(panel => {
				panel.style.removeProperty('flex');
				panel.style.removeProperty('width');
			});
		}
		init(container);
	}

	if (document.documentElement.dataset.splitHandlerEventsReady !== 'true') {
		document.documentElement.dataset.splitHandlerEventsReady = 'true';

		document.addEventListener('pointerdown', event => {
			const handle = event.target.closest(HANDLE_SELECTOR);
			if (!handle || event.button !== 0) return;
			const parts = getResizeParts(handle);
			if (!parts) return;

			event.preventDefault();
			const pointerId = event.pointerId;
			const startX = event.clientX;
			const startLeftWidth = parts.left.getBoundingClientRect().width;
			const startRightWidth = parts.right.getBoundingClientRect().width;
			const totalWidth = startLeftWidth + startRightWidth;
			const startWidths = parts.kind === 'three-panel'
				? readThreePanelWidths(parts)
				: null;

			handle.classList.add('active');
			document.body.style.cursor = 'col-resize';
			document.body.style.userSelect = 'none';

			const onPointerMove = moveEvent => {
				if (moveEvent.pointerId !== pointerId) return;
				moveEvent.preventDefault();
				applyWidths(
					parts,
					startLeftWidth + moveEvent.clientX - startX,
					totalWidth,
					startWidths
				);
			};
			const onPointerEnd = endEvent => {
				if (endEvent.pointerId !== pointerId) return;
				handle.classList.remove('active');
				document.body.style.cursor = '';
				document.body.style.userSelect = '';
				document.removeEventListener('pointermove', onPointerMove);
				document.removeEventListener('pointerup', onPointerEnd);
				document.removeEventListener('pointercancel', onPointerEnd);
			};

			document.addEventListener('pointermove', onPointerMove, { passive: false });
			document.addEventListener('pointerup', onPointerEnd);
			document.addEventListener('pointercancel', onPointerEnd);
		});

		document.addEventListener('keydown', event => {
			const handle = event.target.closest(HANDLE_SELECTOR);
			if (!handle || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
			const parts = getResizeParts(handle);
			if (!parts) return;

			event.preventDefault();
			const leftWidth = parts.left.getBoundingClientRect().width;
			const rightWidth = parts.right.getBoundingClientRect().width;
			const difference = (event.key === 'ArrowRight' ? 1 : -1) * (event.shiftKey ? 32 : 16);
			const startWidths = parts.kind === 'three-panel'
				? readThreePanelWidths(parts)
				: null;
			applyWidths(parts, leftWidth + difference, leftWidth + rightWidth, startWidths);
		});
	}

	window.AIOneSplitHandler = Object.freeze({ init, reset });
	document.addEventListener('component:ready', event => init(event.target));
	document.addEventListener('app:includes-ready', event => init(event.target));
	document.addEventListener('DOMContentLoaded', () => init());
	init();
})();
