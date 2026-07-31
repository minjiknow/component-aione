(() => {
	'use strict';

	let initialized = false;
	let activeTab = 'recommend';
	const pendingWorkspaceTasks = new Set();
	const chatMessageActions = Object.freeze([
		{ action: 'like', label: '좋아요', icon: 'thumbs-up', pressed: true },
		{ action: 'dislike', label: '싫어요', icon: 'thumbs-down', pressed: true },
		{ action: 'retry', label: '다시 생성', icon: 'regenerate' },
		{ action: 'copy', label: '복사', icon: 'copy' }
	]);

	const requiredSelectors = [
		'.answer-workspace-app',
		'.answer-three-panel-host > .three-panel',
		'.answer-workspace-page .app-sidebar',
		'.answer-workspace-page .app-topbar',
		'.answer-upload-component [data-file-upload-zone]',
		'#answerChatMessages',
		'#answerChatListSidepop[data-sidepop]',
		'#answerPageToast'
	];

	function allComponentsReady() {
		return requiredSelectors.every(selector => document.querySelector(selector));
	}

	function showToast(message) {
		window.AIOneToast?.show(message, {
			target: '#answerPageToast',
			duration: 1800
		});
	}

	function scheduleWorkspaceTask(callback, delay) {
		const taskId = window.setTimeout(() => {
			pendingWorkspaceTasks.delete(taskId);
			callback();
		}, delay);
		pendingWorkspaceTasks.add(taskId);
		return taskId;
	}

	function clearPendingWorkspaceTasks() {
		pendingWorkspaceTasks.forEach(taskId => window.clearTimeout(taskId));
		pendingWorkspaceTasks.clear();
	}

	function hydrateIcons(root = document) {
		root.querySelectorAll?.('img[data-icon]').forEach(icon => {
			if (icon.src) return;
			icon.src = new URL(`../assets/icons/${icon.dataset.icon}.svg`, document.baseURI).href;
		});
	}

	function configureTopbar() {
		const newChatButton = document.querySelector('#newClassifyBtn');
		const chatListButton = document.querySelector('#runDrawerBtn');
		const ruleButton = document.querySelector('#ruleManageBtn');
		const workspaceButton = document.querySelector('#notificationAssigneeBtn');

		if (newChatButton) {
			newChatButton.dataset.workspaceAction = 'new-chat';
		}

		if (chatListButton) {
			chatListButton.dataset.sidepopOpen = 'answerChatListSidepop';
			chatListButton.dataset.sidepopVariant = 'chat-list';
			chatListButton.setAttribute('aria-controls', 'answerChatListSidepop');
			chatListButton.setAttribute('aria-haspopup', 'dialog');
			chatListButton.setAttribute('aria-expanded', 'false');
		}

		if (ruleButton) ruleButton.hidden = true;
		if (workspaceButton) workspaceButton.hidden = true;
	}

	function setSidebarCollapsed(sidebar, isCollapsed) {
		const app = sidebar.closest('.answer-workspace-app');
		const collapseButton = sidebar.querySelector('#sidebarCollapseBtn');
		const brandButton = sidebar.querySelector('#sidebarBrandButton');

		sidebar.classList.toggle('collapsed', isCollapsed);
		app?.classList.toggle('sidebar-collapsed', isCollapsed);
		collapseButton?.setAttribute('aria-expanded', String(!isCollapsed));
		if (brandButton) {
			const label = isCollapsed ? '사이드바 펼치기' : 'AI-ONE 홈';
			brandButton.setAttribute('aria-label', label);
			brandButton.title = label;
		}
	}

	function initSidebar() {
		const sidebar = document.querySelector('.answer-workspace-page .app-sidebar');
		if (!sidebar) return;

		sidebar.querySelectorAll('.nav-link').forEach(link => {
			const isActive = link.dataset.page === 'answer';
			link.classList.toggle('active', isActive);
			if (isActive) link.setAttribute('aria-current', 'page');
			else link.removeAttribute('aria-current');
		});

		setSidebarCollapsed(sidebar, true);
		sidebar.querySelector('#sidebarCollapseBtn')?.addEventListener('click', () => {
			setSidebarCollapsed(sidebar, !sidebar.classList.contains('collapsed'));
		});
		sidebar.querySelector('#sidebarBrandButton')?.addEventListener('click', event => {
			if (!sidebar.classList.contains('collapsed')) return;
			event.preventDefault();
			setSidebarCollapsed(sidebar, false);
		});
	}

	function suspendPanelResizeLayout(layout) {
		if (!layout?.style.gridTemplateColumns) return;
		layout.dataset.answerGridTemplate = layout.style.gridTemplateColumns;
		layout.style.removeProperty('grid-template-columns');
		window.AIOneSplitHandler?.init(layout);
	}

	function restorePanelResizeLayout(layout) {
		const columns = layout?.dataset.answerGridTemplate;
		if (!layout || !columns) return;
		layout.style.gridTemplateColumns = columns;
		delete layout.dataset.answerGridTemplate;
		window.AIOneSplitHandler?.init(layout);
	}

	function resetPanelResizeLayout(layout) {
		if (!layout) return;
		delete layout.dataset.answerGridTemplate;
		window.AIOneSplitHandler?.reset(layout);
		document.querySelectorAll('[data-component="split-handler"]').forEach(split => {
			window.AIOneSplitHandler?.reset(split);
		});
	}

	function setActiveTab(tabName, shouldFocus = false) {
		const tabs = Array.from(document.querySelectorAll('[data-answer-tab]'));
		const panels = Array.from(document.querySelectorAll('[data-answer-panel]'));
		const layout = document.querySelector('.answer-three-panel-host > .three-panel');

		if (!tabs.some(tab => tab.dataset.answerTab === tabName)) return;
		activeTab = tabName;

		tabs.forEach(tab => {
			const isActive = tab.dataset.answerTab === tabName;
			tab.classList.toggle('active', isActive);
			tab.classList.toggle('is-active', isActive);
			tab.setAttribute('aria-selected', String(isActive));
			tab.tabIndex = isActive ? 0 : -1;
			if (isActive && shouldFocus) tab.focus();
		});
		panels.forEach(panel => {
			panel.hidden = panel.dataset.answerPanel !== tabName;
		});
		const activePanel = panels.find(panel => panel.dataset.answerPanel === tabName);
		window.requestAnimationFrame(() => window.AIOneSplitHandler?.init(activePanel));
		if (tabName === 'compare') {
			layout?.classList.remove('is-panel-swapped');
			suspendPanelResizeLayout(layout);
		} else if (!layout?.classList.contains('is-source-collapsed')) {
			restorePanelResizeLayout(layout);
		}
		layout?.classList.toggle('is-compare-mode', tabName === 'compare');
		window.AIOneSplitHandler?.init(layout);
	}

	function initTabs() {
		const tabs = Array.from(document.querySelectorAll('[data-answer-tab]'));
		tabs.forEach((tab, index) => {
			tab.addEventListener('click', () => setActiveTab(tab.dataset.answerTab));
			tab.addEventListener('keydown', event => {
				if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
				event.preventDefault();

				let nextIndex = index;
				if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
				if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
				if (event.key === 'Home') nextIndex = 0;
				if (event.key === 'End') nextIndex = tabs.length - 1;
				setActiveTab(tabs[nextIndex].dataset.answerTab, true);
			});
		});
		setActiveTab(activeTab);
	}

	function initCompareSections() {
		const sections = Array.from(document.querySelectorAll(
			'.compare-three-col > .cmp-col:not(.cmp-col-analysis)'
		));
		if (!sections.length) return;

		const selectSection = (selectedSection, shouldFocus = false) => {
			sections.forEach(section => {
				const isSelected = section === selectedSection;
				section.classList.toggle('compare-viewer-active', isSelected);
				if (isSelected) section.setAttribute('aria-current', 'true');
				else section.removeAttribute('aria-current');
			});
			if (shouldFocus) selectedSection.focus();
		};

		sections.forEach((section, index) => {
			section.tabIndex = 0;
			if (!section.getAttribute('aria-label')) {
				section.setAttribute('aria-label', section.querySelector('.cmp-col-title')?.textContent.trim() || `비교 섹션 ${index + 1}`);
			}
			section.addEventListener('click', () => selectSection(section));
			section.addEventListener('focusin', () => selectSection(section));
			section.addEventListener('keydown', event => {
				if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
				event.preventDefault();
				let nextIndex = index;
				if (event.key === 'ArrowLeft') nextIndex = (index - 1 + sections.length) % sections.length;
				if (event.key === 'ArrowRight') nextIndex = (index + 1) % sections.length;
				if (event.key === 'Home') nextIndex = 0;
				if (event.key === 'End') nextIndex = sections.length - 1;
				selectSection(sections[nextIndex], true);
			});
		});

		selectSection(sections[0]);
	}

	function setTabCount(tabName, count) {
		const countElement = document.querySelector(
			`[data-answer-tab="${tabName}"] .tab-count`
		);
		if (countElement) countElement.textContent = String(count);
	}

	function setReferenceFilterCounts(cards, isEmpty = false) {
		document.querySelectorAll('[data-reference-filter]').forEach(button => {
			const filter = button.dataset.referenceFilter;
			const count = isEmpty
				? 0
				: filter === 'all'
					? cards.length
					: cards.filter(card => card.dataset.category === filter).length;
			const countElement = button.querySelector('span');
			if (countElement) countElement.textContent = String(count);
		});
	}

	function setRecommendationEmptyState(isEmpty) {
		const results = document.querySelector('[data-answer-recommend-results]');
		const empty = document.querySelector('[data-answer-recommend-empty]');
		const status = document.querySelector('[data-answer-recommend-status]');
		const cards = Array.from(document.querySelectorAll('[data-reference-card]'));

		if (results) results.hidden = isEmpty;
		if (empty) empty.hidden = !isEmpty;
		if (status) status.hidden = isEmpty;
		setReferenceFilterCounts(cards, isEmpty);
		setTabCount('recommend', isEmpty ? 0 : cards.length);
	}

	function restoreRecommendationResults() {
		const cards = Array.from(document.querySelectorAll('[data-reference-card]'));
		document.body.classList.remove('is-new-chat');
		cards.forEach(card => {
			card.hidden = false;
		});
		setRecommendationEmptyState(false);
		if (cards[0]) selectReferenceCard(cards[0]);
	}

	function syncSourceFileState() {
		const list = document.querySelector('.answer-source-files');
		const count = document.querySelector('[data-source-file-count]');
		const emptyGuide = document.querySelector('[data-source-empty-guide]');
		const search = document.querySelector('.answer-source-search');
		const fileCount = list?.children.length || 0;

		if (count) count.textContent = String(fileCount);
		if (emptyGuide) emptyGuide.hidden = fileCount > 0;
		if (search) search.hidden = fileCount === 0;
	}

	function syncSelectedReferences(cards) {
		const selectedCards = cards.filter(card => card.querySelector('input[type="checkbox"]')?.checked);
		document.querySelectorAll('[data-selected-reference-count]').forEach(count => {
			count.textContent = String(selectedCards.length);
		});

		const list = document.querySelector('.selected-refs-list');
		if (list) {
			const items = document.createDocumentFragment();
			selectedCards.forEach(card => {
				const item = document.createElement('li');
				const score = document.createElement('span');
				const name = document.createElement('span');
				const removeButton = document.createElement('button');
				const cardIndex = cards.indexOf(card);
				const referenceName = card.querySelector('.rec-title')?.textContent.trim()
					|| card.dataset.title
					|| '선택한 관련자료';

				score.className = 'ref-score';
				score.textContent = `${card.dataset.score || 0}%`;
				name.className = 'ref-name';
				name.textContent = referenceName;
				removeButton.type = 'button';
				removeButton.className = 'ref-remove';
				removeButton.dataset.selectedReferenceRemove = '';
				removeButton.dataset.referenceIndex = String(cardIndex);
				removeButton.setAttribute('aria-label', `${referenceName} 선택 해제`);
				removeButton.textContent = '×';
				item.append(score, name, removeButton);
				items.append(item);
			});
			list.replaceChildren(items);
		}

		const emptyGuide = document.querySelector('[data-selected-references-empty]');
		const footer = document.querySelector('.selected-refs-footer');
		if (emptyGuide) emptyGuide.hidden = selectedCards.length > 0;
		if (footer) footer.hidden = selectedCards.length === 0;

		const selectAll = document.querySelector('[data-select-all-references]');
		if (selectAll) {
			selectAll.checked = cards.length > 0 && selectedCards.length === cards.length;
			selectAll.indeterminate = selectedCards.length > 0 && selectedCards.length < cards.length;
		}
	}

	function selectReferenceCard(card) {
		document.querySelectorAll('[data-reference-card]').forEach(item => {
			item.classList.toggle('active', item === card);
		});
		const previewTitle = document.querySelector('[data-preview-title]');
		const previewScore = document.querySelector('[data-preview-score]');
		if (previewTitle) previewTitle.textContent = card.dataset.title || '';
		if (previewScore) previewScore.textContent = `유사도 ${card.dataset.score || 0}%`;
	}

	function initReferences() {
		const cards = Array.from(document.querySelectorAll('[data-reference-card]'));
		cards.forEach(card => {
			card.addEventListener('click', event => {
				if (event.target.closest('input, label')) return;
				selectReferenceCard(card);
			});
			card.querySelector('input[type="checkbox"]')?.addEventListener('change', () => {
				syncSelectedReferences(cards);
				if (card.querySelector('input[type="checkbox"]').checked) selectReferenceCard(card);
			});
		});

		document.querySelector('[data-select-all-references]')?.addEventListener('change', event => {
			cards.forEach(card => {
				const checkbox = card.querySelector('input[type="checkbox"]');
				if (checkbox) checkbox.checked = event.target.checked;
			});
			syncSelectedReferences(cards);
		});

		document.querySelectorAll('[data-reference-filter]').forEach(button => {
			button.addEventListener('click', () => {
				const filter = button.dataset.referenceFilter;
				document.querySelectorAll('[data-reference-filter]').forEach(item => {
					const isActive = item === button;
					item.classList.toggle('active', isActive);
					item.setAttribute('aria-pressed', String(isActive));
				});
				cards.forEach(card => {
					card.hidden = filter !== 'all' && card.dataset.category !== filter;
				});
			});
		});

		document.querySelector('[data-apply-references]')?.addEventListener('click', event => {
			const button = event.currentTarget;
			const selectedCards = cards.filter(card => (
				card.querySelector('input[type="checkbox"]')?.checked
			));
			if (!selectedCards.length || button.dataset.applying === 'true') {
				if (!selectedCards.length) showToast('초안에 반영할 관련자료를 선택해 주세요.');
				return;
			}

			const selected = selectedCards.map(card => ({
				title: card.querySelector('.rec-title')?.textContent.trim()
					|| card.dataset.title
					|| '선택한 관련자료',
				score: card.dataset.score || '0'
			}));
			const messages = document.querySelector('#answerChatMessages');
			const prompt = `다음 자료를 참고하여 답변서 초안을 생성해주세요:\n${
				selected.map((reference, index) => (
					`${index + 1}. ${reference.title} (유사도 ${reference.score}%)`
				)).join('\n')
			}`;

			messages?.append(createChatMessage('user', prompt));
			const pending = window.ChatMessage?.createPending({
				variant: 'answer',
				title: '초안 생성 중',
				description: `${selected.length}건의 선택 자료를 분석하고 있습니다...`
			});
			if (pending) messages?.append(pending);

			button.dataset.applying = 'true';
			button.disabled = true;
			setTabCount('draft', 1);
			setActiveTab('draft');
			scrollChatToBottom();
			showToast(`${selected.length}건의 자료를 답변서 초안에 반영하고 있습니다.`);

			scheduleWorkspaceTask(() => {
				pending?.remove();
				messages?.append(createChatMessage(
					'ai',
					`선택하신 ${selected.length}건의 자료를 분석하여 답변서 초안에 반영합니다.\n\n` +
					`📋 반영 자료:\n${selected.map(reference => `• ${reference.title}`).join('\n')}\n\n` +
					'초안 생성을 시작합니다. "답변서 초안" 탭에서 결과를 확인하세요.'
				));
				delete button.dataset.applying;
				button.disabled = false;
				scrollChatToBottom();
				showToast('선택한 관련자료를 답변서 초안에 반영했습니다.');
			}, 800);
		});

		document.querySelector('.selected-refs-list')?.addEventListener('click', event => {
			const removeButton = event.target.closest('[data-selected-reference-remove]');
			if (!removeButton) return;
			const card = cards[Number(removeButton.dataset.referenceIndex)];
			const checkbox = card?.querySelector('input[type="checkbox"]');
			if (!checkbox) return;
			checkbox.checked = false;
			syncSelectedReferences(cards);
			showToast('선택한 관련자료를 해제했습니다.');
		});

		setReferenceFilterCounts(cards);
		syncSelectedReferences(cards);
	}

	function initSourceUpload() {
		const zone = document.querySelector('.answer-upload-component [data-file-upload-zone]');
		const list = document.querySelector('.answer-source-files');
		const count = document.querySelector('[data-source-file-count]');
		if (!zone || !list || !count) return;

		const getFileType = file => {
			const extension = String(file?.name || '').split('.').pop()?.toLowerCase();
			if (extension === 'pdf') return { type: 'pdf', label: 'PDF' };
			if (['hwp', 'hwpx'].includes(extension)) return { type: 'hwp', label: 'HWP' };
			if (extension === 'docx') return { type: 'docx', label: 'DOCX' };
			if (extension === 'txt') return { type: 'txt', label: 'TXT' };
			return { type: 'txt', label: 'FILE' };
		};

		const createFileItem = file => {
			const { type, label } = getFileType(file);
			const item = document.createElement('li');
			item.className = 'file-item-simple';

			const main = document.createElement('span');
			main.className = 'file-item-main';

			const dot = document.createElement('span');
			dot.className = `file-dot file-type-dot ${type} file-type-${type}`;
			dot.setAttribute('aria-hidden', 'true');

			const collapsedIcon = document.createElement('span');
			collapsedIcon.className = `file-icon file-icon-collapsed ${type}`;
			collapsedIcon.setAttribute('aria-hidden', 'true');
			collapsedIcon.textContent = label;

			const info = document.createElement('span');
			info.className = 'file-info';

			const name = document.createElement('span');
			name.className = 'file-name file-name-simple';
			name.textContent = file.name;
			name.title = file.name;

			const side = document.createElement('span');
			side.className = 'file-item-side';

			const state = document.createElement('span');
			state.className = 'file-status-badge done';
			state.textContent = '청킹 완료';

			const remove = document.createElement('button');
			remove.className = 'file-remove-simple';
			remove.type = 'button';
			remove.setAttribute('aria-label', `${file.name} 삭제`);
			remove.textContent = '×';

			info.append(name);
			main.append(dot, collapsedIcon, info);
			side.append(state, remove);
			item.append(main, side);
			return item;
		};

		zone.addEventListener('app:file-upload', event => {
			Array.from(event.detail?.files || []).forEach(file => {
				list.append(createFileItem(file));
			});
			syncSourceFileState();
			showToast('참조소스를 추가했습니다.');
		});

		list.addEventListener('fileitem:delete', () => {
			syncSourceFileState();
			showToast('참조소스를 삭제했습니다.');
		});

		document.querySelector('[data-source-reset]')?.addEventListener('click', () => {
			list.replaceChildren();
			syncSourceFileState();
			showToast('참조소스를 초기화했습니다.');
		});

		document.querySelector('[data-source-collapse]')?.addEventListener('click', () => {
			const panel = document.querySelector('.answer-source-panel');
			const button = document.querySelector('[data-source-collapse]');
			const collapsed = !panel.classList.contains('panel-collapsed');
			panel.classList.toggle('panel-collapsed', collapsed);
			panel.querySelector('.answer-source-file-section')?.classList.toggle('is-collapsed', collapsed);
			panel.closest('.three-panel')?.classList.toggle('is-source-collapsed', collapsed);
			if (collapsed) suspendPanelResizeLayout(panel.closest('.three-panel'));
			else restorePanelResizeLayout(panel.closest('.three-panel'));
			button?.setAttribute('aria-expanded', String(!collapsed));
			button?.setAttribute('aria-label', collapsed ? '참조소스 패널 펼치기' : '참조소스 패널 접기');
			if (button) button.title = collapsed ? '참조소스 패널 펼치기' : '참조소스 패널 접기';
			showToast(collapsed ? '참조소스 패널을 접었습니다.' : '참조소스 패널을 펼쳤습니다.');
		});

		document.querySelector('[data-source-file-add]')?.addEventListener('click', () => {
			document.querySelector('#answerSourceFileInput')?.click();
		});

		syncSourceFileState();
	}

	function initDocumentActions() {
		document.querySelector('[data-download-draft]')?.addEventListener('click', () => {
			const documentText = document.querySelector('.answer-draft-document')?.innerText.trim();
			if (!documentText) {
				showToast('다운로드할 답변서 초안이 없습니다.');
				return;
			}

			const blob = new Blob([documentText], { type: 'text/plain;charset=utf-8' });
			const url = URL.createObjectURL(blob);
			const link = Object.assign(document.createElement('a'), {
				href: url,
				download: '국회_답변서_초안_v1.0.txt'
			});
			document.body.append(link);
			link.click();
			link.remove();
			window.setTimeout(() => URL.revokeObjectURL(url), 0);
			showToast('답변서 초안을 다운로드했습니다.');
		});
	}

	function initDraftVerification() {
		const draftDocument = document.querySelector('.answer-draft-document');
		const highlightToggle = document.querySelector('[data-answer-highlight-toggle]');
		const sourceToggle = document.querySelector('[data-answer-source-toggle]');
		if (!draftDocument || !highlightToggle || !sourceToggle) return;

		const syncVerificationMode = () => {
			draftDocument.classList.toggle('is-highlight-hidden', !highlightToggle.checked);
			draftDocument.classList.toggle('is-source-hidden', !sourceToggle.checked);
		};

		highlightToggle.addEventListener('change', syncVerificationMode);
		sourceToggle.addEventListener('change', syncVerificationMode);
		syncVerificationMode();
	}

	function expandSourcePanel() {
		const layout = document.querySelector('.answer-three-panel-host > .three-panel');
		const panel = document.querySelector('.answer-source-panel');
		const button = document.querySelector('[data-source-collapse]');
		panel?.classList.remove('panel-collapsed');
		panel?.querySelector('.answer-source-file-section')?.classList.remove('is-collapsed');
		layout?.classList.remove('is-source-collapsed');
		restorePanelResizeLayout(layout);
		button?.setAttribute('aria-expanded', 'true');
		button?.setAttribute('aria-label', '참조소스 패널 접기');
		if (button) button.title = '참조소스 패널 접기';
	}

	function initPanelTools() {
		const layout = document.querySelector('.answer-three-panel-host > .three-panel');
		const swapButton = document.querySelector('#panelSwapBtn');
		const resetButton = document.querySelector('#layoutResetBtn');
		if (!layout || !swapButton || !resetButton) return;

		swapButton.addEventListener('click', () => {
			if (activeTab === 'compare') {
				showToast('답변서 비교 탭에서는 기본 패널 배치를 유지합니다.');
				return;
			}
			expandSourcePanel();
			const swapped = layout.classList.toggle('is-panel-swapped');
			window.AIOneSplitHandler?.init(layout);
			showToast(swapped ? '참조소스와 AI 채팅 위치를 변경했습니다.' : '패널 위치를 기본 순서로 되돌렸습니다.');
		});

		resetButton.addEventListener('click', () => {
			layout.classList.remove('is-panel-swapped');
			expandSourcePanel();
			resetPanelResizeLayout(layout);
			showToast('패널 레이아웃을 초기화했습니다.');
		});
	}

	function getCurrentTime() {
		return new Intl.DateTimeFormat('ko-KR', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		}).format(new Date());
	}

	function appendMultilineText(element, text) {
		String(text).split('\n').forEach((line, index) => {
			if (index > 0) element.append(document.createElement('br'));
			element.append(document.createTextNode(line));
		});
	}

	function createChatMessageActions() {
		const actions = document.createElement('div');
		actions.className = 'msg-actions';
		chatMessageActions.forEach(definition => {
			const button = document.createElement('button');
			const icon = document.createElement('img');

			button.type = 'button';
			button.className = 'icon-button icon-button-ghost icon-button-message msg-action-btn';
			button.dataset.action = definition.action;
			button.setAttribute('aria-label', definition.label);
			button.title = definition.label;
			if (definition.pressed) button.setAttribute('aria-pressed', 'false');

			icon.className = 'icon icon-small';
			icon.dataset.icon = definition.icon;
			icon.src = new URL(`../assets/icons/${definition.icon}.svg`, document.baseURI).href;
			icon.alt = '';
			icon.setAttribute('aria-hidden', 'true');
			button.append(icon);
			actions.append(button);
		});
		return actions;
	}

	function createChatMessage(role, text, time = getCurrentTime()) {
		const message = document.createElement('div');
		message.className = `chat-msg ${role}`;
		message.dataset.component = 'chat-message';
		message.dataset.variant = 'answer';
		message.dataset.role = role;
		message.dataset.status = 'complete';

		if (role === 'ai') {
			const avatar = document.createElement('div');
			avatar.className = 'msg-avatar';
			const icon = document.createElement('img');
			icon.src = new URL('../assets/icons/ai-search.svg', document.baseURI).href;
			icon.alt = '';
			icon.setAttribute('aria-hidden', 'true');
			avatar.append(icon);
			message.append(avatar);
		}

		const content = document.createElement('div');
		content.className = 'msg-text';
		appendMultilineText(content, text);
		const timestamp = document.createElement('span');
		timestamp.className = 'msg-time';
		timestamp.textContent = time;
		message.append(content, timestamp);
		if (role === 'ai') message.append(createChatMessageActions());
		return message;
	}

	function scrollChatToBottom() {
		const messages = document.querySelector('#answerChatMessages');
		if (messages) messages.scrollTop = messages.scrollHeight;
	}

	function initChat() {
		const messages = document.querySelector('#answerChatMessages');
		const form = document.querySelector('[data-answer-chat-form]');
		const input = document.querySelector('#answerChatInput');
		const submit = form?.querySelector('[type="submit"]');
		if (!messages || !form || !input || !submit) return;

		window.ChatMessage?.bind(messages, {
			onFeedback: () => showToast('피드백이 반영되었습니다.'),
			onCopy: ({ copied }) => showToast(copied ? '복사되었습니다.' : '복사하지 못했습니다.')
		});

		input.addEventListener('input', () => {
			submit.disabled = input.value.trim().length === 0;
		});
		form.addEventListener('submit', event => {
			event.preventDefault();
			const question = input.value.trim();
			if (!question) return;

			messages.append(createChatMessage('user', question));
			input.value = '';
			submit.disabled = true;

			const pending = window.ChatMessage?.createPending({
				variant: 'answer',
				title: '분석 중',
				description: '관련자료와 답변서 초안을 함께 확인하고 있습니다...'
			});
			if (pending) messages.append(pending);
			scrollChatToBottom();

			scheduleWorkspaceTask(() => {
				pending?.remove();
				restoreRecommendationResults();
				messages.append(createChatMessage(
					'ai',
					'요청하신 내용을 기준으로 관련자료와 답변서 초안을 갱신했습니다. 답변서 초안 탭에서 근거 문장과 확인 필요 항목을 검토해 주세요.'
				));
				scrollChatToBottom();
				showToast('AI 답변과 초안을 갱신했습니다.');
			}, 800);
		});

		document.querySelectorAll('.chat-tag').forEach(tag => {
			tag.addEventListener('click', () => {
				input.value = tag.textContent.trim();
				input.dispatchEvent(new Event('input', { bubbles: true }));
				input.focus();
			});
		});

		scrollChatToBottom();
	}

	function resetAnswerWorkspace() {
		clearPendingWorkspaceTasks();
		document.body.classList.add('is-new-chat');

		const layout = document.querySelector('.answer-three-panel-host > .three-panel');
		const sourceFiles = document.querySelector('.answer-source-files');
		const sourceInput = document.querySelector('#answerSourceFileInput');
		const sourceSearch = document.querySelector('.answer-source-search input');
		const cards = Array.from(document.querySelectorAll('[data-reference-card]'));
		const messages = document.querySelector('#answerChatMessages');
		const chatInput = document.querySelector('#answerChatInput');
		const chatSubmit = document.querySelector('[data-answer-chat-form] [type="submit"]');
		const applyButton = document.querySelector('[data-apply-references]');

		sourceFiles?.replaceChildren();
		if (sourceInput) sourceInput.value = '';
		if (sourceSearch) sourceSearch.value = '';
		syncSourceFileState();

		cards.forEach(card => {
			card.classList.remove('active');
			card.hidden = false;
			const checkbox = card.querySelector('input[type="checkbox"]');
			if (checkbox) checkbox.checked = false;
		});
		document.querySelectorAll('[data-reference-filter]').forEach(button => {
			const isAll = button.dataset.referenceFilter === 'all';
			button.classList.toggle('active', isAll);
			button.setAttribute('aria-pressed', String(isAll));
		});
		syncSelectedReferences(cards);
		setRecommendationEmptyState(true);
		setTabCount('draft', 0);
		setTabCount('compare', 0);

		if (applyButton) {
			delete applyButton.dataset.applying;
			applyButton.disabled = false;
		}

		document.querySelectorAll(
			'[data-answer-highlight-toggle], [data-answer-source-toggle]'
		).forEach(toggle => {
			toggle.checked = true;
			toggle.dispatchEvent(new Event('change', { bubbles: true }));
		});

		if (messages) {
			messages.replaceChildren(createChatMessage(
				'ai',
				'국회 질의를 입력해 보세요!\n' +
				'AI가 지능형 검색을 통해 관련자료를 추천하고 국회 답변서 초안 생성을 시작합니다.\n\n' +
				'① (선택) 좌측 AI 참조소스에서 첨부파일을 업로드하고\n' +
				'② 이 채팅에 국회질의를 입력하시면 과거 유사답변서나 관련자료를 추천하고 초안을 생성합니다.'
			));
		}
		if (chatInput) chatInput.value = '';
		if (chatSubmit) chatSubmit.disabled = true;

		layout?.classList.remove('is-panel-swapped');
		expandSourcePanel();
		resetPanelResizeLayout(layout);
		setActiveTab('recommend');
		scrollChatToBottom();
		chatInput?.focus();
	}

	function initTopbarActions() {
		document.querySelector('#newClassifyBtn')?.addEventListener('click', () => {
			resetAnswerWorkspace();
			showToast('새 채팅을 시작했습니다.');
		});

		document.querySelectorAll('#answerChatListSidepop .sidepop-chat-select').forEach(select => {
			select.addEventListener('click', () => {
				const topic = select.closest('.sidepop-chat-item');
				if (!topic) return;
				document.querySelectorAll('#answerChatListSidepop .sidepop-chat-item')
					.forEach(item => item.classList.toggle('is-active', item === topic));
				window.AIOneSidePop?.close('#answerChatListSidepop');
				showToast('선택한 채팅으로 전환했습니다.');
			});
		});
	}

	function init() {
		if (initialized || !allComponentsReady()) return;
		initialized = true;

		configureTopbar();
		initSidebar();
		initTabs();
		initCompareSections();
		initReferences();
		initSourceUpload();
		initDocumentActions();
		initDraftVerification();
		initPanelTools();
		initChat();
		initTopbarActions();
		hydrateIcons();
	}

	document.addEventListener('component:ready', event => {
		hydrateIcons(event.target);
		init();
	});
	document.addEventListener('app:includes-ready', event => {
		hydrateIcons(event.target);
		init();
	});
	document.addEventListener('DOMContentLoaded', init);
})();
