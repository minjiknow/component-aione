(function () {
  'use strict';

  const historyData = [
    { icon: 'doc', target: 'ai-answer.html', service: '국회 답변서 초안 작성', type: 'AI초안', typeClass: 'ai', task: '2026년 청년 고용 정책 관련 답변 초안', date: '2026.05.20 10:24', status: '완료', statusClass: 'done', reg: '2026.05.19' },
    { icon: 'search', target: 'ai-answer.html', service: '국회 질의 자료 검색', type: '검색', typeClass: 'search', task: '반도체 산업 지원 관련 질의', date: '2026.05.20 09:15', status: '완료', statusClass: 'done', reg: '2026.05.18' },
    { icon: 'chart', target: 'ai-economy.html', service: '경제동향 분석 보고서', type: '보고서', typeClass: 'report', task: '2026년 4월 경제동향 분석', date: '2026.05.19 18:40', status: '진행 중', statusClass: 'progress', reg: '2026.05.17' },
    { icon: 'folder', target: 'ai-answer.html', service: '내부자료 자산화 관리', type: '문서관리', typeClass: 'doc', task: '국정 현안 보고자료 202605', date: '2026.05.19 14:05', status: '완료', statusClass: 'done', reg: '2026.05.16' },
    { icon: 'doc', target: 'ai-answer.html', service: '국회 답변서 초안 작성', type: 'AI초안', typeClass: 'ai', task: '디지털 전환 추진 정책 관련 답변 초안', date: '2026.05.19 11:32', status: '완료', statusClass: 'done', reg: '2026.05.15' }
  ];

  const iconMap = {
    doc: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    chart: '<svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><polyline points="18 17 12 11 8 15 2 9"/></svg>',
    folder: '<svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>'
  };

  const serviceCards = [
    {
      href: 'ai-intake.html',
      icon: '../assets/icons/service-question-classification.svg',
      iconTone: 'blue',
      title: '국회 질의 분류',
      description: '질의 업로드 · OCR/파싱 · 질의 분류 · 추천실국 확인'
    },
    {
      href: 'ai-answer.html',
      icon: '../assets/icons/service-answer-draft.svg',
      iconTone: 'green',
      title: '국회 답변서 초안 생성',
      description: '자료 분석 · 유사답변서 추천 · 초안 생성 · 편집'
    },
    {
      href: '#',
      icon: '../assets/icons/service-economic-trends.svg',
      iconTone: 'orange',
      title: '국유재산 업무 관리',
      description: '국유재산 관리전문 챗봇 · 종합계획 동향분석 · 개발 가능 재산 추천',
      disabled: true
    },
    {
      href: '#',
      icon: '../assets/icons/service-chatbot.svg',
      iconTone: 'purple',
      title: '정책 안내서',
      description: '정책안내 관리전문 챗봇 · 정책분석 관련자료 · 정책 추천',
      disabled: true
    }
  ];

  function init() {
    window.AIOneServiceCard?.renderList('[data-service-card-list]', serviceCards);
    renderHistorySkeleton();
    bindEvents();
    bindPreparingMenus();
    initSidebar();
    window.setTimeout(renderHistory, 700);
  }

  function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const collapseBtn = document.getElementById('sidebarCollapseBtn');
    const brand = sidebar.querySelector('.sidebar-brand');

    if (collapseBtn) {
      collapseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('collapsed');
        if (sidebar.classList.contains('collapsed')) localStorage.setItem('sidebar-collapsed', 'true');
        else localStorage.removeItem('sidebar-collapsed');
      });
    }
    if (brand) {
      brand.addEventListener('click', () => {
        if (sidebar.classList.contains('collapsed')) {
          sidebar.classList.remove('collapsed');
          localStorage.removeItem('sidebar-collapsed');
        }
      });
    }
    // Restore
    if (localStorage.getItem('sidebar-collapsed') === 'true') {
      sidebar.classList.add('collapsed');
    }
    // Auto-collapse on nav click (except home)
    sidebar.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => {
      if (l.dataset && l.dataset.page === 'home') return;
      localStorage.setItem('sidebar-collapsed', 'true');
      sidebar.classList.add('collapsed');
    }));

    initNavTooltips(sidebar);
  }

  // 사이드바가 접혔을 때 메뉴 아이콘에 마우스 오버 시 메뉴명 툴팁 표시
  function initNavTooltips(sidebar) {
    let tooltip = document.getElementById('navTooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'navTooltip';
      tooltip.className = 'nav-tooltip';
      document.body.appendChild(tooltip);
    }
    sidebar.querySelectorAll('.nav-link[data-tooltip]').forEach(link => {
      link.addEventListener('mouseenter', () => {
        if (!sidebar.classList.contains('collapsed')) return;
        const rect = link.getBoundingClientRect();
        tooltip.textContent = link.dataset.tooltip;
        tooltip.style.left = (rect.right + 10) + 'px';
        tooltip.style.top = (rect.top + rect.height / 2) + 'px';
        tooltip.style.transform = 'translateY(-50%)';
        tooltip.classList.add('visible');
      });
      link.addEventListener('mouseleave', () => {
        tooltip.classList.remove('visible');
      });
    });
  }

  function renderHistorySkeleton() {
    const tbody = document.getElementById('historyBody');
    if (!tbody) return;
    tbody.innerHTML = Array.from({ length: 5 }, () => `
      <tr class="history-skeleton-row" aria-hidden="true">
        <td><div class="ai-skeleton history-skeleton-cell wide"></div></td>
        <td><div class="ai-skeleton history-skeleton-cell medium"></div></td>
        <td><div class="ai-skeleton history-skeleton-cell wide"></div></td>
        <td><div class="ai-skeleton history-skeleton-cell medium"></div></td>
        <td><div class="ai-skeleton history-skeleton-cell short"></div></td>
        <td><div class="ai-skeleton history-skeleton-cell medium"></div></td>
        <td><div class="ai-skeleton history-skeleton-cell short"></div></td>
      </tr>`).join('');
  }

  function openHistoryItem(item) {
    if (!item || !item.target) return;
    sessionStorage.setItem('ai-one-history-task', item.task || '');
    window.location.href = item.target;
  }

  function renderHistory() {
    const tbody = document.getElementById('historyBody');
    tbody.innerHTML = historyData.map((h, index) => `
      <tr class="history-row-link" data-history-index="${index}" tabindex="0" role="link" aria-label="${h.service} 화면으로 이동">
        <td><span class="svc-icon">${iconMap[h.icon] || ''}${h.service}</span></td>
        <td><span class="type-badge ${h.typeClass}">${h.type}</span></td>
        <td>${h.task}</td>
        <td>${h.date}</td>
        <td><span class="status-dot ${h.statusClass}">${h.status}</span></td>
        <td>${h.reg}</td>
        <td><button class="more-btn" aria-label="사용 이력 더보기">⋮</button></td>
      </tr>
    `).join('');
  }

  function bindEvents() {
    const chatInput = document.getElementById('homeChatInput');
    const chatSendBtn = document.getElementById('homeChatSendBtn');

    const goToChatbot = () => {
      const q = chatInput.value.trim();
      if (!q) return;
      sessionStorage.setItem('ai-one-pending-query', q);
      window.location.href = 'ai-chatbot.html';
    };

    if (chatSendBtn) chatSendBtn.addEventListener('click', goToChatbot);
    if (chatInput) chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') goToChatbot(); });
    if (chatInput && chatSendBtn) {
      chatInput.addEventListener('input', () => {
        chatSendBtn.disabled = chatInput.value.trim().length === 0;
      });
    }

    const historyBody = document.getElementById('historyBody');
    if (historyBody) {
      const activateHistoryRow = (event) => {
        const row = event.target.closest('.history-row-link');
        if (!row || event.target.closest('.more-btn')) return;
        const item = historyData[Number(row.dataset.historyIndex)];
        openHistoryItem(item);
      };
      historyBody.addEventListener('click', activateHistoryRow);
      historyBody.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        activateHistoryRow(event);
      });
    }

    // Model picker
    initModelPicker('homeModelPickerBtn', 'homeModelDropdown');
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.model-picker')) {
        document.querySelectorAll('.model-picker-dropdown').forEach(d => d.classList.add('hidden'));
      }
    });

    // 첨부 버튼 (안내)
    const attachBtn = document.querySelector('.chat-attach-btn');
    if (attachBtn) attachBtn.addEventListener('click', () => alert('파일 첨부 기능은 AI-ONE 챗봇 화면에서 이용할 수 있습니다.'));

    // 전체 이력 보기
    const historyMoreBtn = document.querySelector('.history-more');
    if (historyMoreBtn) {
      historyMoreBtn.addEventListener('click', () => {
        showFullHistory();
      });
    }
  }

  function initModelPicker(btnId, dropdownId) {
    const btn = document.getElementById(btnId);
    const dropdown = document.getElementById(dropdownId);
    if (!btn || !dropdown) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.model-picker-dropdown').forEach(d => { if (d.id !== dropdownId) d.classList.add('hidden'); });
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

  function showFullHistory() {
    // Extended history data
    const allHistory = [
      ...historyData,
      { icon: 'doc', target: 'ai-answer.html', service: '국회 답변서 초안 작성', type: 'AI초안', typeClass: 'ai', task: '지방채 인수 추경 편성 사유 답변 초안', date: '2026.05.18 16:20', status: '완료', statusClass: 'done', reg: '2026.05.14' },
      { icon: 'search', target: 'ai-answer.html', service: '국회 질의 자료 검색', type: '검색', typeClass: 'search', task: '세수추계 오차 분석 자료 검색', date: '2026.05.18 14:10', status: '완료', statusClass: 'done', reg: '2026.05.13' },
      { icon: 'chart', target: 'ai-economy.html', service: '경제동향 분석 보고서', type: '보고서', typeClass: 'report', task: '2026년 3월 경제동향 분석', date: '2026.05.17 11:00', status: '완료', statusClass: 'done', reg: '2026.05.12' },
      { icon: 'doc', target: 'ai-answer.html', service: '국회 답변서 초안 작성', type: 'AI초안', typeClass: 'ai', task: '공공기관 경영평가 관련 답변 초안', date: '2026.05.16 09:30', status: '완료', statusClass: 'done', reg: '2026.05.11' },
      { icon: 'folder', target: 'ai-answer.html', service: '내부자료 자산화 관리', type: '문서관리', typeClass: 'doc', task: '재정건전성 보고자료 정리', date: '2026.05.15 17:45', status: '완료', statusClass: 'done', reg: '2026.05.10' }
    ];

    let modal = document.getElementById('historyModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'historyModal';
      modal.className = 'history-modal-backdrop';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `<div class="history-modal">
      <div class="history-modal-header">
        <h3>전체 사용 이력</h3>
        <button class="history-modal-close" id="historyModalClose">×</button>
      </div>
      <div class="history-modal-search">
        <div class="history-search-box">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>
          <input type="search" id="historySearchInput" placeholder="서비스, 유형, 작업 내용, 상태, 일시 검색" autocomplete="off" />
          <button type="button" class="history-search-clear hidden" id="historySearchClear" aria-label="검색어 지우기">×</button>
        </div>
        <span class="history-search-result" id="historySearchResult">총 ${allHistory.length}건</span>
      </div>
      <div class="history-modal-body">
        <table class="history-table full">
          <thead><tr><th>서비스</th><th>유형</th><th>작업 내용</th><th>작업일시</th><th>상태</th><th>등록일</th></tr></thead>
          <tbody id="historyModalTableBody">${allHistory.map((h, idx) => `
            <tr class="history-row-link" data-full-history-index="${idx}" data-history-search="${[h.service,h.type,h.task,h.date,h.status,h.reg].join(' ').toLowerCase()}" tabindex="0" role="link">
              <td><span class="svc-icon">${iconMap[h.icon] || ''}${h.service}</span></td>
              <td><span class="type-badge ${h.typeClass}">${h.type}</span></td>
              <td>${h.task}</td>
              <td>${h.date}</td>
              <td><span class="status-dot ${h.statusClass}">${h.status}</span></td>
              <td>${h.reg}</td>
            </tr>
          `).join('')}</tbody>
        </table>
        <div class="history-search-empty hidden" id="historySearchEmpty">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>
          <strong>검색 결과가 없습니다.</strong>
          <span>다른 검색어를 입력해 보세요.</span>
        </div>
      </div>
    </div>`;

    modal.style.display = 'flex';
    const searchInput = document.getElementById('historySearchInput');
    const searchClear = document.getElementById('historySearchClear');
    const searchResult = document.getElementById('historySearchResult');
    const searchEmpty = document.getElementById('historySearchEmpty');
    const historyTable = modal.querySelector('.history-table.full');

    const filterHistory = () => {
      const keyword = (searchInput?.value || '').trim().toLowerCase();
      let visibleCount = 0;
      modal.querySelectorAll('[data-history-search]').forEach(row => {
        const matched = !keyword || (row.dataset.historySearch || '').includes(keyword);
        row.classList.toggle('hidden', !matched);
        if (matched) visibleCount += 1;
      });
      if (searchClear) searchClear.classList.toggle('hidden', !keyword);
      if (searchResult) searchResult.textContent = keyword ? `검색 결과 ${visibleCount}건` : `총 ${allHistory.length}건`;
      if (searchEmpty) searchEmpty.classList.toggle('hidden', visibleCount !== 0);
      if (historyTable) historyTable.classList.toggle('hidden', visibleCount === 0);
    };

    if (searchInput) {
      searchInput.addEventListener('input', filterHistory);
      setTimeout(() => searchInput.focus(), 0);
    }
    if (searchClear) {
      searchClear.addEventListener('click', () => {
        searchInput.value = '';
        filterHistory();
        searchInput.focus();
      });
    }

    document.getElementById('historyModalClose').addEventListener('click', () => { modal.style.display = 'none'; });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) { modal.style.display = 'none'; return; }
      const row = e.target.closest('[data-full-history-index]');
      if (row) openHistoryItem(allHistory[Number(row.dataset.fullHistoryIndex)]);
    });
    modal.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const row = e.target.closest('[data-full-history-index]');
      if (!row) return;
      e.preventDefault();
      openHistoryItem(allHistory[Number(row.dataset.fullHistoryIndex)]);
    });
  }

  // ─── Custom Modal (alert) ───
  function customAlert(title, msg) {
    let modal = document.getElementById('customModalBackdrop');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'customModalBackdrop';
      modal.className = 'custom-modal-backdrop';
      document.body.appendChild(modal);
    }
    modal.innerHTML = `<div class="custom-modal">
      <div class="custom-modal-icon alert">!</div>
      <div class="custom-modal-title">${title}</div>
      <div class="custom-modal-msg">${msg}</div>
      <div class="custom-modal-actions">
        <button class="btn-confirm" id="cmOk">확인</button>
      </div>
    </div>`;
    modal.classList.remove('hidden');
    document.getElementById('cmOk').addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
  }

  // ─── Preparing Menu (준비중 메뉴 안내) ───
  function bindPreparingMenus() {
    document.querySelectorAll('[data-soon]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        customAlert('준비중', '이 화면은 프로토타입에 아직 포함되어 있지 않습니다.');
      });
    });
  }
  const commonLogoutBtn = document.querySelector('.lnb-logout-btn');
  if (commonLogoutBtn) {
    commonLogoutBtn.addEventListener('click', () => {
      if (!window.confirm('로그아웃 하시겠습니까?')) return;
      localStorage.removeItem('sidebar-collapsed');
      window.location.href = 'login.html';
    });
  }

  init();
})();
