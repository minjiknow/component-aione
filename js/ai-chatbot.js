(function () {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const messages = [];

  function init() {
    bindEvents();
  }

  function bindEvents() {
    // Send from bottom input
    $('#chatSendBtn').addEventListener('click', sendMessage);
    $('#chatInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });

    // Send from center input (empty state)
    const centerSendBtn = $('#chatSendBtnCenter');
    const centerInput = $('#chatInputCenter');
    if (centerSendBtn) centerSendBtn.addEventListener('click', () => sendFromCenter());
    if (centerInput) centerInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendFromCenter(); });

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
      logoutBtn.addEventListener('click', window.AppCommon.logout);
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

  function sendFromCenter() {
    const input = $('#chatInputCenter');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
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
    renderMessages();

    setTimeout(() => {
      messages.push({ role: 'ai', text: generateResponse(text) });
      renderMessages();
      $('#chatInput').focus();
    }, 800);
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
    renderMessages();
    input.value = '';

    // AI response (simulated)
    setTimeout(() => {
      const aiText = generateResponse(text);
      messages.push({ role: 'ai', text: aiText });
      renderMessages();
      input.focus();
    }, 800);
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
    container.innerHTML = messages.map(m => {
      if (m.role === 'user') {
        return `<div class="chat-msg user">${m.text}</div>`;
      } else {
        return `<div class="chat-msg ai">
          <div class="msg-avatar"><img data-icon="layers" alt="" aria-hidden="true" /></div>
          <div class="msg-content">${m.text.replace(/\n/g, '<br>')}</div>
        </div>`;
      }
    }).join('');
    container.scrollTop = container.scrollHeight;
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
    if (centerInput) { centerInput.value = ''; centerInput.focus(); }
  }

  window.AppCommon.whenReady(init);
})();
