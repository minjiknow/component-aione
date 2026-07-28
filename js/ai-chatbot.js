(function () {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const messages = [];
  const reportFiles = [];

  function init() {
    applyPopupMode();
    bindEvents();
    document.addEventListener('click', () => {
      $$('.msg-more-menu').forEach(m => m.classList.add('hidden'));
    });

    // AI-ONE 홈 채팅바에서 넘어온 질의 자동 전송
    const pending = sessionStorage.getItem('ai-one-pending-query');
    if (pending) {
      sessionStorage.removeItem('ai-one-pending-query');
      const centerInput = $('#chatInputCenter');
      if (centerInput) {
        centerInput.value = pending;
        sendFromCenter();
      }
    }
  }

  function applyPopupMode() {
    const params = new URLSearchParams(window.location.search);
    const isPopupMode = params.get('popup') === '1';
    if (!isPopupMode) return;

    document.body.classList.add('chat-popup-mode');
    document.title = 'AI-ONE 챗봇';
  }

  function openChatInPopup() {
    const popupUrl = new URL('ai-chatbot.html', window.location.href);
    popupUrl.searchParams.set('popup', '1');

    const width = Math.min(1440, Math.max(1024, window.screen.availWidth - 80));
    const height = Math.min(960, Math.max(720, window.screen.availHeight - 80));
    const left = Math.max(0, Math.round((window.screen.availWidth - width) / 2));
    const top = Math.max(0, Math.round((window.screen.availHeight - height) / 2));
    const features = [
      'popup=yes',
      `width=${width}`,
      `height=${height}`,
      `left=${left}`,
      `top=${top}`,
      'location=yes',
      'toolbar=no',
      'menubar=no',
      'status=no',
      'scrollbars=yes',
      'resizable=yes'
    ].join(',');

    const popup = window.open(popupUrl.href, 'AI_ONE_CHATBOT_WINDOW', features);
    if (!popup) {
      alert('새창이 차단되었습니다. 브라우저의 팝업 차단을 해제한 후 다시 시도해 주세요.');
      return;
    }
    popup.focus();
  }

  function openReportDrawer() {
    const drawer = $('#reportDrawer');
    const backdrop = $('#reportDrawerBackdrop');
    if (drawer) drawer.classList.remove('hidden');
    if (backdrop) backdrop.classList.remove('hidden');
  }

  function closeReportDrawer() {
    const drawer = $('#reportDrawer');
    const backdrop = $('#reportDrawerBackdrop');
    if (drawer) drawer.classList.add('hidden');
    if (backdrop) backdrop.classList.add('hidden');
    resetReportForm();
  }

  // ─── Report File Attach ───
  function addReportFiles(newFiles) {
    const remaining = 5 - reportFiles.length;
    if (remaining <= 0) { alert('첨부파일은 최대 5개까지 가능합니다.'); return; }
    newFiles.slice(0, remaining).forEach(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      let type = 'txt';
      if (ext === 'pdf') type = 'pdf';
      else if (['png', 'jpg', 'jpeg'].includes(ext)) type = 'img';
      const size = (file.size / 1024 / 1024).toFixed(1) + 'MB';
      reportFiles.push({ name: file.name, size, type });
    });
    renderReportFiles();
  }

  function renderReportFiles() {
    const list = $('#reportFileList');
    if (!list) return;
    list.innerHTML = reportFiles.map((f, i) => `
      <li>
        <span class="report-file-icon ${f.type}">${f.type}</span>
        <span class="report-file-name">${f.name}</span>
        <span class="report-file-size">${f.size}</span>
        <button class="report-file-remove" data-idx="${i}" aria-label="파일 삭제">×</button>
      </li>`).join('');
    list.querySelectorAll('.report-file-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx);
        reportFiles.splice(idx, 1);
        renderReportFiles();
      });
    });
  }

  function resetReportForm() {
    reportFiles.length = 0;
    renderReportFiles();
    const detail = $('#reportDetail');
    if (detail) detail.value = '';
    const firstType = $('input[name="reportType"]');
    if (firstType) firstType.checked = true;
  }

  function bindInputTextToggle(selector) {
    const input = $(selector);
    if (!input) return;
    const box = input.closest('.chat-input-box');
    if (!box) return;
    const sendBtn = box.querySelector('.chat-send-btn');
    const updateState = () => {
      const hasText = input.value.trim().length > 0;
      box.classList.toggle('has-text', hasText);
      if (sendBtn) sendBtn.disabled = !hasText;
    };
    input.addEventListener('input', updateState);
    updateState();
  }

  function bindEvents() {
    // Open chatbot in a minimal browser window
    const openChatWindowBtn = $('#openChatWindowBtn');
    if (openChatWindowBtn) openChatWindowBtn.addEventListener('click', openChatInPopup);

    // Send from bottom input
    $('#chatSendBtn').addEventListener('click', sendMessage);
    $('#chatInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });

    // Send from center input (empty state)
    const centerSendBtn = $('#chatSendBtnCenter');
    const centerInput = $('#chatInputCenter');
    if (centerSendBtn) centerSendBtn.addEventListener('click', () => sendFromCenter());
    if (centerInput) centerInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendFromCenter(); });

    // Toggle border gradient based on text input
    bindInputTextToggle('#chatInput');
    bindInputTextToggle('#chatInputCenter');

    // Model picker
    initModelPicker('modelPickerBtnCenter', 'modelDropdownCenter');
    initModelPicker('modelPickerBtn', 'modelDropdown');

    // New chat
    const newChatBtn = $('#newChatBtn');
    if (newChatBtn) newChatBtn.addEventListener('click', resetChat);
    const newChatLink = $('#newChatLink');
    if (newChatLink) newChatLink.addEventListener('click', resetChat);

    // Logout
    const logoutBtn = $('.logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('sidebar-collapsed');
        window.location.href = 'login.html';
      });
    }

    // Report drawer
    const reportDrawerClose = $('#reportDrawerClose');
    const reportDrawerBackdrop = $('#reportDrawerBackdrop');
    const reportCancelBtn = $('#reportCancelBtn');
    const reportSubmitBtn = $('#reportSubmitBtn');
    if (reportDrawerClose) reportDrawerClose.addEventListener('click', closeReportDrawer);
    if (reportDrawerBackdrop) reportDrawerBackdrop.addEventListener('click', closeReportDrawer);
    if (reportCancelBtn) reportCancelBtn.addEventListener('click', closeReportDrawer);
    if (reportSubmitBtn) {
      reportSubmitBtn.addEventListener('click', () => {
        closeReportDrawer();
        alert('신고가 접수되었습니다. 감사합니다.');
      });
    }

    // Report file upload
    const reportUploadZone = $('#reportUploadZone');
    const reportFileInput = $('#reportFileInput');
    if (reportUploadZone && reportFileInput) {
      reportUploadZone.addEventListener('click', () => reportFileInput.click());
      reportFileInput.addEventListener('change', (e) => {
        addReportFiles(Array.from(e.target.files));
        reportFileInput.value = '';
      });
      reportUploadZone.addEventListener('dragover', (e) => { e.preventDefault(); reportUploadZone.classList.add('drag-over'); });
      reportUploadZone.addEventListener('dragleave', () => reportUploadZone.classList.remove('drag-over'));
      reportUploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        reportUploadZone.classList.remove('drag-over');
        addReportFiles(Array.from(e.dataTransfer.files));
      });
    }

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.model-picker')) {
        $$('.model-picker-dropdown').forEach(d => d.classList.add('hidden'));
      }
    });
  }

  function initModelPicker(btnId, dropdownId) {
    const btn = $('#' + btnId);
    const dropdown = $('#' + dropdownId);
    if (!btn || !dropdown) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other dropdowns
      $$('.model-picker-dropdown').forEach(d => { if (d.id !== dropdownId) d.classList.add('hidden'); });
      dropdown.classList.toggle('hidden');
    });

    dropdown.querySelectorAll('.model-option').forEach(opt => {
      opt.addEventListener('click', () => {
        dropdown.querySelectorAll('.model-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        const label = btn.querySelector('.model-picker-label');
        if (label) label.textContent = opt.querySelector('.model-opt-name').textContent;
        dropdown.classList.add('hidden');
      });
    });
  }

  function updateSendBtnState(input) {
    const box = input.closest('.chat-input-box');
    const sendBtn = box && box.querySelector('.chat-send-btn');
    if (sendBtn) sendBtn.disabled = input.value.trim().length === 0;
  }

  function queueAiResponse(text, onComplete) {
    const pendingMessage = { role: 'ai', text: '', pending: true };
    messages.push(pendingMessage);
    renderMessages();

    setTimeout(() => {
      pendingMessage.text = generateResponse(text);
      pendingMessage.pending = false;
      renderMessages();
      if (typeof onComplete === 'function') onComplete();
    }, 800);
  }

  function retryAiResponse(index) {
    const message = messages[index];
    if (!message || message.role !== 'ai' || message.pending) return;

    let query = '';
    for (let messageIndex = index - 1; messageIndex >= 0; messageIndex -= 1) {
      if (messages[messageIndex].role === 'user') {
        query = messages[messageIndex].text;
        break;
      }
    }
    if (!query) return;

    message.text = '';
    message.pending = true;
    renderMessages();

    setTimeout(() => {
      message.text = generateResponse(query);
      message.pending = false;
      renderMessages();
    }, 800);
  }

  function sendFromCenter() {
    const input = $('#chatInputCenter');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    updateSendBtnState(input);
    // Switch to chat mode
    const empty = $('#chatEmpty');
    if (empty) empty.style.display = 'none';
    const msgContainer = $('#chatMessages');
    msgContainer.style.display = 'block';
    const container = $('#chatContainer');
    container.classList.add('has-messages');
    const wrapper = $('#chatInputWrapper');
    if (wrapper) wrapper.classList.remove('hidden');

    messages.push({ role: 'user', text });
    queueAiResponse(text, () => $('#chatInput').focus());
  }

  function sendMessage() {
    const input = $('#chatInput');
    const text = input.value.trim();
    if (!text) return;

    // Hide empty state
    const empty = $('#chatEmpty');
    if (empty) empty.style.display = 'none';
    const msgContainer = $('#chatMessages');
    msgContainer.style.display = 'block';
    const container = $('#chatContainer');
    container.classList.add('has-messages');

    // User message
    messages.push({ role: 'user', text });
    input.value = '';
    updateSendBtnState(input);

    // AI response (simulated)
    queueAiResponse(text, () => input.focus());
  }

  function generateResponse(query) {
    if (query.includes('지방채') || query.includes('추경')) {
      return '공공자금관리기금(공자기금)은 지방재정 지원을 목적으로 지방자치단체가 발행하는 지방채를 장기 저리로 인수하여 자금을 지원합니다.\n\n주요 내용:\n• 지원대상: 지방자치단체(시·도)\n• 지원사업: 도로, 지하철건설, 공공시설 설치, 지역개발사업 등\n• 인수금리: 공자기금 예탁금리와 동일(분기별 고정)\n• 인수기간: 5년 거치 10년 분할 상환\n\n광주·전남 통합특별시 출범(2026.7.1.)과 관련하여 약 1,000억 원 규모의 추경이 편성되었습니다.';
    }
    if (query.includes('예산') || query.includes('재정')) {
      return '2026년도 예산안에 대한 주요 재정지표를 안내드립니다.\n\n• 총수입: 약 625조원\n• 총지출: 약 657조원\n• 관리재정수지: GDP 대비 -2.8%\n• 국가채무비율: 약 49.1%\n\n추가 질문이 있으시면 말씀해주세요.';
    }
    return '안녕하세요! AI-ONE 챗봇입니다.\n\n국회 질의 관련 답변서 작성, 경제 동향 분석, 재정 데이터 조회 등 업무를 도와드리겠습니다.\n\n무엇을 도와드릴까요?';
  }

  function renderMessages() {
    const container = $('#chatMessages');
    container.innerHTML = messages.map((m, i) => {
      if (m.role === 'user') {
        return `<div class="chat-msg user" data-component="chat-message" data-variant="chatbot" data-role="user">${m.text}</div>`;
      }
      if (m.pending) {
        return `<div class="chat-msg ai is-pending" data-component="chat-message" data-variant="chatbot" data-role="ai" data-status="pending">
          <div class="msg-avatar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div>
          <div class="msg-content"><span class="chat-typing-ellipsis" role="status" aria-label="답변 생성 중">...</span></div>
        </div>`;
      }
      return `<div class="chat-msg ai" data-component="chat-message" data-variant="chatbot" data-role="ai" data-status="complete">
          <div class="msg-avatar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div>
          <div class="msg-content">${m.text.replace(/\n/g, '<br>')}</div>
          <div class="msg-actions">
            <button class="msg-action-btn" data-action="like" data-msg-idx="${i}" aria-label="좋아요" aria-pressed="false" title="좋아요"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg></button>
            <button class="msg-action-btn" data-action="dislike" data-msg-idx="${i}" aria-label="싫어요" aria-pressed="false" title="싫어요"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10zM17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg></button>
            <button class="msg-action-btn" data-action="retry" data-msg-idx="${i}" aria-label="다시 생성" title="다시 생성"><svg viewBox="0 0 24 24" width="14" height="14"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></button>
            <button class="msg-action-btn" data-action="copy" data-msg-idx="${i}" aria-label="복사" title="복사"><svg viewBox="0 0 24 24" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
            <button class="msg-action-btn msg-report-btn" data-action="report" data-msg-idx="${i}" aria-label="오류신고" title="오류신고"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg></button>
            <div class="msg-more-wrap">
              <button class="msg-action-btn msg-more-btn" data-msg-idx="${i}" aria-label="더보기">···</button>
              <div class="msg-more-menu hidden" data-menu-idx="${i}">
                <button class="msg-more-item" data-action="branch"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M6 3v12"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg><span>새 채팅에서 브랜치 생성</span></button>
                <button class="msg-more-item" data-action="recheck"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg><span>대답 재확인</span></button>
                <button class="msg-more-item" data-action="listen"><svg viewBox="0 0 24 24" width="16" height="16"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg><span>듣기</span></button>
                <button class="msg-more-item" data-action="export"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span>Docs로 내보내기</span></button>
                <button class="msg-more-item" data-action="mail"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M4 4h16v16H4z"/><polyline points="22 6 12 13 2 6"/></svg><span>Gmail 초안 작성</span></button>
                <button class="msg-more-item" data-action="legal"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg><span>법적 문제 신고</span></button>
                <button class="msg-more-item active" data-action="detail"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg><span>응답 세부정보 보기</span></button>
              </div>
            </div>
          </div>
        </div>`;
    }).join('');
    container.scrollTop = container.scrollHeight;

    window.ChatMessage?.bind(container, {
      getText: ({ button }) => messages[Number(button.dataset.msgIdx)]?.text || '',
      onRetry: ({ button }) => retryAiResponse(Number(button.dataset.msgIdx))
    });

    // Bind screen-specific report action.
    $$('.msg-report-btn', container).forEach(btn => {
      btn.addEventListener('click', (event) => {
        event.stopPropagation();
        openReportDrawer();
      });
    });

    // Bind more button
    $$('.msg-more-btn', container).forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = btn.dataset.msgIdx;
        $$('.msg-more-menu', container).forEach(m => { if (m.dataset.menuIdx !== idx) m.classList.add('hidden'); });
        const menu = $(`.msg-more-menu[data-menu-idx="${idx}"]`, container);
        if (menu) menu.classList.toggle('hidden');
      });
    });

    // Bind menu item actions
    $$('.msg-more-item', container).forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = item.dataset.action;
        const menu = item.closest('.msg-more-menu');
        if (menu) menu.classList.add('hidden');
        if (action === 'legal') {
          openReportDrawer();
        } else {
          handleMoreAction(action);
        }
      });
    });
  }

  function handleMoreAction(action) {
    const labels = {
      branch: '새 채팅에서 브랜치를 생성했습니다.',
      recheck: '대답을 재확인하고 있습니다...',
      listen: '음성으로 읽어드립니다.',
      export: 'Docs로 내보냈습니다.',
      mail: 'Gmail 초안을 작성했습니다.',
      detail: '응답 세부정보를 확인합니다.'
    };
    alert(labels[action] || '');
  }

  function resetChat() {
    messages.length = 0;
    const empty = $('#chatEmpty');
    if (empty) empty.style.display = 'flex';
    const msgContainer = $('#chatMessages');
    msgContainer.innerHTML = '';
    msgContainer.style.display = 'none';
    const container = $('#chatContainer');
    container.classList.remove('has-messages');
    const wrapper = $('#chatInputWrapper');
    if (wrapper) wrapper.classList.add('hidden');
    const centerInput = $('#chatInputCenter');
    if (centerInput) { centerInput.value = ''; updateSendBtnState(centerInput); centerInput.focus(); }
    const bottomInput = $('#chatInput');
    if (bottomInput) { bottomInput.value = ''; updateSendBtnState(bottomInput); }
  }

  init();
})();
