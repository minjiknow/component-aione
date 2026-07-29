(() => {
	'use strict';

	const TYPE_META = Object.freeze({
		single: { label: '단일소관' },
		multi: { label: '복수소관' },
		none: { label: '비소관' }
	});

	function resolveTarget(target) {
		if (target instanceof Element) return target;
		if (typeof target === 'string') return document.querySelector(target);
		return null;
	}

	function clampConfidence(value) {
		const numericValue = Number(value);
		if (!Number.isFinite(numericValue)) return 0;
		return Math.min(100, Math.max(0, numericValue));
	}

	function createTextElement(tagName, className, text) {
		const element = document.createElement(tagName);
		element.className = className;
		element.textContent = text;
		return element;
	}

	function createDepartmentTag(label, value, isMain = false) {
		const tag = createTextElement('span', `rec-tag${isMain ? ' main' : ''}`, `${label}: ${value}`);
		return tag;
	}

	function emit(card, type) {
		card.dispatchEvent(new CustomEvent(`query-card:${type}`, {
			bubbles: true,
			detail: {
				id: card.dataset.qid,
				scope: card.dataset.scope
			}
		}));
	}

	function create(data = {}, options = {}) {
		const type = Object.hasOwn(TYPE_META, data.type) ? data.type : 'single';
		const typeLabel = data.typeLabel || TYPE_META[type].label;
		const confidence = clampConfidence(data.confidence);
		const needsReview = data.needsReview ?? confidence < 80;
		const editable = options.editable !== false;
		const card = document.createElement('article');
		const head = document.createElement('div');
		const number = createTextElement('span', `query-num ${type}`, `Q${data.id ?? ''}`);
		const typeBadge = createTextElement('span', `status-badge query-type ${type}`, typeLabel);
		const text = createTextElement('p', 'query-text', data.text || '');
		const departments = document.createElement('div');
		const reason = document.createElement('div');
		const reasonLabel = createTextElement('strong', 'ai-reason-label', 'AI 분류 근거:');
		const reasonText = createTextElement('span', 'ai-reason-text', data.reason || '');
		const progressRow = document.createElement('div');
		const progressLabel = createTextElement('span', 'progressbar-label', '신뢰도');
		const progressbar = document.createElement('div');
		const progressFill = document.createElement('div');
		const progressValue = createTextElement('span', 'progressbar-value', `${Math.round(confidence)}%`);

		card.className = `query-card${needsReview ? ' needs-review' : ''}${data.selected ? ' is-selected' : ''}`;
		card.tabIndex = 0;
		card.dataset.qid = String(data.id ?? '');
		card.dataset.type = type;
		card.dataset.scope = type;
		card.setAttribute('aria-label', `질의 Q${data.id ?? ''}: ${data.text || ''}`);

		head.className = 'query-card-head';
		head.append(number);
		if (needsReview) {
			head.append(createTextElement('span', 'query-review-badge', '검토필요'));
		}
		head.append(typeBadge);

		departments.className = 'query-dept';
		if (data.mainDept) departments.append(createDepartmentTag('주관', data.mainDept, true));
		if (data.coopDept) departments.append(createDepartmentTag('협조', data.coopDept));
		if (type === 'none' && data.org) departments.append(createDepartmentTag('비소관', data.org));

		reason.className = 'query-ai-reason';
		reason.append(reasonLabel, reasonText);

		progressRow.className = 'progressbar-row query-confidence-bar';
		progressbar.className = 'progressbar';
		progressbar.dataset.progressbar = '';
		progressbar.dataset.value = String(confidence);
		progressbar.setAttribute('role', 'progressbar');
		progressbar.setAttribute('aria-label', `신뢰도 ${Math.round(confidence)}%`);
		progressbar.setAttribute('aria-valuemin', '0');
		progressbar.setAttribute('aria-valuemax', '100');
		progressbar.setAttribute('aria-valuenow', String(confidence));
		progressbar.style.setProperty('--progressbar-value', `${confidence}%`);
		progressbar.classList.toggle('is-high', confidence >= 90);
		progressbar.classList.toggle('is-low', confidence < 90);
		progressFill.className = 'progressbar-fill';
		progressbar.append(progressFill);
		progressRow.append(progressLabel, progressbar, progressValue);

		card.append(head, text);
		if (departments.childElementCount) card.append(departments);
		if (data.reason) card.append(reason);
		card.append(progressRow);

		if (data.conflict) {
			const conflict = document.createElement('div');
			const icon = createTextElement('span', 'conflict-icon', '⚡');
			const message = document.createElement('span');
			const strong = createTextElement('strong', '', data.conflict.ruleLabel || '분류 룰');

			conflict.className = 'query-conflict';
			icon.setAttribute('aria-hidden', 'true');
			message.className = 'conflict-text';
			message.append('룰 충돌: ', strong, ` → ${data.conflict.ruleDept || ''} / AI 추천 → ${data.conflict.aiDept || ''}`);
			conflict.append(icon, message);
			card.append(conflict);
		}

		if (editable) {
			const footer = document.createElement('div');
			const editButton = createTextElement('button', 'button button-outline button-sm query-edit-btn', '수정');

			footer.className = 'query-card-foot';
			editButton.type = 'button';
			editButton.dataset.qid = card.dataset.qid;
			editButton.addEventListener('click', event => {
				event.stopPropagation();
				emit(card, 'edit');
			});
			footer.append(editButton);
			card.append(footer);
		}

		card.addEventListener('click', event => {
			if (event.target.closest('button')) return;
			emit(card, 'select');
		});
		card.addEventListener('keydown', event => {
			if (event.target !== card || !['Enter', ' '].includes(event.key)) return;
			event.preventDefault();
			emit(card, 'select');
		});

		return card;
	}

	function renderList(target, items = [], options = {}) {
		const list = resolveTarget(target);
		if (!list) return null;

		list.replaceChildren(...items.map(item => create(item, options)));
		window.AIOneProgressBar?.init(list);
		list.dispatchEvent(new CustomEvent('query-card:list-rendered', {
			bubbles: true,
			detail: { count: items.length }
		}));
		return list;
	}

	window.AIOneQueryCard = Object.freeze({ create, renderList });
})();
