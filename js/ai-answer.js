(function () {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  // ─── Data ───
  const treeData = [
    { name: '전체 자료', icon: '📂', indent: 0, id: 'root', open: true },
    { name: '국정감사', icon: '📁', indent: 1, id: 'audit', parent: 'root' },
    { name: '추가질의', icon: '📁', indent: 1, id: 'extra', parent: 'root' },
    { name: '2026년', icon: '📁', indent: 1, id: 'y2026', parent: 'root', open: true },
    { name: '입법위원회', icon: '📁', indent: 2, id: 'legis', parent: 'y2026' },
    { name: '기획재정위원회', icon: '📁', indent: 2, id: 'finance', parent: 'y2026', active: true },
    { name: '정무위원회', icon: '📁', indent: 2, id: 'admin', parent: 'y2026' },
    { name: '2026년', icon: '📁', indent: 1, id: 'y2026', parent: 'root' },
    { name: '미래전략', icon: '📁', indent: 2, id: 'future', parent: 'y2026' },
    { name: '답변서', icon: '📁', indent: 0, id: 'answers' },
    { name: '보고서', icon: '📁', indent: 0, id: 'reports' },
    { name: '법령/지침', icon: '📁', indent: 0, id: 'laws' },
    { name: '통계자료', icon: '📁', indent: 0, id: 'stats' }
  ];

  let fileIdSeq = 0;
  const files = [
    { id: ++fileIdSeq, name: '260402_재경위_전체 의원 질의에 대한 답변_통합본.hwp', size: '3.2MB', type: 'pdf', status: 'done', chunks: 13 },
    { id: ++fileIdSeq, name: '지방채 인수를 해야 하는 법적 의무.hwpx', size: '1.1MB', type: 'docx', status: 'done', chunks: 8 },
    { id: ++fileIdSeq, name: '지방교부세가 지급되고 있고 지방채 인수시 추경 편성 이유.hwpx', size: '0.8MB', type: 'docx', status: 'done', chunks: 11 }
  ];

  // 파일 처리 파이프라인 단계 정의: 파싱 → SLM 자연어화 → 청킹
  const FILE_STAGES = [
    { status: 'parsing', label: '파싱 중', delay: 900 },
    { status: 'summarizing', label: 'SLM 자연어화 중', delay: 900 },
    { status: 'chunking', label: '청킹 중', delay: 800 },
    { status: 'done', label: '청킹 완료', delay: 0 }
  ];

  const recommendations = [
    // 유사답변서 (과거답변서 + 마스터답변)
    {
      id: 1, title: '260402_재경위_전체 의원 질의에 대한 답변_통합본', score: 91, rank: 1,
      meta: '과거답변서 · 2026년 · 기획재정위원회', category: 'similar',
      desc: '공자기금 지방채 인수 제도 개요, 추경 편성 배경, 지원조건(5년 거치 10년 상환) 등 포함.',
      tags: ['과거답변서', '지방채인수'],
      preview: { org: '기획재정위원회 · 2026년', title: '재경위 전체 의원 질의에 대한 답변 통합본', sections: [
        { title: '질의 배경', items: ['재경위 소속 의원 다수가 지방채 인수 제도와 추경 편성 배경에 대해 공통 질의를 제기함', '지방교부세와 지방채의 재원 성격 차이에 대한 설명 요청이 다수 포함됨'] },
        { title: '활용 가능 문단', items: ['공자기금은 지방재정 지원을 목적으로 지자체가 발행하는 지방채를 장기 저리로 인수하여 자금을 지원함', '특정 자본적 지출 사업의 원활한 추진을 위해 필요한 경우 추경을 통해 인수 예산을 편성함'] },
        { title: '제도 운영 현황', items: ['인수금리는 공자기금 예탁금리와 동일하게 분기별로 고정되어 적용됨', '인수기간은 5년 거치 10년 분할 상환 조건으로 운영됨'] },
        { title: '초안 반영 제안', items: ['제도 개요 표(지원대상/사업/조건/절차) 직접 활용', '금리 수치 최신 고시 기준 확인 필요'] }
      ] }
    },
    {
      id: 2, title: '지방채 인수를 해야 하는 법적 의무', score: 88, rank: 2,
      meta: '참고문서 · 법령근거 · 재정정책국', category: 'similar',
      desc: '지방재정법 시행령 제11조, 공공자금관리기금법 시행령 제2조 등 법적 근거 정리.',
      tags: ['법령근거', '공자기금'],
      preview: { org: '재정정책국 · 법령분석', title: '지방채 인수를 해야 하는 법적 의무', sections: [
        { title: '법적 근거', items: ['지방재정법 시행령 제11조에 따라 행안부가 지방채 발행계획을 수립', '공공자금관리기금법 시행령 제2조에 의거하여 기금 운용'] },
        { title: '관련 조문 해설', items: ['지방재정법 제11조는 지자체의 자본적 지출 사업에 대한 지방채 발행 요건을 규정', '공자기금법은 기금 운용의 목적과 대상 사업 범위를 명시'] },
        { title: '초안 반영 제안', items: ['집행절차 법적 근거로 활용', '제도 정당성 강조 시 인용'] }
      ] }
    },
    {
      id: 3, title: '지방교부세가 지급되고 있고 지방채 인수시 지자체 채무는 증가함에도 추경을 편성해야 하는 이유', score: 95, rank: 3,
      meta: '원본질의 · 2026년 · 기획재정위원회', category: 'similar',
      desc: '본 질의에 대한 직접 답변 자료. 공자기금 제도 개요, 추경 배경, 광주·전남 사례 포함.',
      tags: ['원본답변', '추경편성'],
      preview: { org: '기획재정위원회 · 2026년', title: '지방채 인수 추경 편성 사유 답변', sections: [
        { title: '질의 요지', items: ['지방교부세 지급 중에도 지방채 인수로 채무가 증가하는데 추경을 편성하는 이유를 질의'] },
        { title: '활용 가능 문단', items: ['지자체의 특정 자본적 지출 사업 수행을 위해 공자기금이 지방채를 장기 저리로 인수', '광주·전남 통합특별시 출범 관련 약 1,000억 원 규모 추경 수요'] },
        { title: '지자체별 세부 수요', items: ['전남: 안내표지판 설치, 통합전산망 구축 등 700억 원', '광주: 재난관리기금, 재해구호기금 조성 등 195억 원'] },
        { title: '초안 반영 제안', items: ['답변 요약문 직접 활용', '추경 사례 및 지자체별 수요 인용'] }
      ] }
    },
    {
      id: 4, title: '민주당 반대로 무산된 TK통합법 관련 지방채 인수 추경안 견해', score: 76,
      meta: '참고답변 · 2026년 · 기획재정위원회', category: 'similar',
      desc: 'TK통합법 통과 시 지방채 인수 추경안 포함 가능성에 대한 정부 견해.',
      tags: ['참고답변', 'TK통합'],
      preview: { org: '기획재정위원회 · 2026년', title: 'TK통합법 관련 지방채 인수 견해', sections: [
        { title: '질의 배경', items: ['대구·경북 통합 관련 법안(TK통합법)이 여야 협상 결렬로 처리되지 못한 상황에서 지방채 인수안 포함 가능성에 대한 견해 요청'] },
        { title: '활용 가능 문단', items: ['통합법 통과 시 추가 지방채 인수 수요 발생 가능', '현행 추경안은 광주·전남 통합 수요만 반영'] },
        { title: '초안 반영 제안', items: ['비교 논거로 활용 가능', '정치적 맥락은 답변서에서 제외 권장'] }
      ] }
    },
    // 참고자료 (첨부자료 + 초안 근거자료)
    {
      id: 5, title: "지방채 인수 예산 현황표 ('16~'26)", score: 95, rank: 1,
      meta: '참고자료 · 첨부용 · 재정정책국', category: 'reference',
      desc: '연도별 지방채 인수 계획/실적/인수잔액 현황. 2016년~2026년 전체 추이.',
      tags: ['첨부자료', '인수현황'],
      preview: { org: '재정정책국 · 2026년', title: '지방채 인수 예산 현황표', sections: [
        { title: '연도별 추이 개요', items: ["2016년부터 2026년까지 지방채 인수 계획 대비 실적을 매년 집계", '최근 3개년은 실적이 계획 대비 90% 이상 수준으로 안정적으로 집행됨'] },
        { title: '포함 항목', items: ["'25년 예산(최종): 12,100억, 결산: 10,712억", "'26년 본예산: 1,000억, 추경안: 2,000억 (증감 +1,000)", "'25년 인수잔액: 71,532억"] },
        { title: '활용 방안', items: ['답변서 표 삽입용 (예산 현황)', '연도별 추이 시각자료로 활용'] }
      ] }
    },
    {
      id: 6, title: '광주·전남 통합 관련 추경 수요 상세', score: 92, rank: 2,
      meta: '참고자료 · 근거자료 · 지역발전정책국', category: 'reference',
      desc: '전남광주통합특별시 설치 특별법 관련 추경 규모(1,000억) 및 지자체별 세부 수요.',
      tags: ['근거자료', '광주전남'],
      preview: { org: '지역발전정책국 · 2026년', title: '광주·전남 통합 관련 추경 수요', sections: [
        { title: '통합 추진 경과', items: ["전남광주통합특별시 설치를 위한 특별법이 국회 통과", "특별법 '26.3.5. 시행 → '26.7.1. 통합특별시 출범 예정"] },
        { title: '주요 내용', items: ["출범일: 2026.7.1. (특별법 '26.3.5. 시행)", '전남: 안내표지판, 통합전산망 등 700억 원', '광주: 재난관리기금, 재해구호기금 등 195억 원'] },
        { title: '활용 방안', items: ['추경 편성 사례 직접 근거', '지자체별 수요 명세로 인용'] }
      ] }
    },
    {
      id: 7, title: '세수추계 및 세입경정 운용 자료', score: 84, rank: 3,
      meta: '참고자료 · 분석자료 · 세제실', category: 'reference',
      desc: '국채 발행 없이 초과세수만으로 추경 편성. 세목별 규모 및 추계위원회 검증 결과.',
      tags: ['세입경정', '세수추계'],
      preview: { org: '세제실 · 2026년', title: '세수추계 및 세입경정 운용', sections: [
        { title: '재원 조달 방식', items: ['국채 발행 없이 초과세수만으로 추경 재원을 조달', '재정건전성 훼손 없이 자본적 지출 수요에 대응'] },
        { title: '주요 내용', items: ['초과세수 기반 추경 편성 (국채 발행 無)', '세목별: 법인세(+148), 증권거래세(+52), 농특세(+51)', '세수추계위원회(3.20) 및 민간자문단(3.24) 검증'] },
        { title: '활용 방안', items: ['추경 재원 건전성 설명 시 활용', '세입 증액 경정 근거'] }
      ] }
    },
    {
      id: 8, title: '세수추계 오차 분석 및 개선 방안', score: 72,
      meta: '참고자료 · 분석보고서 · 세제실', category: 'reference',
      desc: '과거 세수추계 오차 원인 분석. 법인+자산세수 비중(37.8%)이 OECD 평균(22.8%) 대비 높음.',
      tags: ['분석보고서', '세수오차'],
      preview: { org: '세제실 · 2026년', title: '세수추계 오차 분석', sections: [
        { title: '분석 배경', items: ['최근 수년간 세수추계와 실제 세수 간 오차가 지속적으로 발생하여 원인 분석 필요성 제기'] },
        { title: '주요 내용', items: ['오차 원인: 경제여건 급변, 세수 오버슈팅 오인, 정책 조정', "구조적 취약성: 법인+자산세 비중 37.8% (OECD 22.8%)", '예정처 전망과 정부안 차이: △1.7조 원'] },
        { title: '활용 방안', items: ['세수 관련 후속 질의 대비 참고', '추경 편성 배경 보충 설명'] }
      ] }
    }
  ];

  function buildDocMetaBox(items) {
    if (!items || !items.length) return '';
    return `<div class="web-doc-meta-box">${items.map(item => `
      <div class="web-doc-meta-item"><span class="web-doc-meta-label">${item.label}</span><span>${item.value}</span></div>
    `).join('')}</div>`;
  }

  function buildDocSection(section, contextTitle) {
    const sectionTitle = section.title || '주요 내용';
    const desc = section.desc || `${contextTitle}와 관련하여 ${sectionTitle}에 대한 검토 내용을 정리한 문단입니다. 실제 답변서 작성 시에는 핵심 논거, 수치, 추진 경과를 함께 확인할 수 있도록 문장 길이를 충분히 확보한 형태로 제시합니다.`;
    const note = section.note || `${sectionTitle} 관련 문단은 실제 스캔 문서처럼 충분한 분량을 유지하도록 보강되었으며, 실무 검토 시에는 근거자료와 답변 논리를 함께 확인할 수 있습니다.`;
    return `<div class="web-doc-section">
      <h4 class="web-doc-section-title">${sectionTitle}</h4>
      <p class="web-doc-section-desc">${desc}</p>
      <ul class="web-doc-list">${(section.items || []).map(item => `<li>${item}</li>`).join('')}</ul>
      <div class="web-doc-note">${note}</div>
    </div>`;
  }

  function buildDocPage({ org, title, continueTitle, pageIdx, totalPages, metaItems, lead, sections, tableHtml }) {
    const header = pageIdx === 0
      ? `<span class="web-doc-org">${org}</span><h3 class="web-doc-title">${title}</h3>`
      : `<span class="web-doc-org">${continueTitle || `${title} · (계속)`}</span>`;
    return `<div class="web-doc-page">
      <div class="web-doc-header${pageIdx > 0 ? ' web-doc-header-sub' : ''}">${header}</div>
      <div class="web-doc-body">
        ${pageIdx === 0 ? buildDocMetaBox(metaItems || []) : ''}
        ${lead ? `<p class="web-doc-lead">${lead}</p>` : ''}
        ${(sections || []).map(section => buildDocSection(section, title)).join('')}
        ${tableHtml || ''}
      </div>
      <div class="web-doc-page-footer"><span>- ${pageIdx + 1} / ${totalPages} -</span></div>
    </div>`;
  }

  function buildCompareReferencePages() {
    const pages = [
      {
        org: '기획재정위원회 · 2026년',
        title: '260402_재경위_전체 의원 질의에 대한 답변_통합본',
        metaItems: [
          { label: '문서구분', value: '과거답변서 / 유사도 91%' },
          { label: '소관부서', value: '재정정책국 · 재정관리과' },
          { label: '검토범위', value: '지방채 인수 제도 개요, 추경 편성 배경, 사례' },
          { label: '활용메모', value: '핵심 논거와 표 서식은 현 초안에 직접 반영 가능' }
        ],
        lead: '본 문서는 재경위 전체 의원 질의에 대한 과거 답변 통합본으로, 공공자금관리기금의 지방채 인수 제도와 추경 편성의 불가피성을 설명하는 표준 문안을 포함하고 있습니다. 실제 업무 화면의 문서 미리보기처럼 한 페이지에 충분한 분량이 보이도록 문단과 항목을 보강하였습니다.',
        sections: [
          { title: '1. 질의 배경', desc: '재경위 소속 의원들은 지방교부세가 이미 지급되고 있는 상황에서 추가로 지방채 인수 추경을 편성하는 배경과 필요성을 집중적으로 질의하였습니다. 특히 일반재원과 목적성 재원의 차이, 지방채 인수의 법적 성격, 재정건전성에 미치는 영향 등을 함께 설명할 필요가 있다는 점이 검토의 출발점이 되었습니다.', items: ['지방교부세는 일반재원 성격을 가지나, 지방채 인수는 특정 자본적 지출 사업에 대한 목적성 재원 지원이라는 점을 우선 설명할 필요가 있음', '의원 질의는 단순한 예산 증액 사유보다도 지방재정 운영체계상 왜 별도 재원 조달이 필요한지에 대한 정책적 설명을 요구하고 있음', '답변서 작성 시에는 지방채 인수의 대상 사업, 인수 조건, 절차와 함께 실제 사례를 결합하여 서술하는 것이 이해도를 높이는 데 유리함'], note: '질의 배경 문단은 실제 답변서의 첫머리에서 배경 설명과 쟁점 정리를 동시에 수행하는 역할을 하므로, 문장 길이를 충분히 유지한 형태가 바람직합니다.' },
          { title: '2. 활용 가능 문단', desc: '과거 답변서에서 직접 활용 가능한 핵심 문장들은 제도 목적, 예산 편성 배경, 자금지원 방식 등을 간결하면서도 논리적으로 정리하고 있습니다. 초안 반영 시에는 동일한 논리 구조를 유지하되 시점에 따라 최신 수치와 사례만 갱신하는 방식이 효율적입니다.', items: ['공자기금은 지방재정 지원을 목적으로 지자체가 발행하는 지방채를 장기 저리로 인수하여 자금을 지원함', '도로, 지하철 건설, 공공용 시설 설치 및 지역개발사업 등 특정 자본적 지출 사업의 원활한 추진을 위해 추경을 통해 인수 예산을 편성함', '지방교부세는 일반재원으로 폭넓게 활용되나, 지방채 인수는 특정 사업의 적기 집행을 위한 별도 금융지원 수단으로 운용된다는 점을 함께 설명할 필요가 있음'] }
        ]
      },
      {
        org: '기획재정위원회 · 2026년',
        title: '260402_재경위_전체 의원 질의에 대한 답변_통합본',
        continueTitle: '260402_재경위_전체 의원 질의에 대한 답변_통합본 · (계속)',
        lead: '다음 페이지는 제도 운영 현황과 집행 절차, 초안 작성 시 주의할 수치 항목을 정리한 부분입니다. 실제 검토 문서처럼 설명 문장과 목록, 표를 함께 배치하여 한 화면에서 더 많은 문서 정보를 확인할 수 있도록 구성하였습니다.',
        sections: [
          { title: '3. 제도 운영 현황', desc: '지방채 인수 제도는 분기별 금리 변동, 장기 상환 구조, 행정안전부와의 협의 절차 등 운영상 특징이 명확합니다. 따라서 답변서에는 단순한 제도 소개를 넘어 인수금리 산정 방식과 상환 조건이 지방재정 지원이라는 목적에 어떻게 부합하는지 설명하는 문단이 필요합니다.', items: ['인수금리는 공자기금 예탁금리와 동일하게 분기별로 고정되어 적용되며, 답변 시점의 최신 분기 수치 확인이 필요함', '인수기간은 5년 거치 10년 분할 상환으로 운영되어 자금 부담을 장기에 걸쳐 분산할 수 있음', '행안부의 지방채 발행계획 수립 및 승인 절차와 연계되어 집행되므로, 관계부처 협의 절차를 답변에 병기하는 것이 적절함'] },
          { title: '4. 초안 반영 제안', desc: '현 답변서 초안에 반영할 때는 표 형식의 제도 개요, 사례 중심의 추경 편성 사유, 그리고 재정건전성 관련 보충 문장을 결합하는 방식이 가장 효율적입니다. 금리나 예산 수치 등 변동 가능성이 있는 값은 반드시 최신 자료를 기준으로 갱신해야 합니다.', items: ['지원대상/지원사업/지원조건/집행절차 표는 과거답변의 틀을 그대로 활용 가능', '금리 수치(예: 2026년 2분기 3.435%)는 최신 고시 기준으로 재확인 필요', '채무비율 관리 계획 또는 사후 관리 방안 문장을 추가하면 답변의 완성도를 높일 수 있음'] },
        ],
        tableHtml: `<table class="web-doc-table"><thead><tr><th>항목</th><th>주요 내용</th></tr></thead><tbody><tr><td>인수금리</td><td>공자기금 예탁금리와 동일(분기별 고정 적용)</td></tr><tr><td>인수기간</td><td>5년 거치 10년 분할 상환</td></tr><tr><td>집행절차</td><td>행안부 발행계획 마련 및 협의 → 지자체별 승인 → 지방의회 의결 후 인수 요청</td></tr></tbody></table>`
      },
      {
        org: '기획재정위원회 · 2026년',
        title: '260402_재경위_전체 의원 질의에 대한 답변_통합본',
        continueTitle: '260402_재경위_전체 의원 질의에 대한 답변_통합본 · (부속)',
        lead: '마지막 페이지는 실제 사례와 예산 현황, 답변서 문안 작성 시 강조 포인트를 정리한 부속 설명입니다. 스캔 문서처럼 비교적 긴 텍스트 블록과 표, 주석이 함께 보이도록 구성하였습니다.',
        sections: [
          { title: '5. 비교 관점 및 사례', desc: '광주·전남 통합특별시 사례는 이번 질의에서 추경 편성의 직접적 배경으로 제시할 수 있는 대표 사례입니다. 사례를 설명할 때는 출범 일정, 추경 규모, 지자체별 세부 수요를 함께 적시해야 정책적 설득력이 확보됩니다.', items: ['광주·전남 통합특별시(2026.7.1. 출범) 사례가 추경 편성의 직접적 근거로 활용 가능', '지방채 인수 예산 현황(2026년 예산 12,100억 → 2026년 추경안 2,000억)과 함께 증감 배경을 설명하는 것이 적절함', '전남 700억 원, 광주 195억 원 등 세부 수요를 병기하면 답변의 구체성이 높아짐'] },
          { title: '6. 답변서 작성 메모', desc: '답변서 최종본에는 지나치게 장황한 표현을 줄이되, 근거가 되는 문장과 수치를 충분히 남겨야 합니다. 따라서 비교 문서와의 차이를 확인하면서도 기준 문서의 설명 구조를 유지하는 방식으로 수정하는 것이 권장됩니다.', items: ['질문 요지 → 제도 설명 → 사례 제시 → 재정건전성 보완 설명의 순서를 유지', '출처번호와 근거문단을 병기하여 검증 단계에서 재사용할 수 있도록 구성', '실제 제출 전에는 최신 수치와 관계부처 협의 현황을 다시 확인'] }
        ]
      }
    ];
    return pages.map((page, index) => buildDocPage({ ...page, pageIdx: index, totalPages: pages.length })).join('');
  }

  function buildCompareDraftPages() {
    const pages = [
      {
        org: '재정경제부 · 답변서 초안',
        title: '국회 기획재정위원회 질의에 대한 답변(초안)',
        metaItems: [
          { label: '문서구분', value: '현재 작성 중인 초안' },
          { label: '연계자료', value: '유사답변서 5건 · 참조자료 7건 반영' },
          { label: '초안상태', value: '논리구조 정리 완료 / 수치 재확인 1건' },
          { label: '검토포인트', value: '근거 문장, 금리 수치, 사례 문장 정합성 확인' }
        ],
        lead: '현재 답변서 초안은 과거답변서와 첨부자료를 기반으로 작성된 작업본입니다. 스캔 문서처럼 충분한 분량이 한 페이지 안에서 보이도록 질의 요지, 답변 논리, 제도 개요를 길게 정리하였으며, 실제 업무 화면에서 검토하기 쉽도록 핵심 포인트를 함께 배치했습니다.',
        sections: [
          { title: '1. 질의 요지', desc: '이번 질의의 핵심은 지방교부세가 이미 지급되고 있음에도 왜 추가로 지방채 인수 추경을 편성해야 하는지에 대한 정책적 이유를 설명하는 것입니다. 단순한 예산 필요성 설명을 넘어, 지방재정 지원수단의 성격 차이와 특정 자본사업의 집행 필요성을 함께 기술하는 것이 중요합니다.', items: ['지방교부세 지급에도 지방채 인수로 채무가 증가하는데 왜 추경 편성이 필요한지에 대한 질의', '일반재원과 목적성 재원 간 차이, 지방채 인수의 정책 목적, 재정건전성 영향 설명이 필요', '추경 편성이 단순 예산 확대가 아니라 특정 사업의 적기 집행을 위한 재원 조달이라는 점을 분명히 해야 함'] },
          { title: '2. 답변 내용', desc: '초안은 공자기금 지방채 인수의 목적과 제도 구조를 중심으로 답변 논리를 구성하고 있습니다. 비교 문서와의 유사성을 유지하되, 현재 질의에 맞는 사례와 수치를 반영하는 방식으로 정리하였습니다.', items: ['공자기금은 지방재정 지원을 목적으로 지방채를 <mark>장기 저리</mark>로 인수하여 자금을 지원함', '특정 자본적 지출 사업(도로, 지하철, 공공시설, 지역개발)의 원활한 추진을 위해 추경 편성 필요', '<span class="hl-change"><strong>인수조건:</strong> 5년 거치 10년 분할 상환, 2026년 2분기 금리 3.435%</span>', '광주·전남 통합특별시 출범 관련 약 1,000억 원 규모 추경 수요를 사례로 반영'] }
        ]
      },
      {
        org: '재정경제부 · 답변서 초안',
        title: '국회 기획재정위원회 질의에 대한 답변(초안)',
        continueTitle: '국회 기획재정위원회 질의에 대한 답변(초안) · (계속)',
        lead: '두 번째 페이지는 예산 현황과 사례 설명을 중심으로 구성되어 있습니다. 실제 답변서 화면에서 긴 문서 페이지를 검토하는 느낌을 줄 수 있도록 항목 설명과 표, 보충 문장을 함께 배치했습니다.',
        sections: [
          { title: '3. 예산 현황', desc: '답변서 초안에서는 최근 연도의 예산과 결산, 본예산과 추경안의 차이를 제시하여 추경 규모의 타당성을 설명하고 있습니다. 특히 전년도 집행 실적과 당해 연도 추경안 간의 관계를 함께 설명하면 설득력이 높아집니다.', items: ['2026년 예산(최종) 12,100억 원 → 결산 10,712억 원', '2026년 본예산 1,000억 원 → 추경안 2,000억 원(증감 +1,000, 100%)', '전년도 집행 실적과 인수잔액을 함께 제시하면 재정 운용의 연속성을 설명하는 데 유용함'] },
          { title: '4. 사례 및 근거', desc: '광주·전남 통합특별시 사례는 추경 편성의 구체적 수요를 설명하는 데 가장 직접적인 근거입니다. 초안에는 출범 시점과 지자체별 수요를 함께 서술하여 실제 사업 필요를 뒷받침하고 있습니다.', items: ['광주·전남 통합특별시 출범(2026.7.1. 예정)과 관련된 통합전산망 구축, 안내표지판 설치 등의 수요 발생', '전남 700억 원, 광주 195억 원 등 지자체별 세부 수요를 반영하여 총 1,000억 원 규모 추경 수요 설명', '사례 설명 뒤에는 재정건전성 관리 및 집행 절차 보완 문장을 덧붙이는 것이 바람직함'] }
        ],
        tableHtml: `<table class="web-doc-table"><thead><tr><th>구분</th><th>2026년</th><th>2026년</th></tr></thead><tbody><tr><td>예산/결산</td><td>예산 12,100억 / 결산 10,712억</td><td>본예산 1,000억 / 추경안 2,000억</td></tr><tr><td>주요사례</td><td>지방재정 지원수요 지속</td><td>광주·전남 통합특별시 수요 반영</td></tr></tbody></table>`
      },
      {
        org: '재정경제부 · 답변서 초안',
        title: '국회 기획재정위원회 질의에 대한 답변(초안)',
        continueTitle: '국회 기획재정위원회 질의에 대한 답변(초안) · (보완메모)',
        lead: '마지막 페이지에는 향후 계획과 검토 메모를 담아 비교 검토에 활용할 수 있도록 하였습니다. 실제 실무에서는 이런 문단이 최종 답변본에 그대로 들어가지는 않지만, 내부 검토 단계에서 문안 보완 방향을 공유하는 데 도움이 됩니다.',
        sections: [
          { title: '5. 향후 계획', desc: '국회 심의가 완료된 이후에는 지자체별 세부 사업계획과 집행 절차에 따라 지방채 인수 지원이 순차적으로 이루어집니다. 따라서 답변서에는 제도 설명뿐 아니라 향후 집행 관리 계획을 간단히 함께 서술하는 것이 적절합니다.', items: ['추경안 국회 심의 완료 후 지자체별 세부 사업계획에 따라 순차 집행 예정', '분기별 금리 변동 사항은 예탁금리 고시에 따라 갱신하여 안내', '관계부처 및 지자체와의 협의를 통해 사업별 집행 시기와 규모를 재점검할 예정'] },
          { title: '6. 수정 필요 메모', desc: '현 초안은 전반적인 논리 구조가 적정하나, 비교 기준 문서와 대조했을 때 일부 수치 확인과 표현 다듬기가 필요한 부분이 존재합니다. 이 메모는 차이점 분석과 함께 보며 수정 우선순위를 정하는 데 활용할 수 있습니다.', items: ['금리 3.435%는 최신 분기 고시 기준으로 다시 확인 필요', '지방교부세와 지방채 인수의 재원 성격 차이를 한 문장 더 명확히 설명하는 것이 바람직함', '사례 문단 뒤에 재정건전성 관리 계획을 연결하면 국회 답변 톤에 더 부합함'] }
        ]
      }
    ];
    return pages.map((page, index) => buildDocPage({ ...page, pageIdx: index, totalPages: pages.length })).join('');
  }

  function initDocViewerPanel(panel) {
    if (!panel) return;
    const body = panel.querySelector('.doc-viewer-body');
    if (!body) return;

    const state = panel._docViewerState || {
      zoom: Number(panel.dataset.zoom || 100),
      boundBody: null,
      scrollHandler: null
    };

    state.body = body;
    state.track = body.querySelector('.doc-pages-track') || body.firstElementChild || body;
    state.pages = Array.from(body.querySelectorAll('.web-doc-page'));
    state.pageNumEl = panel.querySelector('[data-page-num]');
    state.pageTotalEl = panel.querySelector('[data-page-total]');
    state.charCountEl = panel.querySelector('[data-char-count]');
    state.zoomValEl = panel.querySelector('[data-zoom-val]');
    state.zoomInBtn = panel.querySelector('[data-action="zoom-in"]');
    state.zoomOutBtn = panel.querySelector('[data-action="zoom-out"]');
    state.fullscreenBtn = panel.querySelector('[data-action="fullscreen"]');

    state.updatePageInfo = () => {
      if (state.pageTotalEl) state.pageTotalEl.textContent = String(state.pages.length || 1);
      if (state.charCountEl) {
        const charCount = String(state.track?.innerText || state.body?.innerText || '').replace(/\s/g, '').length;
        state.charCount = charCount;
        state.charCountEl.textContent = charCount.toLocaleString();
      }
      let current = 1;
      const currentTop = state.body.scrollTop + 40;
      state.pages.forEach((page, idx) => {
        if (currentTop >= page.offsetTop) current = idx + 1;
      });
      state.currentPage = current;
      state.totalPages = state.pages.length || 1;
      panel.dataset.currentPage = String(state.currentPage);
      panel.dataset.pageTotal = String(state.totalPages);
      if (state.pageNumEl) state.pageNumEl.textContent = String(current);
      panel.dispatchEvent(new CustomEvent('ai-one-doc-viewer-change', {
        bubbles: true,
        detail: { page: state.currentPage, total: state.totalPages, zoom: state.zoom }
      }));
    };

    state.applyZoom = () => {
      state.zoom = Math.max(50, Math.min(200, state.zoom));
      panel.dataset.zoom = String(state.zoom);
      if (state.track) {
        const zoomScale = state.zoom / 100;
        state.track.style.transform = 'none';
        state.track.style.width = '100%';
        state.track.style.zoom = String(zoomScale);
        state.track.style.maxWidth = 'none';
      }
      if (state.zoomValEl) state.zoomValEl.textContent = `${state.zoom}%`;
      if (state.zoomOutBtn) state.zoomOutBtn.disabled = state.zoom <= 50;
      if (state.zoomInBtn) state.zoomInBtn.disabled = state.zoom >= 200;
      requestAnimationFrame(() => state.updatePageInfo());
    };

    if (state.boundBody !== body) {
      if (state.boundBody && state.scrollHandler) {
        state.boundBody.removeEventListener('scroll', state.scrollHandler);
      }
      state.scrollHandler = () => panel._docViewerState?.updatePageInfo();
      body.addEventListener('scroll', state.scrollHandler);
      state.boundBody = body;
    }

    panel._docViewerState = state;

    if (!panel.dataset.viewerBound) {
      state.zoomInBtn?.addEventListener('click', () => {
        const currentState = panel._docViewerState;
        if (!currentState) return;
        currentState.zoom += 10;
        currentState.applyZoom();
      });
      state.zoomOutBtn?.addEventListener('click', () => {
        const currentState = panel._docViewerState;
        if (!currentState) return;
        currentState.zoom -= 10;
        currentState.applyZoom();
      });
      state.fullscreenBtn?.addEventListener('click', () => {
        panel.classList.toggle('doc-viewer-fullscreen');
        showToast(panel.classList.contains('doc-viewer-fullscreen') ? '전체화면 모드 (ESC로 종료)' : '일반 모드');
      });
      panel.dataset.viewerBound = 'true';
    }

    state.applyZoom();
    state.updatePageInfo();
  }

  function initAllDocViewers(scope = document) {
    scope.querySelectorAll('.doc-viewer-panel').forEach(panel => initDocViewerPanel(panel));
  }

  function initCompareStatusBar(scope = document) {
    const statusBar = scope.querySelector('#compareStatusBar');
    const basePanel = scope.querySelector('#compareBasePanel');
    const draftPanel = scope.querySelector('#compareDraftPanel');
    if (!statusBar || !basePanel || !draftPanel) return;

    const panels = { base: basePanel, draft: draftPanel };
    let activeTarget = 'base';

    const pageNum = statusBar.querySelector('#comparePageNum');
    const pageTotal = statusBar.querySelector('#comparePageTotal');
    const zoomValue = statusBar.querySelector('#compareZoomVal');
    const charCount = statusBar.querySelector('#compareCharCount');
    const activeLabel = statusBar.querySelector('#compareActiveViewerLabel');
    const zoomOut = statusBar.querySelector('#compareZoomOut');
    const zoomIn = statusBar.querySelector('#compareZoomIn');
    const fullscreen = statusBar.querySelector('#compareFullscreen');

    const getState = () => panels[activeTarget]?._docViewerState || null;
    const refresh = () => {
      const panel = panels[activeTarget];
      const state = getState();
      if (!panel || !state) return;
      if (pageNum) pageNum.textContent = String(state.currentPage || Number(panel.dataset.currentPage) || 1);
      if (pageTotal) pageTotal.textContent = String(state.totalPages || Number(panel.dataset.pageTotal) || state.pages?.length || 1);
      if (zoomValue) zoomValue.textContent = `${state.zoom || 100}%`;
      if (charCount) {
        const count = String(state.track?.innerText || state.body?.innerText || '').replace(/\s/g, '').length;
        charCount.textContent = count.toLocaleString();
      }
      if (activeLabel) activeLabel.textContent = activeTarget === 'base' ? '기준 문서' : '비교 문서';
      if (zoomOut) zoomOut.disabled = (state.zoom || 100) <= 50;
      if (zoomIn) zoomIn.disabled = (state.zoom || 100) >= 200;
      Object.entries(panels).forEach(([key, comparePanel]) => {
        const selected = key === activeTarget;
        comparePanel.classList.toggle('compare-viewer-active', selected);
        comparePanel.setAttribute('aria-selected', String(selected));
      });
    };

    zoomOut?.addEventListener('click', () => {
      const state = getState();
      if (!state) return;
      state.zoom -= 10;
      state.applyZoom();
      refresh();
    });

    zoomIn?.addEventListener('click', () => {
      const state = getState();
      if (!state) return;
      state.zoom += 10;
      state.applyZoom();
      refresh();
    });

    fullscreen?.addEventListener('click', () => {
      const compareView = scope.querySelector('.compare-view') || statusBar.closest('.compare-view');
      if (!compareView) return;
      compareView.classList.toggle('compare-view-fullscreen');
      showToast(compareView.classList.contains('compare-view-fullscreen') ? '답변서 비교 전체보기 (ESC로 종료)' : '일반 모드');
    });

    Object.values(panels).forEach(panel => {
      panel.tabIndex = 0;
      panel.setAttribute('role', 'region');
      panel.addEventListener('ai-one-doc-viewer-change', refresh);
      const selectPanel = () => {
        activeTarget = panel.dataset.compareViewer === 'draft' ? 'draft' : 'base';
        refresh();
      };
      panel.addEventListener('pointerdown', selectPanel);
      panel.addEventListener('focus', selectPanel);
      panel.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        selectPanel();
      });
    });

    refresh();
  }

  let selectedRecIds = [1]; // 다중 선택 지원
  let moreRecSeq = 0; // 채팅으로 추가된 관련자료 순번

  const draftContent = `<div class="draft-view">
  <div class="draft-head">
    <span class="draft-head-title">답변서 초안</span>
    <button class="panel-move-btn" id="draftDownloadBtn" aria-label="다운로드" title="다운로드">
      <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    </button>
  </div>
  <div class="draft-editor" contenteditable="false">
    <div style="border:2px solid var(--border);border-radius:8px;padding:16px 24px;margin-bottom:24px;display:flex;align-items:center;gap:16px;">
      <div style="width:40px;height:40px;border:2px solid var(--text-primary);border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:calc(14px * var(--ui-font-scale));">1</div>
      <div style="font-size:calc(16px * var(--ui-font-scale));font-weight:700;line-height:1.5;">지방교부세가 지급되고 있고 지방채 인수시 지자체 채무는 증가함에도 추경을 편성해야 하는 이유는?</div>
    </div>

    <div style="border:1px solid var(--border);border-radius:8px;padding:16px 20px;margin-bottom:24px;background:var(--surface-elevated);">
      <p style="margin:0;line-height:1.8;">□ 지방자치단체의 특정 자본적 지출 사업 수행을 위해 공공자금관리기금이 지방채를 장기 저리로 인수하여 지방재정을 지원하기 때문입니다.</p>
    </div>

    <h3 style="margin-top:24px;">□ 지방채 인수 추경 편성 배경</h3>
    <ul style="line-height:2;">
      <li>공공자금관리기금(공자기금)은 지방재정 지원을 목적으로 지방자치단체가 발행하는 지방채를 장기 저리로 인수하여 자금을 지원함 <sup style="color:var(--accent-blue);font-size:calc(10px * var(--ui-font-scale));">1,2</sup></li>
      <li>특히 도로, 지하철 건설, 공공용 시설 설치 및 지역개발사업 등 특정 자본적 지출 사업의 원활한 추진을 위해 필요한 경우 추경을 통해 인수 예산을 편성함 <sup style="color:var(--accent-blue);font-size:calc(10px * var(--ui-font-scale));">1,3</sup></li>
    </ul>

    <h3 style="margin-top:24px;">□ 공자기금 지방채 인수 제도 개요</h3>
    <p style="padding-left:16px;">ㅇ 지방채 인수의 구체적인 지원 대상 및 조건은 다음과 같음 <sup style="color:var(--accent-blue);font-size:calc(10px * var(--ui-font-scale));">1,3</sup></p>
    <table class="draft-table">
      <thead>
        <tr><th style="width:100px;">구분</th><th>내용</th></tr>
      </thead>
      <tbody>
        <tr><td>지원대상</td><td>지방자치단체(시·도)</td></tr>
        <tr><td>지원사업</td><td>도로, 지하철건설, 공용·공공용시설의 설치, 지역개발사업 등 특정 자본적 지출 사업 (경상적 사업비, 인건비 등 불가)</td></tr>
        <tr><td>지원조건</td><td>인수금리: 공자기금 예탁금리와 동일(분기별 고정금리)<br/>인수기간: 5년 거치 10년 분할 상환</td></tr>
        <tr><td>집행절차</td><td>행안부 발행계획 마련 및 협의(9월) → 행안부 지자체별 계획 승인(10월 말) → 지방의회 의결 후 인수 요청(연도 중)</td></tr>
      </tbody>
    </table>

    <h3 style="margin-top:24px;">□ 추경 편성의 구체적 사례</h3>
    <ul style="line-height:2;">
      <li>광주·전남 통합특별시 출범(2026.7.1. 예정)과 관련하여 통합전산망 구축, 안내표지판 설치, 재난관리기금 조성 등 지자체의 실제 지방채 인수 수요가 발생함에 따라 이를 반영하여 추경을 편성함 <sup style="color:var(--accent-blue);font-size:calc(10px * var(--ui-font-scale));">1,4</sup></li>
    </ul>

    <hr style="margin:28px 0;border:none;border-top:1px solid var(--border);" />

    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <div style="background:var(--text-primary);color:#fff;border-radius:4px;padding:4px 10px;font-size:calc(12px * var(--ui-font-scale));font-weight:600;">참고 1</div>
      <span style="font-size:calc(15px * var(--ui-font-scale));font-weight:700;">공자기금 지방채 인수 제도</span>
    </div>

    <h4 style="margin-bottom:8px;">(1) 제도 개요 및 목적</h4>
    <ul style="line-height:2;">
      <li>지방재정 지원을 목적으로 지방자치단체가 발행하는 지방채를 장기 저리로 인수</li>
      <li>지방채의 정의: 지자체가 증권발행방법으로 차입하는 지방채증권과 증서에 의한 차입금이 있으며, 공자기금은 차입금에 해당</li>
      <li>기타 운영 사항: 타 회계·기금 예탁, 관리기금 계정 간 예탁 및 전출, 국·공채 등 유가증권 인수 또는 매입 수행</li>
    </ul>

    <h4 style="margin-bottom:8px;">(2) 인수 조건 및 현황</h4>
    <ul style="line-height:2;">
      <li>인수금리: 공자기금 예탁금리와 동일하며 분기별 고정 적용 ('26.2분기 3.435%)</li>
      <li>인수기간: 5년 거치 10년 분할 상환</li>
    </ul>

    <table class="draft-table">
      <thead>
        <tr><th style="width:100px;">구분</th><th>내용</th></tr>
      </thead>
      <tbody>
        <tr><td>지원대상</td><td>지방자치단체(시·도)</td></tr>
        <tr><td>지원사업</td><td>도로, 지하철건설, 공용·공공용시설의 설치, 지역개발사업 등의 특정 자본적 지출 사업 (경상적 사업비, 인건비 등은 불가)</td></tr>
        <tr><td>지원조건</td><td>· 인수금리: 공자기금 예탁금리와 동일(분기별 고정금리)<br/>전분기 공자기금 총괄계정 평균 조달금리 + 기금운용경비(0.1%p)<br/>금리(%): ('25.1분기) 2.975, (2분기) 2.794, (3분기) 2.683, (4분기) 2.713, ('26.1분기) 2.957, (2분기) 3.435<br/>· 인수기간: 5년거치 10년 분할 상환</td></tr>
        <tr><td>집행절차</td><td>① 행안부의 지방채 발행계획 마련 및 우리부 협의 (9월) — 지방재정법 시행령 제11조, 공공자금관리기금법 시행령 제2조 등 근거<br/>② 행안부의 각 지자체별 지방채 발행계획 승인(10월 말)<br/>③ 지자체별 지방의회 의결 후 지방채 인수 요청(연도 중)</td></tr>
      </tbody>
    </table>

    <p style="text-align:center;margin:24px 0 8px;font-weight:700;">&lt;지방채 인수 예산 현황&gt;</p>
    <p style="text-align:right;font-size:calc(11px * var(--ui-font-scale));color:var(--text-muted);margin-bottom:8px;">(단위: 억원)</p>
    <table class="draft-table">
      <thead>
        <tr><th rowspan="2">구분</th><th colspan="2">'25년</th><th colspan="4">'26년</th></tr>
        <tr><th>예산(최종)</th><th>결산</th><th>본예산(A)</th><th>추경안(B)</th><th>증감(B-A)</th><th>(%)</th></tr>
      </thead>
      <tbody>
        <tr><td>지방채 인수</td><td style="text-align:right">12,100</td><td style="text-align:right">10,712</td><td style="text-align:right">1,000</td><td style="text-align:right">2,000</td><td style="text-align:right">1,000</td><td style="text-align:right">(100.0)</td></tr>
      </tbody>
    </table>

    <hr style="margin:28px 0;border:none;border-top:1px solid var(--border);" />

    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <div style="background:var(--text-primary);color:#fff;border-radius:4px;padding:4px 10px;font-size:calc(12px * var(--ui-font-scale));font-weight:600;">참고 2</div>
      <span style="font-size:calc(15px * var(--ui-font-scale));font-weight:700;">광주·전남 통합 관련 추경 수요</span>
    </div>

    <h4 style="margin-bottom:8px;">(1) 출범 계획</h4>
    <ul style="line-height:2;">
      <li>전남광주통합특별시 설치를 위한 특별법 통과 후 '26.3.5. 시행, '26.7.1. 출범 예정 <sup style="color:var(--accent-blue);font-size:calc(10px * var(--ui-font-scale));">1</sup></li>
    </ul>

    <h4 style="margin-bottom:8px;">(2) 추경 규모 및 산출 근거 <sup style="color:var(--accent-blue);font-size:calc(10px * var(--ui-font-scale));">4</sup></h4>
    <ul style="line-height:2;">
      <li>지방채 인수 수요 확인 결과 약 1,000억 원 규모</li>
      <li>지자체별 세부 수요</li>
    </ul>
    <p style="margin-left:24px;line-height:2;">* 전남: 통합특별시 안내표지판 설치, 통합전산망 구축(300억 원) 등 총 700억 원<br/>* 광주: 재난관리기금 및 재해구호기금 조성 등 총 195억 원</p>
    <ul style="line-height:2;">
      <li>'26년 본예산 규모(1,000억 원)를 감안하여 산출</li>
    </ul>

    <hr style="margin:28px 0;border:none;border-top:1px solid var(--border);" />

    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <div style="background:var(--text-primary);color:#fff;border-radius:4px;padding:4px 10px;font-size:calc(12px * var(--ui-font-scale));font-weight:600;">참고 3</div>
      <span style="font-size:calc(15px * var(--ui-font-scale));font-weight:700;">연도별 지방채 인수 실적</span>
    </div>

    <p style="text-align:right;font-size:calc(11px * var(--ui-font-scale));color:var(--text-muted);margin-bottom:8px;">(단위: 억원)</p>
    <table class="draft-table" style="font-size:calc(12px * var(--ui-font-scale));">
      <thead>
        <tr><th>구분</th><th>'16</th><th>'17</th><th>'18</th><th>'19</th><th>'20</th><th>'21</th><th>'22</th><th>'23</th><th>'24</th><th>'25</th></tr>
      </thead>
      <tbody>
        <tr><td>계획</td><td style="text-align:right">29,875</td><td style="text-align:right">1,200</td><td style="text-align:right">1,000</td><td style="text-align:right">1,000</td><td style="text-align:right">18,000</td><td style="text-align:right">21,000</td><td style="text-align:right">100</td><td style="text-align:right">100</td><td style="text-align:right">26,000</td><td style="text-align:right">12,100</td></tr>
        <tr><td>(지방채)</td><td style="text-align:right">14,406</td><td style="text-align:right">1,200</td><td style="text-align:right">1,000</td><td style="text-align:right">1,000</td><td style="text-align:right">18,000</td><td style="text-align:right">21,000</td><td style="text-align:right">100</td><td style="text-align:right">100</td><td style="text-align:right">26,000</td><td style="text-align:right">12,100</td></tr>
        <tr><td>(지방교육채)</td><td style="text-align:right">15,469</td><td style="text-align:right">-</td><td style="text-align:right">-</td><td style="text-align:right">-</td><td style="text-align:right">-</td><td style="text-align:right">-</td><td style="text-align:right">-</td><td style="text-align:right">-</td><td style="text-align:right">-</td><td style="text-align:right">-</td></tr>
        <tr><td>실적</td><td style="text-align:right">14,851</td><td style="text-align:right">14</td><td style="text-align:right">-</td><td style="text-align:right">670</td><td style="text-align:right">15,566</td><td style="text-align:right">19,956</td><td style="text-align:right">79</td><td style="text-align:right">100</td><td style="text-align:right">25,962</td><td style="text-align:right">10,712</td></tr>
        <tr><td>(지방채)</td><td style="text-align:right">708</td><td style="text-align:right">14</td><td style="text-align:right">-</td><td style="text-align:right">670</td><td style="text-align:right">15,566</td><td style="text-align:right">19,956</td><td style="text-align:right">79</td><td style="text-align:right">100</td><td style="text-align:right">25,962</td><td style="text-align:right">10,712</td></tr>
        <tr><td>(지방교육채)</td><td style="text-align:right">14,143</td><td style="text-align:right">-</td><td style="text-align:right">-</td><td style="text-align:right">-</td><td style="text-align:right">-</td><td style="text-align:right">-</td><td style="text-align:right">-</td><td style="text-align:right">-</td><td style="text-align:right">-</td><td style="text-align:right">-</td></tr>
        <tr style="border-top:2px solid var(--border);"><td><strong>인수잔액</strong></td><td style="text-align:right">37,467</td><td style="text-align:right">34,712</td><td style="text-align:right">30,066</td><td style="text-align:right">19,004</td><td style="text-align:right">32,597</td><td style="text-align:right">40,708</td><td style="text-align:right">35,241</td><td style="text-align:right">35,210</td><td style="text-align:right">61,010</td><td style="text-align:right">71,532</td></tr>
      </tbody>
    </table>

    <hr style="margin:28px 0;border:none;border-top:1px solid var(--border);" />
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <div style="background:var(--text-primary);color:#fff;border-radius:4px;padding:4px 10px;font-size:calc(12px * var(--ui-font-scale));font-weight:600;">참고 4</div>
      <span style="font-size:calc(15px * var(--ui-font-scale));font-weight:700;">출처</span>
    </div>
    <div style="font-size:calc(12.5px * var(--ui-font-scale));line-height:2.2;padding-left:8px;">
      <p style="margin:0;">(1) 260402_재경위_전체 의원 질의에 대한 답변_통합본.hwp</p>
      <p style="margin:0;">(2) 지방채 인수를 해야 하는 법적 의무.hwpx</p>
      <p style="margin:0;">(3) 지방교부세가 지급되고 있고 지방채 인수시 지자체 채무는 증가함에도 추경을 편성해야 하는 이유.hwpx</p>
      <p style="margin:0;">(4) 민주당 반대로 무산된 TK통합법이 통과되었다면 이번 지방채 인수 추경안에 관련 예산이 포함될 수 있었다고 보는데, 이에 대한 견해.hwpx</p>
      <p style="margin:0;">(5) 세수추계 실패와 책임문제.hwpx</p>
      <p style="margin:0;">(6) 세수부족, 초과세수 등 반복되는 세수추계 오류 발생 문제.hwpx</p>
      <p style="margin:0;">(7) table_paser_test.hwp</p>
    </div>

    <hr style="margin:28px 0;border:none;border-top:1px solid var(--border);" />
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <div style="background:var(--text-primary);color:#fff;border-radius:4px;padding:4px 10px;font-size:calc(12px * var(--ui-font-scale));font-weight:600;">참고 5</div>
      <span style="font-size:calc(15px * var(--ui-font-scale));font-weight:700;">추가 QA</span>
    </div>
    <div style="border:1px solid var(--border);border-radius:8px;padding:14px 18px;margin-bottom:14px;background:var(--surface-elevated);">
      <p style="margin:0 0 8px;font-weight:600;font-size:calc(13px * var(--ui-font-scale));">Q. 공자기금의 지방채 인수 지원이 가능한 사업 범위는 무엇인가요?</p>
      <p style="margin:0;font-size:calc(12.5px * var(--ui-font-scale));line-height:1.8;">□ 도로, 지하철 건설, 공용 및 공공용 시설의 설치, 지역개발사업 등 특정 자본적 지출 사업에 한해 지원이 가능하며, 경상적 사업비나 인건비 등은 지원 대상에서 제외됩니다.</p>
    </div>
    <div style="border:1px solid var(--border);border-radius:8px;padding:14px 18px;background:var(--surface-elevated);">
      <p style="margin:0 0 8px;font-weight:600;font-size:calc(13px * var(--ui-font-scale));">Q. 지방채 인수를 위한 집행 절차와 일정은 어떻게 되나요?</p>
      <p style="margin:0;font-size:calc(12.5px * var(--ui-font-scale));line-height:1.8;">□ 먼저 9월 중 행정안전부가 지방채 발행계획을 마련하여 협의하고, 10월 말까지 지자체별 발행계획을 승인받은 후, 해당 지자체가 지방의회 의결을 거쳐 연도 중에 지방채 인수를 요청하는 순서로 진행됩니다.</p>
    </div>

  </div>
  </div>`;

  const compareContent = `
  <div class="compare-stats-bar">
    <div class="cmp-stat"><span class="cmp-stat-label">비교 기준</span><span class="cmp-stat-value">유사답변서</span></div>
    <div class="cmp-stat"><span class="cmp-stat-label">비교 대상</span><span class="cmp-stat-value">초안 문서</span></div>
    <div class="cmp-stat"><span class="cmp-stat-label">일치 문단</span><span class="cmp-stat-value hl">4개</span></div>
    <div class="cmp-stat"><span class="cmp-stat-label">확인 필요</span><span class="cmp-stat-value">2건</span></div>
  </div>
  <div class="compare-three-col">
    <div class="cmp-col doc-viewer-panel" id="compareBasePanel" data-compare-viewer="base">
      <div class="cmp-col-head"><span class="cmp-col-title">기준 문서</span><span class="cmp-col-badge">재경위 · 2026년 · 91%</span></div>
      <div class="cmp-col-body doc-viewer-body" id="compareBaseBody"><div class="doc-pages-track">${buildCompareReferencePages()}</div></div>
    </div>
    <div class="cmp-col-resize" data-cmp-resize="0"></div>
    <div class="cmp-col doc-viewer-panel" id="compareDraftPanel" data-compare-viewer="draft">
      <div class="cmp-col-head"><span class="cmp-col-title">비교 문서</span><span class="cmp-col-badge blue">현재 답변서 초안</span></div>
      <div class="cmp-col-body doc-viewer-body" id="compareDraftBody"><div class="doc-pages-track">${buildCompareDraftPages()}</div></div>
    </div>
    <div class="cmp-col-resize" data-cmp-resize="1"></div>
    <div class="cmp-col cmp-col-analysis">
      <div class="cmp-col-head"><span class="cmp-col-title">차이점 분석</span><span class="cmp-col-badge gray">자동 비교</span></div>
      <div class="cmp-col-body">
        <div class="analysis-card">
          <div class="analysis-card-head"><span class="analysis-title">답변 논리</span><span class="analysis-badge red">일치</span></div>
          <p class="analysis-desc">원문과 초안 모두 공자기금 지방채 인수의 목적과 추경 편성 불가피성을 동일한 논리로 설명합니다.</p>
        </div>
        <div class="analysis-card">
          <div class="analysis-card-head"><span class="analysis-title">수치 정보</span><span class="analysis-badge orange">확인 필요</span></div>
          <p class="analysis-desc">인수금리 3.435%(2026년 2분기)는 분기별 변동 금리로, 답변 시점 기준 최신 고시 확인이 필요합니다.</p>
        </div>
        <div class="analysis-card">
          <div class="analysis-card-head"><span class="analysis-title">사례 반영</span><span class="analysis-badge purple">정확 반영</span></div>
          <p class="analysis-desc">광주·전남 통합특별시(2026.7.1. 출범) 관련 추경 수요(전남 700억, 광주 195억)가 원문 그대로 반영되었습니다.</p>
        </div>
        <div class="analysis-card">
          <div class="analysis-card-head"><span class="analysis-title">표현 톤</span><span class="analysis-badge green">적정</span></div>
          <p class="analysis-desc">국회 답변 형식에 부합하며, 제도 설명과 근거 수치가 체계적으로 구성되어 있습니다.</p>
        </div>
      </div>
    </div>
  </div>
  <div class="draft-status-bar compare-status-bar" id="compareStatusBar" aria-label="답변서 비교 진행 정보">
    <div class="draft-status-left">
      <span class="draft-stat">비교 문서 <strong>2</strong>건</span>
      <span class="draft-stat-sep" aria-hidden="true">|</span>
      <span class="draft-stat">글자 수 <strong id="compareCharCount">0</strong>자</span>
      <span class="draft-stat-sep" aria-hidden="true">|</span>
      <span class="draft-stat"><strong id="compareActiveViewerLabel">기준 문서</strong> 페이지 <strong id="comparePageNum">1</strong>/<strong id="comparePageTotal">1</strong></span>
    </div>
    <div class="draft-status-right">
      <button class="draft-zoom-btn" type="button" id="compareZoomOut" aria-label="선택 문서 축소">−</button>
      <span class="draft-zoom-val" id="compareZoomVal" aria-live="polite">100%</span>
      <button class="draft-zoom-btn" type="button" id="compareZoomIn" aria-label="선택 문서 확대">+</button>
      <button class="draft-zoom-btn" type="button" id="compareFullscreen" aria-label="답변서 비교 전체보기" title="답변서 비교 전체보기">
        <svg viewBox="0 0 24 24" width="14" height="14"><path d="M3 3h5v2H5v3H3V3z M16 3h5v5h-2V5h-3V3z M3 16h2v3h3v2H3v-5z M19 19h-3v2h5v-5h-2v3z"/></svg>
      </button>
    </div>
  </div>
  `;

  const chatTopics = [
    { title: '지방채 인수 추경 답변서 초안 작성', time: '11:05', date: '2026.07.20', id: 0 },
    { title: '공자기금 인수금리 조건 정리', time: '10:22', date: '2026.07.20', id: 1 },
    { title: '광주·전남 통합특별시 추경 수요', time: '16:40', date: '2026.07.19', id: 2 },
    { title: '세수결손 대응계획 답변서 검토', time: '15:12', date: '2026.07.18', id: 3 },
    { title: '국가채무비율 전망 근거자료 정리', time: '09:35', date: '2026.07.18', id: 4 },
    { title: '공공기관 경영평가 개선 질의', time: '14:08', date: '2026.07.17', id: 5 },
    { title: '종합부동산세 세율 조정 영향', time: '11:26', date: '2026.07.16', id: 6 },
    { title: '간이과세 기준금액 상향 검토', time: '17:42', date: '2026.07.15', id: 7 },
    { title: '외국환거래법 개정 답변자료', time: '13:18', date: '2026.07.14', id: 8 },
    { title: '청년 일자리 재정사업 성과', time: '10:04', date: '2026.07.11', id: 9 },
    { title: '물가안정 정책 공조 현황', time: '16:55', date: '2026.07.10', id: 10 },
    { title: '재정준칙 도입 필요성 검토', time: '09:48', date: '2026.07.09', id: 11 }
  ];
  let chatTopicSearchTerm = '';
  let chatTopicSortOrder = 'latest';

  // 새 채팅 시작 시 노출되는 안내 문구 (첫번째 문단)
  const AI_CHAT_INTRO = '국회 질의를 입력해 보세요!\nAI가 지능형 검색을 통해 관련자료를 추천하고 국회 답변서 초안 생성을 시작합니다.\n① (선택) 좌측 AI 참조소스에서 첨부파일을 업로드하고\n② 이 채팅에 국회질의를 입력하시면\n과거 유사답변서나 관련자료 추천하고 초안을 생성합니다.';

  const chatConversations = [
    // Topic 0: 지방채 인수 추경 답변서 초안 작성
    [
      { role: 'ai', text: AI_CHAT_INTRO, time: '11:41' },
      { role: 'user', text: '지방교부세가 지급되고 있고 지방채 인수시 지자체 채무는 증가함에도 추경을 편성해야 하는 이유는?', time: '11:42' },
      { role: 'ai', text: '유사 과거답변서 5건을 문서 단위로 추천했습니다. (최고 유사도 38%)\n좌측 "유사답변서 추천 목록"에서 확인·선택할 수 있습니다.', time: '11:42' },
      { role: 'ai', text: '답변서 초안을 생성했습니다. 과거답변 5건, 첨부 7건을 청크 단위로 반영했습니다.\n"답변서 초안 분석" 탭에서 편집하거나, 채팅으로 수정 지시를 내릴 수 있습니다.', time: '11:42' },
      { role: 'ai', text: '답변서 초안 작성을 시작합니다. 지방채 인수 및 추경 관련 참조자료 7건을 분석 완료했습니다.\n\n📌 분석 결과 요약:\n• 최고 유사도: 95% (지방채 인수 추경 편성 사유 답변)\n• 인용 가능 문단: 5개\n• 수치 업데이트 필요: 1건 (금리 최신 고시)', time: '10:45' },
      { role: 'user', text: '공자기금 지방채 인수 제도 개요와 추경 편성 배경을 중심으로 답변서 초안을 작성해줘.', time: '10:50' },
      { role: 'ai', text: '참조자료를 기반으로 초안을 작성했습니다.\n\n✅ 반영 내용:\n• 답변 요약: "특정 자본적 지출 사업 수행을 위해 공자기금이 지방채를 장기 저리로 인수"\n• 제도 개요 표: 지원대상/사업/조건/절차\n• 인수금리: 공자기금 예탁금리와 동일(분기별 고정), \'26.2분기 3.435%\n• 인수기간: 5년 거치 10년 분할 상환\n\n⚠️ 확인 필요:\n• 금리는 분기별 변동이므로 답변 시점 기준 최신 고시 확인 필요', time: '10:55' },
      { role: 'user', text: '광주·전남 통합특별시 관련 추경 사례도 추가해줘. 지자체별 수요도 포함해서.', time: '11:00' },
      { role: 'ai', text: '추경 편성 사례를 추가했습니다.\n\n추가 내용:\n• 광주·전남 통합특별시 출범(2026.7.1. 예정)\n• 지방채 인수 수요: 약 1,000억 원 규모\n• 전남: 안내표지판 설치, 통합전산망 구축(300억) 등 총 700억 원\n• 광주: 재난관리기금, 재해구호기금 조성 등 총 195억 원\n\n예산 현황표도 반영 완료:\n• \'25년 예산 12,100억 / 결산 10,712억\n• \'26년 본예산 1,000억 → 추경안 2,000억 (증감 +1,000, 100%)', time: '11:03' }
    ],
    // Topic 1: 공자기금 인수금리 조건 정리
    [
      { role: 'ai', text: '공자기금 지방채 인수 금리 조건을 정리합니다. 어떤 기준이 필요하신가요?', time: '10:10' },
      { role: 'user', text: '최근 분기별 금리 변동 추이를 정리해줘.', time: '10:15' },
      { role: 'ai', text: '공자기금 지방채 인수금리 추이입니다.\n\n산정 기준: 전분기 공자기금 총괄계정 평균 조달금리 + 기금운용경비(0.1%p)\n\n| 분기 | 금리(%) |\n|------|--------|\n| \'25.1분기 | 2.975 |\n| \'25.2분기 | 2.794 |\n| \'25.3분기 | 2.683 |\n| \'25.4분기 | 2.713 |\n| \'26.1분기 | 2.957 |\n| \'26.2분기 | 3.435 |\n\n인수기간: 5년 거치 10년 분할 상환\n출처: 공공자금관리기금 운용계획', time: '10:20' }
    ],
    // Topic 2: 광주·전남 통합특별시 추경 수요
    [
      { role: 'ai', text: '광주·전남 통합특별시 관련 추경 수요를 정리합니다.', time: '어제' },
      { role: 'user', text: '출범 일정이랑 지자체별 세부 수요 정리해줘.', time: '어제' },
      { role: 'ai', text: '광주·전남 통합 관련 추경 수요입니다.\n\n📋 출범 계획:\n• 전남광주통합특별시 설치를 위한 특별법 통과\n• \'26.3.5. 시행 → \'26.7.1. 출범 예정\n\n💰 추경 규모: 약 1,000억 원\n\n📊 지자체별 세부 수요:\n• 전남(700억 원): 통합특별시 안내표지판 설치, 통합전산망 구축(300억 원) 등\n• 광주(195억 원): 재난관리기금 및 재해구호기금 조성 등\n\n* \'26년 본예산 규모(1,000억 원)를 감안하여 산출\n\n답변서에 추경 편성의 구체적 사례로 인용하기에 적합합니다.', time: '어제' }
    ]
  ];

  while (chatConversations.length < chatTopics.length) {
    const topic = chatTopics[chatConversations.length];
    chatConversations.push([
      { role: 'ai', text: AI_CHAT_INTRO, time: topic.time },
      { role: 'user', text: `${topic.title} 관련 핵심 쟁점과 근거자료를 정리해줘.`, time: topic.time },
      { role: 'ai', text: `${topic.title} 관련 과거 답변서와 참고자료를 검색해 초안 작성에 활용할 수 있도록 정리했습니다.`, time: topic.time }
    ]);
  }

  let activeChatTopic = 0;

  // ─── State ───
  let currentTab = 'recommend';
  let selectedRec = 0;
  let currentFilter = 'all';
  let isReset = false;
  const reportFiles = [];

  // ─── Draft Versions ───
  function formatDraftVersionTab(version) {
    if (!version) return 'v1.0(00:00)';
    return `${version.label}(${version.time})`;
  }

  const draftVersionExamples = [
    { id: 1, label: 'v1.0', time: '09:18', note: 'AI 최초 초안 생성', content: draftContent },
    { id: 2, label: 'v1.1', time: '09:32', note: '질의요지 문장 정리', content: draftContent },
    { id: 3, label: 'v1.2', time: '09:47', note: '법적 근거 보강', content: draftContent },
    { id: 4, label: 'v1.3', time: '10:05', note: '관련 수치 및 사례 추가', content: draftContent },
    { id: 5, label: 'v1.4', time: '10:21', note: '답변 문체 간결화', content: draftContent },
    { id: 6, label: 'v1.5', time: '10:43', note: '출처 검증 결과 반영', content: draftContent },
    { id: 7, label: 'v1.6', time: '11:02', note: '결론 문단 재구성', content: draftContent },
    { id: 8, label: 'v1.7', time: '11:24', note: '최종 검토 의견 반영', content: draftContent }
  ];

  let draftVersions = draftVersionExamples.map(version => ({ ...version }));
  let activeDraftVersion = 0;

  // ─── Render ───
  function init() {
    initFontSizeControl();
    renderTree();
    renderFiles();
    renderRecommendations();
    renderPreview(recommendations[0]);
    renderSelectedRefs();
    renderChatTopics();
    renderChatMessages();
    bindEvents();
    bindApplyToChat();
    initPanelResize();
    initPanelDragDrop();
    initCenterSplitResize();
    if (!window.__aiOneDocViewerEscBound) {
      window.__aiOneDocViewerEscBound = true;
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          document.querySelectorAll('.doc-viewer-panel.doc-viewer-fullscreen').forEach(panel => panel.classList.remove('doc-viewer-fullscreen'));
          document.querySelectorAll('.compare-view.compare-view-fullscreen').forEach(view => view.classList.remove('compare-view-fullscreen'));
        }
      });
    }
  }

  function renderTree() {
    const tree = $('#folderTree');
    if (!tree) return;
    tree.innerHTML = treeData.map(d => {
      const hasChildren = treeData.some(c => c.parent === d.id);
      const arrow = hasChildren ? (d.open ? '▾' : '▸') : '';
      return `<div class="tree-item${d.indent ? ' i' + d.indent : ''}${d.active ? ' active' : ''}" data-id="${d.id}" data-has-children="${hasChildren}">
        <span class="t-arrow">${arrow}</span><span class="t-icon">${d.icon}</span><span class="t-name">${d.name}</span>
      </div>`;
    }).join('');

    // Event delegation for tree
    tree.addEventListener('click', (e) => {
      const item = e.target.closest('.tree-item');
      if (!item) return;
      const id = item.dataset.id;
      const node = treeData.find(d => d.id === id);
      if (!node) return;

      // Toggle open/close if has children
      const hasChildren = treeData.some(c => c.parent === id);
      if (hasChildren) {
        node.open = !node.open;
      }

      // Set active
      treeData.forEach(d => d.active = false);
      node.active = true;

      // Update path
      updateFolderPath(node);

      // Re-render
      renderTreeItems();
    });

    renderTreeItems();
  }

  function renderTreeItems() {
    const tree = $('#folderTree');
    if (!tree) return;
    // Determine visible items based on open state
    const visible = [];
    treeData.forEach(d => {
      if (d.indent === 0) {
        visible.push(d);
      } else {
        // Check if all ancestors are open
        let parent = treeData.find(p => p.id === d.parent);
        let show = true;
        while (parent) {
          if (!parent.open) { show = false; break; }
          parent = treeData.find(p => p.id === parent.parent);
        }
        if (show) visible.push(d);
      }
    });

    tree.innerHTML = visible.map(d => {
      const hasChildren = treeData.some(c => c.parent === d.id);
      const arrow = hasChildren ? (d.open ? '▾' : '▸') : '&nbsp;';
      return `<div class="tree-item${d.indent ? ' i' + d.indent : ''}${d.active ? ' active' : ''}" data-id="${d.id}">
        <span class="t-arrow">${arrow}</span><span class="t-icon">${d.icon}</span><span class="t-name">${d.name}</span>
      </div>`;
    }).join('');
  }

  function updateFolderPath(node) {
    const pathEl = $('.folder-path');
    if (!pathEl) return;
    // Build path from node up to root
    const parts = [node.name];
    let current = node;
    while (current.parent) {
      current = treeData.find(d => d.id === current.parent);
      if (current) parts.unshift(current.name);
    }
    pathEl.textContent = '필터 항목 · ' + parts.join(' > ');
  }

  function resetRefsPanel() {
    hideAnswerSkeleton();
    files.length = 0;
    selectedRecIds = [];
    const fileInput = $('#fileInput');
    if (fileInput) fileInput.value = '';
    const uploadSection = $('.folder-upload-section');
    const refsSection = $('#selectedRefsSection');
    if (uploadSection) { uploadSection.style.flex = ''; uploadSection.style.height = ''; }
    if (refsSection) { refsSection.style.flex = ''; refsSection.style.height = ''; }
    renderFiles();
    renderSelectedRefs();
    renderRecommendations();
    showToast('AI 참조소스 패널이 초기화되었습니다.');
  }

  function renderFiles() {
    const list = $('#fileList');
    list.innerHTML = files.map((f, i) => {
      let dotColor = 'var(--red)';
      if (f.type === 'docx' || f.type === 'pdf' && f.name.includes('법적')) dotColor = 'var(--primary)';
      else if (f.type === 'xls') dotColor = 'var(--green)';
      else if (f.type === 'docx') dotColor = 'var(--primary)';
      if (f.type === 'pdf') dotColor = 'var(--red)';
      if (f.type === 'docx') dotColor = 'var(--primary)';
      if (f.type === 'xls') dotColor = 'var(--green)';
      return `<li class="file-item-simple" data-file-idx="${i}">
        <span class="file-dot${f.status && f.status !== 'done' ? ' processing' : ''}" style="background:${dotColor}"></span>
        <span class="file-name-simple">${f.name}</span>
        ${renderFileStatusBadge(f)}
        <button class="file-remove-simple" data-idx="${i}">×</button>
        <span class="file-collapsed-icon fc-${f.type}" title="${escapeHtml(f.name)}" aria-label="${escapeHtml(f.name)}">
          <svg viewBox="0 0 24 28" aria-hidden="true">
            <path class="file-icon-sheet" d="M4 1.5h10l6 6V26.5H4z"/>
            <path class="file-icon-fold" d="M14 1.5v6h6"/>
          </svg>
          <span class="file-collapsed-type">${escapeHtml(String(f.type || 'file').slice(0, 4))}</span>
        </span>
      </li>`;
    }).join('');

    // Remove button
    list.querySelectorAll('.file-remove-simple').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx);
        files.splice(idx, 1);
        renderFiles();
      });
    });

    // Update count
    const fileCount = $('#fileCount');
    if (fileCount) fileCount.textContent = files.length;

    // Toggle upload guide
    const uploadGuide = $('.upload-guide');
    if (uploadGuide) uploadGuide.style.display = files.length > 0 ? 'none' : '';
  }

  function renderFileStatusBadge(f) {
    if (f.status === 'parsing') return `<span class="file-status-badge parsing">파싱 중</span>`;
    if (f.status === 'summarizing') return `<span class="file-status-badge summarizing">SLM 자연어화</span>`;
    if (f.status === 'chunking') return `<span class="file-status-badge chunking">청킹 중</span>`;
    if (f.status === 'done') return `<span class="file-status-badge done">청킹 완료 ${f.chunks}청크</span>`;
    return `<span class="file-size-simple">${f.size}</span>`;
  }

  // 업로드된 파일의 파싱 → SLM 자연어화 → 청킹 파이프라인을 순차 시뮬레이션
  function runFilePipeline(fileObj) {
    let stageIdx = 0;
    const advance = () => {
      const stage = FILE_STAGES[stageIdx];
      if (!stage) return;
      fileObj.status = stage.status;
      if (stage.status === 'done') {
        fileObj.chunks = Math.floor(Math.random() * 10) + 6; // 6~15청크
      }
      renderFiles();
      stageIdx++;
      if (stage.delay > 0 && FILE_STAGES[stageIdx]) {
        setTimeout(advance, stage.delay);
      }
    };
    advance();
  }

  function renderRecommendations() {
    const filtered = currentFilter === 'all' ? recommendations : recommendations.filter(r => r.category === currentFilter);
    const resultCount = $('#recommendResultCount');
    if (resultCount) resultCount.textContent = String(filtered.length);
    $('#recommendList').innerHTML = filtered.map((r) => {
      const isSelected = selectedRecIds.includes(r.id);
      const topBadge = r.rank ? `<span class="rec-top-badge">TOP ${r.rank}</span>` : '';
      return `
      <div class="rec-card${isSelected ? ' active' : ''}" data-id="${r.id}">
        <div class="rec-card-head">
          <label class="rec-checkbox"><input type="checkbox" ${isSelected ? 'checked' : ''} data-rec-id="${r.id}" /><span class="rec-check-mark"></span></label>
          <span class="rec-title">${r.title}</span>
          <span class="rec-score">${r.score}%</span>
        </div>
        ${topBadge}
        <div class="rec-meta">${r.meta}</div>
        <div class="rec-desc">${r.desc}</div>
        <div class="rec-tags">${r.tags.map(t => `<span class="rec-tag">${t}</span>`).join('')}</div>
      </div>`;
    }).join('');

    // Checkbox multi-select
    $$('.rec-card input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', (e) => {
        e.stopPropagation();
        const id = parseInt(cb.dataset.recId);
        if (cb.checked) {
          if (!selectedRecIds.includes(id)) selectedRecIds.push(id);
        } else {
          selectedRecIds = selectedRecIds.filter(x => x !== id);
        }
        renderRecommendations();
        renderSelectedRefs();
        // Show preview of last selected
        const lastId = selectedRecIds[selectedRecIds.length - 1];
        const rec = recommendations.find(r => r.id === lastId);
        if (rec) renderPreview(rec);
      });
    });

    // Card click → preview (without toggling checkbox)
    $$('.rec-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.rec-checkbox')) return;
        const id = parseInt(card.dataset.id);
        const rec = recommendations.find(r => r.id === id);
        if (rec) renderPreview(rec);
      });
    });
  }

  function renderPreview(rec) {
    if (!rec) return;
    const badge = $('.center-right .sub-badge');
    if (badge) badge.textContent = '유사도 ' + rec.score + '%';

    const sectionsPerPage = 2;
    const allSections = rec.preview.sections || [];
    const pages = [];
    for (let i = 0; i < allSections.length; i += sectionsPerPage) pages.push(allSections.slice(i, i + sectionsPerPage));
    if (pages.length === 0) pages.push([]);

    const metaItems = [
      { label: '문서명', value: rec.title },
      { label: '문서유형', value: rec.meta },
      { label: '활용등급', value: `${rec.score}% 유사도 · ${rec.tags.join(', ')}` },
      { label: '검토메모', value: rec.desc }
    ];

    $('#previewBody').innerHTML = `<div class="doc-pages-track">${pages.map((pageSections, pageIdx) => buildDocPage({
      org: rec.preview.org,
      title: rec.preview.title,
      continueTitle: `${rec.preview.title} · (계속)`,
      pageIdx,
      totalPages: pages.length,
      metaItems: pageIdx === 0 ? metaItems : [],
      lead: pageIdx === 0
        ? `${rec.desc} 관련 실제 검토 문서의 느낌을 주기 위해 본 미리보기는 한 페이지에 충분한 분량이 보이도록 문단, 목록, 메모 박스를 함께 구성했습니다. 선택한 자료의 핵심 논거와 수치, 초안 반영 포인트를 한눈에 검토할 수 있습니다.`
        : `이 페이지는 ${rec.title} 문서의 후속 검토 페이지입니다. 실제 스캔 문서처럼 한 화면에서 충분한 문량을 확인할 수 있도록 세부 설명과 메모를 추가 구성했습니다.`,
      sections: pageSections.map(section => ({
        ...section,
        desc: `${section.title} 항목은 ${rec.title}에서 초안 작성에 바로 활용할 수 있는 내용을 정리한 부분입니다. 실무 검토 시에는 핵심 논거와 함께 예산 수치, 관계부처 협의 내용, 활용 시 주의사항을 함께 확인하는 것이 중요합니다.`,
        note: `${section.title} 관련 문단은 답변서 초안 반영 시 직접 활용 가능한 핵심 표현과 검토 포인트를 동시에 보여주도록 보강하였습니다.`
      }))
    })).join('')}</div>`;

    initDocViewerPanel($('#recommendViewerPanel'));
  }

  function renderSelectedRefs() {
    const list = $('#selectedRefsList');
    const count = $('#selectedRefsCount');
    if (!list) return;
    const selected = recommendations.filter(r => selectedRecIds.includes(r.id));
    if (count) count.textContent = selected.length;
    list.innerHTML = selected.map(r => `<li data-ref-id="${r.id}">
      <span class="ref-score">${r.score}%</span>
      <span class="ref-name">${r.title}</span>
      <span class="ref-remove" data-remove-id="${r.id}">×</span>
    </li>`).join('');

    // Remove button
    $$('.ref-remove', list).forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.removeId);
        selectedRecIds = selectedRecIds.filter(x => x !== id);
        renderSelectedRefs();
        renderRecommendations();
      });
    });

    // Toggle refs guide
    const refsGuide = $('.selected-refs-guide');
    if (refsGuide) refsGuide.style.display = selected.length > 0 ? 'none' : '';

    // Toggle footer message
    const refsFooter = $('#selectedRefsFooter');
    if (refsFooter) refsFooter.classList.toggle('hidden', selected.length === 0);
  }

  function renderChatTopics() {
    const el = $('#chatTopics');
    if (!el) return;
    const normalizedTerm = chatTopicSearchTerm.trim().toLowerCase();
    const visibleTopics = chatTopics
      .map((topic, index) => ({ topic, index }))
      .filter(({ topic }) => !normalizedTerm || `${topic.title} ${topic.date || ''} ${topic.time || ''}`.toLowerCase().includes(normalizedTerm))
      .sort((a, b) => {
        const pinDiff = Number(Boolean(b.topic.pinned)) - Number(Boolean(a.topic.pinned));
        if (pinDiff) return pinDiff;
        const aDate = `${a.topic.date || ''} ${a.topic.time || ''}`;
        const bDate = `${b.topic.date || ''} ${b.topic.time || ''}`;
        return chatTopicSortOrder === 'oldest' ? aDate.localeCompare(bDate) : bDate.localeCompare(aDate);
      });
    const total = $('#chatTopicTotal');
    if (total) total.textContent = String(chatTopics.length);
    el.innerHTML = visibleTopics.length ? visibleTopics.map(({ topic: t, index: i }) =>
      `<div class="chat-topic${i === activeChatTopic ? ' active' : ''}${t.pinned ? ' pinned' : ''}" data-topic="${i}">
        <span class="ct-title">💬 ${t.title}</span>
        <span class="ct-time"><span class="ct-date">${t.date || ''}</span><span>${t.time || ''}</span></span>
        <button class="ct-more" data-topic-idx="${i}" aria-label="더보기">⋮</button>
        <div class="ct-menu hidden" data-menu-idx="${i}">
          <button class="ct-menu-item" data-action="share"><svg viewBox="0 0 24 24" width="14" height="14"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>대화 공유</button>
          <button class="ct-menu-item" data-action="pin"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 2L12 22M12 2L8 6M12 2L16 6"/></svg>${t.pinned ? '고정 해제' : '고정'}</button>
          <button class="ct-menu-item" data-action="rename"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>이름 변경</button>
          <button class="ct-menu-item ct-menu-danger" data-action="delete"><svg viewBox="0 0 24 24" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>삭제</button>
        </div>
      </div>`
    ).join('') : '<div class="drawer-list-empty">검색 결과가 없습니다.</div>';

    // Click to switch conversation
    el.addEventListener('click', (e) => {
      // Ignore if clicking more button or menu
      if (e.target.closest('.ct-more') || e.target.closest('.ct-menu')) return;
      const topic = e.target.closest('.chat-topic');
      if (!topic) return;
      activeChatTopic = parseInt(topic.dataset.topic);
      $$('.chat-topic', el).forEach(t => t.classList.remove('active'));
      topic.classList.add('active');
      renderChatMessages();
      // Close drawer
      const drawer = $('#chatDrawer');
      const backdrop = $('#chatDrawerBackdrop');
      if (drawer) drawer.classList.add('hidden');
      if (backdrop) backdrop.classList.add('hidden');
    });

    // More button (⋮) → toggle context menu
    $$('.ct-more', el).forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = btn.dataset.topicIdx;
        // Close all other menus
        $$('.ct-menu', el).forEach(m => { if (m.dataset.menuIdx !== idx) m.classList.add('hidden'); });
        const menu = $(`.ct-menu[data-menu-idx="${idx}"]`, el);
        if (menu) menu.classList.toggle('hidden');
      });
    });

    // Menu actions
    $$('.ct-menu-item', el).forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = item.closest('.ct-menu');
        const idx = parseInt(menu.dataset.menuIdx);
        const action = item.dataset.action;
        menu.classList.add('hidden');

        if (action === 'share') {
          showToast('대화 공유 링크가 복사되었습니다.');
        } else if (action === 'pin') {
          chatTopics[idx].pinned = !chatTopics[idx].pinned;
          renderChatTopics();
          showToast(chatTopics[idx].pinned ? '대화가 고정되었습니다.' : '고정이 해제되었습니다.');
        } else if (action === 'rename') {
          openRenameModal(idx);
        } else if (action === 'delete') {
          customConfirm('대화 삭제', '이 대화를 삭제하시겠습니까?', () => {
            chatTopics.splice(idx, 1);
            chatConversations.splice(idx, 1);
            if (activeChatTopic >= chatTopics.length) activeChatTopic = Math.max(0, chatTopics.length - 1);
            renderChatTopics();
            renderChatMessages();
            showToast('대화가 삭제되었습니다.');
          }, 'danger');
        }
      });
    });

    // Close menu on outside click
    document.addEventListener('click', () => {
      $$('.ct-menu', el).forEach(m => m.classList.add('hidden'));
    });
  }

  function renderChatMessages() {
    const el = $('#chatMessages');
    const msgs = chatConversations[activeChatTopic] || [];
    el.innerHTML = msgs.map((m, i) => {
      const actions = m.role === 'ai' && i !== 0 ? `<div class="msg-actions">
        <button class="msg-action-btn" data-action="like" data-idx="${i}" aria-label="좋아요" aria-pressed="false" title="좋아요"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg></button>
        <button class="msg-action-btn" data-action="dislike" data-idx="${i}" aria-label="싫어요" aria-pressed="false" title="싫어요"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10zM17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg></button>
        <button class="msg-action-btn" data-action="retry" data-idx="${i}" aria-label="다시 생성" title="다시 생성"><svg viewBox="0 0 24 24" width="14" height="14"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></button>
        <button class="msg-action-btn" data-action="copy" data-idx="${i}" aria-label="복사" title="복사"><svg viewBox="0 0 24 24" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
        <button class="msg-action-btn msg-report-btn" data-action="report" data-idx="${i}" aria-label="오류신고" title="오류신고"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg></button>
        <button class="msg-action-btn" data-action="more" data-idx="${i}" aria-label="더보기" title="더보기">···</button>
      </div>` : '';
      const isTyping = m.role === 'ai' && m.typing;
      const textHtml = isTyping ? '' : m.text.replace(/\n/g, '<br>');
      return `<div class="chat-msg ${m.role}${isTyping ? ' is-typing' : ''}" data-component="chat-message" data-variant="answer" data-role="${m.role}" data-status="${isTyping ? 'pending' : 'complete'}"><div class="msg-text">${textHtml}</div>${m.time ? `<span class="msg-time">${m.time}</span>` : ''}${actions}</div>`;
    }).join('');
    el.scrollTop = el.scrollHeight;

    window.ChatMessage?.bind(el, {
      getText: ({ button }) => chatConversations[activeChatTopic][Number(button.dataset.idx)]?.text || '',
      onFeedback: () => showToast('피드백이 반영되었습니다.'),
      onRetry: () => showToast('답변을 다시 생성합니다.'),
      onCopy: () => showToast('복사되었습니다.')
    });

    // Bind answer-page-only actions.
    $$('.msg-action-btn[data-action="report"], .msg-action-btn[data-action="more"]', el).forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        if (action === 'more') {
          showToast('추가 옵션');
        } else if (action === 'report') {
          openReportDrawer();
        }
      });
    });

    // Run typewriter effect on the freshly added AI message (if any)
    const typingMsg = msgs.find(m => m.role === 'ai' && m.typing);
    if (typingMsg) {
      const wrap = el.querySelector('.chat-msg.ai.is-typing');
      const target = wrap && wrap.querySelector('.msg-text');
      if (target) {
        typeWriterEffect(target, typingMsg.text, () => {
          typingMsg.typing = false;
          if (wrap) {
            wrap.classList.remove('is-typing');
            wrap.dataset.status = 'complete';
          }
          el.scrollTop = el.scrollHeight;
        }, el);
      }
    }
  }

  // 텍스트를 일정 시간 동안 점진적으로 노출시켜 타이핑 효과를 구현
  function typeWriterEffect(target, fullText, onDone, scrollEl) {
    const total = fullText.length;
    if (total === 0) { target.innerHTML = ''; onDone && onDone(); return; }
    const duration = Math.min(2400, Math.max(400, total * 10));
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      const len = Math.floor(total * progress);
      const isDone = progress >= 1;
      target.innerHTML = fullText.slice(0, len).replace(/\n/g, '<br>') + (isDone ? '' : '<span class="typing-cursor"></span>');
      if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
      if (!isDone) {
        requestAnimationFrame(step);
      } else {
        target.innerHTML = fullText.replace(/\n/g, '<br>');
        onDone && onDone();
      }
    }
    requestAnimationFrame(step);
  }

  function switchTab(tab) {
    currentTab = tab;
    const body = $('#centerBody');

    // Restore left panel if collapsed by compare tab
    if (tab !== 'compare') {
      const leftPanel = $('.panel-folder');
      const container = $('.three-panel-layout');
      if (leftPanel && leftPanel.classList.contains('panel-collapsed')) {
        setPanelCollapsed(leftPanel, false);
      }
    }

    if (tab === 'recommend') {
      body.innerHTML = '';
      body.innerHTML = `<div class="recommend-view-wrapper doc-viewer-panel" id="recommendViewerPanel">
        <div class="center-split" id="tabRecommend">
          <div class="center-left">
            <div class="center-sub-head"><span class="sub-title">관련자료 추천 목록</span><span class="sub-badge">유사도순</span></div>
            <div class="filter-bar" role="toolbar" aria-label="관련자료 필터">
              <button class="filter-btn${currentFilter === 'all' ? ' active' : ''}" type="button" aria-pressed="${currentFilter === 'all'}" data-filter="all">전체</button>
              <button class="filter-btn${currentFilter === 'similar' ? ' active' : ''}" type="button" aria-pressed="${currentFilter === 'similar'}" data-filter="similar">유사답변서</button>
              <button class="filter-btn${currentFilter === 'reference' ? ' active' : ''}" type="button" aria-pressed="${currentFilter === 'reference'}" data-filter="reference">참고자료</button>
            </div>
            <div class="recommend-list" id="recommendList"></div>
            <div class="rec-apply-bar"><button class="btn-primary" id="applyToChat">선택 자료 초안에 반영</button></div>
          </div>
          <div class="center-split-handle" id="centerSplitHandle"></div>
          <div class="center-right" id="previewViewerPanel">
            <div class="center-sub-head"><span class="sub-title">자료 미리보기</span><span class="sub-badge blue">유사도 94%</span></div>
            <div class="preview-body doc-viewer-body" id="previewBody"></div>
          </div>
        </div>
        <div class="draft-status-bar recommend-status-bar" aria-label="관련자료 진행 정보">
          <div class="draft-status-left">
            <span class="draft-stat">관련자료 <strong id="recommendResultCount">${recommendations.length}</strong>건</span>
            <span class="draft-stat-sep" aria-hidden="true">|</span>
            <span class="draft-stat">글자 수 <strong data-char-count>0</strong>자</span>
            <span class="draft-stat-sep" aria-hidden="true">|</span>
            <span class="draft-stat">페이지 <strong data-page-num>1</strong>/<strong data-page-total>1</strong></span>
          </div>
          <div class="draft-status-right">
            <button class="draft-zoom-btn" type="button" data-action="zoom-out" aria-label="문서 미리보기 축소">−</button>
            <span class="draft-zoom-val" data-zoom-val aria-live="polite">100%</span>
            <button class="draft-zoom-btn" type="button" data-action="zoom-in" aria-label="문서 미리보기 확대">+</button>
            <button class="draft-zoom-btn" type="button" data-action="fullscreen" aria-label="관련자료 추천 전체보기" title="관련자료 추천 전체보기">
              <svg viewBox="0 0 24 24" width="14" height="14"><path d="M3 3h5v2H5v3H3V3z M16 3h5v5h-2V5h-3V3z M3 16h2v3h3v2H3v-5z M19 19h-3v2h5v-5h-2v3z"/></svg>
            </button>
          </div>
        </div>
      </div>`;
      renderRecommendations();
      renderPreview(recommendations[0]);
      bindApplyToChat();
      initCenterSplitResize();
    } else if (tab === 'draft') {
      if (isReset || files.length === 0) {
        body.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" width="40" height="40" style="stroke:var(--border);fill:none;stroke-width:1.5;margin-bottom:12px"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg><p class="empty-title">답변서 초안이 없습니다</p><p class="empty-desc">우측 AI 채팅에 질의 내용이나 검색 키워드를 입력하여 초안을 생성해 보세요</p></div>`;
        return;
      }
      const selectedDraftVersion = draftVersions[activeDraftVersion] || draftVersions[0];
      body.innerHTML = `<div class="draft-view-wrapper">
      <div class="draft-version-bar">
        <div class="draft-tabs-shell">
          <button class="draft-tabs-scroll-btn" id="draftTabsPrev" type="button" aria-label="이전 버전 탭 보기" title="이전 버전 탭 보기">
            <svg viewBox="0 0 24 24" width="14" height="14"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div class="draft-doc-tabs" id="draftDocTabs"></div>
          <button class="draft-tabs-scroll-btn" id="draftTabsNext" type="button" aria-label="다음 버전 탭 보기" title="다음 버전 탭 보기">
            <svg viewBox="0 0 24 24" width="14" height="14"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
        <div class="version-bar-right">
          <span class="version-label">버전</span>
          <select class="version-select" id="versionSelect" aria-label="답변서 초안 버전 선택">
            ${draftVersions.map((v, i) => `<option value="${i}"${i === activeDraftVersion ? ' selected' : ''}>${formatDraftVersionTab(v)}</option>`).join('')}
          </select>
          <button class="verify-icon-btn" id="verifyDownloadBtn" title="다운로드"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></button>
        </div>
      </div>
      <div class="draft-verify-toolbar">
        <div class="verify-toolbar-left">
          <div class="verify-checks" id="verifyModeChecks">
            <label class="verify-check-label"><input type="checkbox" class="verify-check" data-mode="highlight" checked /><span>문장별 하이라이트</span></label>
            <label class="verify-check-label"><input type="checkbox" class="verify-check" data-mode="source" checked /><span>출처번호 보기</span></label>
          </div>
          <span class="verify-legend green">녹색: 근거 확인</span>
          <span class="verify-legend yellow">노랑: 주의</span>
          <span class="verify-legend red">빨강: 출처 누락</span>
        </div>
      </div>
      ${(selectedDraftVersion?.content || draftContent).replace('>답변서 초안</span>', `>답변서 초안 · ${formatDraftVersionTab(selectedDraftVersion)}</span>`)}<div class="draft-status-bar" aria-label="답변서 초안 진행 정보">
        <div class="draft-status-left">
          <span class="draft-stat">글자 수: <strong id="draftCharCount">0</strong></span>
          <span class="draft-stat-sep" aria-hidden="true">|</span>
          <span class="draft-stat">페이지 <strong id="draftPageNum">1</strong>/<strong id="draftPageTotal">1</strong></span>
        </div>
        <div class="draft-status-right">
          <button class="draft-zoom-btn" type="button" id="draftZoomOut" aria-label="축소">−</button>
          <span class="draft-zoom-val" id="draftZoomVal" aria-live="polite">100%</span>
          <button class="draft-zoom-btn" type="button" id="draftZoomIn" aria-label="확대">+</button>
          <button class="draft-zoom-btn" type="button" id="draftFitBtn" aria-label="전체화면" title="전체화면">
            <svg viewBox="0 0 24 24" width="14" height="14"><path d="M3 3h5v2H5v3H3V3z M16 3h5v5h-2V5h-3V3z M3 16h2v3h3v2H3v-5z M19 19h-3v2h5v-5h-2v3z"/></svg>
          </button>
        </div>
      </div></div>`;
      initDraftStatusBar();
      initDraftVerify();
      initDraftVersionBar();
    } else if (tab === 'compare') {
      if (isReset || files.length === 0) {
        body.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" width="40" height="40" style="stroke:var(--border);fill:none;stroke-width:1.5;margin-bottom:12px"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg><p class="empty-title">비교할 답변서가 없습니다</p><p class="empty-desc">답변서 초안을 생성하면 유사답변서와 비교할 수 있습니다</p></div>`;
        return;
      }
      // Auto-collapse left panel
      const leftPanel = $('.panel-folder');
      const container = $('.three-panel-layout');
      if (leftPanel && !leftPanel.classList.contains('panel-collapsed')) {
        setPanelCollapsed(leftPanel, true);
      }
      body.innerHTML = `<div class="compare-view">${compareContent}</div>`;
      initCompareResize();
      initAllDocViewers(body);
      initCompareStatusBar(body);
    }
  }

  function initCompareResize() {
    $$('.cmp-col-resize').forEach(handle => {
      handle.addEventListener('mousedown', (e) => {
        if (window.matchMedia('(max-width: 900px)').matches) return;
        e.preventDefault();
        const left = handle.previousElementSibling;
        const right = handle.nextElementSibling;
        if (!left || !right) return;
        const startX = e.clientX;
        const startLeftW = left.offsetWidth;
        const startRightW = right.offsetWidth;
        handle.classList.add('active');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        const onMouseMove = (ev) => {
          const diff = ev.clientX - startX;
          const newLeftW = Math.max(150, startLeftW + diff);
          const newRightW = Math.max(150, startRightW - diff);
          left.style.flex = 'none';
          left.style.width = newLeftW + 'px';
          right.style.flex = 'none';
          right.style.width = newRightW + 'px';
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
    });
  }

  function bindRecommendationFilters() {
    const centerBody = $('#centerBody');
    if (!centerBody || centerBody.dataset.recommendFilterReady === 'true') return;
    centerBody.addEventListener('filter-btn:change', event => {
      if (!event.target.closest('.center-left')) return;
      currentFilter = event.detail.filter || 'all';
      renderRecommendations();
      const filtered = currentFilter === 'all' ? recommendations : recommendations.filter(r => r.category === currentFilter);
      if (filtered.length) renderPreview(filtered[0]);
      updateFilterDesc(currentFilter);
      bindApplyToChat();
      bindSelectAll();
    });
    centerBody.dataset.recommendFilterReady = 'true';
    updateFilterDesc(currentFilter);
    bindSelectAll();
  }

  function bindSelectAll() {
    const selectAll = $('#recSelectAll');
    if (!selectAll) return;
    const filtered = currentFilter === 'all' ? recommendations : recommendations.filter(r => r.category === currentFilter);
    selectAll.checked = filtered.length > 0 && filtered.every(r => selectedRecIds.includes(r.id));
    selectAll.addEventListener('change', () => {
      if (selectAll.checked) {
        filtered.forEach(r => { if (!selectedRecIds.includes(r.id)) selectedRecIds.push(r.id); });
      } else {
        const filteredIds = filtered.map(r => r.id);
        selectedRecIds = selectedRecIds.filter(id => !filteredIds.includes(id));
      }
      renderRecommendations();
      renderSelectedRefs();
    });
  }

  function bindApplyToChat() {
    const btn = $('#applyToChat');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (selectedRecIds.length === 0) { showToast('자료를 선택해주세요.'); return; }
      const selected = recommendations.filter(r => selectedRecIds.includes(r.id));
      const titles = selected.map(r => r.title).join(', ');
      const prompt = `다음 자료를 참고하여 답변서 초안을 생성해주세요:\n${selected.map((r, i) => `${i + 1}. ${r.title} (유사도 ${r.score}%)`).join('\n')}`;

      // Send to chat
      const now = new Date();
      const time = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
      chatConversations[activeChatTopic].push({ role: 'user', text: prompt, time });
      renderChatMessages();

      setTimeout(() => {
        chatConversations[activeChatTopic].push({ role: 'ai', text: `선택하신 ${selected.length}건의 자료를 분석하여 답변서 초안에 반영합니다.\n\n📋 반영 자료:\n${selected.map(r => '• ' + r.title).join('\n')}\n\n초안 생성을 시작합니다. "답변서 초안" 탭에서 결과를 확인하세요.`, time, typing: true });
        renderChatMessages();
      }, 800);

      showToast(`${selected.length}건의 자료가 초안에 반영됩니다.`);
    });
  }

  function updateFilterDesc(filter) {
    let descEl = $('.filter-desc');
    const list = $('.recommend-list') || $('#recommendList');
    if (!list) return;
    if (!descEl) {
      descEl = document.createElement('div');
      descEl.className = 'filter-desc';
      list.parentElement.insertBefore(descEl, list);
    }
    if (filter === 'similar') {
      descEl.textContent = '과거 답변서와 마스터답변 중 현재 질의와 유사도가 높은 자료를 추천합니다.';
      descEl.style.display = '';
    } else if (filter === 'reference') {
      descEl.textContent = '답변서에 첨부하거나 답변서 초안 생성 시 근거로 활용할 수 있는 참고자료입니다.';
      descEl.style.display = '';
    } else {
      descEl.style.display = 'none';
    }
  }

  // ─── Events ───
  function bindEvents() {
    const sidebar = $('#sidebar');
    $('#sidebarCollapseBtn').addEventListener('click', e => {
      e.stopPropagation();
      sidebar.classList.toggle('collapsed');
      if (sidebar.classList.contains('collapsed')) {
        localStorage.setItem('sidebar-collapsed', 'true');
      } else {
        localStorage.removeItem('sidebar-collapsed');
      }
    });
    $('.sidebar-brand', sidebar).addEventListener('click', () => {
      if (sidebar.classList.contains('collapsed')) {
        sidebar.classList.remove('collapsed');
        localStorage.removeItem('sidebar-collapsed');
      } else {
        window.location.href = 'ai-home.html';
      }
    });
    $$('.nav-link', sidebar).forEach(l => l.addEventListener('click', () => {
      if (l.dataset.page === 'home') return; // AI-ONE 홈은 접지 않음
      localStorage.setItem('sidebar-collapsed', 'true');
      sidebar.classList.add('collapsed');
    }));

    // Restore collapsed state
    if (localStorage.getItem('sidebar-collapsed') === 'true') {
      sidebar.classList.add('collapsed');
    }

    initNavTooltips(sidebar);

    // Top tabs
    $$('.top-tab').forEach(tab => tab.addEventListener('click', () => {
      $$('.top-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      switchTab(tab.dataset.tab);
    }));

    // Recommendation filter buttons
    bindRecommendationFilters();

    // Upload zone
    const uploadZone = $('#uploadZone');
    if (uploadZone) {
      uploadZone.addEventListener('app:file-upload', event => {
        validateFilesBeforeUpload(event.detail.files, addUploadFiles);
      });
    }

    // Chat
    $('#chatSendBtn').addEventListener('click', sendChat);
    $('#chatInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });
    $('#chatInput').addEventListener('input', () => {
      $('#chatSendBtn').disabled = $('#chatInput').value.trim().length === 0;
    });

    // New Chat button
    const newChatBtn = $('#newChatBtn');
    if (newChatBtn) {
      newChatBtn.addEventListener('click', () => {
        const newId = chatTopics.length;
        const now = new Date();
        const time = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
        chatTopics.push({ title: '새 대화 #' + (newId + 1), time, date: new Date().toLocaleDateString('ko-KR', {year:'numeric', month:'2-digit', day:'2-digit'}).replace(/\. /g, '.').replace(/\.$/, ''), id: newId });
        chatConversations.push([{ role: 'ai', text: AI_CHAT_INTRO, time }]);
        activeChatTopic = newId;
        renderChatTopics();
        renderChatMessages();
        showToast('새 채팅이 생성되었습니다.');
      });
    }

    // Chat list toggle (drawer)
    const chatListToggle = $('#chatListToggle');
    const chatDrawer = $('#chatDrawer');
    const chatDrawerBackdrop = $('#chatDrawerBackdrop');
    const chatDrawerClose = $('#chatDrawerClose');

    function openChatDrawer() {
      if (chatDrawer) chatDrawer.classList.remove('hidden');
      if (chatDrawerBackdrop) chatDrawerBackdrop.classList.remove('hidden');
    }
    function closeChatDrawer() {
      if (chatDrawer) chatDrawer.classList.add('hidden');
      if (chatDrawerBackdrop) chatDrawerBackdrop.classList.add('hidden');
    }

    if (chatListToggle) chatListToggle.addEventListener('click', openChatDrawer);
    if (chatDrawerClose) chatDrawerClose.addEventListener('click', closeChatDrawer);
    if (chatDrawerBackdrop) chatDrawerBackdrop.addEventListener('click', closeChatDrawer);

    const chatTopicSearch = $('#chatTopicSearch');
    const chatTopicSearchClear = $('#chatTopicSearchClear');
    const chatTopicSort = $('#chatTopicSort');
    chatTopicSearch?.addEventListener('input', () => {
      chatTopicSearchTerm = chatTopicSearch.value || '';
      chatTopicSearchClear?.classList.toggle('hidden', !chatTopicSearchTerm);
      renderChatTopics();
    });
    chatTopicSearchClear?.addEventListener('click', () => {
      chatTopicSearchTerm = '';
      if (chatTopicSearch) {
        chatTopicSearch.value = '';
        chatTopicSearch.focus();
      }
      chatTopicSearchClear.classList.add('hidden');
      renderChatTopics();
    });
    chatTopicSort?.addEventListener('change', () => {
      chatTopicSortOrder = chatTopicSort.value === 'oldest' ? 'oldest' : 'latest';
      renderChatTopics();
    });

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
        resetReportForm();
        showToast('신고가 접수되었습니다. 감사합니다.');
      });
    }

    // Report file upload
    const reportUploadZone = $('#reportUploadZone');
    if (reportUploadZone) {
      reportUploadZone.addEventListener('app:file-upload', event => {
        addReportFiles(event.detail.files);
      });
    }

    // Drawer position toggle
    const drawerPosBtn = $('#drawerPosBtn');
    const drawerPosIcon = $('#drawerPosIcon');
    const updateDrawerPositionControl = () => {
      const isLeft = chatDrawer && chatDrawer.classList.contains('drawer-left');
      const label = $('#drawerPosLabel');
      if (label) label.textContent = isLeft ? '우측으로 이동' : '좌측으로 이동';
      if (drawerPosBtn) drawerPosBtn.setAttribute('aria-label', isLeft ? '드로어를 우측으로 이동' : '드로어를 좌측으로 이동');
      if (drawerPosIcon) {
        const sideMark = drawerPosIcon.querySelector('.drawer-side-mark');
        const moveArrow = drawerPosIcon.querySelector('.drawer-move-arrow');
        if (sideMark) sideMark.setAttribute('d', isLeft ? 'M8 5.5V18.5' : 'M16 5.5V18.5');
        if (moveArrow) moveArrow.setAttribute('d', isLeft ? 'M10 12H17M14.5 9.5 17 12l-2.5 2.5' : 'M14 12H7M9.5 9.5 7 12l2.5 2.5');
      }
    };
    if (drawerPosBtn && chatDrawer) {
      updateDrawerPositionControl();
      drawerPosBtn.addEventListener('click', () => {
        chatDrawer.classList.toggle('drawer-left');
        updateDrawerPositionControl();
      });
    }

    // Chat mode buttons
    $$('.mode-btn').forEach(btn => btn.addEventListener('click', () => {
      $$('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const desc = $('#chatModeDesc');
      if (desc) {
        if (btn.dataset.mode === 'fast') {
          desc.textContent = '간단한 지시만으로 문서 초안을 빠르게 생성합니다.';
        } else {
          desc.textContent = '좌측 자료 폴더와 업로드 파일의 요구사항을 우선 반영해 초안을 생성합니다.';
        }
      }
    }));

    // Chat tags
    $$('.chat-tag').forEach(tag => tag.addEventListener('click', () => {
      const input = $('#chatInput');
      input.value = tag.textContent + ': ';
      input.dispatchEvent(new Event('input'));
      input.focus();
    }));

    // Buttons
    const resetBtn = $('#resetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        hideAnswerSkeleton();
        // Clear files
        files.length = 0;
        renderFiles();
        // Clear selected refs
        selectedRecIds = [];
        renderSelectedRefs();
        // Reset filter
        currentFilter = 'all';
        // Switch to recommend tab
        $$('.top-tab').forEach(t => t.classList.remove('active'));
        $$('.top-tab')[0].classList.add('active');
        // Show empty states
        const centerBody = $('#centerBody');
        if (centerBody) {
          centerBody.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" width="40" height="40" style="stroke:var(--border);fill:none;stroke-width:1.5;margin-bottom:12px"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><p class="empty-title">검색된 추천 자료가 없습니다</p><p class="empty-desc">우측 AI 채팅에 질의 내용이나 검색 키워드를 입력해 보세요<br/>AI가 관련 유사답변서와 참고자료를 추천합니다</p></div>`;
        }
        // Reset chat
        chatConversations[0] = [{ role: 'ai', text: AI_CHAT_INTRO, time: new Date().getHours() + ':' + String(new Date().getMinutes()).padStart(2,'0') }];
        activeChatTopic = 0;
        renderChatMessages();
        // Reset versions
        draftVersions = draftVersionExamples.map(version => ({ ...version }));
        activeDraftVersion = 0;
        openDocTabs = [{ id: 0, label: formatDraftVersionTab(draftVersions[0]), versionIdx: 0 }];
        activeDocTab = 0;
        // Update file count
        const fileCount = $('#fileCount');
        if (fileCount) fileCount.textContent = '0';
        isReset = true;
        // Update tab counts
        const tabRec = $('#tabCountRecommend');
        const tabDraft = $('#tabCountDraft');
        const tabCompare = $('#tabCountCompare');
        if (tabRec) tabRec.textContent = '0';
        if (tabDraft) tabDraft.textContent = '0';
        if (tabCompare) tabCompare.textContent = '0';
        showToast('초기화되었습니다.');
      });
    }

    const refsResetBtn = $('#refsResetBtn');
    if (refsResetBtn) {
      refsResetBtn.addEventListener('click', () => {
        resetRefsPanel();
      });
    }

    // Left panel collapse
    const leftCollapseBtn = $('#leftPanelCollapseBtn');
    if (leftCollapseBtn) {
      leftCollapseBtn.addEventListener('click', () => {
        const panel = leftCollapseBtn.closest('.panel');
        const container = $('.three-panel-layout');
        if (!panel || !container) return;
        setPanelCollapsed(panel, !panel.classList.contains('panel-collapsed'));
      });
    }

    // Collapsed add button → trigger file input
    const collapsedAddBtn = $('#collapsedAddBtn');
    if (collapsedAddBtn) {
      collapsedAddBtn.addEventListener('click', () => {
        const fileInput = $('#fileInput');
        if (fileInput) fileInput.click();
      });
    }

    // Left panel vertical resize (between upload and selected refs)
    const leftResizeHandle = $('#leftPanelResizeHandle');
    if (leftResizeHandle) {
      leftResizeHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const uploadSection = $('.folder-upload-section');
        const refsSection = $('#selectedRefsSection');
        if (!uploadSection || !refsSection) return;
        const startY = e.clientY;
        const startUploadH = uploadSection.offsetHeight;
        const startRefsH = refsSection.offsetHeight;
        leftResizeHandle.classList.add('active');
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';

        const onMouseMove = (ev) => {
          const diff = ev.clientY - startY;
          const newUploadH = Math.max(80, startUploadH + diff);
          const newRefsH = Math.max(60, startRefsH - diff);
          uploadSection.style.flex = 'none';
          uploadSection.style.height = newUploadH + 'px';
          refsSection.style.flex = 'none';
          refsSection.style.height = newRefsH + 'px';
        };
        const onMouseUp = () => {
          leftResizeHandle.classList.remove('active');
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
    }

    // Panel swap (rotate)
    if ($('#panelSwapBtn')) {
      $('#panelSwapBtn').addEventListener('click', rotatePanels);
    }

    // Fullscreen
    if ($('#fullscreenBtn')) {
      $('#fullscreenBtn').addEventListener('click', () => {
        document.body.classList.toggle('fullscreen-mode');
        if (document.body.classList.contains('fullscreen-mode')) {
          showToast('전체화면 모드');
        } else {
          showToast('일반 모드');
        }
      });
    }

    // Tree items handled by event delegation in renderTree
  }

  // ─── File Upload ───

  const FILE_SECURITY_SCAN_LIMIT = 1024 * 1024;
  const FILE_SENSITIVE_RULES = [
    { label: '개인정보 표기', pattern: /(개인정보|민감정보|개인 식별정보|개인식별정보)/i },
    { label: '주민등록·외국인등록 정보', pattern: /(주민등록(번호)?|주민번호|외국인등록(번호)?|\b\d{6}-?[1-4]\d{6}\b)/i },
    { label: '여권·면허 정보', pattern: /(여권번호|운전면허(번호)?|면허번호)/i },
    { label: '금융·인증 정보', pattern: /(계좌번호|신용카드(번호)?|카드번호|비밀번호|인증번호|보안카드)/i },
    { label: '건강·의료 정보', pattern: /(건강정보|진료기록|진단명|병력|의료정보|장애정보|유전정보|생체정보|지문정보)/i },
    { label: '민감한 개인 속성', pattern: /(범죄경력|정치적 견해|노동조합|종교정보|성생활|성적 지향)/i },
    { label: '연락처 정보', pattern: /(\b01[016789]-?\d{3,4}-?\d{4}\b|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i }
  ];
  const FILE_CONFIDENTIAL_RULES = [
    { label: '대외비', pattern: /(대외\s*비|대외비)/i },
    { label: '비공개·내부한정', pattern: /(비공개|내부한정|내부용|외부공개금지|외부 공개 금지)/i },
    { label: '보안·기밀', pattern: /(보안문서|기밀|confidential|secret)/i }
  ];

  function escapeSecurityHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
  }

  async function inspectUploadFileSecurity(file) {
    let contentSample = '';
    try {
      contentSample = await file.slice(0, FILE_SECURITY_SCAN_LIMIT).text();
    } catch (error) {
      contentSample = '';
    }
    const target = `${file.name || ''}\n${contentSample}`;
    const sensitiveReasons = FILE_SENSITIVE_RULES.filter(rule => rule.pattern.test(target)).map(rule => rule.label);
    const confidentialReasons = FILE_CONFIDENTIAL_RULES.filter(rule => rule.pattern.test(target)).map(rule => rule.label);
    return {
      file,
      sensitiveReasons: [...new Set(sensitiveReasons)],
      confidentialReasons: [...new Set(confidentialReasons)],
      level: sensitiveReasons.length ? 'sensitive' : (confidentialReasons.length ? 'confidential' : 'safe')
    };
  }

  function getSecurityModal() {
    let modal = $('#customModalBackdrop');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'customModalBackdrop';
      modal.className = 'custom-modal-backdrop';
      document.body.appendChild(modal);
    }
    return modal;
  }

  function renderSecurityFileRows(results, reasonKey) {
    return results.map(result => {
      const reasons = result[reasonKey] || [];
      return `<li class="security-file-row"><span class="security-file-name">${escapeSecurityHtml(result.file.name)}</span><span class="security-file-reason">${escapeSecurityHtml(reasons.join(' · '))}</span></li>`;
    }).join('');
  }

  function showSensitiveFileBlocked(results, onClose) {
    const modal = getSecurityModal();
    modal.innerHTML = `<div class="custom-modal security-modal">
      <div class="custom-modal-icon danger">!</div>
      <div class="custom-modal-title">업로드할 수 없는 파일이 있습니다</div>
      <div class="custom-modal-msg security-modal-msg">개인정보 또는 민감정보가 감지된 파일은 업로드할 수 없습니다. 해당 정보를 삭제하거나 비식별 처리한 뒤 다시 업로드해 주세요.</div>
      <ul class="security-file-list">${renderSecurityFileRows(results, 'sensitiveReasons')}</ul>
      <div class="security-policy-note">차단된 파일은 업로드 목록 및 AI 분석 대상에 추가되지 않습니다.</div>
      <div class="custom-modal-actions"><button class="btn-confirm danger" id="securityBlockedOk">확인</button></div>
    </div>`;
    modal.classList.remove('hidden');
    const close = () => {
      modal.classList.add('hidden');
      if (onClose) onClose();
    };
    $('#securityBlockedOk').onclick = close;
    modal.onclick = (event) => { if (event.target === modal) close(); };
  }

  function showConfidentialFileConfirm(results, onConfirm) {
    const modal = getSecurityModal();
    modal.innerHTML = `<div class="custom-modal security-modal">
      <div class="custom-modal-icon alert">!</div>
      <div class="custom-modal-title">대외비 파일 업로드 확인</div>
      <div class="custom-modal-msg security-modal-msg">대외비 또는 비공개 정보가 감지되었습니다. 해당 자료에 대한 열람·활용 권한이 있는지 확인한 후 업로드를 진행해 주세요.</div>
      <ul class="security-file-list">${renderSecurityFileRows(results, 'confidentialReasons')}</ul>
      <div class="security-policy-note warning">확인 후 업로드하면 해당 파일이 AI 분석에 사용되며 업로드 및 이용 이력이 기록될 수 있습니다.</div>
      <div class="custom-modal-actions">
        <button class="btn-cancel" id="securityConfidentialCancel">취소</button>
        <button class="btn-confirm" id="securityConfidentialConfirm">확인 후 업로드</button>
      </div>
    </div>`;
    modal.classList.remove('hidden');
    const close = () => modal.classList.add('hidden');
    $('#securityConfidentialCancel').onclick = close;
    $('#securityConfidentialConfirm').onclick = () => {
      close();
      if (onConfirm) onConfirm(results.map(result => result.file));
    };
    modal.onclick = (event) => { if (event.target === modal) close(); };
  }

  async function validateFilesBeforeUpload(inputFiles, uploadHandler) {
    const candidateFiles = Array.from(inputFiles || []);
    if (!candidateFiles.length) return;
    showToast('파일의 개인정보·민감정보 및 대외비 여부를 확인하고 있습니다.');
    const results = await Promise.all(candidateFiles.map(inspectUploadFileSecurity));
    const blocked = results.filter(result => result.level === 'sensitive');
    const confidential = results.filter(result => result.level === 'confidential');
    const safe = results.filter(result => result.level === 'safe').map(result => result.file);

    const continueAllowedUpload = () => {
      if (safe.length) uploadHandler(safe);
      if (confidential.length) {
        showConfidentialFileConfirm(confidential, approvedFiles => uploadHandler(approvedFiles));
      }
    };

    if (blocked.length) {
      showSensitiveFileBlocked(blocked, continueAllowedUpload);
    } else {
      continueAllowedUpload();
    }
  }

  function addUploadFiles(newFiles) {
    const added = [];
    newFiles.forEach(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      let type = 'txt';
      if (ext === 'pdf') type = 'pdf';
      else if (ext === 'hwp') type = 'hwp';
      else if (ext === 'docx' || ext === 'doc') type = 'docx';
      else if (ext === 'xlsx' || ext === 'xls') type = 'xls';
      else if (['png','jpg','jpeg','tif','tiff'].includes(ext)) type = 'img';
      const size = (file.size / 1024 / 1024).toFixed(1) + 'MB';
      const fileObj = { id: ++fileIdSeq, name: file.name, size, type, status: null, chunks: 0 };
      files.push(fileObj);
      added.push(fileObj);
    });
    isReset = false;
    renderFiles();
    showAnswerSkeleton('참조소스를 분석하고 추천 데이터를 준비하고 있습니다...');
    window.setTimeout(() => {
      hideAnswerSkeleton();
      if (currentTab === 'recommend') {
        renderRecommendations();
        renderPreview(recommendations[0]);
      }
    }, 1400);
    showToast(`${newFiles.length}건 파일이 업로드되었습니다.`);
    const fileCount = $('#fileCount');
    if (fileCount) fileCount.textContent = files.length;

    // 업로드마다 파싱 → SLM 자연어화 → 청킹 파이프라인 실행
    added.forEach(fileObj => runFilePipeline(fileObj));
  }

  // ─── Report File Attach ───
  function addReportFiles(newFiles) {
    const remaining = 5 - reportFiles.length;
    if (remaining <= 0) { showToast('첨부파일은 최대 5개까지 가능합니다.'); return; }
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

  // 채팅으로 추가 요청 시 관련자료 추천 목록에 채울 후보 자료 풀
  const MORE_REC_POOL = [
    {
      title: '지방재정 위기관리 매뉴얼(개정판)', score: 81,
      meta: '참고자료 · 지침 · 재정정책국', category: 'reference',
      desc: '지자체 재정위기 사전경보 및 관리 절차. 채무비율 산정 기준 포함.',
      tags: ['참고자료', '재정위기관리'],
      preview: { org: '재정정책국 · 개정판', title: '지방재정 위기관리 매뉴얼', sections: [{ title: '주요 내용', items: ['재정위기단체 지정 기준 및 절차', '채무비율 산정 방식 및 관리대상 기준'] }, { title: '활용 방안', items: ['채무 증가 관련 질의 답변 보강', '재정건전성 관리 근거로 인용'] }] }
    },
    {
      title: '지방채 발행 한도 산정 기준 지침', score: 78,
      meta: '참고자료 · 지침 · 재정정책국', category: 'reference',
      desc: '지방채무 한도액 산정 공식 및 지자체별 발행 승인 절차 안내.',
      tags: ['참고자료', '지방채한도'],
      preview: { org: '재정정책국', title: '지방채 발행 한도 산정 기준', sections: [{ title: '주요 내용', items: ['지방채무 한도액 = 최근 3년 평균 일반회계 결산액 기준 산정', '한도 초과 시 행안부 승인 절차 필요'] }, { title: '활용 방안', items: ['채무 증가 우려에 대한 제도적 보완 설명', '한도 관리 체계 인용'] }] }
    },
    {
      title: '2026년 지방재정 운용 성과평가 보고서', score: 74,
      meta: '참고답변 · 성과보고 · 지역발전정책국', category: 'similar',
      desc: '지자체별 재정운용 성과와 채무관리 지표 평가 결과 요약.',
      tags: ['참고답변', '성과평가'],
      preview: { org: '지역발전정책국 · 2026년', title: '지방재정 운용 성과평가 보고서', sections: [{ title: '주요 내용', items: ['채무관리 지표 우수 지자체 사례 포함', '재정운용 평가 등급별 개선 권고사항'] }, { title: '활용 방안', items: ['답변서 신뢰도 보강 자료로 인용', '유사 질의 대비 참고'] }] }
    },
    {
      title: '지방교부세 산정 및 배분 현황 자료', score: 70,
      meta: '참고자료 · 통계자료 · 재정정책국', category: 'reference',
      desc: '지방교부세 총액 및 지자체별 배분 현황. 교부세와 지방채 관계 설명 포함.',
      tags: ['참고자료', '지방교부세'],
      preview: { org: '재정정책국 · 통계자료', title: '지방교부세 산정 및 배분 현황', sections: [{ title: '주요 내용', items: ['교부세는 일반재원으로 특정 자본사업에 사용 제한', '지방채는 자본적 지출 목적의 별도 재원'] }, { title: '활용 방안', items: ['교부세와 지방채의 목적 차이 설명', '추경 편성 필요성 논거 보강'] }] }
    }
  ];

  function detectMoreRecRequest(lowerText) {
    return lowerText.includes('관련자료') && (lowerText.includes('추가') || lowerText.includes('더'));
  }

  // 사용자 요청 키워드에 따라 서로 다른 예시 응답 생성 (답변서 초안 수정 시나리오)
  function generateDraftEditResponse(text) {
    const lower = text.toLowerCase();
    if (lower.includes('요약')) {
      return '답변서 초안을 핵심 위주로 요약했습니다.\n\n📝 요약 결과:\n• 공자기금은 지자체 자본사업 지원을 위해 지방채를 장기 저리로 인수\n• 광주·전남 통합특별시 출범에 따른 추경 약 1,000억 원 반영\n• 인수기간 5년 거치 10년 분할 상환 조건 유지\n\n전체 분량이 약 40% 축소되었습니다. "답변서 초안" 탭에서 확인해 보세요.';
    }
    if (lower.includes('항목') || lower.includes('정리')) {
      return '답변서 내용을 항목별로 정리했습니다.\n\n① 제도 개요 — 공자기금 지방채 인수 목적 및 근거\n② 추경 편성 배경 — 광주·전남 통합특별시 관련 수요\n③ 재원 조건 — 인수금리 및 상환 조건\n④ 향후 계획 — 지자체별 집행 일정\n\n각 항목은 "답변서 초안" 탭에서 구분선으로 표시됩니다.';
    }
    if (lower.includes('문단') || lower.includes('다듬')) {
      return '문장을 더 매끄럽게 다듬었습니다.\n\n예시:\n"공자기금은 지자체가 발행하는 지방채를 장기 저리로 인수하여, 자본적 지출 사업의 원활한 추진을 지원하고 있습니다."\n\n→ 기존 대비 문장 호흡이 짧아지고 공문서 어조에 맞게 정리되었습니다.';
    }
    if (lower.includes('표로') || lower.includes('표 ') || lower.includes('테이블')) {
      return '주요 수치를 표 형태로 정리했습니다.\n\n| 구분 | 내용 |\n|------|------|\n| 인수금리 | 공자기금 예탁금리 (분기별 고정) |\n| 인수기간 | 5년 거치 10년 분할 상환 |\n| 추경 규모 | 약 1,000억 원 |\n\n"답변서 초안" 탭 본문에 표가 삽입되었습니다.';
    }
    if (lower.includes('관계') || lower.includes('연관') || lower.includes('연결')) {
      return '질의와 참조자료 간의 연관 관계를 분석했습니다.\n\n🔗 연관 구조:\n• 지방교부세 지급 ↔ 일반재원 (용도 제한)\n• 지방채 인수 ↔ 자본적 지출 목적 (별도 재원)\n• 지자체 채무 증가 ↔ 통합특별시 출범에 따른 일시적 수요\n\n세 요소가 서로 배타적이지 않다는 점을 답변서에 강조했습니다.';
    }
    if (lower.includes('재검색')) {
      return '국회 질의·답변 데이터베이스를 재검색했습니다.\n\n🔍 검색 결과: 유사 질의 3건 추가 확인\n• 지방채 인수 관련 상임위 질의 2건\n• 지방교부세 배분 기준 관련 질의 1건\n\n좌측 "유사답변서 추천 목록"에 반영되었습니다.';
    }
    if (lower.includes('유사사례')) {
      return '유사사례를 추가로 검색했습니다.\n\n📚 발견된 사례:\n• 2026년 강원특별자치도 출범 시 지방채 인수 추경 사례\n• 2023년 세종시 행정수도 이전 관련 자본사업 추경 사례\n\n비교 참고자료로 "답변서 비교" 탭에서 확인할 수 있습니다.';
    }
    if (lower.includes('검색') || lower.includes('찾아') || lower.includes('추천')) {
      return '요청하신 조건으로 관련 자료를 검색했습니다.\n\n검색 결과 유사도 상위 자료가 좌측 "관련자료 추천 목록"에 갱신되었습니다. 필요한 자료를 선택하시면 초안에 반영할 수 있습니다.';
    }
    if (lower.includes('분석') || lower.includes('비교') || lower.includes('확인')) {
      return '질의 내용을 분석했습니다.\n\n📌 분석 결과:\n• 쟁점: 지방교부세 지급 중에도 추경을 편성하는 이유\n• 핵심 논거: 교부세(일반재원)와 지방채(자본적 지출 목적)는 재원 성격이 다름\n• 보강 필요: 채무비율 관리 계획 언급 시 신뢰도 향상\n\n답변서 초안에 위 논거를 반영했습니다.';
    }
    if (lower.includes('다시') || lower.includes('재생성')) {
      return '답변서 초안을 처음부터 다시 생성했습니다.\n\n이전 버전과 달리 이번 초안은 채무비율 관리 계획을 추가하고, 결론 문단을 간결하게 재구성했습니다. 버전 선택에서 이전 초안과 비교할 수 있습니다.';
    }
    if (lower.includes('법적') || lower.includes('근거') || lower.includes('법령')) {
      return '법적 근거를 보강했습니다.\n\n📖 추가된 근거:\n• 지방재정법 시행령 제11조 (지방채 발행계획 수립)\n• 공공자금관리기금법 시행령 제2조 (기금 운용 근거)\n\n답변서 하단에 근거 법령 각주가 추가되었습니다.';
    }
    if (lower.includes('수치') || lower.includes('금리') || lower.includes('금액')) {
      return '최신 수치를 반영하여 업데이트했습니다.\n\n💰 업데이트 내용:\n• 인수금리: \'26.2분기 기준 3.435%로 갱신\n• 추경 규모: 1,000억 원 → 지자체별 세부 배분 반영\n\n변경된 수치는 "답변서 초안" 탭에서 강조 표시됩니다.';
    }
    return '요청하신 내용을 반영하여 답변서 초안을 수정했습니다.\n\n수정 사항은 "답변서 초안" 탭에서 확인하실 수 있으며, 버전 선택 메뉴에서 이전 버전과 비교할 수 있습니다.';
  }

  // 채팅 요청에 따라 관련자료 추천 목록에 신규 항목 추가
  function addMoreRecommendations() {
    const count = Math.min(2, MORE_REC_POOL.length - moreRecSeq);
    const added = [];
    let maxId = recommendations.reduce((m, r) => Math.max(m, r.id), 0);
    for (let i = 0; i < count; i++) {
      const base = MORE_REC_POOL[moreRecSeq % MORE_REC_POOL.length];
      moreRecSeq++;
      const item = { ...base, id: ++maxId, preview: { ...base.preview, sections: base.preview.sections.map(s => ({ ...s, items: [...s.items] })) } };
      recommendations.push(item);
      added.push(item);
    }
    // 목록을 유사도순으로 정렬 유지
    recommendations.sort((a, b) => b.score - a.score);

    // 탭 카운트 배지 업데이트
    const tabRec = $('#tabCountRecommend');
    if (tabRec) tabRec.textContent = recommendations.length;

    return added;
  }

  function showAnswerSkeleton(message = 'AI 응답 데이터를 불러오고 있습니다...') {
    hideAnswerSkeleton();
    const panel = $('.panel-center');
    if (!panel) return;
    const overlay = document.createElement('div');
    overlay.className = 'api-skeleton-overlay answer-api-skeleton';
    overlay.innerHTML = `<div class="skeleton-loading-label">${message}</div><div class="answer-skeleton-columns"><div class="answer-skeleton-list">${Array.from({length:4},()=>'<div class="skeleton-card"><div class="skeleton-card-row"><div class="ai-skeleton skeleton-circle"></div><div class="ai-skeleton skeleton-line lg"></div></div><div class="ai-skeleton skeleton-line full"></div><div class="ai-skeleton skeleton-line md"></div></div>').join('')}</div><div class="answer-skeleton-preview"><div class="ai-skeleton skeleton-line sm"></div>${Array.from({length:3},()=>'<div class="skeleton-card"><div class="ai-skeleton skeleton-line lg"></div><div class="ai-skeleton skeleton-line full"></div><div class="ai-skeleton skeleton-line full"></div><div class="ai-skeleton skeleton-line md"></div></div>').join('')}</div></div>`;
    panel.appendChild(overlay);
  }

  function hideAnswerSkeleton() {
    $$('.answer-api-skeleton').forEach(el => el.remove());
  }

  function sendChat() {
    const input = $('#chatInput');
    const text = input.value.trim();
    if (!text) return;
    const now = new Date();
    const time = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
    chatConversations[activeChatTopic].push({ role: 'user', text, time });
    renderChatMessages();
    input.value = '';
    $('#chatSendBtn').disabled = true;

    // Show typing indicator with contextual message
    const msgEl = $('#chatMessages');
    const typing = document.createElement('div');
    typing.className = 'chat-typing';
    const lowerText = text.toLowerCase();
    const isMoreRecRequest = detectMoreRecRequest(lowerText);
    showAnswerSkeleton(isMoreRecRequest || lowerText.includes('검색') || lowerText.includes('추천') ? '관련자료를 검색하고 있습니다...' : '답변서 초안 데이터를 생성하고 있습니다...');
    let typingTitle = '생성 중';
    let typingDesc = '답변서 초안을 생성하고 있습니다...';
    if (isMoreRecRequest) {
      typingTitle = '검색 중';
      typingDesc = '관련 자료를 추가로 검색하고 있습니다...';
    } else if (lowerText.includes('검색') || lowerText.includes('찾아') || lowerText.includes('추천')) {
      typingTitle = '검색 중';
      typingDesc = '관련 자료를 검색하고 있습니다...';
    } else if (lowerText.includes('분석') || lowerText.includes('비교') || lowerText.includes('확인')) {
      typingTitle = '분석 중';
      typingDesc = 'AI가 질의를 분석하고 있습니다...';
    } else if (lowerText.includes('다시') || lowerText.includes('재') || lowerText.includes('수정')) {
      typingTitle = '재생성 중';
      typingDesc = '답변서를 다시 생성하고 있습니다...';
    }
    typing.innerHTML = '<div class="typing-avatar"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div><div class="typing-content"><div class="typing-text-wrap"><span class="typing-title">' + typingTitle + '</span><span class="typing-desc">' + typingDesc + '</span></div><div class="typing-dots"><span></span><span></span><span></span></div></div>';
    msgEl.appendChild(typing);
    msgEl.scrollTop = msgEl.scrollHeight;

    setTimeout(() => {
      hideAnswerSkeleton();
      // Remove typing indicator
      typing.remove();

      if (isMoreRecRequest) {
        const added = addMoreRecommendations();
        if (added.length === 0) {
          chatConversations[activeChatTopic].push({ role: 'ai', text: '추가로 추천할 수 있는 관련자료가 더 이상 없습니다.', time, typing: true });
        } else {
          chatConversations[activeChatTopic].push({ role: 'ai', text: `관련자료 ${added.length}건을 추가로 찾았습니다.\n\n📋 추가된 자료:\n${added.map(r => '• ' + r.title + ' (유사도 ' + r.score + '%)').join('\n')}\n\n"관련자료 추천" 탭의 목록에서 확인·선택할 수 있습니다.`, time, typing: true });
        }
        renderChatMessages();

        // 관련자료 추천 탭으로 전환하여 추가된 목록을 바로 확인
        const recTabBtn = $('.top-tab[data-tab="recommend"]');
        if (recTabBtn) {
          $$('.top-tab').forEach(t => t.classList.remove('active'));
          recTabBtn.classList.add('active');
        }
        switchTab('recommend');
        showToast(`관련자료 ${added.length}건이 추가되었습니다.`);
        if (window.AIOneNotifications) window.AIOneNotifications.notifyLongTask('관련자료 검색 완료', `관련자료 ${added.length}건이 추가되었습니다.`, 'answer');
        return;
      }

      chatConversations[activeChatTopic].push({ role: 'ai', text: generateDraftEditResponse(text), time, typing: true });
      renderChatMessages();
      // Create new draft version
      const vNum = draftVersions.length + 1;
      const vLabel = 'v1.' + draftVersions.length;
      draftVersions.push({ id: vNum, label: vLabel, time: time, note: 'AI 채팅 수정사항 반영', content: draftContent });
      activeDraftVersion = draftVersions.length - 1;
      // Update version select if on draft tab
      const vSelect = $('#versionSelect');
      if (vSelect) {
        const opt = document.createElement('option');
        opt.value = activeDraftVersion;
        opt.textContent = formatDraftVersionTab(draftVersions[activeDraftVersion]);
        opt.selected = true;
        vSelect.appendChild(opt);
      }
      showToast('답변서 초안 ' + vLabel + '이 생성되었습니다.');
      if (window.AIOneNotifications) window.AIOneNotifications.notifyLongTask('답변서 초안 생성 완료', '답변서 초안 ' + vLabel + '이 생성되었습니다.', 'answer');
    }, 1500);
  }

  // ─── Center Split Resize ───
  function initCenterSplitResize() {
    const handle = $('#centerSplitHandle');
    if (!handle || handle.dataset.bound === 'true') return;
    handle.dataset.bound = 'true';
    handle.addEventListener('mousedown', e => {
      if (window.matchMedia('(max-width: 720px)').matches) return;
      e.preventDefault();
      const left = handle.previousElementSibling;
      const right = handle.nextElementSibling;
      if (!left || !right) return;
      const startX = e.clientX;
      const startLeftWidth = left.offsetWidth;
      const startRightWidth = right.offsetWidth;

      handle.classList.add('active');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const onMouseMove = ev => {
        const diff = ev.clientX - startX;
        const boundedDiff = Math.max(-(startLeftWidth - 180), Math.min(diff, startRightWidth - 180));
        left.style.flex = 'none';
        right.style.flex = 'none';
        left.style.width = `${startLeftWidth + boundedDiff}px`;
        right.style.width = `${startRightWidth - boundedDiff}px`;
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
  }

  // ─── Panel Layout / Reorder / Resize ───
  const LAYOUT_KEY = 'panel-layout-answer-v7';
  const DEFAULT_PANEL_ORDER = ['folder', 'center', 'chat'];
  const DEFAULT_PANEL_WIDTHS = { folder: 340, chat: 440 };
  const PANEL_MIN_WIDTHS = { folder: 280, center: 360, chat: 360 };

  function isResponsiveAnswerMode() {
    return window.matchMedia('(max-width: 1024px)').matches;
  }

  function clearResponsiveAnswerPanelStyles(container = $('.three-panel-layout')) {
    if (!container) return;
    container.style.gridTemplateColumns = '';
    getPanels(container).forEach(panel => {
      panel.style.width = '';
      panel.style.maxWidth = '';
      panel.style.minWidth = '';
      panel.style.flex = '';
    });
  }

  function getPanelKey(panel, index = 0) {
    if (!panel) return `panel-${index}`;
    if (panel.dataset?.panel) return panel.dataset.panel;
    if (panel.classList.contains('panel-folder')) return 'folder';
    if (panel.classList.contains('panel-center')) return 'center';
    if (panel.classList.contains('panel-chat')) return 'chat';
    return panel.id || `panel-${index}`;
  }

  function getPanels(container = $('.three-panel-layout')) {
    return container ? Array.from(container.querySelectorAll(':scope > .panel')) : [];
  }

  function getPanelHandles(container = $('.three-panel-layout')) {
    return container ? Array.from(container.querySelectorAll(':scope > .panel-resize-handle')) : [];
  }

  function getPanelMinWidth(panel, key) {
    if (panel?.classList.contains('panel-collapsed')) return 44;
    return PANEL_MIN_WIDTHS[key] || 140;
  }

  function getAvailablePanelWidth(container) {
    if (!container) return 0;
    const style = getComputedStyle(container);
    const horizontalPadding = parseFloat(style.paddingLeft || 0) + parseFloat(style.paddingRight || 0);
    const handleWidth = getPanelHandles(container).reduce((sum, handle) => sum + handle.getBoundingClientRect().width, 0);
    return Math.max(0, container.clientWidth - horizontalPadding - handleWidth);
  }

  function fitPanelWidths(container, order, widthsByPanel) {
    const panelMap = new Map();
    getPanels(container).forEach((panel, index) => panelMap.set(getPanelKey(panel, index), panel));

    const mins = order.map(key => getPanelMinWidth(panelMap.get(key), key));
    const widths = order.map((key, index) => Math.max(mins[index], Math.round(Number(widthsByPanel?.[key]) || mins[index])));
    const available = getAvailablePanelWidth(container);
    let delta = Math.round(available - widths.reduce((sum, width) => sum + width, 0));
    const flexibleIndex = Math.max(0, order.indexOf('center'));

    if (delta > 0) {
      widths[flexibleIndex] += delta;
    } else if (delta < 0) {
      let deficit = -delta;
      const shrinkOrder = [flexibleIndex, ...widths.map((_, index) => index).filter(index => index !== flexibleIndex)];
      shrinkOrder.forEach(index => {
        if (deficit <= 0) return;
        const reducible = Math.max(0, widths[index] - mins[index]);
        const reduction = Math.min(deficit, reducible);
        widths[index] -= reduction;
        deficit -= reduction;
      });
    }

    return widths;
  }

  function getCurrentPanelLayoutState(container = $('.three-panel-layout')) {
    if (!container) return null;
    const panels = getPanels(container);
    const widthsByPanel = {};
    const order = panels.map((panel, index) => {
      const key = getPanelKey(panel, index);
      widthsByPanel[key] = Math.round(panel.getBoundingClientRect().width);
      return key;
    });
    return { order, widthsByPanel };
  }

  function applyPanelWidths(container, widths) {
    if (!container || !Array.isArray(widths) || widths.length !== 3) return;
    if (isResponsiveAnswerMode()) {
      clearResponsiveAnswerPanelStyles(container);
      return;
    }
    container.style.gridTemplateColumns = `${Math.round(widths[0])}px 2px ${Math.round(widths[1])}px 2px ${Math.round(widths[2])}px`;
  }

  function applyPanelLayoutState(container, state) {
    if (!container || !state || !Array.isArray(state.order) || state.order.length !== 3) return;

    const handles = getPanelHandles(container);
    const panelMap = new Map();
    getPanels(container).forEach((panel, index) => panelMap.set(getPanelKey(panel, index), panel));
    const orderedPanels = state.order.map(key => panelMap.get(key)).filter(Boolean);
    if (orderedPanels.length !== panelMap.size) return;

    while (container.firstChild) container.removeChild(container.firstChild);
    orderedPanels.forEach((panel, index) => {
      container.appendChild(panel);
      if (index < orderedPanels.length - 1 && handles[index]) container.appendChild(handles[index]);
    });

    if (isResponsiveAnswerMode()) {
      clearResponsiveAnswerPanelStyles(container);
      return;
    }

    const widths = fitPanelWidths(container, state.order, state.widthsByPanel || {});
    applyPanelWidths(container, widths);
  }

  function savePanelLayoutState(container = $('.three-panel-layout')) {
    if (isResponsiveAnswerMode()) return;
    const state = getCurrentPanelLayoutState(container);
    if (state) localStorage.setItem(LAYOUT_KEY, JSON.stringify(state));
  }

  function restorePanelLayoutState(container = $('.three-panel-layout')) {
    if (!container) return;
    if (isResponsiveAnswerMode()) {
      clearResponsiveAnswerPanelStyles(container);
      return;
    }
    const saved = localStorage.getItem(LAYOUT_KEY);
    if (!saved) return;
    try {
      applyPanelLayoutState(container, JSON.parse(saved));
    } catch (e) {
      localStorage.removeItem(LAYOUT_KEY);
    }
  }

  function getDefaultPanelLayoutState(container = $('.three-panel-layout')) {
    const available = getAvailablePanelWidth(container);
    const centerWidth = Math.max(PANEL_MIN_WIDTHS.center, available - DEFAULT_PANEL_WIDTHS.folder - DEFAULT_PANEL_WIDTHS.chat);
    return {
      order: [...DEFAULT_PANEL_ORDER],
      widthsByPanel: { folder: DEFAULT_PANEL_WIDTHS.folder, center: centerWidth, chat: DEFAULT_PANEL_WIDTHS.chat }
    };
  }

  function setPanelCollapsed(panel, shouldCollapse) {
    const container = $('.three-panel-layout');
    if (!panel || !container || isResponsiveAnswerMode()) return;
    const state = getCurrentPanelLayoutState(container);
    if (!state) return;
    const key = getPanelKey(panel);

    if (shouldCollapse) {
      if (!panel.classList.contains('panel-collapsed')) {
        panel.dataset.expandedPanelWidth = String(state.widthsByPanel[key] || DEFAULT_PANEL_WIDTHS[key] || 220);
        panel.classList.add('panel-collapsed');
      }
      state.widthsByPanel[key] = 44;
    } else {
      panel.classList.remove('panel-collapsed');
      state.widthsByPanel[key] = Math.max(PANEL_MIN_WIDTHS[key] || 140, Number(panel.dataset.expandedPanelWidth) || DEFAULT_PANEL_WIDTHS[key] || 220);
    }

    applyPanelLayoutState(container, state);
    savePanelLayoutState(container);
  }

  function rotatePanels() {
    const container = $('.three-panel-layout');
    const state = getCurrentPanelLayoutState(container);
    if (!state) return;
    const nextOrder = [...state.order.slice(1), state.order[0]];
    applyPanelLayoutState(container, { order: nextOrder, widthsByPanel: state.widthsByPanel });
    savePanelLayoutState(container);
    showToast('패널 위치가 변경되었습니다.');
  }

  // ─── Panel Drag & Drop ───
  function initPanelDragDrop() {
    const container = $('.three-panel-layout');
    if (!container) return;
    let draggedPanel = null;

    getPanels(container).forEach(panel => {
      const head = panel.querySelector('.panel-head') || panel.querySelector('.center-header');
      if (!head) return;
      head.style.cursor = 'grab';
      head.setAttribute('draggable', 'true');
      head.querySelectorAll('button, input, select, a, [contenteditable]').forEach(el => el.setAttribute('draggable', 'false'));

      head.addEventListener('dragstart', e => {
        if (e.target.closest('button, input, select, a')) { e.preventDefault(); return; }
        draggedPanel = panel;
        panel.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');
      });

      head.addEventListener('dragend', () => {
        panel.style.opacity = '';
        draggedPanel = null;
        getPanels(container).forEach(item => item.classList.remove('drag-over'));
      });
    });

    container.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const target = e.target.closest('.panel');
      if (target && target !== draggedPanel) {
        getPanels(container).forEach(item => item.classList.remove('drag-over'));
        target.classList.add('drag-over');
      }
    });

    container.addEventListener('dragleave', e => e.target.closest('.panel')?.classList.remove('drag-over'));

    container.addEventListener('drop', e => {
      e.preventDefault();
      const target = e.target.closest('.panel');
      if (!target || !draggedPanel || target === draggedPanel) return;
      target.classList.remove('drag-over');

      const state = getCurrentPanelLayoutState(container);
      const nextOrder = [...state.order];
      const dragIndex = nextOrder.indexOf(getPanelKey(draggedPanel));
      const targetIndex = nextOrder.indexOf(getPanelKey(target));
      [nextOrder[dragIndex], nextOrder[targetIndex]] = [nextOrder[targetIndex], nextOrder[dragIndex]];

      applyPanelLayoutState(container, { order: nextOrder, widthsByPanel: state.widthsByPanel });
      savePanelLayoutState(container);
      showToast('패널 위치가 변경되었습니다.');
    });
  }

  // ─── Panel Resize ───
  function initPanelResize() {
    const container = $('.three-panel-layout');
    if (!container) return;
    restorePanelLayoutState(container);

    container.addEventListener('mousedown', e => {
      const handle = e.target.closest('.panel-resize-handle');
      if (!handle || isResponsiveAnswerMode()) return;
      e.preventDefault();

      const handles = getPanelHandles(container);
      const handleIndex = handles.indexOf(handle);
      const startX = e.clientX;
      const panels = getPanels(container);
      const keys = panels.map((panel, index) => getPanelKey(panel, index));
      const startWidths = panels.map(panel => Math.round(panel.getBoundingClientRect().width));
      const minWidths = panels.map((panel, index) => getPanelMinWidth(panel, keys[index]));

      handle.classList.add('active');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const onMouseMove = ev => {
        const diff = ev.clientX - startX;
        const widths = [...startWidths];
        const leftIndex = handleIndex;
        const rightIndex = handleIndex + 1;
        const boundedDiff = Math.max(
          -(startWidths[leftIndex] - minWidths[leftIndex]),
          Math.min(diff, startWidths[rightIndex] - minWidths[rightIndex])
        );
        widths[leftIndex] = startWidths[leftIndex] + boundedDiff;
        widths[rightIndex] = startWidths[rightIndex] - boundedDiff;
        applyPanelWidths(container, widths);
      };

      const onMouseUp = () => {
        handle.classList.remove('active');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        savePanelLayoutState(container);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    let lastContainerWidth = container.clientWidth;
    let wasResponsive = isResponsiveAnswerMode();
    if (wasResponsive) clearResponsiveAnswerPanelStyles(container);

    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(() => {
        const responsive = isResponsiveAnswerMode();
        if (responsive) {
          clearResponsiveAnswerPanelStyles(container);
          lastContainerWidth = container.clientWidth;
          wasResponsive = true;
          return;
        }

        if (wasResponsive) {
          wasResponsive = false;
          const saved = localStorage.getItem(LAYOUT_KEY);
          if (saved) {
            try { applyPanelLayoutState(container, JSON.parse(saved)); }
            catch (e) { applyPanelLayoutState(container, getDefaultPanelLayoutState(container)); }
          } else {
            applyPanelLayoutState(container, getDefaultPanelLayoutState(container));
          }
          lastContainerWidth = container.clientWidth;
          return;
        }

        if (container.clientWidth === lastContainerWidth) return;
        lastContainerWidth = container.clientWidth;
        const state = getCurrentPanelLayoutState(container);
        if (!state) return;
        applyPanelLayoutState(container, state);
        savePanelLayoutState(container);
      });
      observer.observe(container);
    }

    const layoutResetBtn = $('#layoutResetBtn');
    if (layoutResetBtn) {
      layoutResetBtn.addEventListener('click', () => {
        localStorage.removeItem(LAYOUT_KEY);
        getPanels(container).forEach(panel => panel.classList.remove('panel-collapsed'));
        applyPanelLayoutState(container, getDefaultPanelLayoutState(container));
        showToast('레이아웃이 기본값으로 초기화되었습니다.');
      });
    }
  }

  // ─── Draft Version Bar ───
  let openDocTabs = [{ id: 0, label: formatDraftVersionTab(draftVersions[0]), versionIdx: 0 }];
  let activeDocTab = 0;

  function getNextDraftTabId() {
    return openDocTabs.reduce((maxId, tab) => Math.max(maxId, tab.id), -1) + 1;
  }

  function openDraftVersionTab(versionIdx) {
    const version = draftVersions[versionIdx];
    if (!version) return;

    const existing = openDocTabs.find(tab => tab.versionIdx === versionIdx);
    if (existing) {
      activeDocTab = existing.id;
    } else {
      const newTab = {
        id: getNextDraftTabId(),
        label: formatDraftVersionTab(version),
        versionIdx
      };
      openDocTabs.push(newTab);
      activeDocTab = newTab.id;
    }
    activeDraftVersion = versionIdx;
  }

  function initDraftVersionBar() {
    const activeVersion = draftVersions[activeDraftVersion] || draftVersions[0];
    const activeOpenTab = openDocTabs.find(tab => tab.versionIdx === activeDraftVersion);
    if (!activeOpenTab && activeVersion) openDraftVersionTab(activeDraftVersion);

    renderDocTabs();
    bindDraftTabScroller();

    const versionSelect = $('#versionSelect');
    if (versionSelect) {
      versionSelect.value = String(activeDraftVersion);
      versionSelect.addEventListener('change', () => {
        const idx = Number.parseInt(versionSelect.value, 10);
        if (!Number.isInteger(idx) || !draftVersions[idx]) return;
        openDraftVersionTab(idx);
        switchTab('draft');
      });
    }

    const downloadBtn = $('#verifyDownloadBtn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        const version = draftVersions[activeDraftVersion];
        showToast(`${formatDraftVersionTab(version)} 답변서 초안을 다운로드합니다.`);
      });
    }
  }

  function renderDocTabs() {
    const container = $('#draftDocTabs');
    if (!container) return;

    container.innerHTML = openDocTabs.map(tab => {
      const version = draftVersions[tab.versionIdx];
      const label = version ? formatDraftVersionTab(version) : tab.label;
      return `<button class="draft-doc-tab${tab.id === activeDocTab ? ' active' : ''}" data-dtab="${tab.id}" type="button" title="${label}">
        <span class="draft-doc-tab-label">${label}</span>
        <span class="draft-doc-tab-close" data-dtab-close="${tab.id}" role="button" aria-label="${label} 탭 닫기">×</span>
      </button>`;
    }).join('');

    bindDocTabEvents();
    requestAnimationFrame(() => {
      container.querySelector('.draft-doc-tab.active')?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      updateDraftTabScrollButtons();
    });
  }

  function bindDocTabEvents() {
    const container = $('#draftDocTabs');
    if (!container) return;

    $$('.draft-doc-tab', container).forEach(tab => {
      tab.addEventListener('click', event => {
        if (event.target.closest('.draft-doc-tab-close')) return;
        const tabId = Number.parseInt(tab.dataset.dtab, 10);
        const selectedTab = openDocTabs.find(item => item.id === tabId);
        if (!selectedTab) return;
        activeDocTab = selectedTab.id;
        activeDraftVersion = selectedTab.versionIdx;
        switchTab('draft');
      });
    });

    $$('.draft-doc-tab-close', container).forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        const id = Number.parseInt(button.dataset.dtabClose, 10);
        if (openDocTabs.length <= 1) {
          showToast('최소 한 개의 버전 탭은 열어 두어야 합니다.');
          return;
        }

        const closingTab = openDocTabs.find(tab => tab.id === id);
        openDocTabs = openDocTabs.filter(tab => tab.id !== id);

        if (activeDocTab === id) {
          const nextTab = openDocTabs[openDocTabs.length - 1];
          activeDocTab = nextTab.id;
          activeDraftVersion = nextTab.versionIdx;
          switchTab('draft');
          return;
        }

        if (closingTab?.versionIdx === activeDraftVersion) {
          const activeTab = openDocTabs.find(tab => tab.id === activeDocTab) || openDocTabs[0];
          activeDraftVersion = activeTab.versionIdx;
        }
        renderDocTabs();
      });
    });
  }

  function bindDraftTabScroller() {
    const container = $('#draftDocTabs');
    const prevButton = $('#draftTabsPrev');
    const nextButton = $('#draftTabsNext');
    if (!container || !prevButton || !nextButton) return;

    prevButton.addEventListener('click', () => container.scrollBy({ left: -240, behavior: 'smooth' }));
    nextButton.addEventListener('click', () => container.scrollBy({ left: 240, behavior: 'smooth' }));

    container.addEventListener('scroll', updateDraftTabScrollButtons, { passive: true });
    container.addEventListener('wheel', event => {
      if (container.scrollWidth <= container.clientWidth) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      container.scrollLeft += event.deltaY;
    }, { passive: false });

    window.addEventListener('resize', updateDraftTabScrollButtons, { passive: true });
    updateDraftTabScrollButtons();
  }

  function updateDraftTabScrollButtons() {
    const container = $('#draftDocTabs');
    const prevButton = $('#draftTabsPrev');
    const nextButton = $('#draftTabsNext');
    if (!container || !prevButton || !nextButton) return;

    const hasOverflow = container.scrollWidth > container.clientWidth + 2;
    prevButton.classList.toggle('hidden', !hasOverflow);
    nextButton.classList.toggle('hidden', !hasOverflow);
    prevButton.disabled = !hasOverflow || container.scrollLeft <= 1;
    nextButton.disabled = !hasOverflow || container.scrollLeft + container.clientWidth >= container.scrollWidth - 1;
  }

  // ─── Draft Verify ───
  const verifyRefData = [
    { file: '260402_재경위_전체 의원 질의에 대한 답변_통합본.hwp', org: '재정경제부 · 2026.04 · p.3', quote: '"공공자금관리기금은 지방재정 지원을 목적으로 지방자치단체가 발행하는 지방채를 장기 저리로 인수하여 자금을 지원함"' },
    { file: '지방채 인수를 해야 하는 법적 의무.hwpx', org: '재정정책국 · 법령분석 · p.1', quote: '"지방재정법 시행령 제11조, 공공자금관리기금법 시행령 제2조에 의거하여 지방채 인수를 집행한다"' },
    { file: '지방교부세가 지급되고 있고 지방채 인수시 추경 편성 이유.hwpx', org: '기획재정위원회 · 2026년 · p.2', quote: '"특정 자본적 지출 사업의 원활한 추진을 위해 필요한 경우 추경을 통해 인수 예산을 편성함"' },
    { file: '민주당 반대로 무산된 TK통합법 관련 견해.hwpx', org: '기획재정위원회 · 2026년 · p.1', quote: '"광주·전남 통합특별시 출범과 관련하여 통합전산망 구축 등 실제 수요가 발생함에 따라 추경을 편성함"' }
  ];

  function initDraftVerify() {
    runVerification();

    // Checkbox mode switching - re-run on change
    $$('.verify-check').forEach(chk => {
      chk.addEventListener('change', () => {
        clearVerification();
        if ($('.verify-check[data-mode="highlight"]').checked || $('.verify-check[data-mode="source"]').checked) {
          runVerification();
        }
      });
    });
  }

  function runVerification() {
    const editor = $('.draft-editor');
    if (!editor) return;
    const highlightOn = $('.verify-check[data-mode="highlight"]') && $('.verify-check[data-mode="highlight"]').checked;
    const sourceOn = $('.verify-check[data-mode="source"]') && $('.verify-check[data-mode="source"]').checked;

    const sentences = $$('li, p', editor);
    let sentenceIdx = 0;
    sentences.forEach((el) => {
      if (!el.textContent.trim() || el.textContent.trim().length < 10) return;
      el.classList.remove('verify-green', 'verify-yellow', 'verify-red');
      el.querySelectorAll('.verify-badge').forEach(b => b.remove());

      sentenceIdx++;
      const rand = Math.random();
      let cls, badgeText, badgeCls;
      if (rand < 0.6) {
        cls = 'verify-green';
        badgeText = `[${Math.ceil(Math.random() * 4)}]`;
        badgeCls = 'verify-badge-green';
      } else if (rand < 0.85) {
        cls = 'verify-yellow';
        badgeText = '[주의]';
        badgeCls = 'verify-badge-yellow';
      } else {
        cls = 'verify-red';
        badgeText = '[출처없음]';
        badgeCls = 'verify-badge-red';
      }
      if (highlightOn) el.classList.add(cls);
      el.dataset.verifyIdx = sentenceIdx;
      if (sourceOn) {
        el.insertAdjacentHTML('beforeend', ` <sup class="verify-badge ${badgeCls}" data-vbadge="${sentenceIdx}">${badgeText}</sup>`);
      }
    });

    // Bind click on verified sentences
    $$('.verify-green, .verify-yellow, .verify-red', editor).forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => openVerifyDetail(el));
    });
  }

  function clearVerification() {
    const editor = $('.draft-editor');
    if (!editor) return;
    $$('.verify-green, .verify-yellow, .verify-red', editor).forEach(el => {
      el.classList.remove('verify-green', 'verify-yellow', 'verify-red');
      el.style.cursor = '';
    });
    $$('.verify-badge', editor).forEach(b => b.remove());
    const detail = $('.verify-detail-panel');
    if (detail) detail.remove();
    const resHandle = $('.verify-split-handle');
    if (resHandle) resHandle.remove();
    const splitArea = $('.draft-split-area');
    const draftView = $('.draft-view');
    if (splitArea && draftView) {
      splitArea.parentNode.insertBefore(draftView, splitArea);
      splitArea.remove();
    }
    const wrapper = $('.draft-view-wrapper');
    if (wrapper) wrapper.classList.remove('verify-split');
  }

  function openVerifyDetail(el) {
    const wrapper = $('.draft-view-wrapper');
    if (!wrapper) return;

    // Create split container if not exists
    let splitArea = $('.draft-split-area');
    const draftView = $('.draft-view');
    if (!splitArea && draftView) {
      splitArea = document.createElement('div');
      splitArea.className = 'draft-split-area';
      draftView.parentNode.insertBefore(splitArea, draftView);
      splitArea.appendChild(draftView);
    }

    // Add split mode
    wrapper.classList.add('verify-split');

    // Get or create detail panel
    let detail = $('.verify-detail-panel');
    if (!detail) {
      // Add resize handle
      let resizeHandle = $('.verify-split-handle');
      if (!resizeHandle) {
        resizeHandle = document.createElement('div');
        resizeHandle.className = 'verify-split-handle';
        splitArea.appendChild(resizeHandle);
        // Bind resize
        resizeHandle.addEventListener('mousedown', (e) => {
          e.preventDefault();
          const draftView = $('.draft-view', splitArea);
          const detailPanel = $('.verify-detail-panel', splitArea);
          if (!draftView || !detailPanel) return;
          const startX = e.clientX;
          const startDraftW = draftView.offsetWidth;
          const startDetailW = detailPanel.offsetWidth;
          resizeHandle.classList.add('active');
          document.body.style.cursor = 'col-resize';
          document.body.style.userSelect = 'none';
          const onMouseMove = (ev) => {
            const diff = ev.clientX - startX;
            const newDraftW = Math.max(200, startDraftW + diff);
            const newDetailW = Math.max(200, startDetailW - diff);
            draftView.style.flex = 'none';
            draftView.style.width = newDraftW + 'px';
            detailPanel.style.flex = 'none';
            detailPanel.style.width = newDetailW + 'px';
          };
          const onMouseUp = () => {
            resizeHandle.classList.remove('active');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
          };
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        });
      }
      detail = document.createElement('div');
      detail.className = 'verify-detail-panel';
      splitArea.appendChild(detail);
    }

    const sentText = el.textContent.replace(/\[\d+\]|\[주의\]|\[출처없음\]/g, '').trim();
    const idx = el.dataset.verifyIdx || '01';
    const isGreen = el.classList.contains('verify-green');
    const isYellow = el.classList.contains('verify-yellow');

    // Pick random refs
    const ref1 = verifyRefData[Math.floor(Math.random() * verifyRefData.length)];
    const ref2 = verifyRefData[Math.floor(Math.random() * verifyRefData.length)];

    let statusBadge = '<span class="vd-status-badge green">근거 확인</span>';
    if (isYellow) statusBadge = '<span class="vd-status-badge yellow">주의</span>';
    if (!isGreen && !isYellow) statusBadge = '<span class="vd-status-badge red">출처 누락</span>';

    detail.innerHTML = `
      <div class="vd-header">
        <div class="vd-header-left">
          <div class="vd-title-row">
            <span class="vd-title">근거 상세 확인</span>
            ${statusBadge}
          </div>
          <span class="vd-desc">선택 문장의 출처, 원문, 검토 의견</span>
        </div>
        <button class="vd-close" id="verifyDetailClose" type="button" aria-label="근거 상세 확인 닫기">×</button>
      </div>
      <div class="vd-tabs">
        <button class="vd-tab active" data-vd-tab="ref">근거자료</button>
        <button class="vd-tab" data-vd-tab="risk">위험표현</button>
      </div>
      <div class="vd-body" id="vdBody">
        <div class="vd-tab-content" data-vd-content="ref">
          <div class="vd-section">
            <div class="vd-section-head"><span class="vd-section-title">선택 문장</span><span class="vd-sentence-num">문장 ${String(idx).padStart(2, '0')}</span></div>
            <div class="vd-sentence-box">${sentText}</div>
          </div>
          <div class="vd-section">
            <div class="vd-section-head"><span class="vd-section-title">참조자료 매핑</span></div>
            <div class="vd-ref-card">
              <div class="vd-ref-head"><span class="vd-ref-file">${ref1.file}</span><button class="vd-ref-btn">원문</button></div>
              <div class="vd-ref-meta">${ref1.org}</div>
              <div class="vd-ref-quote">${ref1.quote}</div>
            </div>
            <div class="vd-ref-card">
              <div class="vd-ref-head"><span class="vd-ref-file">${ref2.file}</span><button class="vd-ref-btn">원문</button></div>
              <div class="vd-ref-meta">${ref2.org}</div>
              <div class="vd-ref-quote">${ref2.quote}</div>
            </div>
          </div>
        </div>
        <div class="vd-tab-content hidden" data-vd-content="risk">
          <div class="vd-section">
            <div class="vd-section-head"><span class="vd-section-title">선택 문장</span><span class="vd-sentence-num">문장 ${String(idx).padStart(2, '0')}</span></div>
            <div class="vd-sentence-box">${sentText}</div>
          </div>
          <div class="vd-section">
            <div class="vd-section-head"><span class="vd-section-title">위험 표현 분석</span></div>
            <div class="vd-risk-item">
              <div class="vd-risk-head"><span class="vd-risk-badge yellow">주의</span><span class="vd-risk-label">단정적 표현</span></div>
              <p class="vd-risk-desc">답변서에서 "~하기 때문입니다", "~할 수 있습니다" 등 단정적 서술은 국회 답변 시 부담이 될 수 있습니다. "~하고 있습니다", "~할 계획입니다" 등으로 완화를 권장합니다.</p>
            </div>
            <div class="vd-risk-item">
              <div class="vd-risk-head"><span class="vd-risk-badge red">위험</span><span class="vd-risk-label">미확인 수치</span></div>
              <p class="vd-risk-desc">문장에 포함된 수치(금리, 금액 등)가 최신 고시 기준과 일치하는지 확인이 필요합니다. 분기별 변동 금리의 경우 답변 시점 기준으로 재확인하세요.</p>
            </div>
            <div class="vd-risk-item">
              <div class="vd-risk-head"><span class="vd-risk-badge green">안전</span><span class="vd-risk-label">일반 서술</span></div>
              <p class="vd-risk-desc">해당 문장은 법령 근거에 기반한 사실 서술로, 특별한 위험 표현이 감지되지 않았습니다.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Close button
    $('#verifyDetailClose').addEventListener('click', () => {
      detail.remove();
      const resHandle = $('.verify-split-handle');
      if (resHandle) resHandle.remove();
      wrapper.classList.remove('verify-split');
      // Restore draft-view out of split area
      const splitArea = $('.draft-split-area');
      const draftView = $('.draft-view');
      if (splitArea && draftView) {
        splitArea.parentNode.insertBefore(draftView, splitArea);
        splitArea.remove();
      }
    });

    // Tab switching
    $$('.vd-tab', detail).forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.vd-tab', detail).forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.vdTab;
        $$('.vd-tab-content', detail).forEach(c => c.classList.add('hidden'));
        const content = $(`.vd-tab-content[data-vd-content="${target}"]`, detail);
        if (content) content.classList.remove('hidden');
      });
    });
  }

  // ─── Draft Status Bar ───
  function initDraftStatusBar() {
    const editor = $('.draft-editor');
    if (!editor) return;

    // Character count
    const text = editor.innerText || editor.textContent || '';
    const charCount = text.replace(/\s/g, '').length;
    const charEl = $('#draftCharCount');
    if (charEl) charEl.textContent = charCount.toLocaleString();

    // Page estimate (roughly 2000 chars per page)
    const pages = Math.max(1, Math.ceil(charCount / 2000));
    const pageNum = $('#draftPageNum');
    const pageTotal = $('#draftPageTotal');
    if (pageNum) pageNum.textContent = '1';
    if (pageTotal) pageTotal.textContent = pages;

    // Zoom
    let zoom = 100;
    const zoomVal = $('#draftZoomVal');
    const zoomIn = $('#draftZoomIn');
    const zoomOut = $('#draftZoomOut');
    const fitBtn = $('#draftFitBtn');

    function applyZoom() {
      editor.style.transform = 'scale(' + (zoom / 100) + ')';
      editor.style.transformOrigin = 'top left';
      editor.style.width = (10000 / zoom) + '%';
      if (zoomVal) zoomVal.textContent = zoom + '%';
    }

    if (zoomIn) zoomIn.addEventListener('click', () => { zoom = Math.min(200, zoom + 10); applyZoom(); });
    if (zoomOut) zoomOut.addEventListener('click', () => { zoom = Math.max(50, zoom - 10); applyZoom(); });
    if (fitBtn) fitBtn.addEventListener('click', () => {
      const wrapper = $('.draft-view-wrapper');
      if (!wrapper) return;
      wrapper.classList.toggle('draft-fullscreen');
      if (wrapper.classList.contains('draft-fullscreen')) {
        showToast('전체화면 모드 (ESC로 종료)');
      } else {
        showToast('일반 모드');
      }
    });

    // ESC key to exit draft fullscreen
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const wrapper = $('.draft-view-wrapper.draft-fullscreen');
        if (wrapper) { wrapper.classList.remove('draft-fullscreen'); showToast('일반 모드'); }
      }
    });
  }

  // ─── Rename Modal ───
  function openRenameModal(idx) {
    let modal = $('#renameModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'renameModal';
      modal.className = 'rename-modal-backdrop hidden';
      modal.innerHTML = `<div class="rename-modal">
        <div class="rename-modal-head"><span>채팅 이름 변경</span><button class="rename-modal-close" id="renameModalClose">×</button></div>
        <div class="rename-modal-body">
          <label class="rename-label">대화 이름</label>
          <input type="text" class="rename-input" id="renameInput" placeholder="새 이름을 입력하세요" />
        </div>
        <div class="rename-modal-foot">
          <button class="btn-outline" id="renameCancelBtn">취소</button>
          <button class="btn-primary" id="renameConfirmBtn">변경</button>
        </div>
      </div>`;
      document.body.appendChild(modal);
    }

    const input = $('#renameInput');
    input.value = chatTopics[idx].title;
    modal.classList.remove('hidden');
    setTimeout(() => { input.focus(); input.select(); }, 100);

    const close = () => modal.classList.add('hidden');
    $('#renameModalClose').onclick = close;
    $('#renameCancelBtn').onclick = close;
    modal.onclick = (e) => { if (e.target === modal) close(); };
    $('#renameConfirmBtn').onclick = () => {
      const val = input.value.trim();
      if (val) {
        chatTopics[idx].title = val;
        renderChatTopics();
        showToast('이름이 변경되었습니다.');
      }
      close();
    };
    input.onkeydown = (e) => { if (e.key === 'Enter') $('#renameConfirmBtn').click(); };
  }

  // ─── Custom Modal (confirm/alert) ───
  function customConfirm(title, msg, onConfirm, type = 'confirm') {
    let modal = $('#customModalBackdrop');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'customModalBackdrop';
      modal.className = 'custom-modal-backdrop';
      document.body.appendChild(modal);
    }
    const iconCls = type === 'danger' ? 'danger' : 'confirm';
    const btnCls = type === 'danger' ? 'btn-confirm danger' : 'btn-confirm';
    modal.innerHTML = `<div class="custom-modal">
      <div class="custom-modal-icon ${iconCls}">${type === 'danger' ? '⚠' : '?'}</div>
      <div class="custom-modal-title">${title}</div>
      <div class="custom-modal-msg">${msg}</div>
      <div class="custom-modal-actions">
        <button class="btn-cancel" id="cmCancel">취소</button>
        <button class="${btnCls}" id="cmConfirm">확인</button>
      </div>
    </div>`;
    modal.classList.remove('hidden');
    $('#cmCancel').addEventListener('click', () => modal.classList.add('hidden'));
    $('#cmConfirm').addEventListener('click', () => { modal.classList.add('hidden'); if (onConfirm) onConfirm(); });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
  }

  // 사이드바가 접혔을 때 메뉴 아이콘에 마우스 오버 시 메뉴명 툴팁 표시
  function initNavTooltips(sidebarEl) {
    let tooltip = document.getElementById('navTooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'navTooltip';
      tooltip.className = 'nav-tooltip';
      document.body.appendChild(tooltip);
    }
    $$('.nav-link[data-tooltip]', sidebarEl).forEach(link => {
      link.addEventListener('mouseenter', () => {
        if (!sidebarEl.classList.contains('collapsed')) return;
        const rect = link.getBoundingClientRect();
        tooltip.textContent = link.dataset.tooltip;
        tooltip.style.left = (rect.right + 10) + 'px';
        tooltip.style.top = (rect.top + rect.height / 2) + 'px';
        tooltip.style.transform = 'translateY(-50%)';
        tooltip.classList.add('visible');
      });
      link.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
    });
  }

  function customAlert(title, msg) {
    let modal = $('#customModalBackdrop');
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
    $('#cmOk').addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
  }

  // ─── Report Drawer ───
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

  function showToast(msg) {
    const t = $('#toast');
    if (!t) return;
    if (window.AIOneToast) {
      window.AIOneToast.show(msg, { target: t, duration: 2000 });
      return;
    }
    const message = t.querySelector('[data-toast-message]') || t;
    message.textContent = msg;
    t.hidden = false;
  }


  // ─── 전체 글자 크기 조절 ───
  const FONT_SIZE_STORAGE_KEY = 'ai-one-font-scale';
  const FONT_SIZE_MIN = 100;
  const FONT_SIZE_MAX = 150;
  const FONT_SIZE_STEP = 10;

  function initFontSizeControl() {
    const tool = $('#fontSizeTool');
    const button = $('#fontSizeBtn');
    const popover = $('#fontSizePopover');
    const decrease = $('#fontSizeDecrease');
    const increase = $('#fontSizeIncrease');
    const defaultBtn = $('#fontSizeDefault');
    const value = $('#fontSizeValue');
    const directInput = $('#fontSizeDirectInput');
    const applyBtn = $('#fontSizeApply');
    if (!tool || !button || !popover || !decrease || !increase || !defaultBtn || !value || !directInput || !applyBtn) return;

    const clampPercent = (percent) => {
      const numeric = Number(percent);
      if (!Number.isFinite(numeric)) return 100;
      return Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, Math.round(numeric)));
    };

    let currentPercent = 100;
    try {
      const savedScale = Number(localStorage.getItem(FONT_SIZE_STORAGE_KEY));
      if (Number.isFinite(savedScale)) currentPercent = clampPercent(savedScale * 100);
    } catch (e) {
      currentPercent = 100;
    }

    const applyPercent = (percent, persist = true) => {
      const nextPercent = clampPercent(percent);
      const nextScale = nextPercent / 100;
      currentPercent = nextPercent;
      document.documentElement.style.setProperty('--ui-font-scale', String(nextScale));
      value.textContent = `${nextPercent}%`;
      directInput.value = String(nextPercent);
      decrease.disabled = nextPercent <= FONT_SIZE_MIN;
      increase.disabled = nextPercent >= FONT_SIZE_MAX;
      defaultBtn.disabled = nextPercent === 100;
      button.dataset.scale = String(nextScale);
      button.setAttribute('aria-label', `전체 글자 크기 조절, 현재 ${nextPercent}%`);
      button.title = `전체 글자 크기 ${nextPercent}%`;
      if (persist) {
        try { localStorage.setItem(FONT_SIZE_STORAGE_KEY, String(nextScale)); } catch (e) { /* 현재 화면에만 적용 */ }
      }
    };

    const applyDirectInput = () => {
      applyPercent(Number(directInput.value));
    };

    const setPopover = (open) => {
      popover.classList.toggle('hidden', !open);
      button.classList.toggle('active', open);
      button.setAttribute('aria-expanded', String(open));
    };

    button.addEventListener('click', (event) => {
      event.stopPropagation();
      setPopover(popover.classList.contains('hidden'));
    });
    popover.addEventListener('click', event => event.stopPropagation());
    decrease.addEventListener('click', () => applyPercent(currentPercent - FONT_SIZE_STEP));
    increase.addEventListener('click', () => applyPercent(currentPercent + FONT_SIZE_STEP));
    applyBtn.addEventListener('click', applyDirectInput);
    directInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') applyDirectInput();
    });
    directInput.addEventListener('blur', () => {
      directInput.value = String(clampPercent(directInput.value));
    });
    defaultBtn.addEventListener('click', () => applyPercent(100));
    document.addEventListener('click', event => {
      if (!tool.contains(event.target)) setPopover(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') setPopover(false);
    });

    applyPercent(currentPercent, true);
  }

  // Logout
  const logoutBtn = $('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      customConfirm('로그아웃', '로그아웃 하시겠습니까?', () => {
        localStorage.removeItem('sidebar-collapsed');
        window.location.href = 'login.html';
      });
    });
  }

  // ─── Preparing Menu (준비중 메뉴 안내) ───
  $$('.nav-link[data-soon]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      customAlert('준비중', '이 화면은 프로토타입에 아직 포함되어 있지 않습니다.');
    });
  });

  init();
})();
