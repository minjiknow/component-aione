(() => {
	'use strict';

	const components = window.AIOneComponents;
	if (!components) return;

	const emptyScripts = [];
	components.register('sidebar', {
		fragment: 'sidebar/sidebar.html?v=20260728-2',
		styles: ['button/button.css', 'sidebar/sidebar.css'],
		scripts: emptyScripts
	});
	components.register('topbar', {
		fragment: 'topbar/topbar.html?v=20260728-1',
		styles: ['button/button.css?v=20260728-2', 'topbar/topbar.css?v=20260728-1'],
		scripts: emptyScripts
	});
	components.register('panel', {
		fragment: 'panel/panel.html',
		styles: ['panel/panel.css'],
		scripts: emptyScripts
	});
	components.register('three-panel', {
		fragment: 'panel/three-panel.html',
		styles: ['panel/panel.css'],
		scripts: emptyScripts
	});
	components.register('file-upload', {
		fragment: 'file-upload/file-upload.html',
		styles: ['file-upload/file-upload.css'],
		scripts: emptyScripts
	});

	const iconBaseUrl = new URL('../assets/icons/', document.baseURI);
	const questionSelector = '.document-question';
	const workspaceQuestionCards = [
		{
			id: 1,
			type: 'single',
			text: '2026년도 예산편성지침 중 인건비 산정기준 변경사항에 대한 구체적 안내 요청',
			mainDept: '경제정책국',
			reason: '과거 답변 이력 기반 ‘경제정책국’ 단일소관 판정',
			confidence: 94,
			selected: true
		},
		{
			id: 2,
			type: 'multi',
			text: '지방자치단체 재정자립도 산정 시 세외수입 항목 포함 여부 및 관련 법령 해석',
			mainDept: '경제정책국',
			coopDept: '세제실',
			reason: '주관 ‘경제정책국’ 확인, 협조 필요 근거: 관련 법령 교차 참조',
			confidence: 82,
			conflict: {
				ruleLabel: '세제 키워드 룰',
				ruleDept: '세제실',
				aiDept: '경제정책국'
			}
		},
		{
			id: 3,
			type: 'single',
			text: '공공기관 경영평가 시 비계량지표 평가방법론 개선 관련 의견 조회',
			mainDept: '공공정책국',
			reason: '‘공공정책국’ 소관 업무 키워드 매칭',
			confidence: 91
		},
		{
			id: 4,
			type: 'multi',
			text: '외국환거래법 개정에 따른 해외직접투자 신고절차 변경 안내 요청',
			mainDept: '국제금융국',
			coopDept: '경제정책국',
			reason: '복수 부서 업무영역에 걸친 복합 질의로 판단',
			confidence: 78
		},
		{
			id: 5,
			type: 'none',
			text: '최근 기상이변으로 인한 농작물 피해 현황 자료 요청의 건',
			mainDept: '해당없음',
			org: '농림축산식품부',
			reason: '농림축산식품부 소관 업무로 판단',
			confidence: 87
		}
	];
	const panelMinWidth = 220;
	const panelHandleWidth = 2;
	const panelStates = new WeakMap();
	let pendingDeleteFileItem = null;

	function hydrateIcons(root = document) {
		root.querySelectorAll?.('img[data-icon]').forEach(icon => {
			if (icon.src) return;
			icon.src = new URL(`${icon.dataset.icon}.svg`, iconBaseUrl).href;
		});
	}

	function showToast(message) {
		window.AIOneToast?.show(message, {
			target: '#workspaceToast',
			duration: 1800
		});
	}

	function setQuestionConfirmationState(isConfirmed, shouldFocus = false) {
		const actions = document.querySelector('[data-question-confirm-actions]');
		if (!actions) return;

		const draftState = actions.querySelector('[data-question-confirm-state="draft"]');
		const confirmedState = actions.querySelector('[data-question-confirm-state="confirmed"]');
		if (!draftState || !confirmedState) return;

		actions.dataset.confirmed = String(isConfirmed);
		draftState.hidden = isConfirmed;
		confirmedState.hidden = !isConfirmed;

		if (!shouldFocus) return;
		const focusTarget = isConfirmed
			? confirmedState.querySelector('[data-modal-open="workspaceDepartmentNotificationModal"]')
			: draftState.querySelector('[data-modal-open="workspaceQuestionConfirmModal"]');
		focusTarget?.focus();
	}

	function enhanceSidebar(host) {
		const sidebar = host.querySelector('.app-sidebar');
		if (!sidebar || sidebar.dataset.workspaceReady === 'true') return;

		sidebar.dataset.workspaceReady = 'true';
		const workspace = sidebar.closest('.workspace-app');
		const collapseButton = sidebar.querySelector('#sidebarCollapseBtn');
		const brandButton = sidebar.querySelector('#sidebarBrandButton');
		const setCollapsed = isCollapsed => {
			sidebar.classList.toggle('collapsed', isCollapsed);
			workspace?.classList.toggle('sidebar-collapsed', isCollapsed);
			collapseButton?.setAttribute('aria-expanded', String(!isCollapsed));
			if (brandButton) {
				const label = isCollapsed ? '사이드바 펼치기' : 'AI-ONE 홈';
				brandButton.setAttribute('aria-label', label);
				brandButton.title = label;
			}
		};

		setCollapsed(false);
		sidebar.querySelectorAll('.nav-link').forEach(link => {
			link.classList.toggle('active', link.dataset.page === 'intake');
			if (link.getAttribute('aria-disabled') === 'true') {
				link.addEventListener('click', event => event.preventDefault());
			}
		});

		collapseButton?.addEventListener('click', () => {
			setCollapsed(!sidebar.classList.contains('collapsed'));
		});
		brandButton?.addEventListener('click', () => {
			if (sidebar.classList.contains('collapsed')) {
				setCollapsed(false);
				return;
			}
			showToast('AI-ONE 홈 메뉴입니다.');
		});
	}

	function enhanceTopbar(host) {
		const topbar = host.querySelector('.app-topbar');
		if (!topbar || topbar.dataset.workspaceReady === 'true') return;

		topbar.dataset.workspaceReady = 'true';
		topbar.querySelector('[data-topbar-title]').textContent = '국회질의분류 AI 워크스페이스';
		topbar.querySelector('[data-topbar-subtitle]').textContent = '질의 업로드 · OCR/파싱 · 질의 분류 · 추천실국 확인';

		hydrateIcons(topbar);
		syncFullscreenButton();
	}

	function initFileUpload(host) {
		const zone = host.querySelector('[data-file-upload-zone]');
		const input = zone?.querySelector('input[type="file"]');
		if (!zone || !input || zone.dataset.workspaceReady === 'true') return;

		zone.dataset.workspaceReady = 'true';
		const announceFiles = files => {
			const count = Array.from(files || []).length;
			if (count) showToast(`${count}개 파일을 업로드 목록에 추가했습니다.`);
		};

		zone.addEventListener('click', event => {
			if (event.target !== input) input.click();
		});
		zone.addEventListener('keydown', event => {
			if (!['Enter', ' '].includes(event.key)) return;
			event.preventDefault();
			input.click();
		});
		input.addEventListener('change', () => {
			announceFiles(input.files);
			input.value = '';
		});
		zone.addEventListener('dragover', event => {
			event.preventDefault();
			zone.classList.add('dragover');
		});
		zone.addEventListener('dragleave', event => {
			if (!event.relatedTarget || !zone.contains(event.relatedTarget)) {
				zone.classList.remove('dragover');
			}
		});
		zone.addEventListener('drop', event => {
			event.preventDefault();
			zone.classList.remove('dragover');
			announceFiles(event.dataTransfer?.files);
		});
	}

	function getPanelSlots(container) {
		return Array.from(container?.children || [])
			.filter(element => element.hasAttribute('data-panel-slot'));
	}

	function getPanelHandles(container) {
		return Array.from(container?.children || [])
			.filter(element => element.classList.contains('panel-resize-handle'));
	}

	function readPanelWidths(container) {
		return new Map(getPanelSlots(container).map(panel => [
			panel,
			Math.round(panel.getBoundingClientRect().width)
		]));
	}

	function createPanelColumns(panels, widths) {
		return panels
			.flatMap((panel, index) => (
				index < panels.length - 1
					? [`${Math.round(widths.get(panel))}px`, `${panelHandleWidth}px`]
					: [`${Math.round(widths.get(panel))}px`]
			))
			.join(' ');
	}

	function syncPanelHandleAria(container) {
		const panels = getPanelSlots(container);
		const handles = getPanelHandles(container);
		handles.forEach((handle, index) => {
			const leftPanel = panels[index];
			const rightPanel = panels[index + 1];
			if (!leftPanel || !rightPanel) return;

			const leftWidth = Math.round(leftPanel.getBoundingClientRect().width);
			const adjacentWidth = leftWidth + Math.round(rightPanel.getBoundingClientRect().width);
			const minimum = Math.min(panelMinWidth, Math.floor(adjacentWidth / 2));
			handle.setAttribute('aria-valuemin', String(minimum));
			handle.setAttribute('aria-valuemax', String(Math.max(minimum, adjacentWidth - minimum)));
			handle.setAttribute('aria-valuenow', String(leftWidth));
		});
	}

	function applyPanelWidths(container, widths) {
		const panels = getPanelSlots(container);
		if (!panels.length || panels.some(panel => !Number.isFinite(widths.get(panel)))) return;

		container.style.gridTemplateColumns = createPanelColumns(panels, widths);
		syncPanelHandleAria(container);
	}

	function rebuildPanelOrder(container, panels) {
		const handles = getPanelHandles(container);
		container.replaceChildren();
		panels.forEach((panel, index) => {
			container.append(panel);
			if (index < panels.length - 1 && handles[index]) container.append(handles[index]);
		});
	}

	function movePanel(container, panel, targetPanel) {
		const panels = getPanelSlots(container);
		const sourceIndex = panels.indexOf(panel);
		const targetIndex = panels.indexOf(targetPanel);
		if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return false;

		clearPanelSwitchSelection(container);
		const widths = readPanelWidths(container);
		panels.splice(sourceIndex, 1);
		panels.splice(targetIndex, 0, panel);
		rebuildPanelOrder(container, panels);
		applyPanelWidths(container, widths);
		return true;
	}

	function clearPanelSwitchSelection(container) {
		getPanelSlots(container).forEach(panel => {
			panel.classList.remove('panel-switch-source');
			panel.querySelector('.panel-title[role="button"]')?.setAttribute('aria-pressed', 'false');
		});
	}

	function swapPanelPositions(container, firstPanel, secondPanel) {
		const panels = getPanelSlots(container);
		const firstIndex = panels.indexOf(firstPanel);
		const secondIndex = panels.indexOf(secondPanel);
		if (firstIndex < 0 || secondIndex < 0 || firstIndex === secondIndex) return false;

		const widths = readPanelWidths(container);
		[panels[firstIndex], panels[secondIndex]] = [panels[secondIndex], panels[firstIndex]];
		rebuildPanelOrder(container, panels);
		applyPanelWidths(container, widths);
		return true;
	}

	function rotatePanelLayout() {
		const container = document.querySelector('.three-panel[data-workspace-panels-ready="true"]');
		if (!container) return false;

		const panels = getPanelSlots(container);
		if (panels.length < 2) return false;

		clearPanelSwitchSelection(container);
		const widths = readPanelWidths(container);
		panels.push(panels.shift());
		rebuildPanelOrder(container, panels);
		applyPanelWidths(container, widths);
		return true;
	}

	function resetPanelLayout() {
		const container = document.querySelector('.three-panel[data-workspace-panels-ready="true"]');
		const state = container && panelStates.get(container);
		if (!container || !state) return false;

		clearPanelSwitchSelection(container);
		state.initialOrder.forEach(panel => {
			panel.classList.remove('drag-over');
			panel.style.removeProperty('opacity');
			panel.querySelector('.panel-component')?.classList.remove('panel-collapsed');
		});
		rebuildPanelOrder(container, state.initialOrder);
		container.style.removeProperty('grid-template-columns');
		window.requestAnimationFrame(() => syncPanelHandleAria(container));
		return true;
	}

	function bindPanelResize(container) {
		container.addEventListener('mousedown', event => {
			const handle = event.target.closest('.panel-resize-handle');
			if (!handle || handle.parentElement !== container) return;

			const handleIndex = getPanelHandles(container).indexOf(handle);
			const panels = getPanelSlots(container);
			const leftPanel = panels[handleIndex];
			const rightPanel = panels[handleIndex + 1];
			if (handleIndex < 0 || !leftPanel || !rightPanel) return;

			event.preventDefault();
			const startX = event.clientX;
			const startWidths = readPanelWidths(container);
			const startLeftWidth = startWidths.get(leftPanel);
			const adjacentWidth = startLeftWidth + startWidths.get(rightPanel);
			const minimum = Math.min(panelMinWidth, Math.floor(adjacentWidth / 2));
			handle.classList.add('active');
			document.body.style.cursor = 'col-resize';
			document.body.style.userSelect = 'none';

			const onMouseMove = moveEvent => {
				const requestedLeftWidth = startLeftWidth + moveEvent.clientX - startX;
				const leftWidth = Math.min(Math.max(Math.round(requestedLeftWidth), minimum), adjacentWidth - minimum);
				const widths = new Map(startWidths);
				widths.set(leftPanel, leftWidth);
				widths.set(rightPanel, adjacentWidth - leftWidth);
				applyPanelWidths(container, widths);
			};

			const onMouseUp = () => {
				handle.classList.remove('active');
				document.body.style.cursor = '';
				document.body.style.userSelect = '';
				document.removeEventListener('mousemove', onMouseMove);
				document.removeEventListener('mouseup', onMouseUp);
			};

			document.addEventListener('mousemove', onMouseMove);
			document.addEventListener('mouseup', onMouseUp);
		});

		container.addEventListener('keydown', event => {
			const handle = event.target.closest('.panel-resize-handle');
			if (!handle || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;

			const handleIndex = getPanelHandles(container).indexOf(handle);
			const panels = getPanelSlots(container);
			const leftPanel = panels[handleIndex];
			const rightPanel = panels[handleIndex + 1];
			if (handleIndex < 0 || !leftPanel || !rightPanel) return;

			event.preventDefault();
			const widths = readPanelWidths(container);
			const leftWidth = widths.get(leftPanel);
			const adjacentWidth = leftWidth + widths.get(rightPanel);
			const minimum = Math.min(panelMinWidth, Math.floor(adjacentWidth / 2));
			const difference = (event.key === 'ArrowRight' ? 1 : -1) * (event.shiftKey ? 32 : 16);
			const nextLeftWidth = Math.min(Math.max(leftWidth + difference, minimum), adjacentWidth - minimum);
			widths.set(leftPanel, nextLeftWidth);
			widths.set(rightPanel, adjacentWidth - nextLeftWidth);
			applyPanelWidths(container, widths);
		});
	}

	function bindPanelDragDrop(container) {
		getPanelSlots(container).forEach(panel => {
			const head = panel.querySelector('.panel-head');
			if (!head) return;

			head.style.cursor = 'grab';
			head.style.touchAction = 'none';
			head.querySelectorAll('button, input, select, textarea, a, [contenteditable]')
				.forEach(element => element.setAttribute('draggable', 'false'));

			head.addEventListener('pointerdown', event => {
				if (event.button !== 0
					|| event.target.closest('button, input, select, textarea, a, [contenteditable]')) return;

				const pointerId = event.pointerId;
				const startX = event.clientX;
				const startY = event.clientY;
				let isDragging = false;
				let targetPanel = null;

				const clearDragState = () => {
					panel.style.removeProperty('opacity');
					head.style.cursor = 'grab';
					document.body.style.userSelect = '';
					getPanelSlots(container).forEach(item => item.classList.remove('drag-over'));
				};

				const onPointerMove = moveEvent => {
					if (moveEvent.pointerId !== pointerId) return;
					if (!isDragging
						&& Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) < 6) return;

					isDragging = true;
					moveEvent.preventDefault();
					panel.style.opacity = '0.5';
					head.style.cursor = 'grabbing';
					document.body.style.userSelect = 'none';

					const hoveredPanel = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY)
						?.closest('[data-panel-slot]');
					targetPanel = hoveredPanel?.parentElement === container && hoveredPanel !== panel
						? hoveredPanel
						: null;
					getPanelSlots(container)
						.forEach(item => item.classList.toggle('drag-over', item === targetPanel));
				};

			const onPointerUp = upEvent => {
					if (upEvent.pointerId !== pointerId) return;
					document.removeEventListener('pointermove', onPointerMove);
					document.removeEventListener('pointerup', onPointerUp);
					document.removeEventListener('pointercancel', onPointerUp);

					if (isDragging) {
						head.dataset.suppressPanelSwitchClick = 'true';
						window.setTimeout(() => delete head.dataset.suppressPanelSwitchClick, 0);
					}
					const dropTarget = targetPanel;
					clearDragState();
					if (isDragging && dropTarget && movePanel(container, panel, dropTarget)) {
						showToast('패널 순서가 변경되었습니다.');
					}
				};

				document.addEventListener('pointermove', onPointerMove, { passive: false });
				document.addEventListener('pointerup', onPointerUp);
				document.addEventListener('pointercancel', onPointerUp);
			});
		});
	}

	function bindPanelHeaderSwitch(container) {
		getPanelSlots(container).forEach(panel => {
			const head = panel.querySelector('.panel-head');
			const title = head?.querySelector('.panel-title');
			if (!head || !title || head.dataset.panelSwitchReady === 'true') return;

			head.dataset.panelSwitchReady = 'true';
			title.setAttribute('role', 'button');
			title.setAttribute('tabindex', '0');
			title.setAttribute('aria-pressed', 'false');
			title.setAttribute('aria-label', `${title.textContent.trim()} 패널 위치 교환`);
			title.title = '클릭한 뒤 다른 패널 헤더를 클릭하면 위치가 교환됩니다.';

			const activate = event => {
				if (event.target.closest('button, input, select, textarea, a, [contenteditable]')) return;
				if (head.dataset.suppressPanelSwitchClick === 'true') {
					delete head.dataset.suppressPanelSwitchClick;
					return;
				}

				const selectedPanel = getPanelSlots(container)
					.find(item => item.classList.contains('panel-switch-source'));
				if (!selectedPanel) {
					panel.classList.add('panel-switch-source');
					title.setAttribute('aria-pressed', 'true');
					showToast('위치를 바꿀 다른 패널 헤더를 선택해 주세요.');
					return;
				}

				if (selectedPanel === panel) {
					clearPanelSwitchSelection(container);
					showToast('패널 위치 교환 선택을 취소했습니다.');
					return;
				}

				if (swapPanelPositions(container, selectedPanel, panel)) {
					clearPanelSwitchSelection(container);
					showToast('선택한 두 패널의 위치를 교환했습니다.');
				}
			};

			head.addEventListener('click', activate);
			title.addEventListener('keydown', event => {
				if (!['Enter', ' '].includes(event.key)) return;
				event.preventDefault();
				activate(event);
			});
		});
	}

	function initWorkspacePanels(host) {
		const container = host.querySelector('.three-panel');
		if (!container || container.dataset.workspacePanelsReady === 'true') return;

		const panels = Array.from(container.children)
			.filter(element => element.hasAttribute('data-slot'));
		if (panels.length < 2) return;

		panels.forEach((panel, index) => {
			panel.dataset.panelSlot = panel.dataset.slot || `panel-${index}`;
			panel.dataset.panelInitialIndex = String(index);
		});
		panelStates.set(container, { initialOrder: panels.slice() });
		container.dataset.workspacePanelsReady = 'true';
		bindPanelResize(container);
		bindPanelDragDrop(container);
		bindPanelHeaderSwitch(container);
		syncPanelHandleAria(container);
	}

	function sortFileItems(list) {
		const items = Array.from(list.querySelectorAll(':scope > li[data-file-idx]'));
		items
			.sort((a, b) => (
				Number(b.classList.contains('pinned')) - Number(a.classList.contains('pinned'))
				|| Number(a.dataset.fileInitialIndex) - Number(b.dataset.fileInitialIndex)
			))
			.forEach(item => list.append(item));
	}

	function syncPinnedFileItem(item, isPinned) {
		item.classList.toggle('pinned', isPinned);
		const pinButton = item.querySelector('[data-menu-value="pin"]');
		if (pinButton) {
			pinButton.textContent = isPinned ? '목록 고정 해제' : '목록 고정';
			pinButton.setAttribute('aria-pressed', String(isPinned));
		}

		const meta = item.querySelector('.file-meta');
		if (meta) {
			meta.dataset.fileMetaBase ||= meta.textContent.replace(/\s*·\s*목록 고정$/, '').trim();
			meta.textContent = `${meta.dataset.fileMetaBase}${isPinned ? ' · 목록 고정' : ''}`;
		}
	}

	function initFileActionMenus(root = document) {
		const list = root.querySelector?.('.workspace-file-list')
			|| (root.matches?.('.workspace-file-list') ? root : null);
		if (!list) return;

		list.querySelectorAll(':scope > li[data-file-idx]').forEach((item, index) => {
			item.dataset.fileInitialIndex ||= String(index);
			if (item.dataset.fileActionsReady === 'true') return;

			const trigger = item.querySelector('.file-item-side > .file-more-btn');
			if (!trigger) return;

			const menuId = `workspaceFileMenu-${item.dataset.fileIdx || index}`;
			const actionWrap = document.createElement('span');
			actionWrap.className = 'file-action-wrap dropdown-menu-component';
			actionWrap.dataset.dropdownMenu = '';

			trigger.dataset.dropdownTrigger = '';
			trigger.setAttribute('aria-haspopup', 'menu');
			trigger.setAttribute('aria-expanded', 'false');
			trigger.setAttribute('aria-controls', menuId);
			trigger.title = '파일 옵션';

			const menu = document.createElement('span');
			menu.className = 'dropdown-menu dropdown-menu-compact';
			menu.id = menuId;
			menu.dataset.placement = 'bottom-end';
			menu.setAttribute('role', 'menu');
			menu.hidden = true;
			menu.innerHTML = `
				<button type="button" class="dropdown-menu-item" role="menuitem"
					data-menu-value="pin" aria-pressed="false">목록 고정</button>
				<button type="button" class="dropdown-menu-item danger" role="menuitem"
					data-menu-value="delete" data-modal-open="workspaceFileDeleteModal">삭제</button>
			`;

			trigger.replaceWith(actionWrap);
			actionWrap.append(trigger, menu);
			item.dataset.fileActionsReady = 'true';
			syncPinnedFileItem(item, item.classList.contains('pinned'));
		});

		window.AIOneDropdownMenu?.init(list);
	}

	function prepareFileDelete(item) {
		pendingDeleteFileItem = item;
		const fileName = item.querySelector('.file-name')?.textContent.trim() || '선택한 파일';
		const modalFileName = document.querySelector('[data-delete-file-name]');
		if (modalFileName) modalFileName.textContent = fileName;
	}

	function deletePendingFile() {
		const item = pendingDeleteFileItem;
		if (!item?.isConnected) return;

		const list = item.closest('.workspace-file-list');
		const wasActive = item.classList.contains('active');
		item.remove();
		if (wasActive) list?.querySelector('li[data-file-idx]')?.classList.add('active');

		const summaryCount = document.querySelector('.upload-summary-value strong');
		const currentCount = Number(summaryCount?.textContent);
		if (summaryCount && Number.isFinite(currentCount)) {
			summaryCount.textContent = String(Math.max(0, currentCount - 1));
		}
		showToast('파일이 삭제되었습니다.');
	}

	function enhanceProgressbar(host) {
		const progressbar = host.querySelector('[data-progressbar]');
		if (!progressbar) return;
		const value = progressbar.getAttribute('aria-valuenow') || progressbar.dataset.value || '0';
		progressbar.setAttribute('aria-label', `신뢰도 ${value}%`);
	}

	function renderQuestionCards(root = document) {
		const list = root.querySelector?.('[data-query-card-list]')
			|| (root.matches?.('[data-query-card-list]') ? root : null);
		if (!list) return;

		window.AIOneQueryCard?.renderList(list, workspaceQuestionCards);
	}

	function selectQuestion(question) {
		const questions = Array.from(document.querySelectorAll(questionSelector));
		if (!question || !questions.includes(question)) return;

		questions.forEach(item => item.classList.toggle('is-selected', item === question));
		document.querySelectorAll('.query-card').forEach(card => {
			card.classList.toggle('is-selected', card.dataset.qid === question.dataset.questionIndex);
		});
		document.querySelector('[data-result-original]').textContent = question.dataset.original;
		document.querySelector('[data-result-summary]').textContent = question.dataset.summary;
		document.querySelector('[data-result-department]').textContent = question.dataset.department;

		const locationCard = document.querySelector('.source-location-card');
		locationCard.querySelector('small').textContent = `1페이지 · 문단 ${question.dataset.questionIndex}`;
		locationCard.querySelector('p').textContent = `“${question.dataset.original}”`;

		const confidenceHost = document.querySelector('.inspector-confidence');
		const progressbar = confidenceHost?.querySelector('[data-progressbar]');
		if (progressbar) {
			window.AIOneProgressBar?.setValue(progressbar, question.dataset.confidence);
			progressbar.setAttribute('aria-label', `신뢰도 ${question.dataset.confidence}%`);
		}

		const index = questions.indexOf(question);
		document.querySelector('[data-question-move="-1"]').disabled = index === 0;
		document.querySelector('[data-question-move="1"]').disabled = index === questions.length - 1;
		document.querySelector('.comparison-meta strong').textContent = `문장 ${index + 1} / ${questions.length} 선택됨`;
	}

	function moveQuestion(direction) {
		const questions = Array.from(document.querySelectorAll(questionSelector));
		const selectedIndex = questions.findIndex(question => question.classList.contains('is-selected'));
		const nextIndex = Math.min(questions.length - 1, Math.max(0, selectedIndex + direction));
		if (nextIndex !== selectedIndex) selectQuestion(questions[nextIndex]);
	}

	async function copyResult(type) {
		const source = document.querySelector(type === 'summary' ? '[data-result-summary]' : '[data-result-original]');
		const text = source?.textContent?.trim();
		if (!text) return;

		try {
			await navigator.clipboard.writeText(text);
		} catch (error) {
			const textarea = document.createElement('textarea');
			textarea.value = text;
			textarea.setAttribute('readonly', '');
			textarea.style.position = 'fixed';
			textarea.style.opacity = '0';
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			textarea.remove();
		}
		showToast('선택한 문장을 복사했습니다.');
	}

	function filterQuestions(filter) {
		document.querySelectorAll('.filter-btn').forEach(button => {
			const selected = button.dataset.filter === filter;
			button.classList.toggle('active', selected);
			button.setAttribute('aria-pressed', String(selected));
		});
		document.querySelectorAll('.query-card').forEach(card => {
			card.hidden = filter !== 'all' && card.dataset.scope !== filter;
		});
	}

	function syncFullscreenButton() {
		const button = document.getElementById('fullscreenBtn');
		if (!button) return;

		const isFullscreen = Boolean(document.fullscreenElement);
		button.setAttribute('aria-label', isFullscreen ? '전체화면 종료' : '전체화면');
		button.title = isFullscreen ? '전체화면 종료' : '전체화면';
		button.querySelector('.fullscreen-expand')?.classList.toggle('hidden', isFullscreen);
		button.querySelector('.fullscreen-shrink')?.classList.toggle('hidden', !isFullscreen);
	}

	async function toggleFullscreen() {
		try {
			if (document.fullscreenElement) await document.exitFullscreen();
			else await document.documentElement.requestFullscreen();
		} catch (error) {
			showToast('이 브라우저에서는 전체화면을 사용할 수 없습니다.');
		}
	}

	function setWorkspaceEmptyState(isEmpty) {
		document.body.classList.toggle('is-new-workspace', isEmpty);
		document.querySelectorAll('[data-workspace-empty]').forEach(emptyState => {
			emptyState.hidden = !isEmpty;
		});

		const fileInput = document.getElementById('workspaceFileInput');
		if (fileInput) fileInput.value = '';

		const fileCount = document.querySelector('.upload-summary-value strong');
		if (fileCount) fileCount.textContent = isEmpty ? '0' : '24';

		const filterCounts = { all: 5, single: 2, multi: 2, none: 1 };
		document.querySelectorAll('.filter-btn[data-filter]').forEach(button => {
			const count = button.querySelector('.filter-count');
			if (count) count.textContent = isEmpty ? '0' : String(filterCounts[button.dataset.filter] || 0);
		});

		const sourceFile = document.querySelector('.source-file-chip');
		if (sourceFile) sourceFile.textContent = isEmpty
			? '파일을 선택하세요'
			: '예산결산위_질의서_2026-0315.pdf';

		const extractCount = document.querySelector('.extract-count strong');
		if (extractCount) extractCount.textContent = isEmpty ? '0건' : '5건';

		const selectionCount = document.querySelector('.comparison-meta strong');
		if (selectionCount) selectionCount.textContent = isEmpty ? '문장 0 / 0 선택됨' : '문장 1 / 5 선택됨';

		const characterCount = document.querySelector('[data-character-count]');
		if (characterCount) characterCount.textContent = isEmpty ? '0' : '293';

		const pageCount = document.querySelector('[data-page-count]');
		if (pageCount) pageCount.textContent = '1/1';

		const zoomValue = document.querySelector('.zoom-control > strong');
		if (zoomValue) zoomValue.textContent = '100%';

		setQuestionConfirmationState(false);
		filterQuestions('all');
	}

	function startNewQuestionClassification() {
		pendingDeleteFileItem = null;
		setWorkspaceEmptyState(true);
		showToast('새 질의분류를 시작합니다. 파일과 질의 분류 결과가 초기화되었습니다.');
	}

	function resetWorkspace() {
		setWorkspaceEmptyState(false);
		resetPanelLayout();
		renderQuestionCards();
		filterQuestions('all');
		document.querySelectorAll('.query-card').forEach((card, index) => {
			card.classList.toggle('is-selected', index === 0);
		});
		const firstQuestion = document.querySelector(questionSelector);
		if (firstQuestion) selectQuestion(firstQuestion);
		showToast('워크스페이스 표시 상태를 초기화했습니다.');
	}

	document.addEventListener('component:ready', event => {
		hydrateIcons(event.target);
		const name = event.detail?.name;
		if (name === 'sidebar') enhanceSidebar(event.target);
		if (name === 'topbar') enhanceTopbar(event.target);
		if (name === 'file-upload') initFileUpload(event.target);
		if (name === 'progressbar') enhanceProgressbar(event.target);
		if (name === 'panel') initFileActionMenus(event.target);
		if (name === 'three-panel') {
			initWorkspacePanels(event.target);
			initFileActionMenus(event.target);
			renderQuestionCards(event.target);
		}
	});

	document.addEventListener('query-card:select', event => {
		const question = document.querySelector(
			`${questionSelector}[data-question-index="${event.detail?.id}"]`
		);
		if (question) selectQuestion(question);
	});

	document.addEventListener('query-card:edit', () => {
		showToast('선택한 질의 수정 화면을 준비했습니다.');
	});

	document.addEventListener('dropdownmenu:select', event => {
		const item = event.target.closest('.workspace-file-list li[data-file-idx]');
		if (!item) return;

		if (event.detail?.value === 'pin') {
			const isPinned = !item.classList.contains('pinned');
			syncPinnedFileItem(item, isPinned);
			sortFileItems(item.closest('.workspace-file-list'));
			showToast(isPinned ? '파일을 목록 상단에 고정했습니다.' : '파일 고정을 해제했습니다.');
		}
		if (event.detail?.value === 'delete') prepareFileDelete(item);
	});

	document.addEventListener('modal:close', event => {
		if (event.target.id === 'workspaceFileDeleteModal') pendingDeleteFileItem = null;
	});

	document.addEventListener('click', event => {
		const deleteConfirmButton = event.target.closest('[data-workspace-confirm="delete-file"]');
		if (deleteConfirmButton) {
			deletePendingFile();
			return;
		}

		const questionConfirmButton = event.target.closest('[data-workspace-confirm="question-classification"]');
		if (questionConfirmButton) {
			showToast('질의 및 추천 실국을 확정했습니다.');
			window.setTimeout(() => setQuestionConfirmationState(true, true), 0);
			return;
		}

		const notificationConfirmButton = event.target.closest('[data-workspace-confirm="department-notification"]');
		if (notificationConfirmButton) {
			showToast('실국담당자에게 알림을 전송했습니다.');
			return;
		}

		const questionConfirmCancelButton = event.target.closest('[data-question-confirm-cancel]');
		if (questionConfirmCancelButton) {
			setQuestionConfirmationState(false, true);
			showToast('질의 확정을 취소했습니다.');
			return;
		}

		const filterButton = event.target.closest('.filter-btn');
		if (filterButton) {
			filterQuestions(filterButton.dataset.filter);
			return;
		}

		const question = event.target.closest(questionSelector);
		if (question) {
			selectQuestion(question);
			return;
		}

		const fileButton = event.target.closest('.workspace-file-list .file-item-main');
		if (fileButton) {
			document.querySelectorAll('.workspace-file-list li').forEach(item => {
				item.classList.toggle('active', item === fileButton.closest('li'));
			});
			return;
		}

		const copyButton = event.target.closest('[data-copy-target]');
		if (copyButton) {
			copyResult(copyButton.dataset.copyTarget);
			return;
		}

		const moveButton = event.target.closest('[data-question-move]');
		if (moveButton && !moveButton.disabled) {
			moveQuestion(Number(moveButton.dataset.questionMove));
			return;
		}

		const actionButton = event.target.closest(
			'[data-workspace-action], #runDrawerBtn, #ruleManageBtn, #panelSwapBtn, #layoutResetBtn, #resetBtn, #fullscreenBtn'
		);
		if (!actionButton) return;

		if (actionButton.id === 'layoutResetBtn') {
			if (resetPanelLayout()) showToast('레이아웃이 기본값으로 초기화되었습니다.');
			return;
		}

		if (actionButton.id === 'resetBtn') {
			resetWorkspace();
			return;
		}

		if (actionButton.id === 'fullscreenBtn') {
			toggleFullscreen();
			return;
		}

		if (actionButton.id === 'panelSwapBtn') {
			if (rotatePanelLayout()) showToast('패널 위치가 변경되었습니다.');
			return;
		}

		if (actionButton.dataset.workspaceAction === 'new-question') {
			startNewQuestionClassification();
			return;
		}

		const messages = {
			download: '질의목록 다운로드를 준비했습니다.',
			edit: '선택한 질의 수정 화면을 준비했습니다.',
			runDrawerBtn: '실행 목록을 열었습니다.',
			ruleManageBtn: '룰 설정을 열었습니다.'
		};
		showToast(messages[actionButton.dataset.workspaceAction || actionButton.id] || '기능을 선택했습니다.');
	});

	document.addEventListener('DOMContentLoaded', () => {
		hydrateIcons();
		initFileActionMenus();
		document.addEventListener('fullscreenchange', syncFullscreenButton);
	});
})();
