(() => {
	'use strict';

	const isComponentCatalog = new URLSearchParams(window.location.search).get('view') === 'component-catalog';
	if (isComponentCatalog) {
		document.documentElement.classList.add('component-catalog-preview');
	}

	if (!window.AIOneComponents) return;

	const iconBaseUrl = new URL('../assets/icons/', document.baseURI);
	const serviceCards = [
		{
			href: 'ai-workspace.html',
			target: isComponentCatalog ? '_top' : '_self',
			icon: '../assets/icons/service-question-classification.svg',
			iconTone: 'blue',
			title: '국회 질의 분류',
			description: '문서 업로드 · OCR/파싱 · 질의 분류 · 매칭부서 확인'
		},
		{
			href: 'ai-answer.html',
			target: isComponentCatalog ? '_top' : '_self',
			icon: '../assets/icons/service-answer-draft.svg',
			iconTone: 'green',
			title: '국회 답변서 초안 생성',
			description: '자료 분석 · 유사답변서 추천 · 초안 생성 · 편집'
		},
		{
			href: '#',
			icon: '../assets/icons/service-economic-trends.svg',
			iconTone: 'orange',
			title: '경제동향 분석 보고서',
			description: '데이터 수집 · 동향 분석 · 보고서 초안 · 검토',
			status: 'preparing'
		},
		{
			href: '#',
			icon: '../assets/icons/service-chatbot.svg',
			iconTone: 'purple',
			title: '세수예측 및 시나리오 시뮬레이션',
			description: '시나리오별 세수 예측',
			status: 'preparing'
		}
	];
	const fullHistoryItems = [
		{ icon: 'document', target: 'ai-answer.html', service: '국회 답변서 초안 작성', type: 'AI초안', typeClass: 'ai', task: '2026년 청년 고용 정책 관련 답변 초안', date: '2026.05.20 10:24', status: '완료', statusClass: 'done', registered: '2026.05.19' },
		{ icon: 'search', service: '국회 질의 자료 검색', type: '검색', typeClass: 'search', task: '반도체 산업 지원 관련 질의', date: '2026.05.20 09:15', status: '완료', statusClass: 'done', registered: '2026.05.18' },
		{ icon: 'chart-line', service: '경제동향 분석 보고서', type: '보고서', typeClass: 'report', task: '2026년 4월 경제동향 분석', date: '2026.05.19 18:40', status: '진행 중', statusClass: 'progress', registered: '2026.05.17' },
		{ icon: 'folder', service: '내부자료 자산화 관리', type: '문서관리', typeClass: 'doc', task: '국정 현안 보고자료 202605', date: '2026.05.19 14:05', status: '완료', statusClass: 'done', registered: '2026.05.16' },
		{ icon: 'document', target: 'ai-answer.html', service: '국회 답변서 초안 작성', type: 'AI초안', typeClass: 'ai', task: '디지털 전환 추진 정책 관련 답변 초안', date: '2026.05.19 11:32', status: '완료', statusClass: 'done', registered: '2026.05.15' },
		{ icon: 'document', target: 'ai-answer.html', service: '국회 답변서 초안 작성', type: 'AI초안', typeClass: 'ai', task: '지방채 인수 추경 편성 사유 답변 초안', date: '2026.05.18 16:20', status: '완료', statusClass: 'done', registered: '2026.05.14' },
		{ icon: 'search', service: '국회 질의 자료 검색', type: '검색', typeClass: 'search', task: '세수추계 오차 분석 자료 검색', date: '2026.05.18 14:10', status: '완료', statusClass: 'done', registered: '2026.05.13' },
		{ icon: 'chart-line', service: '경제동향 분석 보고서', type: '보고서', typeClass: 'report', task: '2026년 3월 경제동향 분석', date: '2026.05.17 11:00', status: '완료', statusClass: 'done', registered: '2026.05.12' },
		{ icon: 'document', target: 'ai-answer.html', service: '국회 답변서 초안 작성', type: 'AI초안', typeClass: 'ai', task: '공공기관 경영평가 관련 답변 초안', date: '2026.05.16 09:30', status: '완료', statusClass: 'done', registered: '2026.05.11' },
		{ icon: 'folder', service: '내부자료 자산화 관리', type: '문서관리', typeClass: 'doc', task: '재정건전성 보고자료 정리', date: '2026.05.15 17:45', status: '완료', statusClass: 'done', registered: '2026.05.10' }
	];
	let historyModalReturnFocus = null;

	function hydrateIcons(root = document) {
		root.querySelectorAll?.('img[data-icon]').forEach(icon => {
			if (icon.src) return;
			icon.src = new URL(`${icon.dataset.icon}.svg`, iconBaseUrl).href;
		});
	}

	function showToast(message) {
		window.AIOneToast?.show(message, {
			target: '#homeToast',
			duration: 1800
		});
	}

	function openPreparingModal(trigger) {
		const modal = document.getElementById('preparingServiceModal');
		if (modal && window.AIOneModal) {
			window.AIOneModal.open(modal, trigger);
			return;
		}
		showToast('해당 서비스는 준비 중입니다.');
	}

	function openHistoryRow(row) {
		const target = row?.dataset.historyTarget;
		if (!target) {
			showToast('해당 서비스는 준비 중입니다.');
			return;
		}

		sessionStorage.setItem('ai-one-history-task', row.dataset.historyTitle || '');
		window.location.href = target;
	}

	function openFullHistoryItem(index) {
		const item = fullHistoryItems[index];
		if (!item?.target) {
			showToast('해당 서비스는 준비 중입니다.');
			return;
		}

		sessionStorage.setItem('ai-one-history-task', item.task);
		window.location.href = item.target;
	}

	function renderFullHistory() {
		const rows = document.querySelector('[data-home-history-rows]');
		if (!rows || rows.dataset.rendered === 'true') return;

		rows.innerHTML = fullHistoryItems.map((item, index) => {
			const searchText = [
				item.service,
				item.type,
				item.task,
				item.date,
				item.status,
				item.registered
			].join(' ').toLocaleLowerCase('ko-KR');
			const icon = new URL(`${item.icon}.svg`, iconBaseUrl).href;

			return `
				<tr class="history-row-link" data-full-history-index="${index}"
					data-history-search="${searchText}" tabindex="0" role="link"
					aria-label="${item.task} 열기">
					<td><span class="svc-icon"><img src="${icon}" alt="" aria-hidden="true" />${item.service}</span></td>
					<td><span class="type-badge ${item.typeClass}">${item.type}</span></td>
					<td>${item.task}</td>
					<td>${item.date}</td>
					<td><span class="status-dot ${item.statusClass}">${item.status}</span></td>
					<td>${item.registered}</td>
				</tr>`;
		}).join('');
		rows.dataset.rendered = 'true';
	}

	function filterFullHistory() {
		const modal = document.querySelector('[data-home-history-modal]');
		const search = modal?.querySelector('[data-home-history-search]');
		const clear = modal?.querySelector('[data-home-history-clear]');
		const result = modal?.querySelector('[data-home-history-result]');
		const table = modal?.querySelector('.history-table.full');
		const empty = modal?.querySelector('[data-home-history-empty]');
		if (!modal || !search) return;

		const keyword = search.value.trim().toLocaleLowerCase('ko-KR');
		let visibleCount = 0;
		modal.querySelectorAll('[data-history-search]').forEach(row => {
			const isVisible = !keyword || row.dataset.historySearch.includes(keyword);
			row.hidden = !isVisible;
			if (isVisible) visibleCount += 1;
		});
		if (clear) clear.hidden = !keyword;
		if (result) {
			result.textContent = keyword
				? `검색 결과 ${visibleCount}건`
				: `총 ${fullHistoryItems.length}건`;
		}
		if (table) table.hidden = visibleCount === 0;
		if (empty) empty.hidden = visibleCount !== 0;
	}

	function closeFullHistory() {
		const modal = document.querySelector('[data-home-history-modal]');
		if (!modal || modal.hidden) return;
		modal.hidden = true;
		modal.setAttribute('aria-hidden', 'true');
		historyModalReturnFocus?.focus();
		historyModalReturnFocus = null;
	}

	function openFullHistory(trigger) {
		const modal = document.querySelector('[data-home-history-modal]');
		const search = modal?.querySelector('[data-home-history-search]');
		if (!modal) return;

		renderFullHistory();
		historyModalReturnFocus = trigger || document.activeElement;
		modal.hidden = false;
		modal.setAttribute('aria-hidden', 'false');
		if (search) search.value = '';
		filterFullHistory();
		window.requestAnimationFrame(() => search?.focus());
	}

	function initFullHistoryModal() {
		const modal = document.querySelector('[data-home-history-modal]');
		if (!modal || modal.dataset.ready === 'true') return;
		modal.dataset.ready = 'true';
		renderFullHistory();

		modal.querySelector('[data-home-history-close]')?.addEventListener('click', closeFullHistory);
		modal.querySelector('[data-home-history-search]')?.addEventListener('input', filterFullHistory);
		modal.querySelector('[data-home-history-clear]')?.addEventListener('click', () => {
			const search = modal.querySelector('[data-home-history-search]');
			search.value = '';
			filterFullHistory();
			search.focus();
		});
		modal.addEventListener('click', event => {
			if (event.target === modal) {
				closeFullHistory();
				return;
			}
			const row = event.target.closest('[data-full-history-index]');
			if (row) openFullHistoryItem(Number(row.dataset.fullHistoryIndex));
		});
		modal.addEventListener('keydown', event => {
			const row = event.target.closest('[data-full-history-index]');
			if (row && ['Enter', ' '].includes(event.key)) {
				event.preventDefault();
				openFullHistoryItem(Number(row.dataset.fullHistoryIndex));
				return;
			}
			if (event.key === 'Escape') {
				event.preventDefault();
				closeFullHistory();
				return;
			}
			if (event.key !== 'Tab') return;

			const focusable = Array.from(modal.querySelectorAll(
				'button:not(:disabled), input:not(:disabled), [href], [tabindex]:not([tabindex="-1"])'
			)).filter(element => !element.hidden && element.getClientRects().length > 0);
			if (!focusable.length) return;
			const first = focusable[0];
			const last = focusable.at(-1);
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		});
	}

	function enhanceSidebar(host) {
		const sidebar = host.querySelector('.app-sidebar');
		if (!sidebar || sidebar.dataset.homeReady === 'true') return;

		sidebar.dataset.homeReady = 'true';
		const app = sidebar.closest('.ai-home-app');
		const collapseButton = sidebar.querySelector('#sidebarCollapseBtn');
		const brandButton = sidebar.querySelector('#sidebarBrandButton');
		const setCollapsed = isCollapsed => {
			sidebar.classList.toggle('collapsed', isCollapsed);
			app?.classList.toggle('sidebar-expanded', !isCollapsed);
			collapseButton?.setAttribute('aria-expanded', String(!isCollapsed));

			if (brandButton) {
				const label = isCollapsed ? '사이드바 펼치기' : 'AI-ONE 홈';
				brandButton.setAttribute('aria-label', label);
				brandButton.title = label;
			}
		};

		setCollapsed(true);
		sidebar.querySelectorAll('.nav-link').forEach(link => {
			const isCurrent = link.dataset.page === 'home';
			link.classList.toggle('active', isCurrent);
			if (isCurrent) link.setAttribute('aria-current', 'page');
			else link.removeAttribute('aria-current');

			if (link.getAttribute('aria-disabled') === 'true') {
				link.addEventListener('click', event => {
					event.preventDefault();
					showToast('해당 서비스는 준비 중입니다.');
				});
			}
		});

		collapseButton?.addEventListener('click', () => {
			setCollapsed(!sidebar.classList.contains('collapsed'));
		});
		brandButton?.addEventListener('click', event => {
			if (!sidebar.classList.contains('collapsed')) return;
			event.preventDefault();
			setCollapsed(false);
		});
	}

	function enhanceDataTable(host) {
		const table = host.querySelector('[data-datatable]');
		if (!table || table.dataset.homeReady === 'true') return;

		table.dataset.homeReady = 'true';
		table.querySelectorAll('tbody tr[data-history-title]').forEach(row => {
			row.tabIndex = 0;
			row.setAttribute('role', 'link');
			row.setAttribute('aria-label', `${row.dataset.historyTitle} 열기`);
		});

		const moreLink = host.querySelector('.data-table-more');
		moreLink?.addEventListener('click', event => {
			event.preventDefault();
			openFullHistory(moreLink);
		});
	}

	function initPromptComposer() {
		const host = document.querySelector('[data-home-prompt-composer]');
		if (!host || host.dataset.homePromptComposerReady === 'true') return;

		host.dataset.homePromptComposerReady = 'true';
		host.addEventListener('promptcomposer:submit', event => {
			if (!host.contains(event.target)) return;
			openPreparingModal(host.querySelector('[data-prompt-submit]'));
		});
	}

	function initHistoryEvents() {
		document.addEventListener('click', event => {
			const row = event.target.closest('.data-table tbody tr[data-history-title]');
			if (row) openHistoryRow(row);
		});

		document.addEventListener('keydown', event => {
			if (!['Enter', ' '].includes(event.key)) return;
			const row = event.target.closest('.data-table tbody tr[data-history-title]');
			if (!row) return;
			event.preventDefault();
			openHistoryRow(row);
		});
	}

	function initPreparingCards() {
		document.addEventListener('click', event => {
			const card = event.target.closest('.service-card[data-soon], .service-card[data-modal-open]');
			if (!card) return;
			event.preventDefault();
			if (card.dataset.modalOpen) {
				if (!document.getElementById(card.dataset.modalOpen)) {
					showToast('해당 서비스는 준비 중입니다.');
				}
				return;
			}
			showToast('해당 서비스는 준비 중입니다.');
		});
	}

	document.addEventListener('component:ready', event => {
		hydrateIcons(event.target);
		if (event.detail?.name === 'sidebar') enhanceSidebar(event.target);
		if (event.detail?.name === 'datatable') enhanceDataTable(event.target);
	});

	document.addEventListener('DOMContentLoaded', () => {
		hydrateIcons();
		window.AIOneServiceCard?.renderList('[data-service-card-list]', serviceCards);
		initPromptComposer();
		initFullHistoryModal();
		initHistoryEvents();
		initPreparingCards();
	});
})();
