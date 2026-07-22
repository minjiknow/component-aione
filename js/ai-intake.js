/**
 * AI-ONE 질의 입수 및 부서추천
 * - 파일 업로드 / OCR·파싱 시뮬레이션
 * - 문서 하이라이트 뷰
 * - 질의 목록 / 매칭부서 표시
 */

(function () {
  'use strict';

  // ─── Sample Data ───
  const sampleQueries = [
    {
      id: 1,
      text: '2024년도 예산편성지침 중 인건비 산정기준 변경사항에 대한 구체적 안내 요청',
      type: 'single',
      typeLabel: '단일소관',
      mainDept: '예산실',
      coopDept: '',
      org: '기획재정부',
      confidence: 94
    },
    {
      id: 2,
      text: '지방자치단체 재정자립도 산정 시 세외수입 항목 포함 여부 및 관련 법령 해석',
      type: 'multi',
      typeLabel: '복수소관',
      mainDept: '재정정책국',
      coopDept: '세제실, 지방재정과',
      org: '행정안전부',
      confidence: 82,
      conflict: { ruleDept: '세제실', aiDept: '재정정책국', ruleLabel: '세제 키워드 룰' }
    },
    {
      id: 3,
      text: '공공기관 경영평가 시 비계량지표 평가방법론 개선 관련 의견 조회',
      type: 'single',
      typeLabel: '단일소관',
      mainDept: '공공정책국',
      coopDept: '',
      org: '기획재정부',
      confidence: 91
    },
    {
      id: 4,
      text: '외국환거래법 개정에 따른 해외직접투자 신고절차 변경 안내 요청',
      type: 'multi',
      typeLabel: '복수소관',
      mainDept: '국제금융국',
      coopDept: '외환시장과',
      org: '한국은행',
      confidence: 78
    },
    {
      id: 5,
      text: '최근 기상이변으로 인한 농작물 피해 현황 자료 요청의 건',
      type: 'none',
      typeLabel: '비소관',
      mainDept: '해당없음',
      coopDept: '',
      org: '농림축산식품부',
      confidence: 96
    }
  ];

  const sampleDocText = `국회예산정책처 질의서

1. 2024년도 예산편성지침 중 인건비 산정기준 변경사항에 대한 구체적 안내를 요청합니다. 특히 공무원 보수 인상률 적용 시점과 관련하여 세부 기준이 필요합니다.

2. 지방자치단체 재정자립도 산정 시 세외수입 항목의 포함 여부와 관련 법령 해석에 대해 질의합니다. 현행 지방재정법 제36조의2와 시행령 간 해석 차이가 있어 명확한 입장을 확인하고자 합니다.

3. 공공기관 경영평가 시 비계량지표 평가방법론 개선에 관하여 귀 부처의 의견을 조회합니다. 최근 3년간 평가결과 분석자료도 함께 회신 부탁드립니다.

4. 외국환거래법 개정(2024.3.1. 시행)에 따른 해외직접투자 신고절차 변경사항에 대해 안내를 요청합니다. 개정 전후 비교표 및 신고서 양식 변경 내용을 포함해 주시기 바랍니다.

5. 최근 기상이변으로 인한 농작물 피해 현황에 대한 자료를 요청합니다. 본 건은 농림축산식품부 소관으로 판단되나, 관련 예산 편성 협조 차원에서 확인합니다.

끝.`;

  // ─── File-specific data ───
  const fileDataMap = {
    '예산결산위_질의서_2024-0315.pdf': {
      docText: `국회 예산결산특별위원회 질의서

1. 2024년도 예산편성지침 중 인건비 산정기준 변경사항에 대한 구체적 안내를 요청합니다. 특히 공무원 보수 인상률 적용 시점과 관련하여 세부 기준이 필요합니다.

2. 지방자치단체 재정자립도 산정 시 세외수입 항목의 포함 여부와 관련 법령 해석에 대해 질의합니다. 현행 지방재정법 제36조의2와 시행령 간 해석 차이가 있어 명확한 입장을 확인하고자 합니다.

3. 공공기관 경영평가 시 비계량지표 평가방법론 개선에 관하여 귀 부처의 의견을 조회합니다.

4. 외국환거래법 개정(2024.3.1. 시행)에 따른 해외직접투자 신고절차 변경사항에 대해 안내를 요청합니다.

5. 최근 기상이변으로 인한 농작물 피해 현황에 대한 자료를 요청합니다.

끝.`,
      queries: [
        { id: 1, text: '2024년도 예산편성지침 중 인건비 산정기준 변경사항에 대한 구체적 안내 요청', type: 'single', typeLabel: '단일소관', mainDept: '예산실', coopDept: '', org: '기획재정부', confidence: 94, keywords: ['예산편성지침', '인건비'] },
        { id: 2, text: '지방자치단체 재정자립도 산정 시 세외수입 항목 포함 여부 및 관련 법령 해석', type: 'multi', typeLabel: '복수소관', mainDept: '재정정책국', coopDept: '세제실, 지방재정과', org: '행정안전부', confidence: 82, keywords: ['재정자립도', '세외수입', '법령'], conflict: { ruleDept: '세제실', aiDept: '재정정책국', ruleLabel: '세제 키워드 룰' } },
        { id: 3, text: '공공기관 경영평가 시 비계량지표 평가방법론 개선 관련 의견 조회', type: 'single', typeLabel: '단일소관', mainDept: '공공정책국', coopDept: '', org: '기획재정부', confidence: 91, keywords: ['공공기관', '경영평가', '비계량지표'] },
        { id: 4, text: '외국환거래법 개정에 따른 해외직접투자 신고절차 변경 안내 요청', type: 'multi', typeLabel: '복수소관', mainDept: '국제금융국', coopDept: '외환시장과', org: '한국은행', confidence: 78, keywords: ['외국환거래법', '해외직접투자'], conflict: { ruleDept: '국제금융국', aiDept: '경제정책국', ruleLabel: '외환거래 룰' } },
        { id: 5, text: '최근 기상이변으로 인한 농작물 피해 현황 자료 요청의 건', type: 'none', typeLabel: '비소관', mainDept: '해당없음', coopDept: '', org: '농림축산식품부', confidence: 96, keywords: ['기상이변', '농작물'] }
      ]
    },
    '기재위_요지서_세제현안.hwp': {
      docText: `기획재정위원회 질의 요지서 — 세제 현안

1. 2024년 종합부동산세 세율 조정에 따른 세수 영향 추정치를 요청합니다.

2. 간이과세자 기준금액 상향 조정 시 부가가치세 세수 감소 규모 분석 자료를 회신 부탁드립니다.

3. 법인세 최저한세율 적용 대상 확대 방안에 대한 검토 의견을 조회합니다.

끝.`,
      queries: [
        { id: 6, text: '2024년 종합부동산세 세율 조정에 따른 세수 영향 추정치 요청', type: 'single', typeLabel: '단일소관', mainDept: '세제실', coopDept: '', org: '기획재정부', confidence: 92 },
        { id: 7, text: '간이과세자 기준금액 상향 조정 시 부가가치세 세수 감소 규모 분석', type: 'single', typeLabel: '단일소관', mainDept: '세제실', coopDept: '', org: '국세청', confidence: 88 },
        { id: 8, text: '법인세 최저한세율 적용 대상 확대 방안 검토 의견 조회', type: 'multi', typeLabel: '복수소관', mainDept: '세제실', coopDept: '법인세과', org: '기획재정부', confidence: 85 }
      ]
    },
    '김민수의원_추가질의_재정건전성.pdf': {
      docText: `김민수 의원 추가질의 — 재정건전성 관련

1. 국가채무 관리 계획의 실효성에 대해 구체적 답변을 요구합니다. 2024년 말 기준 GDP 대비 국가채무비율 전망치를 제시해 주시기 바랍니다.

2. 2024년 세수 결손 규모와 이에 대한 정부의 대응 계획을 상세히 답변해 주십시오.

3. 관리재정수지 적자 확대에 대한 구조적 원인 분석과 향후 개선 방안을 질의합니다.`,
      queries: [
        { id: 9, text: 'GDP 대비 국가채무비율 전망치 및 국가채무 관리 계획 실효성 질의', type: 'single', typeLabel: '단일소관', mainDept: '재정정책국', coopDept: '', org: '기획재정부', confidence: 90 },
        { id: 10, text: '2024년 세수 결손 규모와 대응 계획 상세 답변 요구', type: 'multi', typeLabel: '복수소관', mainDept: '세제실', coopDept: '예산실', org: '기획재정부', confidence: 87 },
        { id: 11, text: '관리재정수지 적자 확대의 구조적 원인 분석 및 개선 방안 질의', type: 'single', typeLabel: '단일소관', mainDept: '재정정책국', coopDept: '', org: '기획재정부', confidence: 93 }
      ]
    },
    '박영희의원_요구자료_세수결손.docx': {
      docText: `박영희 의원 요구자료 — 세수결손 현황

요구사항:
1. 2024년 월별 세수 실적 및 진도율 현황표 제출

2. 주요 세목별(소득세, 법인세, 부가가치세) 결손 원인 분석 자료

3. 세수 결손 보전을 위한 추가경정예산 편성 검토 여부에 대한 입장

4. 최근 3년간 세수 추계 오차율 및 개선 방안`,
      queries: [
        { id: 12, text: '2024년 월별 세수 실적 및 진도율 현황표 제출 요구', type: 'single', typeLabel: '단일소관', mainDept: '세제실', coopDept: '', org: '국세청', confidence: 95 },
        { id: 13, text: '주요 세목별 결손 원인 분석 자료 요구', type: 'single', typeLabel: '단일소관', mainDept: '세제실', coopDept: '', org: '기획재정부', confidence: 91 },
        { id: 14, text: '추가경정예산 편성 검토 여부 입장 질의', type: 'multi', typeLabel: '복수소관', mainDept: '예산실', coopDept: '세제실', org: '기획재정부', confidence: 86 },
        { id: 15, text: '최근 3년간 세수 추계 오차율 및 개선 방안 요구', type: 'single', typeLabel: '단일소관', mainDept: '세제실', coopDept: '', org: '기획재정부', confidence: 89 }
      ]
    },
    '국정감사_의원질의_경제정책.txt': {
      docText: `국정감사 의원 질의 — 경제정책 분야

[질의1] 정부의 하반기 경제정책방향에서 제시한 민생안정 대책의 구체적 이행 현황을 보고하시오.

[질의2] 물가안정 목표 달성을 위한 정부·한은 간 정책 공조 현황과 향후 계획을 답변하시오.

[질의3] 청년 일자리 대책 중 재정사업의 실질적 성과와 개선 필요사항을 질의합니다.`,
      queries: [
        { id: 16, text: '하반기 경제정책방향 민생안정 대책 이행 현황 보고 요구', type: 'single', typeLabel: '단일소관', mainDept: '경제정책국', coopDept: '', org: '기획재정부', confidence: 92 },
        { id: 17, text: '물가안정 목표 달성 위한 정부·한은 정책 공조 현황 질의', type: 'multi', typeLabel: '복수소관', mainDept: '경제정책국', coopDept: '물가정책과', org: '한국은행', confidence: 84 },
        { id: 18, text: '청년 일자리 재정사업 성과 및 개선 필요사항 질의', type: 'multi', typeLabel: '복수소관', mainDept: '경제정책국', coopDept: '고용정책과', org: '고용노동부', confidence: 80 }
      ]
    }
  };

  let activeFileIndex = 0;

  // ─── Sessions (실행 목록) ───
  const sessions = [
    {
      id: 1, title: '기재위 국정감사 질의 분류', status: 'done', time: '14:23', date: '2025.06.25',
      files: ['예산결산위_질의서_2024-0315.pdf', '기재위_요지서_세제현안.hwp'],
      queryCount: 8, singleCount: 4, multiCount: 3, noneCount: 1
    },
    {
      id: 2, title: '김민수의원 추가질의 분류', status: 'done', time: '10:45', date: '2025.06.26',
      files: ['김민수의원_추가질의_재정건전성.pdf'],
      queryCount: 3, singleCount: 2, multiCount: 1, noneCount: 0
    },
    {
      id: 3, title: '박영희의원 요구자료 분류', status: 'done', time: '16:30', date: '2025.06.26',
      files: ['박영희의원_요구자료_세수결손.docx'],
      queryCount: 4, singleCount: 2, multiCount: 1, noneCount: 1
    },
    {
      id: 4, title: '국정감사 경제정책 질의 분류', status: 'pending', time: '09:15', date: '2025.07.07',
      files: ['국정감사_의원질의_경제정책.txt'],
      queryCount: 3, singleCount: 1, multiCount: 2, noneCount: 0
    }
  ];
  let activeSessionId = 4; // Current session

  const sampleLogs = [
    { time: '14:32:15', msg: 'OCR 파싱 완료 – 5건 질의 추출' },
    { time: '14:32:10', msg: '부서 매칭 시작 (AI 모델 v2.3)' },
    { time: '14:31:58', msg: '질의 분류 완료 – 단일2, 복수2, 비소관1' },
    { time: '14:31:45', msg: '텍스트 추출 완료 (1,247자)' },
    { time: '14:30:02', msg: '파일 업로드 완료 – 질의서_2024_0315.pdf' }
  ];

  // ─── DOM References ───
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  let uploadZone;
  let fileList;
  let fileCount;
  let docContent;
  let queryList;
  let toast;
  let runDrawerBtn;
  let runDrawer;
  let drawerBackdrop;
  let drawerClose;
  let editModal;
  let editModalClose;
  let editCancel;
  let editApply;

  function cacheDomReferences() {
    uploadZone = $('#uploadZone');
    fileList = $('#fileList');
    fileCount = $('#fileCount');
    docContent = $('#docContent');
    queryList = $('#queryList');
    toast = $('#toast');
    runDrawerBtn = $('#runDrawerBtn');
    runDrawer = $('#runDrawer');
    drawerBackdrop = $('#drawerBackdrop');
    drawerClose = $('#drawerClose');
    editModal = $('#editModal');
    editModalClose = $('#editModalClose');
    editCancel = $('#editCancel');
    editApply = $('#editApply');
  }

  // ─── State ───
  let uploadedFiles = [];
  let currentFilter = 'all';
  let editingQuery = null;

  // ─── Init ───
  function init() {
    cacheDomReferences();
    bindEvents();
    loadSampleData();
    initRuleManagement();
  }

  function bindEvents() {
    // Upload
    uploadZone.addEventListener('app:file-upload', (event) => addFiles(event.detail.files));

    // Tabs (removed - using checkbox now)
    $$('.filter-btn').forEach(btn => btn.addEventListener('click', handleFilter));

    // Drawer
    runDrawerBtn.addEventListener('click', openDrawer);
    drawerClose.addEventListener('click', closeDrawer);
    drawerBackdrop.addEventListener('click', closeDrawer);

    // Drawer position toggle
    const runDrawerPosBtn = $('#runDrawerPosBtn');
    const runDrawer = $('#runDrawer');
    if (runDrawerPosBtn && runDrawer) {
      runDrawerPosBtn.addEventListener('click', () => {
        runDrawer.classList.toggle('drawer-left');
        const label = $('#runDrawerPosLabel');
        if (runDrawer.classList.contains('drawer-left')) {
          if (label) label.textContent = '우측으로 이동';
        } else {
          if (label) label.textContent = '좌측으로 이동';
        }
      });
    }

    // Modal
    editModalClose.addEventListener('click', closeEditModal);
    editCancel.addEventListener('click', closeEditModal);
    editApply.addEventListener('click', applyEdit);

    // Reset
    $('#resetBtn').addEventListener('click', resetAll);

    // Excel (query panel)
    const queryExcelBtn = $('#queryExcelBtn');
    if (queryExcelBtn) queryExcelBtn.addEventListener('click', () => downloadExcel());

    // AI Reclassify
    const aiReclassifyBtn = $('#aiReclassifyBtn');
    if (aiReclassifyBtn) aiReclassifyBtn.addEventListener('click', () => showToast('AI 재분류를 실행합니다.'));

    // New Classify
    const newClassifyBtn = $('#newClassifyBtn');
    if (newClassifyBtn) newClassifyBtn.addEventListener('click', () => {
      const newId = sessions.length + 1;
      const now = new Date();
      const timeStr = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
      const dateStr = now.toISOString().slice(0,10).replace(/-/g,'.');
      sessions.push({
        id: newId,
        title: '새 질의분류 #' + newId,
        status: 'pending',
        time: timeStr,
        date: dateStr,
        files: [],
        queryCount: 0, singleCount: 0, multiCount: 0, noneCount: 0
      });
      activeSessionId = newId;
      // Reset workspace
      uploadedFiles = [];
      sampleQueries.length = 0;
      renderFileList();
      docContent.innerHTML = `<div class="doc-placeholder"><img class="placeholder-icon" data-icon="document" alt="" aria-hidden="true" /><p>문서를 업로드하면 여기에 표시됩니다</p></div>`;
      queryList.innerHTML = '';
      const fileNameEl = $('#activeFileName');
      if (fileNameEl) fileNameEl.textContent = '파일을 선택하세요';
      updateConfirmBtnUI();
      showToast('새 질의분류 세션이 생성되었습니다.');
    });

    // Confirm - state managed per file
    const confirmBtn = $('#confirmBtn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', handleConfirmBtn);
    }
    const confirmCancelBtn = $('#confirmCancelBtn');
    if (confirmCancelBtn) {
      confirmCancelBtn.addEventListener('click', handleConfirmCancel);
    }

    // Fullscreen
    $('#fullscreenBtn').addEventListener('click', toggleFullscreen);

    // Topbar logo click → exit fullscreen
    const topbarLogoBtn = $('#topbarLogoBtn');
    if (topbarLogoBtn) {
      topbarLogoBtn.addEventListener('click', () => {
        document.body.classList.remove('fullscreen-mode');
        topbarLogoBtn.classList.add('hidden');
        showToast('일반 모드');
      });
    }

    // Logout
    const logoutBtn = $('.logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        customConfirm('로그아웃', '로그아웃 하시겠습니까?', () => {
          window.AppCommon.logout();
        });
      });
    }

    // Left panel reset
    const leftResetBtn = $('#leftResetBtn');
    if (leftResetBtn) {
      leftResetBtn.addEventListener('click', () => {
        resetAll();
        showToast('초기화되었습니다.');
      });
    }

  }

  // ─── Load sample ───
  function loadSampleData() {
    uploadedFiles = [
      { name: '예산결산위_질의서_2024-0315.pdf', type: 'pdf', size: '2.4MB', status: 'parsed' },
      { name: '기재위_요지서_세제현안.hwp', type: 'hwp', size: '1.1MB', status: 'parsed' },
      { name: '김민수의원_추가질의_재정건전성.pdf', type: 'pdf', size: '0.9MB', status: 'parsed' },
      { name: '박영희의원_요구자료_세수결손.docx', type: 'docx', size: '1.5MB', status: 'parsed' },
      { name: '국정감사_의원질의_경제정책.txt', type: 'txt', size: '0.6MB', status: 'parsed' }
    ];
    activeFileIndex = 0;
    renderFileList();
    loadFileData(activeFileIndex);
  }

  function loadFileData(idx) {
    activeFileIndex = idx;
    const file = uploadedFiles[idx];
    if (!file) return;

    // Update active filename display
    const fileNameEl = $('#activeFileName');
    if (fileNameEl) fileNameEl.textContent = file.name;

    const data = fileDataMap[file.name];
    if (data) {
      sampleQueries.length = 0;
      data.queries.forEach(q => sampleQueries.push(q));
      renderDocContentForFile(data.docText);
      renderQueryList();
      // Update stats
      const statTotal = $('#statTotal');
      const statSingle = $('#statSingle');
      const statMulti = $('#statMulti');
      const statNone = $('#statNone');
      if (statTotal) statTotal.textContent = data.queries.length;
      if (statSingle) statSingle.textContent = data.queries.filter(q => q.type === 'single').length;
      if (statMulti) statMulti.textContent = data.queries.filter(q => q.type === 'multi').length;
      if (statNone) statNone.textContent = data.queries.filter(q => q.type === 'none').length;
    }
    // Highlight active file in list
    $$('.file-list li').forEach((li, i) => {
      li.classList.toggle('active', i === idx);
    });
    // Update confirm button state for this file
    updateConfirmBtnUI();
  }

  function renderDocContentForFile(text) {
    const queries = sampleQueries;

    // Left: Original text
    const docOriginal = $('#docOriginal');
    if (docOriginal) {
      const activeFile = $('#activeFileName');
      const fileName = activeFile ? activeFile.textContent : '질의서_2024_0315.pdf';
      docOriginal.innerHTML = `
        <div class="orig-header">
          <span class="orig-badge">원본 문서</span>
          <span class="orig-file">${fileName}</span>
        </div>
        <div class="orig-page">
          <div class="orig-page-header">
            <p class="orig-dept">국회예산정책처</p>
            <p class="orig-doc-type">질 의 서</p>
            <p class="orig-meta">수신: 기획재정부 장관 | 문서번호: 예정처-2024-0315 | 일자: 2024.03.15</p>
          </div>
          <div class="orig-body">
            <p class="orig-subject"><strong>제목: 2024년도 주요 재정정책 관련 질의</strong></p>
            <br/>
            <p>1. 귀 부의 무궁한 발전을 기원합니다.</p>
            <br/>
            <p>2. 국회예산정책처에서는 2024년도 예산 및 기금운용계획안 분석을 위해 아래 사항에 대한 자료 제출 및 답변을 요청합니다.</p>
            <br/>
            <p class="orig-section-title"><strong>가. 질의사항</strong></p>
            ${queries.map((q, i) => `<p style="padding-left:16px;margin:12px 0;">① ${q.text}</p>`).join('<br/>')}
            <br/>
            <p style="text-align:right;margin-top:32px;">끝.</p>
          </div>
        </div>
      `;
    }

    // Right: Highlight view
    const highlightOn = $('#docHighlightToggle') ? $('#docHighlightToggle').checked : true;
    const hlColors = { single: '#dbeafe', multi: '#ede9fe', none: '#f3f4f6' };
    const hlBorders = { single: '#3b82f6', multi: '#8b5cf6', none: '#9ca3af' };

    let html = '<div class="doc-query-list">';
    queries.forEach((q, i) => {
      const keywords = q.keywords || [];
      let displayText = q.text;
      if (highlightOn && keywords.length) {
        keywords.forEach(kw => {
          displayText = displayText.replace(new RegExp(kw, 'g'), `<span class="kw">${kw}</span>`);
        });
      }
      const bgStyle = highlightOn ? `background:${hlColors[q.type] || hlColors.single};border-left:3px solid ${hlBorders[q.type] || hlBorders.single}` : '';
      html += `<div class="doc-query-item" data-qid="${q.id}" style="${bgStyle}">
        <span class="doc-query-num ${q.type}">${String(i + 1).padStart(2, '0')}</span>
        <span class="doc-query-page">P.${i + 1}</span>
        <span class="doc-query-text">${displayText}</span>
      </div>`;
    });
    html += '</div>';
    docContent.innerHTML = html;

    // Click to scroll to query card + highlight
    $$('.doc-query-item', docContent).forEach(item => {
      item.addEventListener('click', () => {
        const qid = item.dataset.qid;
        // Highlight active item
        $$('.doc-query-item', docContent).forEach(d => d.classList.remove('active'));
        item.classList.add('active');
        // Find and highlight matching card in query list
        const card = $(`.query-card[data-qid="${qid}"]`, queryList);
        if (card) {
          // Remove previous highlights
          $$('.query-card', queryList).forEach(c => { c.style.boxShadow = ''; c.classList.remove('mapped'); });
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.style.boxShadow = '0 0 0 2px var(--primary)';
          card.classList.add('mapped');
          setTimeout(() => { card.style.boxShadow = ''; card.classList.remove('mapped'); }, 3000);
        }
      });
    });

    // Highlight toggle
    const toggle = $('#docHighlightToggle');
    if (toggle) {
      toggle.onchange = () => renderDocContentForFile(text);
    }

  }

  // ─── File Upload ───
  function addFiles(files) {
    files.forEach(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      let type = 'txt';
      if (ext === 'pdf') type = 'pdf';
      else if (ext === 'hwp') type = 'hwp';
      else if (ext === 'docx') type = 'docx';
      else if (['png', 'jpg', 'jpeg', 'tif', 'tiff'].includes(ext)) type = 'img';

      const status = 'parsed';
      const size = (file.size / 1024 / 1024).toFixed(1) + 'MB';
      uploadedFiles.push({ name: file.name, type, size, status });

      // Generate sample data for new files if not in fileDataMap
      if (!fileDataMap[file.name]) {
        const baseName = file.name.replace(/\.[^.]+$/, '');
        fileDataMap[file.name] = {
          docText: `[AI 분석 결과] ${baseName}\n\n1. ${baseName} 관련 질의사항이 추출되었습니다. AI 에이전트가 문서를 분석하여 질의를 자동 분류합니다.\n\n2. 추출된 질의에 대해 담당실국이 추천되었습니다. 확인 후 확정해 주시기 바랍니다.`,
          queries: [
            { id: Date.now() + Math.random(), text: baseName + ' 관련 주요 질의사항 (AI 자동 추출)', type: 'single', typeLabel: '단일소관', mainDept: 'AI 추천 대기', coopDept: '', org: '기획재정부', confidence: 85 }
          ]
        };
      }
    });

    renderFileList();
    showToast(`${files.length}건 파일이 업로드되었습니다. AI 분석을 시작합니다.`);

    // Simulate AI analysis → then load first new file
    setTimeout(() => {
      const firstNewIdx = uploadedFiles.length - files.length;
      loadFileData(firstNewIdx);
      showToast('AI 분석 및 실국 매칭이 완료되었습니다.');

      // Update session info
      const session = sessions.find(s => s.id === activeSessionId);
      if (session) {
        session.files = uploadedFiles.map(f => f.name);
        session.queryCount = sampleQueries.length;
      }
    }, 1500);
  }

  function renderFileList() {
    fileCount.textContent = uploadedFiles.length + '건';
    fileList.innerHTML = uploadedFiles.map((f, i) => `
      <li class="${i === activeFileIndex ? 'active' : ''}" data-file-idx="${i}">
        <div class="file-icon ${f.type}">${f.type.toUpperCase()}</div>
        <div class="file-info">
          <span class="file-name">${f.name}</span>
          <span class="file-meta">${f.size}</span>
        </div>
        <span class="file-status ${f.status}">${'완료'}</span>
        <button type="button" class="icon-button icon-button-ghost file-remove" data-idx="${i}" aria-label="파일 삭제">×</button>
      </li>
    `).join('');

    // File click → load that file's data
    $$('.file-list li', fileList.parentElement).forEach(li => {
      li.addEventListener('click', (e) => {
        if (e.target.closest('.file-remove')) return;
        const idx = parseInt(li.dataset.fileIdx);
        loadFileData(idx);
      });
    });

    // Remove button
    $$('.file-remove', fileList).forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx);
        uploadedFiles.splice(idx, 1);
        if (activeFileIndex >= uploadedFiles.length) activeFileIndex = Math.max(0, uploadedFiles.length - 1);
        renderFileList();
        if (uploadedFiles.length > 0) loadFileData(activeFileIndex);
      });
    });
  }

  // ─── Document Content ───
  function renderDocContent() {
    // Use active file's data
    const file = uploadedFiles[activeFileIndex];
    const data = file ? fileDataMap[file.name] : null;
    const text = data ? data.docText : sampleDocText;
    renderDocContentForFile(text);
  }

  function handleDocTab(e) {
    $$('.doc-tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
    const view = e.target.dataset.view;
    if (view === 'highlight') {
      renderDocContent();
    } else if (view === 'text') {
      docContent.innerHTML = `<pre style="white-space:pre-wrap;font-size:13px;line-height:1.8;color:var(--text)">${sampleDocText}</pre>`;
    } else {
      docContent.innerHTML = `<div class="original-doc">
        <div class="orig-header">
          <span class="orig-badge">원본 문서</span>
          <span class="orig-file">질의서_2024_0315.pdf</span>
        </div>
        <div class="orig-page">
          <div class="orig-page-header">
            <p class="orig-dept">국회예산정책처</p>
            <p class="orig-doc-type">질 의 서</p>
            <p class="orig-meta">수신: 기획재정부 장관 | 문서번호: 예정처-2024-0315 | 일자: 2024.03.15</p>
          </div>
          <div class="orig-body">
            <p class="orig-subject">제목: 2024년도 주요 재정정책 관련 질의</p>
            <br/>
            <p>1. 귀 부의 무궁한 발전을 기원합니다.</p>
            <br/>
            <p>2. 국회예산정책처에서는 2024년도 예산 및 기금운용계획안 분석을 위해 아래 사항에 대한 자료 제출 및 답변을 요청합니다.</p>
            <br/>
            <p class="orig-section-title">가. 질의사항</p>
            <p style="padding-left:16px">① 2024년도 예산편성지침 중 인건비 산정기준 변경사항에 대한 구체적 안내를 요청합니다. 특히 공무원 보수 인상률 적용 시점과 관련하여 세부 기준이 필요합니다.</p>
            <br/>
            <p style="padding-left:16px">② 지방자치단체 재정자립도 산정 시 세외수입 항목의 포함 여부와 관련 법령 해석에 대해 질의합니다. 현행 지방재정법 제36조의2와 시행령 간 해석 차이가 있어 명확한 입장을 확인하고자 합니다.</p>
            <br/>
            <p style="padding-left:16px">③ 공공기관 경영평가 시 비계량지표 평가방법론 개선에 관하여 귀 부처의 의견을 조회합니다. 최근 3년간 평가결과 분석자료도 함께 회신 부탁드립니다.</p>
            <br/>
            <p style="padding-left:16px">④ 외국환거래법 개정(2024.3.1. 시행)에 따른 해외직접투자 신고절차 변경사항에 대해 안내를 요청합니다.</p>
            <br/>
            <p style="padding-left:16px">⑤ 최근 기상이변으로 인한 농작물 피해 현황에 대한 자료를 요청합니다.</p>
            <br/>
            <p>3. 상기 사항에 대해 2024년 3월 29일까지 회신하여 주시기 바랍니다.</p>
            <br/>
            <p style="text-align:right;margin-top:24px">국회예산정책처장</p>
          </div>
          <div class="orig-page-footer">
            <span>- 1 -</span>
          </div>
        </div>
      </div>`;
    }
  }

  // ─── AI Reason Generator ───
  function getAIReason(q) {
    const reasons = {
      'single': [
        `"${q.mainDept}" 소관 업무 키워드 매칭 (유사 질의 ${Math.floor(q.confidence * 0.8)}건 분석)`,
        `과거 답변 이력 기반 "${q.mainDept}" 단일소관 판정`,
        `질의 내용의 핵심 키워드가 "${q.mainDept}" 업무 범위에 집중`
      ],
      'multi': [
        `"${q.mainDept}" 주관 + "${q.coopDept}" 관련 키워드 동시 감지`,
        `복수 부서 업무영역에 걸친 복합 질의로 판단 (유사도 ${q.confidence}%)`,
        `주관 "${q.mainDept}" 확인, 협조 필요 근거: 관련 법령 교차 참조`
      ],
      'none': [
        `본 부처 소관 키워드 미감지. "${q.org}" 소관으로 추정`,
        `질의 내용이 타 부처 업무영역에 해당 (비소관 판정 신뢰도 ${q.confidence}%)`
      ]
    };
    const pool = reasons[q.type] || reasons['single'];
    return pool[q.id % pool.length];
  }

  // ─── Query List ───
  function createQueryCard(q) {
    const template = $('#queryCardTemplate');
    const card = template?.content.firstElementChild?.cloneNode(true);
    if (!card) return null;

    const reason = getAIReason(q);
    const barColor = q.confidence >= 90 ? 'var(--green)' : q.confidence >= 75 ? 'var(--primary)' : 'var(--orange)';
    const needsReview = q.confidence < 80;
    const number = $('[data-query-number]', card);
    const type = $('[data-query-type]', card);
    const review = $('[data-query-review]', card);
    const coopDept = $('[data-query-coop-dept]', card);
    const org = $('[data-query-org]', card);
    const conflict = $('[data-query-conflict]', card);
    const editButton = $('.query-edit-btn', card);

    card.dataset.qid = q.id;
    card.dataset.type = q.type;
    card.classList.toggle('needs-review', needsReview);

    number.textContent = `Q${q.id}`;
    number.classList.add(q.type);
    type.textContent = q.typeLabel;
    type.classList.add(q.type);
    review.classList.toggle('hidden', !needsReview);

    $('[data-query-text]', card).textContent = q.text;
    $('[data-query-main-dept]', card).textContent = `주관: ${q.mainDept}`;

    coopDept.textContent = q.coopDept ? `협조: ${q.coopDept}` : '';
    coopDept.classList.toggle('hidden', !q.coopDept);
    org.textContent = q.type === 'none' && q.org ? `비소관: ${q.org}` : '';
    org.classList.toggle('hidden', q.type !== 'none' || !q.org);

    $('[data-query-reason]', card).textContent = reason;
    $('[data-query-confidence-bar]', card).style.cssText = `width:${q.confidence}%;background:${barColor}`;
    $('[data-query-confidence]', card).textContent = `${q.confidence}%`;

    conflict.classList.toggle('hidden', !q.conflict);
    if (q.conflict) {
      $('[data-query-conflict-rule]', card).textContent = q.conflict.ruleLabel;
      $('[data-query-conflict-detail]', card).textContent = ` → ${q.conflict.ruleDept} / AI 추천 → ${q.conflict.aiDept}`;
    }

    editButton.dataset.qid = q.id;
    return card;
  }

  function renderQueryList() {
    let filtered;
    if (currentFilter === 'all') {
      filtered = sampleQueries;
    } else if (currentFilter === 'review') {
      filtered = sampleQueries.filter(q => q.confidence < 80);
    } else {
      filtered = sampleQueries.filter(q => q.type === currentFilter);
    }

    const cards = filtered.map(createQueryCard).filter(Boolean);
    queryList.replaceChildren(...cards);

    // Edit buttons
    $$('.query-edit-btn', queryList).forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const qid = parseInt(btn.dataset.qid);
        openEditModal(qid);
      });
    });

    // Card click → highlight in doc
    $$('.query-card', queryList).forEach(card => {
      card.addEventListener('click', () => {
        const qid = card.dataset.qid;
        const hl = $(`.highlight[data-qid="${qid}"]`, docContent);
        if (hl) {
          hl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          hl.style.outline = '2px solid var(--primary)';
          setTimeout(() => hl.style.outline = '', 1500);
        }
      });
    });
  }

  function handleFilter(e) {
    $$('.filter-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentFilter = e.target.dataset.filter;
    renderQueryList();
  }

  // ─── Stepper ───
  function updateStepper(activeStep) {
    $$('.step').forEach(step => {
      const s = parseInt(step.dataset.step);
      step.classList.remove('active', 'done');
      if (s < activeStep) step.classList.add('done');
      else if (s === activeStep) step.classList.add('active');
    });
  }

  // ─── Drawer ───
  function openDrawer() {
    runDrawer.classList.remove('hidden');
    drawerBackdrop.classList.remove('hidden');
    renderDrawer();
  }

  function closeDrawer() {
    runDrawer.classList.add('hidden');
    drawerBackdrop.classList.add('hidden');
  }

  function renderDrawer() {
    $('#runCount').textContent = sessions.length + '건';
    $('#runList').innerHTML = sessions.map(s => `
      <li class="run-item${s.id === activeSessionId ? ' active' : ''}" data-session="${s.id}">
        <span class="run-dot ${s.status === 'done' ? '' : 'pending'}"></span>
        <div class="run-info">
          <span class="run-title">${s.title}</span>
          <span class="run-time">${s.date} ${s.time} · 질의 ${s.queryCount}건</span>
        </div>
      </li>
    `).join('');

    // Session click → load that session
    $$('.run-item', $('#runList')).forEach(item => {
      item.addEventListener('click', () => {
        const sid = parseInt(item.dataset.session);
        loadSession(sid);
        closeDrawer();
      });
    });

    $('#workLog').innerHTML = sampleLogs.map(l => `
      <li>
        <span class="log-time">${l.time}</span>
        ${l.msg}
      </li>
    `).join('');
  }

  function loadSession(sid) {
    const session = sessions.find(s => s.id === sid);
    if (!session) return;
    activeSessionId = sid;

    // Load files from session
    uploadedFiles = session.files.map(name => {
      const ext = name.split('.').pop().toLowerCase();
      let type = 'txt';
      if (ext === 'pdf') type = 'pdf';
      else if (ext === 'hwp') type = 'hwp';
      else if (ext === 'docx') type = 'docx';
      else if (['png','jpg','jpeg'].includes(ext)) type = 'img';
      return { name, type, size: '1.0MB', status: 'parsed' };
    });

    activeFileIndex = 0;
    renderFileList();
    if (uploadedFiles.length > 0) {
      loadFileData(0);
    } else {
      sampleQueries.length = 0;
      docContent.innerHTML = `<div class="doc-placeholder"><img class="placeholder-icon" data-icon="document" alt="" aria-hidden="true" /><p>문서를 업로드하면 여기에 표시됩니다</p></div>`;
      queryList.innerHTML = '';
    }
    updateConfirmBtnUI();
    showToast(`"${session.title}" 세션을 불러왔습니다.`);
  }

  // ─── Edit Modal ───
  function openEditModal(qid) {
    editingQuery = sampleQueries.find(q => q.id === qid);
    if (!editingQuery) return;
    $('#editQueryText').value = editingQuery.text;
    $('#editType').value = editingQuery.type;
    $('#editMainDept').value = editingQuery.mainDept;
    $('#editCoopDept').value = editingQuery.coopDept;
    $('#editOrg').value = editingQuery.org;
    editModal.classList.remove('hidden');
  }

  function closeEditModal() {
    editModal.classList.add('hidden');
    editingQuery = null;
  }

  function applyEdit() {
    if (!editingQuery) return;
    const typeMap = { single: '단일소관', multi: '복수소관', none: '비소관', unclear: '소관불명확' };
    editingQuery.text = $('#editQueryText').value;
    editingQuery.type = $('#editType').value;
    editingQuery.typeLabel = typeMap[$('#editType').value] || '단일소관';
    editingQuery.mainDept = $('#editMainDept').value;
    editingQuery.coopDept = $('#editCoopDept').value;
    editingQuery.org = $('#editOrg').value;
    closeEditModal();
    renderQueryList();
    renderDocContent();
    showToast('매칭부서가 수정되었습니다.');
  }

  // ─── Reset ───
  function resetAll() {
    uploadedFiles = [];
    sampleQueries.length = 0;
    renderFileList();
    // Original view empty
    const docOriginal = $('#docOriginal');
    if (docOriginal) {
      docOriginal.innerHTML = `<div class="doc-placeholder"><img class="placeholder-icon" data-icon="document" alt="" aria-hidden="true" /><p>문서를 업로드하면 원본이 표시됩니다</p></div>`;
    }
    // Highlight view empty
    docContent.innerHTML = `<div class="doc-placeholder"><img class="placeholder-icon" data-icon="document" alt="" aria-hidden="true" /><p>문서를 업로드하면 질의 추출 결과가 표시됩니다</p></div>`;
    // Query list empty
    queryList.innerHTML = `<div class="doc-placeholder" style="padding:40px 20px"><img class="placeholder-icon" data-icon="list" alt="" aria-hidden="true" /><p>질의 분류 결과가 여기에 표시됩니다</p></div>`;
    // Update stats
    const statTotal = $('#statTotal');
    if (statTotal) statTotal.textContent = '0';
    const statSingle = $('#statSingle');
    if (statSingle) statSingle.textContent = '0';
    const statMulti = $('#statMulti');
    if (statMulti) statMulti.textContent = '0';
    const statNone = $('#statNone');
    if (statNone) statNone.textContent = '0';
    // File name
    const fileName = $('#activeFileName');
    if (fileName) fileName.textContent = '파일을 선택하세요';
    showToast('초기화되었습니다.');
  }

  // ─── Fullscreen ───
  function toggleFullscreen() {
    const isFullscreen = document.body.classList.toggle('fullscreen-mode');
    const topbarLogoBtn = $('#topbarLogoBtn');
    if (isFullscreen) {
      topbarLogoBtn.classList.remove('hidden');
      showToast('전체화면 모드');
    } else {
      topbarLogoBtn.classList.add('hidden');
      showToast('일반 모드');
    }
  }

  // ─── Confirm/Notify State per File ───
  // States: 'confirm' | 'notify' | 'done'
  const fileConfirmState = {};

  function handleConfirmBtn() {
    const btn = $('#confirmBtn');
    if (!btn) return;
    const fileKey = uploadedFiles[activeFileIndex] ? uploadedFiles[activeFileIndex].name : '';
    const state = fileConfirmState[fileKey] || 'confirm';

    if (state === 'confirm') {
      customConfirm('질의 확정', '질의 및 실국을 확정하시겠습니까?', () => {
        fileConfirmState[fileKey] = 'notify';
        updateConfirmBtnUI();
        showToast('확정되었습니다.');
      });
    } else if (state === 'notify') {
      customConfirm('알림 전송', '실국담당자에게 알림을 전송하시겠습니까?', () => {
        fileConfirmState[fileKey] = 'done';
        updateConfirmBtnUI();
        showToast('실국담당자에게 알림이 전송되었습니다.');
      });
    }
  }

  function handleConfirmCancel() {
    const fileKey = uploadedFiles[activeFileIndex] ? uploadedFiles[activeFileIndex].name : '';
    const state = fileConfirmState[fileKey] || 'confirm';
    if (state === 'notify') {
      customConfirm('확정 취소', '확정을 취소하고 이전 상태로 되돌리시겠습니까?', () => {
        fileConfirmState[fileKey] = 'confirm';
        updateConfirmBtnUI();
        showToast('확정이 취소되었습니다.');
      });
    }
  }

  function updateConfirmBtnUI() {
    const btn = $('#confirmBtn');
    if (!btn) return;
    const fileKey = uploadedFiles[activeFileIndex] ? uploadedFiles[activeFileIndex].name : '';
    const state = fileConfirmState[fileKey] || 'confirm';

    btn.disabled = false;
    btn.style.opacity = '';
    btn.classList.remove('primary');
    btn.classList.add('primary');

    // Show/hide cancel button
    const cancelBtn = $('#confirmCancelBtn');

    if (state === 'confirm') {
      btn.textContent = '확정';
      if (cancelBtn) cancelBtn.classList.add('hidden');
    } else if (state === 'notify') {
      btn.textContent = '실국알림';
      if (cancelBtn) cancelBtn.classList.remove('hidden');
    } else if (state === 'done') {
      btn.textContent = '알림전송완료';
      btn.disabled = true;
      btn.style.opacity = '0.6';
      if (cancelBtn) cancelBtn.classList.add('hidden');
    }
  }

  // ─── Rule Management ───
  const classifyRules = [
    { id: 1, keywords: '에너지', condition: '"에너지" 단독 이슈 (친환경/미래산업 미포함)', dept: '자원정책국', priority: 1, conflict: 'rule', active: true },
    { id: 2, keywords: '친환경 에너지, 미래산업, 구조개혁', condition: '"친환경 에너지", "미래산업", "구조개혁" 함께 포함 시', dept: '산업정책국', priority: 2, conflict: 'both', active: true },
    { id: 3, keywords: '청년, 일자리', condition: '"청년" + "일자리" 조합', dept: '고용정책과', priority: 2, conflict: 'rule', active: true },
    { id: 4, keywords: '청년, 주거', condition: '"청년" + "주거" 조합', dept: '국토정책국', priority: 2, conflict: 'both', active: false },
    { id: 5, keywords: '청년, 복지, 재정지원', condition: '"청년" + "복지/재정지원" 조합', dept: '복지정책국', priority: 3, conflict: 'ai', active: true }
  ];

  function initRuleManagement() {
    const ruleBtn = $('#ruleManageBtn');
    const ruleDrawer = $('#ruleDrawer');
    const ruleDrawerBackdrop = $('#ruleDrawerBackdrop');
    const ruleDrawerClose = $('#ruleDrawerClose');
    const addRuleBtn = $('#addRuleBtn');
    const ruleFormSave = $('#ruleFormSave');
    const ruleApplyBtn = $('#ruleApplyBtn');

    if (!ruleBtn || !ruleDrawer) return;

    function openRuleDrawer() {
      ruleDrawer.classList.remove('hidden');
      ruleDrawerBackdrop.classList.remove('hidden');
      renderRuleList();
    }
    function closeRuleDrawer() {
      ruleDrawer.classList.add('hidden');
      ruleDrawerBackdrop.classList.add('hidden');
    }

    ruleBtn.addEventListener('click', openRuleDrawer);
    ruleDrawerClose.addEventListener('click', closeRuleDrawer);
    ruleDrawerBackdrop.addEventListener('click', closeRuleDrawer);

    addRuleBtn.addEventListener('click', () => {
      $('#ruleKeywords').value = '';
      $('#ruleIncludeKeywords').value = '';
      $('#ruleExcludeKeywords').value = '';
      $('#ruleMemo').value = '';
      showToast('새 룰이 추가되었습니다. 내용을 입력하세요.');
    });
    ruleFormSave.addEventListener('click', () => {
      const keywords = $('#ruleKeywords').value.trim();
      const condition = $('#ruleCondition').value.trim();
      const dept = $('#ruleDept').value.trim();
      if (!keywords || !dept) { showToast('키워드와 추천 국/실을 입력해주세요.'); return; }
      classifyRules.push({
        id: Date.now(),
        keywords,
        condition: condition || keywords + ' 포함 시',
        dept,
        priority: parseInt($('#rulePriority').value),
        conflict: document.querySelector('input[name="ruleConflict"]:checked').value,
        active: true
      });
      renderRuleList();
      showToast('분류 룰이 저장되었습니다.');
    });
  }

  function renderRuleList() {
    const list = $('#ruleList');
    if (!list) return;
    list.innerHTML = classifyRules.map((r, i) => `
      <div class="rule-item${i === 0 ? ' active' : ''}${r.active ? '' : ' disabled'}" data-rule-id="${r.id}">
        <div class="rule-item-head">
          <span class="rule-item-keywords">${r.keywords}</span>
          <span class="rule-item-status ${r.active ? 'on' : 'off'}">${r.active ? '사용' : '미사용'}</span>
        </div>
        <div class="rule-item-body">${r.condition} → ${r.dept}</div>
      </div>
    `).join('');

    // Click to select
    list.querySelectorAll('.rule-item').forEach(item => {
      item.addEventListener('click', () => {
        list.querySelectorAll('.rule-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });
  }

  // ─── Excel Download ───
  function downloadExcel() {
    const today = new Date().toISOString().slice(0, 10);
    const queries = sampleQueries;

    // Build CSV content (BOM for Korean support in Excel)
    const headers = ['실행일', '요구일', '질의ID', '질의번호', '질의요지', '담당실국', '협조', '제출기한'];
    const rows = queries.map((q, i) => [
      today,
      '2024.03.15',
      'Q-2024-' + String(q.id).padStart(4, '0'),
      i + 1,
      '"' + q.text.replace(/"/g, '""') + '"',
      q.mainDept,
      q.coopDept || '',
      '2024.03.29'
    ]);

    let csv = '\uFEFF'; // BOM
    csv += headers.join(',') + '\n';
    rows.forEach(row => { csv += row.join(',') + '\n'; });

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '질의목록_추천실국_' + today + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('엑셀 파일이 다운로드되었습니다.');
  }

  // ─── Custom Modal ───
  function customConfirm(title, msg, onConfirm, type = 'confirm') {
    let modal = $('#customModalBackdrop');
    if (!modal) { modal = document.createElement('div'); modal.id = 'customModalBackdrop'; modal.className = 'custom-modal-backdrop'; document.body.appendChild(modal); }
    const iconCls = type === 'danger' ? 'danger' : 'confirm';
    const btnCls = type === 'danger' ? 'btn-confirm danger' : 'btn-confirm';
    modal.innerHTML = `<div class="custom-modal"><div class="custom-modal-icon ${iconCls}">${type === 'danger' ? '⚠' : '?'}</div><div class="custom-modal-title">${title}</div><div class="custom-modal-msg">${msg}</div><div class="custom-modal-actions"><button class="btn-cancel" id="cmCancel">취소</button><button class="${btnCls}" id="cmConfirm">확인</button></div></div>`;
    modal.classList.remove('hidden');
    $('#cmCancel').addEventListener('click', () => modal.classList.add('hidden'));
    $('#cmConfirm').addEventListener('click', () => { modal.classList.add('hidden'); if (onConfirm) onConfirm(); });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
  }

  // ─── Toast ───
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2500);
  }

  // ─── Start ───
  window.AppCommon.whenReady(init);
})();
