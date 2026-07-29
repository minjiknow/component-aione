(() => {
	'use strict';

	const ICON_TONES = new Set(['blue', 'green', 'orange', 'purple']);

	function resolveTarget(target) {
		if (target instanceof Element) return target;
		if (typeof target === 'string') return document.querySelector(target);
		return null;
	}

	function create(options = {}) {
		const item = document.createElement('li');
		const link = document.createElement('a');
		const top = document.createElement('div');
		const iconWrap = document.createElement('div');
		const icon = document.createElement('img');
		const title = document.createElement('h3');
		const description = document.createElement('p');
		const iconTone = ICON_TONES.has(options.iconTone) ? options.iconTone : 'blue';
		const isDisabled = options.disabled === true;
		const modalTarget = typeof options.modalTarget === 'string'
			? options.modalTarget.trim()
			: '';

		item.className = 'service-item';
		link.className = 'service-card';
		link.href = modalTarget ? '#' : (options.href || '#');
		if (modalTarget) link.dataset.modalOpen = modalTarget;
		if (isDisabled) {
			link.dataset.soon = '';
			link.setAttribute('aria-disabled', 'true');
		}

		top.className = 'service-card-top';
		iconWrap.className = `service-icon ${iconTone}`;
		icon.src = options.icon || '';
		icon.width = 38;
		icon.height = 38;
		icon.alt = '';
		icon.setAttribute('aria-hidden', 'true');

		title.className = 'service-title';
		title.textContent = options.title || '';
		description.className = 'service-desc';
		description.textContent = options.description || '';

		iconWrap.append(icon);
		top.append(iconWrap);
		link.append(top, title, description);
		item.append(link);
		return item;
	}

	function renderList(target, items = []) {
		const list = resolveTarget(target);
		if (!list) return null;

		list.replaceChildren(...items.map(create));
		list.dispatchEvent(new CustomEvent('service-card:list-rendered', {
			bubbles: true,
			detail: { count: items.length }
		}));
		return list;
	}

	window.AIOneServiceCard = Object.freeze({ create, renderList });
})();
