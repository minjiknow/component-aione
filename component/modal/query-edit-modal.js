(() => {
	'use strict';

	const modalState = new WeakMap();

	function resolveModal(target) {
		if (target instanceof Element) return target.closest('[data-modal]') || target;
		if (typeof target === 'string') return document.querySelector(target);
		return null;
	}

	function setSelectValue(select, value) {
		if (!select) return;

		const nextValue = String(value || '');
		const hasOption = Array.from(select.options).some(option => option.value === nextValue);
		if (nextValue && !hasOption) select.add(new Option(nextValue, nextValue));
		select.value = nextValue;
	}

	function fill(modal, query = {}) {
		const type = ['single', 'multi', 'none'].includes(query.type) ? query.type : 'single';
		const text = modal.querySelector('[data-query-edit-text]');
		const typeSelect = modal.querySelector('[data-query-edit-type]');
		const mainDepartment = modal.querySelector('[data-query-edit-main-dept]');
		const cooperationDepartment = modal.querySelector('[data-query-edit-coop-dept]');
		const organization = modal.querySelector('[data-query-edit-org]');

		if (text) text.value = query.text || '';
		setSelectValue(typeSelect, type);
		setSelectValue(mainDepartment, query.mainDept || '해당없음');
		if (cooperationDepartment) cooperationDepartment.value = query.coopDept || '';
		if (organization) organization.value = query.org || '재정경제부';
	}

	function read(modal) {
		const state = modalState.get(modal) || {};
		return {
			id: state.id,
			text: modal.querySelector('[data-query-edit-text]')?.value.trim() || '',
			type: modal.querySelector('[data-query-edit-type]')?.value || 'single',
			mainDept: modal.querySelector('[data-query-edit-main-dept]')?.value || '',
			coopDept: modal.querySelector('[data-query-edit-coop-dept]')?.value.trim() || '',
			org: modal.querySelector('[data-query-edit-org]')?.value.trim() || ''
		};
	}

	function open(target, query = {}, trigger = null) {
		const modal = resolveModal(target);
		if (!modal) return null;

		modalState.set(modal, { id: query.id });
		fill(modal, query);
		window.AIOneModal?.open(modal, trigger);
		return modal;
	}

	document.addEventListener('click', event => {
		const applyButton = event.target.closest('[data-query-edit-apply]');
		if (!applyButton) return;

		const modal = applyButton.closest('[data-modal]');
		if (!modal) return;

		const values = read(modal);
		modal.dispatchEvent(new CustomEvent('query-edit-modal:apply', {
			bubbles: true,
			detail: values
		}));
		window.AIOneModal?.close(modal);
	});

	window.AIOneQueryEditModal = Object.freeze({ open, read });
})();
