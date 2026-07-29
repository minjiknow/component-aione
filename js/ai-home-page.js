(() => {
	'use strict';

	const components = window.AIOneComponents;
	if (!components) return;

	components.register('sidebar', {
		fragment: 'sidebar/sidebar.html?v=20260728-2',
		styles: ['button/button.css', 'sidebar/sidebar.css'],
		scripts: []
	});

	const iconBaseUrl = new URL('../assets/icons/', document.baseURI);
	const serviceCards = [
		{
			href: 'ai-workspace.html',
			icon: '../assets/icons/service-question-classification.svg',
			iconTone: 'blue',
			title: '국회 질의 분류',
			description: '문서 업로드 · OCR/파싱 · 질의 분류 · 매칭부서 확인'
		},
		{
			icon: '../assets/icons/service-answer-draft.svg',
			iconTone: 'green',
			title: '국회 답변서 초안 생성',
			description: '자료 분석 · 유사답변서 추천 · 초안 생성 · 편집',
			modalTarget: 'preparingServiceModal'
		},
		{
			href: '#',
			icon: '../assets/icons/service-economic-trends.svg',
			iconTone: 'orange',
			title: '경제동향 분석 보고서',
			description: '데이터 수집 · 동향 분석 · 보고서 초안 · 검토',
			disabled: true
		},
		{
			href: '#',
			icon: '../assets/icons/service-chatbot.svg',
			iconTone: 'purple',
			title: '세수예측 및 시나리오 시뮬레이션',
			description: '시나리오별 세수 예측',
			disabled: true
		}
	];

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
			showToast('전체 이력 화면은 준비 중입니다.');
		});
	}

	function initSearch() {
		const form = document.querySelector('[data-home-search]');
		const input = document.getElementById('homeSearchInput');
		if (!form || !input) return;

		form.addEventListener('submit', event => {
			event.preventDefault();
			const query = input.value.trim();
			if (!query) {
				input.focus();
				showToast('대화를 시작할 내용을 입력해 주세요.');
				return;
			}

			openPreparingModal(form.querySelector('[type="submit"]'));
		});
	}

	function initHistoryEvents() {
		document.addEventListener('click', event => {
			if (event.target.closest('[data-dropdown-menu]')) return;
			const row = event.target.closest('.data-table tbody tr[data-history-title]');
			if (row) openHistoryRow(row);
		});

		document.addEventListener('keydown', event => {
			if (!['Enter', ' '].includes(event.key) || event.target.closest('[data-dropdown-menu]')) return;
			const row = event.target.closest('.data-table tbody tr[data-history-title]');
			if (!row) return;
			event.preventDefault();
			openHistoryRow(row);
		});

		document.addEventListener('dropdownmenu:select', event => {
			const row = event.target.closest('tr[data-history-title]');
			if (!row) return;

			if (event.detail?.value === 'open') {
				openHistoryRow(row);
				return;
			}
			if (event.detail?.value === 'rename') {
				showToast('이름 변경 기능은 준비 중입니다.');
			}
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
		initSearch();
		initHistoryEvents();
		initPreparingCards();
	});
})();
