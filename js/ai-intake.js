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
      text: '2026년도 예산편성지침 중 인건비 산정기준 변경사항에 대한 구체적 안내 요청',
      type: 'single',
      typeLabel: '단일소관',
      mainDept: '경제정책국',
      coopDept: '',
      org: '재정경제부',
      confidence: 94
    },
    {
      id: 2,
      text: '지방자치단체 재정자립도 산정 시 세외수입 항목 포함 여부 및 관련 법령 해석',
      type: 'multi',
      typeLabel: '복수소관',
      mainDept: '경제정책국',
      coopDept: '세제실',
      org: '행정안전부',
      confidence: 82,
      conflict: { ruleDept: '세제실', aiDept: '경제정책국', ruleLabel: '세제 키워드 룰' }
    },
    {
      id: 3,
      text: '공공기관 경영평가 시 비계량지표 평가방법론 개선 관련 의견 조회',
      type: 'single',
      typeLabel: '단일소관',
      mainDept: '공공정책국',
      coopDept: '',
      org: '재정경제부',
      confidence: 91
    },
    {
      id: 4,
      text: '외국환거래법 개정에 따른 해외직접투자 신고절차 변경 안내 요청',
      type: 'multi',
      typeLabel: '복수소관',
      mainDept: '국제금융국',
      coopDept: '대외경제국',
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

1. 2026년도 예산편성지침 중 인건비 산정기준 변경사항에 대한 구체적 안내를 요청합니다. 특히 공무원 보수 인상률 적용 시점과 관련하여 세부 기준이 필요합니다.

2. 지방자치단체 재정자립도 산정 시 세외수입 항목의 포함 여부와 관련 법령 해석에 대해 질의합니다. 현행 지방재정법 제36조의2와 시행령 간 해석 차이가 있어 명확한 입장을 확인하고자 합니다.

3. 공공기관 경영평가 시 비계량지표 평가방법론 개선에 관하여 귀 부처의 의견을 조회합니다. 최근 3년간 평가결과 분석자료도 함께 회신 부탁드립니다.

4. 외국환거래법 개정(2026.3.1. 시행)에 따른 해외직접투자 신고절차 변경사항에 대해 안내를 요청합니다. 개정 전후 비교표 및 신고서 양식 변경 내용을 포함해 주시기 바랍니다.

5. 최근 기상이변으로 인한 농작물 피해 현황에 대한 자료를 요청합니다. 본 건은 농림축산식품부 소관으로 판단되나, 관련 예산 편성 협조 차원에서 확인합니다.

끝.`;

  // 문서별 원본 문서 메타(부서/문서유형/문서번호/수신처/제목/서두·말미 문구) — 원본 보기를 다중 페이지 실문서 형태로 구성
  const DEFAULT_DOC_META = {
    dept: '국회예산정책처', docType: '질 의 서', docNo: '예정처-2026-0315', date: '2026.03.15',
    recipient: '재정경제부 장관', title: '2026년도 주요 재정정책 관련 질의',
    intro: ['1. 귀 부의 무궁한 발전을 기원합니다.', '2. 국회예산정책처에서는 2026년도 예산 및 기금운용계획안 분석을 위해 아래 사항에 대한 자료 제출 및 답변을 요청합니다.'],
    closing: '상기 사항에 대해 2026년 3월 29일까지 회신하여 주시기 바랍니다.', signer: '국회예산정책처장',
    committee: '재정경제기획위원회', memberName: '나 성 은 (인)', partyName: '국민의힘', formTitle: '질 의 요 지 서'
  };

  const docMetaMap = {
    '예산결산위_질의서_2026-0315.pdf': DEFAULT_DOC_META,
    '기재위_요지서_세제현안.hwp': {
      dept: '국회 기획재정위원회', docType: '질의 요지서', docNo: '기재위-2026-0142', date: '2026.03.18',
      recipient: '재정경제부 장관', title: '2026년 세제 현안 관련 질의',
      intro: ['1. 위원회 활동에 대한 협조에 감사드립니다.', '2. 기획재정위원회에서는 2026년 세제 현안 검토를 위해 아래 사항에 대한 자료 제출 및 의견 회신을 요청합니다.'],
      closing: '상기 사항에 대해 2026년 4월 1일까지 회신하여 주시기 바랍니다.', signer: '국회 기획재정위원회 위원장',
      committee: '기획재정위원회', memberName: '기재위 위원', partyName: '국회', formTitle: '질 의 요 지 서'
    },
    '김민수의원_추가질의_재정건전성.pdf': {
      dept: '김민수 의원실', docType: '추가 질의서', docNo: '의원실-2026-0087', date: '2026.03.20',
      recipient: '재정경제부 장관', title: '재정건전성 관련 추가 질의',
      intro: ['1. 지난 상임위 질의에 대한 답변에 감사드립니다.', '2. 아래 사항에 대해 추가 답변이 필요하여 다시 질의드립니다.'],
      closing: '상기 사항에 대해 2026년 3월 27일까지 회신하여 주시기 바랍니다.', signer: '국회의원 김민수',
      committee: '기획재정위원회', memberName: '김민수 (인)', partyName: '국회', formTitle: '질 의 요 지 서'
    },
    '박영희의원_요구자료_세수결손.docx': {
      dept: '박영희 의원실', docType: '자료 요구서', docNo: '의원실-2026-0103', date: '2026.03.22',
      recipient: '재정경제부 장관', title: '세수결손 현황 관련 자료 요구',
      intro: ['1. 국정 운영에 대한 노고에 감사드립니다.', '2. 2026년 세수결손 현황 파악을 위해 아래 자료의 제출을 요구합니다.'],
      closing: '상기 자료는 2026년 3월 29일까지 제출하여 주시기 바랍니다.', signer: '국회의원 박영희',
      committee: '기획재정위원회', memberName: '박영희 (인)', partyName: '국회', formTitle: '질 의 요 지 서'
    },
    '국정감사_의원질의_경제정책.txt': {
      dept: '국회 기획재정위원회 국정감사', docType: '국정감사 질의서', docNo: '국감-2026-0056', date: '2026.10.10',
      recipient: '재정경제부 장관', title: '경제정책 분야 국정감사 질의',
      intro: ['1. 2026년도 국정감사에 임하여 아래와 같이 질의합니다.', '2. 성실한 답변을 요청드립니다.'],
      closing: '상기 사항에 대해 국정감사 종료 전까지 서면답변을 제출하여 주시기 바랍니다.', signer: '국회 기획재정위원회',
      committee: '기획재정위원회', memberName: '국정감사 위원', partyName: '국회', formTitle: '질 의 요 지 서'
    }
  };

  // 원본 보기 문서를 질의요지서 형태로 렌더링
  function buildOriginalPages(meta, queries) {
    const displayTitle = meta.formTitle || '질 의 요 지 서';
    const displayCommittee = meta.committee || meta.dept || '재정경제기획위원회';
    const displayMemberName = meta.memberName || '나 성 은 (인)';
    const displayPartyName = meta.partyName || '국민의힘';
    const displayDate = (meta.date || '').replace(/\./g, '. ').replace(/\s+/g, ' ').trim() || '2026. 3. 11.';

    return `
      <div class="orig-page orig-page-form">
        <div class="orig-form-title-wrap">
          <h3 class="orig-form-title">${displayTitle}</h3>
        </div>

        <div class="orig-form-meta-row">
          <span class="orig-form-date">${displayDate}</span>
          <span class="orig-form-committee">${displayCommittee}</span>
        </div>

        <div class="orig-form-info-table">
          <div class="orig-form-info-row">
            <div class="orig-form-info-label">질의의원명</div>
            <div class="orig-form-info-value">${displayMemberName}</div>
            <div class="orig-form-info-label">교섭단체명</div>
            <div class="orig-form-info-value">${displayPartyName}</div>
          </div>
        </div>
        <div class="orig-query-boxes orig-query-boxes-form">
          ${queries.map((q, idx) => {
            const subQuestions = Array.isArray(q.subQuestions) ? q.subQuestions : [];
            return `
              <div class="orig-question-group">
                <div class="orig-query-box orig-form-query-box${idx === activeQueryIndex ? ' active' : ''}" data-qidx="${idx}">
                  <span class="orig-query-num orig-form-query-num">${idx + 1}</span>
                  <span class="orig-query-box-text orig-form-query-text">${q.text}</span>
                </div>
                ${subQuestions.length ? `
                  <div class="orig-sub-question-list">
                    ${subQuestions.map(sub => `<div class="orig-sub-question-item"><span class="orig-sub-question-bullet">-</span><span class="orig-sub-question-card">${sub}</span></div>`).join('')}
                  </div>` : ''}
              </div>`;
          }).join('')}
        </div>
      </div>`;
  }


  // ─── File-specific data ───
  const fileDataMap = {
    '예산결산위_질의서_2026-0315.pdf': {
      docText: `국회 예산결산특별위원회 질의서

1. 2026년도 예산편성지침 중 인건비 산정기준 변경사항에 대한 구체적 안내를 요청합니다. 특히 공무원 보수 인상률 적용 시점과 관련하여 세부 기준이 필요합니다.

2. 지방자치단체 재정자립도 산정 시 세외수입 항목의 포함 여부와 관련 법령 해석에 대해 질의합니다. 현행 지방재정법 제36조의2와 시행령 간 해석 차이가 있어 명확한 입장을 확인하고자 합니다.

3. 공공기관 경영평가 시 비계량지표 평가방법론 개선에 관하여 귀 부처의 의견을 조회합니다.

4. 외국환거래법 개정(2026.3.1. 시행)에 따른 해외직접투자 신고절차 변경사항에 대해 안내를 요청합니다.

5. 최근 기상이변으로 인한 농작물 피해 현황에 대한 자료를 요청합니다.

끝.`,
      queries: [
        { id: 1, text: '2026년도 예산편성지침 중 인건비 산정기준 변경사항에 대한 구체적 안내 요청', summary: '2026년도 예산편성지침에서 인건비 산정기준 변경 내용과 적용 방법에 대한 구체적 안내 요청', type: 'single', typeLabel: '단일소관', mainDept: '경제정책국', coopDept: '', org: '재정경제부', confidence: 94, keywords: ['예산편성지침', '인건비'] },
        { id: 2, text: '지방자치단체 재정자립도 산정 시 세외수입 항목 포함 여부 및 관련 법령 해석', summary: '지방재정법상 재정자립도 산정 기준에 세외수입을 포함해야 하는지에 대한 법령 해석 질의', type: 'multi', typeLabel: '복수소관', mainDept: '경제정책국', coopDept: '세제실', org: '행정안전부', confidence: 82, keywords: ['재정자립도', '세외수입', '법령'], conflict: { ruleDept: '세제실', aiDept: '경제정책국', ruleLabel: '세제 키워드 룰' } },
        { id: 3, text: '공공기관 경영평가 시 비계량지표 평가방법론 개선 관련 의견 조회', summary: '공공기관 경영평가의 비계량지표 평가방법을 개선하기 위한 방안에 대한 의견 조회', type: 'single', typeLabel: '단일소관', mainDept: '공공정책국', coopDept: '', org: '재정경제부', confidence: 91, keywords: ['공공기관', '경영평가', '비계량지표'] },
        { id: 4, text: '외국환거래법 개정에 따른 해외직접투자 신고절차 변경 안내 요청', summary: '외국환거래법 개정(2026.3.1. 시행)에 따라 변경된 해외직접투자 신고절차에 대한 안내 요청', type: 'multi', typeLabel: '복수소관', mainDept: '국제금융국', coopDept: '대외경제국', org: '한국은행', confidence: 78, keywords: ['외국환거래법', '해외직접투자'], conflict: { ruleDept: '국제금융국', aiDept: '경제정책국', ruleLabel: '외환거래 룰' } },
        { id: 5, text: '최근 기상이변으로 인한 농작물 피해 현황 자료 요청의 건', summary: '최근 기상이변으로 발생한 농작물 피해 현황 자료를 요청하는 질의로 농림축산식품부 소관 사항', type: 'none', typeLabel: '비소관', mainDept: '해당없음', coopDept: '', org: '농림축산식품부', confidence: 96, keywords: ['기상이변', '농작물'] }
      ]
    },
    '기재위_요지서_세제현안.hwp': {
      docText: `기획재정위원회 질의 요지서 — 세제 현안

1. 2026년 종합부동산세 세율 조정에 따른 세수 영향 추정치를 요청합니다. 특히 1세대 1주택자 특례 적용 시나리오별 세수 변동 규모를 구체적으로 제시해 주시기 바랍니다.

2. 간이과세자 기준금액 상향 조정 시 부가가치세 세수 감소 규모 분석 자료를 회신 부탁드립니다. 아울러 과세유형 전환에 따른 행정비용 변화도 함께 검토해 주십시오.

3. 법인세 최저한세율 적용 대상 확대 방안에 대한 검토 의견을 조회합니다. 중소기업에 대한 예외 적용 필요성도 포함하여 답변해 주시기 바랍니다.

끝.`,
      queries: [
        { id: 6, text: '2026년 종합부동산세 세율 조정에 따른 세수 영향 추정치 및 1세대 1주택자 특례 적용 시나리오별 세수 변동 규모 요청', summary: '종합부동산세 세율 조정 시나리오별 세수 영향과 1세대 1주택자 특례 적용에 따른 세수 변동 규모 추정치를 요청하는 질의', type: 'single', typeLabel: '단일소관', mainDept: '세제실', coopDept: '', org: '재정경제부', confidence: 92, keywords: ['종합부동산세', '세율 조정'] },
        { id: 7, text: '간이과세자 기준금액 상향 조정에 따른 부가가치세 세수 감소 규모 및 행정비용 변화 분석 요청', summary: '간이과세자 기준금액 상향 조정이 부가가치세 세수와 과세유형 전환 행정비용에 미치는 영향을 분석해 달라는 질의', type: 'single', typeLabel: '단일소관', mainDept: '세제실', coopDept: '', org: '국세청', confidence: 88, keywords: ['간이과세자', '부가가치세'] },
        { id: 8, text: '법인세 최저한세율 적용 대상 확대 방안 및 중소기업 예외 적용 필요성 검토 의견 조회', summary: '법인세 최저한세율 적용 대상을 확대할 경우 중소기업에 대한 예외 적용이 필요한지에 대한 검토 의견 조회', type: 'multi', typeLabel: '복수소관', mainDept: '세제실', coopDept: '경제구조개혁국', org: '재정경제부', confidence: 85, keywords: ['법인세', '최저한세율'] }
      ]
    },
    '김민수의원_추가질의_재정건전성.pdf': {
      docText: `김민수 의원 추가질의 — 재정건전성 관련

1. 국가채무 관리 계획의 실효성에 대해 구체적 답변을 요구합니다. 2026년 말 기준 GDP 대비 국가채무비율 전망치와 함께 중장기 관리목표 달성 가능성을 제시해 주시기 바랍니다.

2. 2026년 세수 결손 규모와 이에 대한 정부의 대응 계획을 상세히 답변해 주십시오. 특히 추가경정예산 편성 없이 세입경정으로 대응 가능한지 여부를 명확히 밝혀 주시기 바랍니다.

3. 관리재정수지 적자 확대에 대한 구조적 원인 분석과 향후 개선 방안을 질의합니다. 경기순환적 요인과 구조적 요인을 구분하여 설명해 주시기 바랍니다.`,
      queries: [
        { id: 9, text: 'GDP 대비 국가채무비율 전망치 및 중장기 관리목표 달성 가능성을 포함한 국가채무 관리 계획 실효성 질의', summary: '2026년 말 기준 국가채무비율 전망과 중장기 관리계획의 실효성 및 목표 달성 가능성에 대한 질의', type: 'multi', typeLabel: '복수소관', mainDept: '국고실', coopDept: '경제정책국', org: '재정경제부', confidence: 90, keywords: ['국가채무', 'GDP'] },
        { id: 10, text: '추가경정예산 편성 없이 세입경정으로 대응 가능한지를 포함한 2026년 세수 결손 규모 및 대응 계획 답변 요구', summary: '2026년 세수 결손 규모와 세입경정을 통한 대응 가능성 등 정부의 구체적 대응 계획을 요구하는 질의', type: 'multi', typeLabel: '복수소관', mainDept: '세제실', coopDept: '경제정책국', org: '재정경제부', confidence: 87, keywords: ['세수 결손', '세입경정'] },
        { id: 11, text: '경기순환적 요인과 구조적 요인을 구분한 관리재정수지 적자 확대 원인 분석 및 개선 방안 질의', summary: '관리재정수지 적자 확대의 원인을 경기순환적 요인과 구조적 요인으로 구분하여 분석하고 개선 방안을 요구하는 질의', type: 'multi', typeLabel: '복수소관', mainDept: '국고실', coopDept: '경제정책국', org: '재정경제부', confidence: 93, keywords: ['관리재정수지', '적자'] }
      ]
    },
    '박영희의원_요구자료_세수결손.docx': {
      docText: `박영희 의원 요구자료 — 세수결손 현황

요구사항:
1. 2026년 월별 세수 실적 및 진도율 현황표 제출을 요청합니다. 전년 동월 대비 증감률도 함께 표기하여 제출해 주시기 바랍니다.

2. 주요 세목별(소득세, 법인세, 부가가치세) 결손 원인 분석 자료를 요청합니다. 세목별 결손 기여도를 정량적으로 제시해 주시기 바랍니다.

3. 세수 결손 보전을 위한 추가경정예산 편성 검토 여부에 대한 입장을 요구합니다. 편성 시 예상 규모와 재원 조달 방안도 함께 밝혀 주십시오.

4. 최근 3년간 세수 추계 오차율 및 개선 방안을 요구합니다. 오차 발생의 구조적 원인과 향후 추계 모델 개선 계획을 포함해 주시기 바랍니다.`,
      queries: [
        { id: 12, text: '전년 동월 대비 증감률을 포함한 2026년 월별 세수 실적 및 진도율 현황표 제출 요구', summary: '2026년 월별 세수 실적과 진도율을 전년 동월 대비 증감률과 함께 제출해 달라는 요구', type: 'single', typeLabel: '단일소관', mainDept: '세제실', coopDept: '', org: '국세청', confidence: 95, keywords: ['세수 실적', '진도율'] },
        { id: 13, text: '세목별 결손 기여도를 정량적으로 제시한 주요 세목별 결손 원인 분석 자료 요구', summary: '소득세·법인세·부가가치세 등 주요 세목별 결손 원인과 기여도를 정량적으로 분석해 달라는 요구', type: 'single', typeLabel: '단일소관', mainDept: '세제실', coopDept: '', org: '재정경제부', confidence: 91, keywords: ['세목별', '결손 원인'] },
        { id: 14, text: '편성 시 예상 규모와 재원 조달 방안을 포함한 추가경정예산 편성 검토 여부 입장 질의', summary: '세수 결손 보전을 위한 추가경정예산 편성 여부와 편성 시 예상 규모·재원 조달 방안에 대한 입장 질의', type: 'multi', typeLabel: '복수소관', mainDept: '경제정책국', coopDept: '국고실, 세제실', org: '재정경제부', confidence: 86, keywords: ['추가경정예산', '재원 조달'] },
        { id: 15, text: '오차 발생의 구조적 원인과 개선 계획을 포함한 최근 3년간 세수 추계 오차율 및 개선 방안 요구', summary: '최근 3년간 세수 추계 오차율의 구조적 원인을 분석하고 향후 추계 모델 개선 방안을 요구하는 질의', type: 'single', typeLabel: '단일소관', mainDept: '세제실', coopDept: '', org: '재정경제부', confidence: 89, keywords: ['세수 추계', '오차율'] }
      ]
    },
    '국정감사_의원질의_경제정책.txt': {
      docText: `국정감사 의원 질의 — 경제정책 분야

[질의1] 정부의 하반기 경제정책방향에서 제시한 민생안정 대책의 구체적 이행 현황을 보고하시오. 대책별 집행률과 향후 추진 일정도 함께 제시하시오.

[질의2] 물가안정 목표 달성을 위한 정부·한은 간 정책 공조 현황과 향후 계획을 답변하시오. 최근 금리정책 방향과의 연계성도 설명하시오.

[질의3] 청년 일자리 대책 중 재정사업의 실질적 성과와 개선 필요사항을 질의합니다. 사업별 고용창출 효과를 구체적 수치로 제시해 주시기 바랍니다.`,
      queries: [
        { id: 16, text: '대책별 집행률과 향후 추진 일정을 포함한 하반기 경제정책방향 민생안정 대책 이행 현황 보고 요구', summary: '하반기 경제정책방향의 민생안정 대책에 대한 집행률과 이행 현황, 향후 추진 일정을 보고하라는 요구', type: 'multi', typeLabel: '복수소관', mainDept: '민생경제국', coopDept: '경제정책국', org: '재정경제부', confidence: 92, keywords: ['민생안정', '이행 현황'] },
        { id: 17, text: '최근 금리정책 방향과의 연계성을 포함한 물가안정 목표 달성 위한 정부·한은 정책 공조 현황 질의', summary: '물가안정 목표 달성을 위한 정부와 한국은행의 정책 공조 현황과 금리정책 연계성에 대한 질의', type: 'multi', typeLabel: '복수소관', mainDept: '민생경제국', coopDept: '경제정책국', org: '한국은행', confidence: 84, keywords: ['물가안정', '정책 공조'] },
        { id: 18, text: '사업별 고용창출 효과를 포함한 청년 일자리 재정사업 성과 및 개선 필요사항 질의', summary: '청년 일자리 재정사업의 사업별 고용창출 효과와 성과, 개선이 필요한 사항에 대한 질의', type: 'multi', typeLabel: '복수소관', mainDept: '경제구조개혁국', coopDept: '민생경제국', org: '고용노동부', confidence: 80, keywords: ['청년 일자리', '고용창출'] }
      ]
    }
  };

  let activeFileIndex = 0;

  // ─── Sessions (실행 목록) ───
  const sessions = [
    {
      id: 1, title: '재경위_제437회국회(임시회) 제1차 전체회의', status: 'done', time: '14:23', date: '2026.07.21',
      files: ['예산결산위_질의서_2026-0315.pdf', '기재위_요지서_세제현안.hwp'],
      queryCount: 8, memberCount: 18, singleCount: 4, multiCount: 3, noneCount: 1
    },
    {
      id: 2, title: '재경위_제429회국회(정기회) 제7차 전체회의', status: 'done', time: '10:45', date: '2026.07.18',
      files: ['김민수의원_추가질의_재정건전성.pdf'],
      queryCount: 12, memberCount: 24, singleCount: 7, multiCount: 4, noneCount: 1
    },
    {
      id: 3, title: '예결위_제437회국회(임시회) 제1차 전체회의', status: 'done', time: '16:30', date: '2026.07.16',
      files: ['박영희의원_요구자료_세수결손.docx'],
      queryCount: 15, memberCount: 28, singleCount: 9, multiCount: 5, noneCount: 1
    },
    {
      id: 4, title: '예결위_제429회국회(정기회) 제7차 전체회의', status: 'pending', time: '09:15', date: '2026.07.14',
      files: ['국정감사_의원질의_경제정책.txt'],
      queryCount: 10, memberCount: 21, singleCount: 5, multiCount: 4, noneCount: 1
    },
    { id: 5, title: '재경위_제436회국회(임시회) 제3차 전체회의', status: 'done', time: '15:30', date: '2026.07.11', files: ['세수결손_대응계획.pdf'], queryCount: 14, memberCount: 23, singleCount: 8, multiCount: 5, noneCount: 1 },
    { id: 6, title: '예결위_제436회국회(임시회) 제2차 전체회의', status: 'done', time: '11:42', date: '2026.07.09', files: ['국가채무_추가질의.hwp'], queryCount: 11, memberCount: 19, singleCount: 7, multiCount: 4, noneCount: 0 },
    { id: 7, title: '재경위_제435회국회(임시회) 제4차 전체회의', status: 'done', time: '14:18', date: '2026.07.07', files: ['공공기관_경영평가.docx'], queryCount: 13, memberCount: 22, singleCount: 8, multiCount: 4, noneCount: 1 },
    { id: 8, title: '예결위_제435회국회(임시회) 제5차 전체회의', status: 'done', time: '10:06', date: '2026.07.04', files: ['종부세_개편질의.pdf'], queryCount: 16, memberCount: 26, singleCount: 10, multiCount: 5, noneCount: 1 },
    { id: 9, title: '재경위_제434회국회(임시회) 제2차 전체회의', status: 'done', time: '16:55', date: '2026.07.01', files: ['외국환거래법_개정.pdf'], queryCount: 9, memberCount: 17, singleCount: 5, multiCount: 4, noneCount: 0 },
    { id: 10, title: '예결위_제434회국회(임시회) 제3차 전체회의', status: 'done', time: '13:27', date: '2026.06.27', files: ['청년일자리_재정사업.hwp'], queryCount: 18, memberCount: 30, singleCount: 11, multiCount: 6, noneCount: 1 },
    { id: 11, title: '재경위_제433회국회(임시회) 제1차 전체회의', status: 'done', time: '09:48', date: '2026.06.24', files: ['물가안정_정책공조.pdf'], queryCount: 12, memberCount: 20, singleCount: 7, multiCount: 5, noneCount: 0 },
    { id: 12, title: '예결위_제433회국회(임시회) 제4차 전체회의', status: 'done', time: '17:20', date: '2026.06.20', files: ['재정준칙_검토자료.docx'], queryCount: 15, memberCount: 25, singleCount: 9, multiCount: 5, noneCount: 1 }
  ];
  let activeSessionId = 12; // Current session
  let runListSearchTerm = '';
  let runListSortOrder = 'latest';
  const SESSION_PREF_KEY = 'ai-one-intake-run-sessions-v2';
  const NOTIFICATION_ASSIGNEE_KEY = 'ai-one-intake-department-notification-settings-v3';

  // 실국별 알림 담당자 후보 및 기본 지정값
  // 실제 운영 시에는 조직·사용자 조회 API와 설정 저장 API의 응답으로 대체합니다.
  const notificationOrganizationOrder = [
    '부총리 직속',
    '제1차관 직속',
    '제1차관 소관',
    '제1차관 추진단',
    '제2차관 직속',
    '제2차관 소관'
  ];

  const notificationStaffNames = [
    '이수빈','정우진','문가영','김민지','박도윤','이서현','최지훈','정하윤','오세진','한유진',
    '송민재','윤서아','장현우','배지민','임수호','이준호','정민지','강현우','김하린','백승우',
    '조서윤','최예원','김성민','장다은','박준서','이하연','윤민호','서지원','한승민','임유나',
    '강지호','송혜진','우민석','김도현','박하늘','조유진','정하연','박성진','이예원','최민준'
  ];

  function createNotificationStaff(dept, offset) {
    const safeKey = String(dept || 'dept').replace(/[^가-힣a-zA-Z0-9]/g, '-');
    return [0, 1, 2].map(index => ({
      id: `${safeKey}-${offset + index}`,
      name: notificationStaffNames[(offset + index) % notificationStaffNames.length],
      position: index === 0 ? '사무관' : '주무관'
    }));
  }

  const notificationDepartmentDirectory = [
    { organization: '부총리 직속', dept: '대변인', subunits: ['홍보담당관'], staff: createNotificationStaff('대변인', 0) },
    { organization: '부총리 직속', dept: '감사관', subunits: ['감사담당관'], staff: createNotificationStaff('감사관', 3) },
    { organization: '부총리 직속', dept: '입법심의관', subunits: [], staff: createNotificationStaff('입법심의관', 6) },
    { organization: '부총리 직속', dept: '전략기획관', subunits: [], staff: createNotificationStaff('전략기획관', 9) },
    { organization: '부총리 직속', dept: '장관정책보좌관', subunits: [], staff: createNotificationStaff('장관정책보좌관', 12) },

    { organization: '제1차관 직속', dept: '인사과', subunits: [], staff: createNotificationStaff('인사과', 15) },
    { organization: '제1차관 직속', dept: '운영지원과', subunits: [], staff: createNotificationStaff('운영지원과', 18) },
    { organization: '제1차관 직속', dept: '차관보', subunits: [], staff: createNotificationStaff('차관보', 21) },

    { organization: '제1차관 소관', dept: '경제정책국', subunits: ['거시경제심의관','종합정책과','경제분석과','자금시장정책과','자금시장분석과','부동산시장과','재정기획과'], staff: createNotificationStaff('경제정책국', 24) },
    { organization: '제1차관 소관', dept: '민생경제국', subunits: ['민생경제총괄과','물가정책과','인력정책과','복지경제과'], staff: createNotificationStaff('민생경제국', 27) },
    { organization: '제1차관 소관', dept: '경제구조개혁국', subunits: ['경제구조개혁총괄과','경제구조분석과','노동시장경제과','연금보건경제과','청년정책과'], staff: createNotificationStaff('경제구조개혁국', 30) },
    { organization: '제1차관 소관', dept: '혁신성장실', subunits: ['정책조정관','정책조정총괄과','산업경제과','서비스경제과','지역경제정책과','기업환경과','녹색전환경제과','전략경제정책관','전략경제총괄과','전략경제분석과','전략투자지원과','전략수출지원과','인공지능경제과'], staff: createNotificationStaff('혁신성장실', 33) },
    { organization: '제1차관 소관', dept: '세제실', subunits: ['조세총괄정책관','조세정책과','조세특례제도과','조세추계과','조세분석과','소득법인세정책관','소득세제과','법인세제과','금융세제과','재산소비세정책관','재산세제과','부가가치세제과','환경에너지세제과','국제조세정책관','국제조세제도과','신국제조세규범과','관세정책관','관세제도과','산업관세과','관세협력과','자유무역협정관세이행과'], staff: createNotificationStaff('세제실', 36) },

    { organization: '제1차관 추진단', dept: '초혁신경제추진단', subunits: ['기획총괄과','전략지원과','미래산업과','글로벌전략과'], staff: createNotificationStaff('초혁신경제추진단', 39) },
    { organization: '제1차관 추진단', dept: '조세개혁추진단', subunits: ['총괄기획팀','보유세개편팀'], staff: createNotificationStaff('조세개혁추진단', 42) },
    { organization: '제1차관 추진단', dept: '수출플러스지원단', subunits: ['총괄기획팀','글로벌진출팀','성장금융팀','신산업진출팀'], staff: createNotificationStaff('수출플러스지원단', 45) },

    { organization: '제2차관 직속', dept: '정책금융기획관', subunits: [], staff: createNotificationStaff('정책금융기획관', 48) },
    { organization: '제2차관 직속', dept: '금융입법담당관', subunits: [], staff: createNotificationStaff('금융입법담당관', 51) },
    { organization: '제2차관 직속', dept: '공공금융담당관', subunits: [], staff: createNotificationStaff('공공금융담당관', 54) },

    { organization: '제2차관 소관', dept: '기획조정실', subunits: ['정책기획관','기획재정담당관','혁신정책담당관','규제개혁법무담당관','정보화담당관','비상안전기획관','비상안전기획팀'], staff: createNotificationStaff('기획조정실', 57) },
    { organization: '제2차관 소관', dept: '국고실', subunits: ['국고정책관','국고총괄과','국채정책과','국채시장과','출자관리과','회계결산과','국유재산정책관','국유재산정책과','국유재산개발과','국유재산조정과','국유재산협력과','조달계약정책관','조달정책과','계약정책과','계약분쟁심사과'], staff: createNotificationStaff('국고실', 60) },
    { organization: '제2차관 소관', dept: '국제경제관리관', subunits: ['국제금융국','대외경제국','개발금융국'], staff: createNotificationStaff('국제경제관리관', 63) },
    { organization: '제2차관 소관', dept: '국제금융국', subunits: ['국제금융심의관','국제금융과','외화자금과','외환제도과','외환분석과','금융협력과','다자금융과'], staff: createNotificationStaff('국제금융국', 66) },
    { organization: '제2차관 소관', dept: '대외경제국', subunits: ['대외경제심의관','대외경제총괄과','국제경제과','통상정책과','신통상분석과','경제협력과','남북경제과'], staff: createNotificationStaff('대외경제국', 69) },
    { organization: '제2차관 소관', dept: '개발금융국', subunits: ['개발금융총괄과','국제기구과','개발전략과','개발사업협력과','개발정책협력과','녹색기후기획과'], staff: createNotificationStaff('개발금융국', 72) },
    { organization: '제2차관 소관', dept: '공공정책국', subunits: ['공공혁신심의관','공공정책총괄과','공공제도기획과','재무경영과','평가분석과','인재경영과','공공윤리정책과','공공혁신기획과','경영관리과'], staff: createNotificationStaff('공공정책국', 75) }
  ];
  let notificationDepartmentAssignments = {};

  const NOTIFICATION_DEPARTMENT_ALIASES = {
    '거시경제심의관': '경제정책국',
    '종합정책과': '경제정책국',
    '경제분석과': '경제정책국',
    '재정기획과': '경제정책국',
    '물가정책과': '민생경제국',
    '인력정책과': '민생경제국',
    '청년정책과': '경제구조개혁국',
    '노동시장경제과': '경제구조개혁국',
    '정책조정관': '혁신성장실',
    '전략경제정책관': '혁신성장실',
    '조세총괄정책관': '세제실',
    '소득법인세정책관': '세제실',
    '재산소비세정책관': '세제실',
    '국제조세정책관': '세제실',
    '관세정책관': '세제실',
    '법인세과': '세제실',
    '법인세제과': '세제실',
    '부가가치세제과': '세제실',
    '예산실': '경제정책국',
    '재정정책국': '국고실',
    '국고정책관': '국고실',
    '국유재산정책관': '국고실',
    '조달계약정책관': '국고실',
    '국제금융심의관': '국제금융국',
    '외환시장과': '국제금융국',
    '외환제도과': '국제금융국',
    '대외경제심의관': '대외경제국',
    '공공혁신심의관': '공공정책국',
    '고용정책과': '경제구조개혁국',
    '지방재정과': '민생경제국'
  };

  function resolveNotificationDepartmentName(value) {
    const dept = String(value || '').trim();
    if (!dept || dept === '해당없음' || dept === 'AI 추천 대기') return '';
    if (getNotificationDepartmentGroup(dept)) return dept;
    return NOTIFICATION_DEPARTMENT_ALIASES[dept] || dept;
  }

  function splitNotificationDepartments(value) {
    return [...new Set(String(value || '')
      .split(',')
      .map(resolveNotificationDepartmentName)
      .filter(Boolean))];
  }

  const sampleLogs = [
    { time: '14:32:15', msg: 'OCR 파싱 완료 – 5건 질의 추출' },
    { time: '14:32:10', msg: '부서 매칭 시작 (AI 모델 v2.3)' },
    { time: '14:31:58', msg: '질의 분류 완료 – 단일2, 복수2, 비소관1' },
    { time: '14:31:45', msg: '텍스트 추출 완료 (1,247자)' },
    { time: '14:30:02', msg: '파일 업로드 완료 – 질의서_2026_0315.pdf' }
  ];

  // ─── DOM References ───
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const uploadZone = $('#uploadZone');
  const fileInput = $('#fileInput');
  const fileList = $('#fileList');
  const fileCount = $('#fileCount');
  const docContent = $('#docContent');
  const queryList = $('#queryList');
  const toast = $('#toast');

  // Drawer
  const runDrawerBtn = $('#runDrawerBtn');
  const runDrawer = $('#runDrawer');
  const drawerBackdrop = $('#drawerBackdrop');
  const drawerClose = $('#drawerClose');

  // Modal
  const editModal = $('#editModal');
  const editModalClose = $('#editModalClose');
  const editCancel = $('#editCancel');
  const editApply = $('#editApply');

  // Sidebar toggle
  const sidebarToggle = $('#sidebarToggle');
  const sidebar = $('#sidebar');
  const sidebarCollapseBtn = $('#sidebarCollapseBtn');
  const mainWrap = $('#mainWrap');

  // ─── State ───
  let uploadedFiles = [];
  let currentFilter = 'all';
  let editingQuery = null;
  let activeQueryIndex = 0; // 질의 추출 결과 패널에서 현재 선택된 문장 인덱스
  let lastDocText = ''; // 현재 표시 중인 원문 텍스트 (통계 표시용)
  let workspaceTitle = '제목없는 국회질의';
  let workspaceMemberCount = 0;
  const WORKSPACE_META_KEY = 'ai-one-intake-workspace-meta-v2';
  let documentZoom = 100; // 중앙 문서 뷰어 확대 비율
  const DOC_ORIGINAL_WIDTH_KEY = 'ai-one-intake-doc-original-width';

  // 파일 처리 파이프라인 단계 정의: 파싱 → SLM 자연어화 → 청킹 (국회 답변서 초안 생성과 동일)
  const FILE_STAGES = [
    { status: 'parsing', delay: 900 },
    { status: 'summarizing', delay: 900 },
    { status: 'chunking', delay: 800 },
    { status: 'done', delay: 0 }
  ];

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
      renderFileList();
      stageIdx++;
      if (stage.delay > 0 && FILE_STAGES[stageIdx]) {
        setTimeout(advance, stage.delay);
      }
    };
    advance();
  }

  function showIntakeSkeleton(message = '문서를 분석하고 있습니다...') {
    hideIntakeSkeleton();
    const centerPanel = $('.panel-center');
    const rightPanel = $('.panel-right');
    if (centerPanel) {
      const overlay = document.createElement('div');
      overlay.className = 'api-skeleton-overlay intake-api-skeleton';
      overlay.innerHTML = `<div class="skeleton-loading-label">${message}</div><div class="intake-skeleton-grid"><div class="intake-skeleton-column"><div class="ai-skeleton skeleton-line md"></div><div class="ai-skeleton intake-skeleton-doc"></div></div><div class="intake-skeleton-column"><div class="ai-skeleton skeleton-line sm"></div>${Array.from({length:4},()=>'<div class="skeleton-card"><div class="ai-skeleton skeleton-line lg"></div><div class="ai-skeleton skeleton-line full"></div><div class="ai-skeleton skeleton-line md"></div></div>').join('')}</div></div>`;
      centerPanel.appendChild(overlay);
    }
    if (rightPanel) {
      const overlay = document.createElement('div');
      overlay.className = 'api-skeleton-overlay intake-api-skeleton';
      overlay.innerHTML = `<div class="skeleton-loading-label">분류 결과를 불러오고 있습니다...</div>${Array.from({length:4},()=>'<div class="skeleton-card"><div class="skeleton-card-row"><div class="ai-skeleton skeleton-circle"></div><div class="ai-skeleton skeleton-line lg"></div></div><div class="ai-skeleton skeleton-line full"></div><div class="ai-skeleton skeleton-line md"></div></div>').join('')}`;
      rightPanel.appendChild(overlay);
    }
  }

  function hideIntakeSkeleton() {
    $$('.intake-api-skeleton').forEach(el => el.remove());
  }

  // ─── Init ───
  function init() {
    hydrateSessionPreferences();
    hydrateWorkspaceMeta();
    const runListSearch = $('#runListSearch');
    const runListSearchClear = $('#runListSearchClear');
    const runListSort = $('#runListSort');
    runListSearch?.addEventListener('input', () => {
      runListSearchTerm = runListSearch.value || '';
      runListSearchClear?.classList.toggle('hidden', !runListSearchTerm);
      renderDrawer();
    });
    runListSearchClear?.addEventListener('click', () => {
      runListSearchTerm = '';
      if (runListSearch) {
        runListSearch.value = '';
        runListSearch.focus();
      }
      runListSearchClear.classList.add('hidden');
      renderDrawer();
    });
    runListSort?.addEventListener('change', () => {
      runListSortOrder = runListSort.value === 'oldest' ? 'oldest' : 'latest';
      renderDrawer();
    });
    loadNotificationAssignees();
    initFontSizeControl();
    bindEvents();
    bindWorkspaceMetaControls();
    updateNotificationAssigneeButton();
    loadSampleData();
    initPanelResize();
    initPanelDragDrop();
    initRuleManagement();
  }

  function bindEvents() {
    // Upload
    uploadZone.addEventListener('app:file-upload', handleFileUpload);

    // Filter Button의 선택 상태는 common.js가 관리하고 실제 목록만 이 화면에서 갱신합니다.
    $('.filter-bar')?.addEventListener('filter-btn:change', handleFilterChange);
    document.addEventListener('click', event => {
      if (!event.target.closest('.file-action-wrap')) closeFileActionMenus();
      if (!event.target.closest('.run-action-wrap')) closeRunActionMenus();
    });

    // Drawer
    runDrawerBtn.addEventListener('click', openDrawer);
    drawerClose.addEventListener('click', closeDrawer);
    drawerBackdrop.addEventListener('click', closeDrawer);

    const notificationAssigneeBtn = $('#notificationAssigneeBtn');
    if (notificationAssigneeBtn) {
      notificationAssigneeBtn.addEventListener('click', openNotificationAssigneeModal);
    }

    // Drawer position toggle
    const runDrawerPosBtn = $('#runDrawerPosBtn');
    const runDrawer = $('#runDrawer');
    const runDrawerPosIcon = $('#runDrawerPosIcon');
    const updateRunDrawerPositionControl = () => {
      const isLeft = runDrawer && runDrawer.classList.contains('drawer-left');
      const label = $('#runDrawerPosLabel');
      if (label) label.textContent = isLeft ? '우측으로 이동' : '좌측으로 이동';
      if (runDrawerPosBtn) runDrawerPosBtn.setAttribute('aria-label', isLeft ? '드로어를 우측으로 이동' : '드로어를 좌측으로 이동');
      if (runDrawerPosIcon) {
        const sideMark = runDrawerPosIcon.querySelector('.drawer-side-mark');
        const moveArrow = runDrawerPosIcon.querySelector('.drawer-move-arrow');
        if (sideMark) sideMark.setAttribute('d', isLeft ? 'M8 5.5V18.5' : 'M16 5.5V18.5');
        if (moveArrow) moveArrow.setAttribute('d', isLeft ? 'M10 12H17M14.5 9.5 17 12l-2.5 2.5' : 'M14 12H7M9.5 9.5 7 12l2.5 2.5');
      }
    };
    if (runDrawerPosBtn && runDrawer) {
      updateRunDrawerPositionControl();
      runDrawerPosBtn.addEventListener('click', () => {
        runDrawer.classList.toggle('drawer-left');
        updateRunDrawerPositionControl();
      });
    }

    // Modal
    editModalClose.addEventListener('click', closeEditModal);
    editCancel.addEventListener('click', closeEditModal);
    editApply.addEventListener('click', applyEdit);

    // Sidebar
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    }

    // Sidebar collapse
    if (sidebarCollapseBtn) {
      sidebarCollapseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('collapsed');
        if (sidebar.classList.contains('collapsed')) {
          localStorage.setItem('sidebar-collapsed', 'true');
        } else {
          localStorage.removeItem('sidebar-collapsed');
        }
      });
    }

    // Auto-collapse sidebar when clicking any nav link
    $$('.nav-link', sidebar).forEach(link => {
      link.addEventListener('click', () => {
        if (link.dataset.page === 'home') return;
        localStorage.setItem('sidebar-collapsed', 'true');
        sidebar.classList.add('collapsed');
      });
    });

    // Restore collapsed state from localStorage
    if (localStorage.getItem('sidebar-collapsed') === 'true') {
      sidebar.classList.add('collapsed');
    }

    // Expand sidebar by clicking logo when collapsed
    const sidebarBrand = $('.sidebar-brand', sidebar);
    if (sidebarBrand) {
      sidebarBrand.addEventListener('click', () => {
        if (sidebar.classList.contains('collapsed')) {
          sidebar.classList.remove('collapsed');
          localStorage.removeItem('sidebar-collapsed');
        } else {
          window.location.href = 'ai-home.html';
        }
      });
    }

    initNavTooltips(sidebar);

    // Reset
    const resetBtn = $('#resetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('pointerdown', stopResetInteraction);
      resetBtn.addEventListener('click', (event) => {
        stopResetInteraction(event);
        resetAll({ full: true, resetWorkspaceMeta: true });
      });
    }

    // Excel (query panel)
    const queryExcelBtn = $('#queryExcelBtn');
    if (queryExcelBtn) queryExcelBtn.addEventListener('click', () => downloadExcel());

    // AI Reclassify
    const aiReclassifyBtn = $('#aiReclassifyBtn');
    if (aiReclassifyBtn) aiReclassifyBtn.addEventListener('click', requestAiReclassification);

    // New Classify: 새 실행 세션을 만든 뒤 화면 전체 업무 상태를 초기화
    const newClassifyBtn = $('#newClassifyBtn');
    if (newClassifyBtn) newClassifyBtn.addEventListener('click', () => {
      const newId = sessions.length + 1;
      const now = new Date();
      const timeStr = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
      const dateStr = now.toISOString().slice(0,10).replace(/-/g,'.');
      sessions.push({
        id: newId,
        title: '제목없는 국회질의',
        status: 'pending',
        time: timeStr,
        date: dateStr,
        files: [],
        queryCount: 0, memberCount: 0, singleCount: 0, multiCount: 0, noneCount: 0
      });
      activeSessionId = newId;
      resetAll({ full: true, showMessage: false, resetWorkspaceMeta: true });
      updateConfirmBtnUI();
      showToast('새 질의분류를 시작합니다. 제목과 의원수가 기본값으로 초기화되었습니다.');
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

    // Left panel collapse
    const leftCollapseBtn = $('#leftPanelCollapseBtn');
    if (leftCollapseBtn) {
      leftCollapseBtn.addEventListener('click', () => {
        const panel = leftCollapseBtn.closest('.panel');
        const container = $('.three-panel');
        if (!panel || !container) return;
        setPanelCollapsed(panel, !panel.classList.contains('panel-collapsed'));
      });
    }


    // Panel swap (rotate positions on each click)
    $('#panelSwapBtn').addEventListener('click', rotatePanels);
  }


  function syncWorkspaceMetaToActiveSession() {
    const session = sessions.find(item => item.id === activeSessionId);
    if (session) {
      session.title = workspaceTitle;
      session.memberCount = workspaceMemberCount;
      session.files = uploadedFiles.map(file => file.name);
      session.queryCount = uploadedFiles.reduce((sum, file) => sum + getFileQueryCount(file), 0);
    }
    persistSessionPreferences();
  }

  function renderWorkspaceMeta() {
    const titleText = $('#workspaceTitleText');
    const titleInput = $('#workspaceTitleInput');
    const memberInput = $('#memberCountInput');
    const ratio = $('#fileMemberRatio');
    const displayTitle = workspaceTitle || '제목없는 국회질의';
    if (titleText) titleText.textContent = displayTitle;
    if (titleInput) titleInput.value = displayTitle;
    if (memberInput) memberInput.value = String(workspaceMemberCount ?? 0);
    if (ratio) ratio.textContent = uploadedFiles.length + '/' + (workspaceMemberCount ?? 0);
    document.title = '국회질의분류 AI 워크스페이스 — AI-ONE';
  }

  function saveWorkspaceMeta() {
    try { localStorage.setItem(WORKSPACE_META_KEY, JSON.stringify({ title: workspaceTitle, memberCount: workspaceMemberCount })); } catch (error) {}
    syncWorkspaceMetaToActiveSession();
    renderWorkspaceMeta();
  }

  function hydrateWorkspaceMeta() {
    try {
      const saved = JSON.parse(localStorage.getItem(WORKSPACE_META_KEY) || 'null');
      const savedTitle = String(saved?.title || '').trim();
      // 이전 버전의 서비스명 기본값은 사용자 제목으로 보지 않고 새 기본값으로 마이그레이션한다.
      if (savedTitle && savedTitle !== '국회질의분류 AI 워크스페이스' && savedTitle !== '국회질의분류') workspaceTitle = savedTitle;
      else workspaceTitle = '제목없는 국회질의';
      if (saved && saved.memberCount !== null && saved.memberCount !== '' && Number.isFinite(Number(saved.memberCount))) workspaceMemberCount = Math.max(0, Math.min(999, Number(saved.memberCount)));
      else workspaceMemberCount = 0;
    } catch (error) {
      workspaceTitle = '제목없는 국회질의';
      workspaceMemberCount = 0;
    }
    const activeSession = sessions.find(item => item.id === activeSessionId);
    if (activeSession) {
      activeSession.title = workspaceTitle;
      activeSession.memberCount = workspaceMemberCount;
    }
    renderWorkspaceMeta();
  }

  function bindWorkspaceMetaControls() {
    const titleBtn = $('#workspaceTitleBtn');
    const titleInput = $('#workspaceTitleInput');
    const memberInput = $('#memberCountInput');

    const openEdit = () => {
      titleBtn?.classList.add('hidden');
      titleInput?.classList.remove('hidden');
      if (titleInput) { titleInput.value = workspaceTitle || '제목없는 국회질의'; titleInput.focus(); titleInput.select(); }
    };
    const closeEdit = (save = true) => {
      if (save) {
        const next = String(titleInput?.value || '').trim();
        workspaceTitle = next || '제목없는 국회질의';
        saveWorkspaceMeta();
        renderDrawer();
      } else if (titleInput) titleInput.value = workspaceTitle || '제목없는 국회질의';
      titleInput?.classList.add('hidden');
      titleBtn?.classList.remove('hidden');
    };
    titleBtn?.addEventListener('click', openEdit);
    titleInput?.addEventListener('keydown', event => {
      if (event.key === 'Enter') { event.preventDefault(); closeEdit(true); }
      if (event.key === 'Escape') { event.preventDefault(); closeEdit(false); }
    });
    titleInput?.addEventListener('blur', () => closeEdit(true));
    memberInput?.addEventListener('input', () => {
      const raw = String(memberInput.value || '').trim();
      workspaceMemberCount = raw === '' ? 0 : Math.max(0, Math.min(999, Number(raw)));
      renderWorkspaceMeta();
    });
    memberInput?.addEventListener('change', () => { saveWorkspaceMeta(); renderDrawer(); });
    memberInput?.addEventListener('wheel', event => event.currentTarget.blur(), { passive: true });

  }

  // ─── Load sample ───
  function loadSampleData() {
    uploadedFiles = [
      { name: '예산결산위_질의서_2026-0315.pdf', displayName: '재경위_질의서_김민수의원.pdf', type: 'pdf', size: '2.4MB', status: 'done', chunks: 14 },
      { name: '기재위_요지서_세제현안.hwp', displayName: '재경위_질의요지서_OOO의원.hwp', type: 'hwp', size: '1.1MB', status: 'done', chunks: 9 },
      { name: '김민수의원_추가질의_재정건전성.pdf', displayName: '재경위_추가질의서_박영희의원.pdf', type: 'pdf', size: '0.9MB', status: 'done', chunks: 7 },
      { name: '박영희의원_요구자료_세수결손.docx', displayName: '재경위_자료요구서_이정민의원.docx', type: 'docx', size: '1.5MB', status: 'done', chunks: 12 },
      { name: '국정감사_의원질의_경제정책.txt', displayName: '재경위_국정감사질의서_최서윤의원.txt', type: 'txt', size: '0.6MB', status: 'done', chunks: 6 },
      { name: '정무위_가계부채_관리방안.pdf', displayName: '재경위_질의서_정우진의원.pdf', type: 'pdf', size: '1.8MB', status: 'done', chunks: 10 },
      { name: '기재위_법인세_세액공제.hwp', displayName: '재경위_질의요지서_한유진의원.hwp', type: 'hwp', size: '1.2MB', status: 'done', chunks: 8 },
      { name: '이정민의원_국가채무_질의.pdf', displayName: '재경위_추가질의서_장현우의원.pdf', type: 'pdf', size: '0.8MB', status: 'done', chunks: 6 },
      { name: '최서윤의원_민생물가_요구자료.docx', displayName: '재경위_자료요구서_김하린의원.docx', type: 'docx', size: '1.3MB', status: 'done', chunks: 11 },
      { name: '예결위_추경예산_쟁점자료.pdf', displayName: '예결위_질의서_박준서의원.pdf', type: 'pdf', size: '2.1MB', status: 'done', chunks: 13 },
      { name: '재정준칙_도입검토_질의.hwp', displayName: '예결위_질의요지서_서지원의원.hwp', type: 'hwp', size: '1.0MB', status: 'done', chunks: 7 },
      { name: '공공기관_경영평가_개선.docx', displayName: '예결위_추가질의서_강지호의원.docx', type: 'docx', size: '1.4MB', status: 'done', chunks: 9 },
      { name: '종합부동산세_개편질의.pdf', displayName: '예결위_자료요구서_김도현의원.pdf', type: 'pdf', size: '1.7MB', status: 'done', chunks: 12 },
      { name: '외국환거래법_개정질의.pdf', displayName: '예결위_질의서_정하연의원.pdf', type: 'pdf', size: '1.1MB', status: 'done', chunks: 8 },
      { name: '청년일자리_재정사업.hwp', displayName: '예결위_질의요지서_최민준의원.hwp', type: 'hwp', size: '0.9MB', status: 'done', chunks: 7 },
      { name: '물가안정_정책공조.pdf', displayName: '예결위_추가질의서_이승우의원.pdf', type: 'pdf', size: '1.6MB', status: 'done', chunks: 10 },
      { name: '세수결손_대응계획.docx', displayName: '재경위_자료요구서_장유진의원.docx', type: 'docx', size: '1.2MB', status: 'done', chunks: 9 },
      { name: '국유재산_활용현황.pdf', displayName: '재경위_질의서_김현진의원.pdf', type: 'pdf', size: '2.0MB', status: 'done', chunks: 13 },
      { name: '국고보조금_통합관리.hwp', displayName: '재경위_질의요지서_배준영의원.hwp', type: 'hwp', size: '1.1MB', status: 'done', chunks: 8 },
      { name: '지역균형발전_재정지원.pdf', displayName: '재경위_추가질의서_한준혁의원.pdf', type: 'pdf', size: '1.5MB', status: 'done', chunks: 11 },
      { name: '금융시장_변동성_대응.txt', displayName: '예결위_자료요구서_신예린의원.txt', type: 'txt', size: '0.5MB', status: 'done', chunks: 5 },
      { name: '중소기업_정책금융_질의.pdf', displayName: '예결위_질의서_박소연의원.pdf', type: 'pdf', size: '1.3MB', status: 'done', chunks: 9 },
      { name: '저출생_재정사업_성과.docx', displayName: '예결위_질의요지서_정예진의원.docx', type: 'docx', size: '1.4MB', status: 'done', chunks: 10 },
      { name: '탄소중립_재정투자_요구자료.pdf', displayName: '예결위_자료요구서_OOO의원.pdf', type: 'pdf', size: '1.9MB', status: 'done', chunks: 12 }
    ];    activeFileIndex = 0;
    renderFileList();
    loadFileData(activeFileIndex);
    const activeSession = sessions.find(item => item.id === activeSessionId);
    if (activeSession) {
      activeSession.title = workspaceTitle;
      activeSession.memberCount = workspaceMemberCount;
      activeSession.files = uploadedFiles.map(file => file.name);
      activeSession.queryCount = uploadedFiles.reduce((sum, file) => sum + getFileQueryCount(file), 0);
    }
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
      data.queries.forEach(q => sampleQueries.push({
        ...q,
        keywords: Array.isArray(q.keywords) ? [...q.keywords] : q.keywords,
        conflict: q.conflict ? { ...q.conflict } : q.conflict
      }));
      activeQueryIndex = 0;
      renderDocContentForFile(data.docText);
      renderQueryList();
      // Update extracted count
      const statExtracted = $('#statExtracted');
      if (statExtracted) statExtracted.textContent = data.queries.length;
    }
    // Highlight active file in list
    $$('.file-list li').forEach((li, i) => {
      li.classList.toggle('active', i === idx);
    });
    // Update confirm button state for this file
    updateConfirmBtnUI();
  }

  function getDocOriginalWidthBounds(splitView, handleWidth = 4) {
    const availableWidth = Math.max(0, splitView.clientWidth - handleWidth);
    const minLeft = Math.min(300, Math.max(220, Math.round(availableWidth * 0.28)));
    const minRight = Math.min(320, Math.max(240, Math.round(availableWidth * 0.30)));
    const maxByRight = Math.max(minLeft, availableWidth - minRight);
    const maxByRatio = Math.max(minLeft, Math.round(availableWidth * 0.72));
    const maxLeft = Math.max(minLeft, Math.min(maxByRight, maxByRatio));
    return { minLeft, maxLeft };
  }

  function resetDocOriginalWidth(showMessage = false) {
    const left = $('.doc-split-left');
    const right = $('.doc-split-right');
    if (!left || !right) return;

    left.style.removeProperty('width');
    left.style.flex = '1.8 1 0%';
    right.style.removeProperty('width');
    right.style.flex = '1 1 0%';
    try { localStorage.removeItem(DOC_ORIGINAL_WIDTH_KEY); } catch (e) {}
    if (showMessage) showToast('원본 문서 영역을 기본 너비로 초기화했습니다.');
  }

  function applyDocOriginalWidth() {
    const splitView = $('.doc-split-view');
    const left = $('.doc-split-left');
    const right = $('.doc-split-right');
    if (!splitView || !left || !right) return;

    const savedWidth = Number(localStorage.getItem(DOC_ORIGINAL_WIDTH_KEY));
    if (!savedWidth) {
      resetDocOriginalWidth(false);
      return;
    }

    const { minLeft, maxLeft } = getDocOriginalWidthBounds(splitView);
    const nextLeftWidth = Math.max(minLeft, Math.min(maxLeft, savedWidth));

    left.style.flex = '0 0 auto';
    left.style.width = nextLeftWidth + 'px';
    right.style.flex = '1 1 0%';
    right.style.removeProperty('width');
  }

  function renderDocContentForFile(text) {
    if (text !== undefined) lastDocText = text;
    text = lastDocText;
    const queries = sampleQueries;
    if (activeQueryIndex >= queries.length) activeQueryIndex = Math.max(0, queries.length - 1);

    // Left: Original text — 질의 건수에 따라 여러 페이지로 구성, 각 문장은 클릭 가능한 번호 박스로 표시
    const docOriginal = $('#docOriginal');
    if (docOriginal) {
      const activeFile = uploadedFiles[activeFileIndex];
      const meta = (activeFile && docMetaMap[activeFile.name]) || DEFAULT_DOC_META;
      docOriginal.innerHTML = buildOriginalPages(meta, queries);

      // 번호 박스 클릭 → 우측 상세 패널 갱신
      $$('.orig-query-box', docOriginal).forEach(box => {
        box.addEventListener('click', () => {
          activeQueryIndex = parseInt(box.dataset.qidx);
          renderDocContentForFile(text);
        });
      });
    }

    renderQueryDetailPanel(queries);
    applyDocOriginalWidth();

    // Split handle resize
    const splitHandle = $('#docSplitHandle');
    if (splitHandle && !splitHandle.dataset.bound) {
      splitHandle.dataset.bound = 'true';
      splitHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const left = splitHandle.previousElementSibling;
        const right = splitHandle.nextElementSibling;
        const splitView = splitHandle.parentElement;
        if (!left || !right || !splitView) return;

        const handleWidth = splitHandle.offsetWidth || 4;
        const startX = e.clientX;
        const startLeftW = left.offsetWidth;

        splitHandle.classList.add('active');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        const onMove = (ev) => {
          const diff = ev.clientX - startX;
          const { minLeft, maxLeft } = getDocOriginalWidthBounds(splitView, handleWidth);
          const nextLeftWidth = Math.max(minLeft, Math.min(maxLeft, startLeftW + diff));

          left.style.flex = '0 0 auto';
          left.style.width = nextLeftWidth + 'px';
          right.style.flex = '1 1 auto';
          right.style.removeProperty('width');
        };

        const onUp = () => {
          splitHandle.classList.remove('active');
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          try { localStorage.setItem(DOC_ORIGINAL_WIDTH_KEY, String(left.offsetWidth)); } catch (e) {}
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
    }

    if (!window.__aiOneDocOriginalWidthResizeBound) {
      window.__aiOneDocOriginalWidthResizeBound = true;
      window.addEventListener('resize', () => {
        applyDocOriginalWidth();
      });
    }

    // Update doc status bar
    updateDocStatusBar(text);
  }

  function updateDocStatusBar(text) {
    const charCount = text ? text.replace(/\s/g, '').length : 0;
    const charEl = $('#docCharCount');
    if (charEl) charEl.textContent = charCount.toLocaleString();
    const pages = Math.max(1, Math.ceil(charCount / 2000));
    const pageNum = $('#docPageNum');
    const pageTotal = $('#docPageTotal');
    if (pageNum) pageNum.textContent = '1';
    if (pageTotal) pageTotal.textContent = pages;

    // Zoom controls
    const zoomVal = $('#docZoomVal');
    const zoomIn = $('#docZoomIn');
    const zoomOut = $('#docZoomOut');
    const fitBtn = $('#docFitBtn');
    const originalContent = $('#docOriginal');
    const panelStatusBar = $('#docPanelStatusBar');

    function applyZoom() {
      const scale = documentZoom / 100;

      // 페이지 조절 기능은 원본 보기 영역에만 적용한다.
      if (originalContent) {
        originalContent.style.setProperty('--doc-zoom-scale', String(scale));
        originalContent.style.removeProperty('transform');
        originalContent.style.removeProperty('transform-origin');
        originalContent.style.removeProperty('width');
        originalContent.style.removeProperty('height');
      }

      if (zoomVal) zoomVal.textContent = documentZoom + '%';
      if (zoomOut) zoomOut.disabled = documentZoom <= 50;
      if (zoomIn) zoomIn.disabled = documentZoom >= 200;
    }

    if (zoomIn && !zoomIn.dataset.bound) {
      zoomIn.dataset.bound = 'true';
      zoomIn.addEventListener('click', () => {
        documentZoom = Math.min(200, documentZoom + 10);
        applyZoom();
      });
    }
    if (zoomOut && !zoomOut.dataset.bound) {
      zoomOut.dataset.bound = 'true';
      zoomOut.addEventListener('click', () => {
        documentZoom = Math.max(50, documentZoom - 10);
        applyZoom();
      });
    }

    applyZoom();

    function setCompareFullscreen(enabled) {
      const comparePanel = originalContent ? originalContent.closest('.panel-center') : $('.panel-center');
      if (!comparePanel) return;

      comparePanel.classList.toggle('doc-compare-fullscreen', enabled);
      document.body.classList.toggle('doc-compare-fullscreen-open', enabled);

      if (fitBtn) {
        fitBtn.classList.toggle('active', enabled);
        fitBtn.setAttribute('aria-pressed', String(enabled));
        fitBtn.setAttribute('title', enabled ? '질의 원본 · 결과 비교 전체보기 종료' : '질의 원본 · 결과 비교 전체보기');
        fitBtn.setAttribute('aria-label', enabled ? '질의 원본 · 결과 비교 전체보기 종료' : '질의 원본 · 결과 비교 전체보기');
      }
    }

    if (fitBtn && !fitBtn.dataset.bound) {
      fitBtn.dataset.bound = 'true';
      fitBtn.setAttribute('aria-pressed', 'false');
      fitBtn.addEventListener('click', () => {
        const comparePanel = originalContent ? originalContent.closest('.panel-center') : $('.panel-center');
        if (!comparePanel) return;
        const nextFullscreen = !comparePanel.classList.contains('doc-compare-fullscreen');
        setCompareFullscreen(nextFullscreen);
        showToast(nextFullscreen ? '질의 원본 · 결과 비교 전체보기 모드 (ESC로 종료)' : '일반 모드');
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const comparePanel = $('.panel-center.doc-compare-fullscreen');
          if (comparePanel) setCompareFullscreen(false);
        }
      });
    }
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

  function handleFileUpload(e) {
    validateFilesBeforeUpload(e.detail.files, addFiles);
  }

  function addFiles(files) {
    const added = [];
    files.forEach(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      let type = 'txt';
      if (ext === 'pdf') type = 'pdf';
      else if (ext === 'hwp') type = 'hwp';
      else if (ext === 'docx') type = 'docx';
      else if (['png', 'jpg', 'jpeg', 'tif', 'tiff'].includes(ext)) type = 'img';

      const size = (file.size / 1024 / 1024).toFixed(1) + 'MB';
      const fileObj = { name: file.name, type, size, status: null, chunks: 0 };
      uploadedFiles.push(fileObj);
      added.push(fileObj);

      // Generate sample data for new files if not in fileDataMap
      if (!fileDataMap[file.name]) {
        const baseName = file.name.replace(/\.[^.]+$/, '');
        fileDataMap[file.name] = {
          docText: `[AI 분석 결과] ${baseName}\n\n1. ${baseName}와 관련하여 세부 추진 현황과 향후 계획에 대한 구체적 답변을 요청합니다. 관련 예산 규모와 집행 일정도 함께 제시하여 주시기 바랍니다.\n\n2. 추출된 질의에 대해 담당실국이 추천되었습니다. 확인 후 확정해 주시기 바랍니다.`,
          queries: [
            { id: Date.now() + Math.random(), text: baseName + '와 관련한 세부 추진 현황, 향후 계획, 예산 규모 및 집행 일정에 대한 구체적 답변 요청 (AI 자동 추출)', summary: baseName + '의 추진 현황과 향후 계획, 관련 예산 및 집행 일정에 대한 구체적 답변을 요청하는 AI 자동 추출 질의', type: 'single', typeLabel: '단일소관', mainDept: 'AI 추천 대기', coopDept: '', org: '재정경제부', confidence: 85 }
          ]
        };
        docMetaMap[file.name] = {
          dept: '국회사무처', docType: '질 의 서', docNo: 'AI자동-' + Date.now().toString().slice(-6), date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
          recipient: '재정경제부 장관', title: baseName + ' 관련 질의',
          intro: ['1. 문서 분석을 통해 아래 사항에 대한 답변을 요청합니다.'],
          closing: '상기 사항에 대한 신속한 확인과 답변을 요청합니다.', signer: '국회사무처장'
        };
      }
    });

    renderFileList();
    showIntakeSkeleton('OCR·파싱 및 질의 분류 결과를 불러오고 있습니다...');
    showToast(`${files.length}건 파일이 업로드되었습니다. AI 분석을 시작합니다.`);

    // 업로드마다 파싱 → SLM 자연어화 → 청킹 파이프라인 실행
    added.forEach(fileObj => runFilePipeline(fileObj));

    // Simulate AI analysis → then load first new file
    setTimeout(() => {
      hideIntakeSkeleton();
      const firstNewIdx = uploadedFiles.length - files.length;
      loadFileData(firstNewIdx);
      showToast('AI 분석 및 실국 매칭이 완료되었습니다.');
      if (window.AIOneNotifications) window.AIOneNotifications.notifyLongTask('질의 분류 완료', 'AI 분석 및 실국 매칭이 완료되었습니다.', 'intake');

      // Update session info
      const session = sessions.find(s => s.id === activeSessionId);
      if (session) {
        session.files = uploadedFiles.map(f => f.name);
        session.queryCount = uploadedFiles.reduce((sum, file) => sum + getFileQueryCount(file), 0);
        session.memberCount = workspaceMemberCount;
        session.title = workspaceTitle;
      }
    }, 1500);
  }

  function getFileQueryCount(file) {
    const data = fileDataMap[file?.name];
    if (data?.queries?.length) return data.queries.length;
    const chunks = Number(file?.chunks || 0);
    return Math.max(1, Math.round(chunks * 0.55));
  }

  function renderFileList() {
    const summaryFileMemberCount = $('#uploadFileMemberCount');
    const currentMemberCount = Number.isFinite(Number(workspaceMemberCount)) ? Number(workspaceMemberCount) : 0;
    const isMatched = uploadedFiles.length === currentMemberCount;
    if (fileCount) fileCount.textContent = uploadedFiles.length + '건';
    const fileMemberRatio = $('#fileMemberRatio');
    if (fileMemberRatio) fileMemberRatio.textContent = uploadedFiles.length + '/' + currentMemberCount;
    if (summaryFileMemberCount) {
      summaryFileMemberCount.innerHTML = `<strong class="upload-summary-file-count ${isMatched ? 'match' : 'mismatch'}">${uploadedFiles.length}</strong> / <span class="upload-summary-member-count">${currentMemberCount}</span>`;
      summaryFileMemberCount.classList.toggle('matched', isMatched);
      summaryFileMemberCount.classList.toggle('mismatched', !isMatched);
    }

    const sortedFiles = uploadedFiles
      .map((file, index) => ({ file, index }))
      .sort((a, b) => Number(Boolean(b.file.pinned)) - Number(Boolean(a.file.pinned)) || a.index - b.index);

    if (!sortedFiles.length) {
      fileList.innerHTML = `<li class="file-list-empty"><div><strong>질의 업로드 목록이 없습니다.</strong><span>질의 파일을 업로드하면 이 영역에 목록이 표시됩니다.</span></div></li>`;
      return;
    }

    fileList.innerHTML = sortedFiles.map(({ file: f, index: i }) => `
      <li class="${i === activeFileIndex ? 'active' : ''}${f.pinned ? ' pinned' : ''}" data-file-idx="${i}">
        <button class="file-item-main" type="button" aria-label="${escapeHtml(f.displayName || f.name)} 파일 보기">
          <div class="file-icon ${f.type}${f.status && f.status !== 'done' ? ' processing' : ''}">${escapeHtml((f.type || '').toUpperCase())}</div>
          <div class="file-info">
            <span class="file-name" title="${escapeHtml(f.displayName || f.name)}">${escapeHtml(f.displayName || f.name)}</span>
            <span class="file-meta">${escapeHtml(f.size || '')}${f.pinned ? ' · 목록 고정' : ''}</span>
          </div>
        </button>
        <div class="file-item-side">
          ${renderFileStatusBadge(f)}
          <div class="file-action-wrap">
            <button class="file-more-btn" type="button" data-idx="${i}" aria-label="파일 옵션" aria-expanded="false" title="파일 옵션">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/></svg>
            </button>
            <div class="file-more-menu hidden" data-menu-idx="${i}">
              <button type="button" class="file-menu-item" data-action="pin" data-idx="${i}">${f.pinned ? '목록 고정 해제' : '목록 고정'}</button>
              <button type="button" class="file-menu-item danger" data-action="delete" data-idx="${i}">삭제</button>
            </div>
          </div>
        </div>
      </li>
    `).join('');

    $$('.file-list li[data-file-idx]', fileList).forEach(li => {
      li.addEventListener('click', (e) => {
        if (e.target.closest('.file-action-wrap')) return;
        const idx = parseInt(li.dataset.fileIdx, 10);
        loadFileData(idx);
      });
    });

    $$('.file-item-main', fileList).forEach(btn => {
      btn.addEventListener('click', () => {
        const li = btn.closest('li[data-file-idx]');
        if (!li) return;
        loadFileData(parseInt(li.dataset.fileIdx, 10));
      });
    });

    $$('.file-more-btn', fileList).forEach(btn => {
      btn.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        const idx = btn.dataset.idx;
        const menu = fileList.querySelector(`.file-more-menu[data-menu-idx="${idx}"]`);
        const willOpen = menu?.classList.contains('hidden');
        closeFileActionMenus();
        if (menu && willOpen) {
          menu.classList.remove('hidden');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    $$('.file-menu-item', fileList).forEach(btn => {
      btn.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        const idx = parseInt(btn.dataset.idx, 10);
        const action = btn.dataset.action;
        closeFileActionMenus();
        if (action === 'pin') toggleFilePinned(idx);
        if (action === 'delete') requestFileDelete(idx);
      });
    });
  }

  function closeFileActionMenus() {
    $$('.file-more-menu', fileList).forEach(menu => menu.classList.add('hidden'));
    $$('.file-more-btn', fileList).forEach(btn => btn.setAttribute('aria-expanded', 'false'));
  }

  function toggleFilePinned(index) {
    const file = uploadedFiles[index];
    if (!file) return;
    file.pinned = !file.pinned;
    renderFileList();
    showToast(file.pinned ? '파일을 목록 상단에 고정했습니다.' : '파일 고정을 해제했습니다.');
  }

  function requestFileDelete(index) {
    const file = uploadedFiles[index];
    if (!file) return;
    customConfirm('파일 삭제', `<strong>${escapeHtml(file.displayName || file.name)}</strong><br>질의 업로드 목록에서 삭제하시겠습니까?`, () => deleteUploadedFile(index), 'danger');
  }

  function deleteUploadedFile(index) {
    const file = uploadedFiles[index];
    if (!file) return;
    uploadedFiles.splice(index, 1);
    if (activeFileIndex >= uploadedFiles.length) activeFileIndex = Math.max(0, uploadedFiles.length - 1);
    renderFileList();
    if (uploadedFiles.length > 0) loadFileData(activeFileIndex);
    else resetAll({ full: false, showMessage: false });
    showToast('파일이 삭제되었습니다.');
  }

  function renderFileStatusBadge(f) {
    if (f.status === 'parsing') return `<span class="file-status parsing">파싱 중</span>`;
    if (f.status === 'summarizing') return `<span class="file-status summarizing">SLM 자연어화</span>`;
    if (f.status === 'chunking') return `<span class="file-status chunking">청킹 중</span>`;
    if (f.status === 'done') return `<span class="file-status-group final"><span class="file-status parsed">청킹 완료</span><span class="file-status query-count final">질의 ${getFileQueryCount(f)}건</span></span>`;
    return `<span class="file-status parsed">완료</span>`;
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
      docContent.innerHTML = `<pre style="white-space:pre-wrap;font-size:calc(13px * var(--ui-font-scale));line-height:1.8;color:var(--text)">${sampleDocText}</pre>`;
    } else {
      docContent.innerHTML = `<div class="original-doc">
        <div class="orig-header">
          <span class="orig-badge">원본 문서</span>
          <span class="orig-file">질의서_2026_0315.pdf</span>
        </div>
        <div class="orig-page">
          <div class="orig-page-header">
            <p class="orig-dept">국회예산정책처</p>
            <p class="orig-doc-type">질 의 서</p>
            <p class="orig-meta">수신: 재정경제부 장관 | 문서번호: 예정처-2026-0315 | 일자: 2026.03.15</p>
          </div>
          <div class="orig-body">
            <p class="orig-subject">제목: 2026년도 주요 재정정책 관련 질의</p>
            <br/>
            <p>1. 귀 부의 무궁한 발전을 기원합니다.</p>
            <br/>
            <p>2. 국회예산정책처에서는 2026년도 예산 및 기금운용계획안 분석을 위해 아래 사항에 대한 자료 제출 및 답변을 요청합니다.</p>
            <br/>
            <p class="orig-section-title">가. 질의사항</p>
            <p style="padding-left:16px">① 2026년도 예산편성지침 중 인건비 산정기준 변경사항에 대한 구체적 안내를 요청합니다. 특히 공무원 보수 인상률 적용 시점과 관련하여 세부 기준이 필요합니다.</p>
            <br/>
            <p style="padding-left:16px">② 지방자치단체 재정자립도 산정 시 세외수입 항목의 포함 여부와 관련 법령 해석에 대해 질의합니다. 현행 지방재정법 제36조의2와 시행령 간 해석 차이가 있어 명확한 입장을 확인하고자 합니다.</p>
            <br/>
            <p style="padding-left:16px">③ 공공기관 경영평가 시 비계량지표 평가방법론 개선에 관하여 귀 부처의 의견을 조회합니다. 최근 3년간 평가결과 분석자료도 함께 회신 부탁드립니다.</p>
            <br/>
            <p style="padding-left:16px">④ 외국환거래법 개정(2026.3.1. 시행)에 따른 해외직접투자 신고절차 변경사항에 대해 안내를 요청합니다.</p>
            <br/>
            <p style="padding-left:16px">⑤ 최근 기상이변으로 인한 농작물 피해 현황에 대한 자료를 요청합니다.</p>
            <br/>
            <p>3. 상기 사항에 대해 2026년 3월 29일까지 회신하여 주시기 바랍니다.</p>
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

  // 우측 "질의 추출 결과" 패널: 선택된 문장의 OCR 원문 · AI 요약 · 분류 결과 · 추천 실국 · 근거 · 신뢰도
  function renderQueryDetailPanel(queries) {
    const counter = $('#queryDetailCounter');
    if (counter) counter.textContent = queries.length ? `문장 ${activeQueryIndex + 1} / ${queries.length} 선택됨` : '';

    if (!queries.length) {
      docContent.innerHTML = `<div class="doc-placeholder"><svg viewBox="0 0 24 24" class="placeholder-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><p>문서를 업로드하면 분석 결과가 표시됩니다</p></div>`;
      return;
    }

    const q = queries[activeQueryIndex];
    const reason = getAIReason(q);
    const summary = getQuerySummary(q);
    const office = getRecommendOffice(q);
    const barColor = q.confidence >= 90 ? 'var(--green)' : q.confidence >= 75 ? 'var(--primary)' : 'var(--orange)';

    const sourcePage = 1;
    const sourceParagraph = activeQueryIndex + 1;

    docContent.innerHTML = `
      <div class="query-detail">
        <button class="source-link-card" id="sourceLinkCard" type="button" aria-label="원본 문서의 연결 위치로 이동">
          <div class="source-link-head">
            <div class="source-link-title-wrap">
              <span class="source-link-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.07.07l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15"/><path d="M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 12 20l1.15-1.15"/></svg>
              </span>
              <strong class="source-link-title">원문 연결 위치</strong>
            </div>
            <span class="source-link-location">${sourcePage}페이지 · 문단 ${sourceParagraph}</span>
          </div>
          <p class="source-link-text">“${q.text}”</p>
        </button>
        <div class="qd-section">
          <span class="qd-label">선택한 문장 (OCR 원문)</span>
          <div class="qd-box qd-box-ocr">
            <span class="qd-box-text">${q.text}</span>
            <button class="qd-copy-btn" data-copy="${encodeURIComponent(q.text)}" title="복사"><svg viewBox="0 0 24 24" width="12" height="12"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>복사</span></button>
          </div>
        </div>
        <div class="qd-section">
          <span class="qd-label">AI 질의 요약(질의 요지)</span>
          <div class="qd-box qd-box-summary">
            <span class="qd-box-text">${summary}</span>
            <button class="qd-copy-btn" data-copy="${encodeURIComponent(summary)}" title="복사"><svg viewBox="0 0 24 24" width="12" height="12"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>복사</span></button>
          </div>
        </div>
        <div class="qd-section">
          <span class="qd-label">분류 결과</span>
          <div class="qd-result-row">
            <span class="qd-type-badge ${q.type}">${q.typeLabel}</span>
            <span class="qd-org-text qd-org-main">주관: ${q.mainDept}</span>
            ${q.type === 'multi' && q.coopDept ? `<span class="qd-org-text qd-org-coop">협조: ${q.coopDept}</span>` : ''}
          </div>
        </div>
        <div class="qd-section">
          <span class="qd-label">추천 실국</span>
          <div class="qd-office-box">${office}</div>
        </div>
        <div class="qd-section">
          <span class="qd-label">AI 분류 근거</span>
          <p class="qd-reason-text">${reason}</p>
        </div>
        <div class="qd-confidence-section">
          <div class="qd-confidence-row">
            <span class="qd-confidence-label">신뢰도</span>
            <div class="qd-confidence-bar-wrap">
              <div class="qd-confidence-bar-fill" style="width:${q.confidence}%;background:${barColor}"></div>
            </div>
            <span class="qd-confidence-value">${q.confidence}%</span>
          </div>
          <div class="qd-nav-row">
            <button class="qd-nav-btn" id="qdPrevBtn" title="이전 문장" ${activeQueryIndex === 0 ? 'disabled' : ''}>‹ 이전</button>
            <button class="qd-nav-btn" id="qdNextBtn" title="다음 문장" ${activeQueryIndex === queries.length - 1 ? 'disabled' : ''}>다음 ›</button>
          </div>
        </div>
      </div>
    `;

    // 원문 연결 위치 클릭 → 원본 문서의 해당 문장으로 이동
    const sourceLinkCard = $('#sourceLinkCard');
    if (sourceLinkCard) {
      sourceLinkCard.addEventListener('click', () => {
        const originalBox = $(`.orig-query-box[data-qidx="${activeQueryIndex}"]`, $('#docOriginal'));
        if (!originalBox) return;
        originalBox.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        originalBox.classList.remove('source-link-focus');
        void originalBox.offsetWidth;
        originalBox.classList.add('source-link-focus');
        window.setTimeout(() => originalBox.classList.remove('source-link-focus'), 1400);
        showToast('원본 문장의 연결 위치로 이동했습니다.');
      });
    }

    // 복사 버튼
    $$('.qd-copy-btn', docContent).forEach(btn => {
      btn.addEventListener('click', () => {
        const val = decodeURIComponent(btn.dataset.copy);
        navigator.clipboard && navigator.clipboard.writeText(val).then(() => showToast('복사되었습니다.')).catch(() => showToast('복사되었습니다.'));
      });
    });

    // 이전/다음 문장 이동
    const prevBtn = $('#qdPrevBtn');
    const nextBtn = $('#qdNextBtn');
    if (prevBtn) prevBtn.addEventListener('click', () => {
      if (activeQueryIndex > 0) { activeQueryIndex--; renderDocContentForFile(); }
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
      if (activeQueryIndex < queries.length - 1) { activeQueryIndex++; renderDocContentForFile(); }
    });

    // 대응하는 질의목록 카드도 함께 강조
    const card = $(`.query-card[data-qid="${q.id}"]`, queryList);
    if (card) {
      $$('.query-card', queryList).forEach(c => c.classList.remove('mapped'));
      card.classList.add('mapped');
    }
  }

  // 요약 데이터가 없는 질의는 원문 기반으로 간단한 AI 요약을 생성
  function getQuerySummary(q) {
    if (q.summary) return q.summary;
    return q.text.replace(/(요청|질의|조회|입니다|합니다)\.?$/,'').trim() + '에 대한 AI 질의 요약';
  }

  // 추천 실국 표시용 소속 부서명 (마지막 세부 조직명)
  function getRecommendOffice(q) {
    if (q.type === 'none') return q.org || '해당없음';
    const officeMap = {
      '경제정책국': '경제정책국 · 거시경제심의관/종합정책과',
      '민생경제국': '민생경제국 · 민생경제총괄과/물가정책과',
      '경제구조개혁국': '경제구조개혁국 · 경제구조개혁총괄과/청년정책과',
      '혁신성장실': '혁신성장실 · 정책조정관/전략경제정책관',
      '세제실': '세제실 · 조세총괄정책관',
      '초혁신경제추진단': '초혁신경제추진단 · 기획총괄과',
      '조세개혁추진단': '조세개혁추진단 · 총괄기획팀',
      '수출플러스지원단': '수출플러스지원단 · 총괄기획팀',
      '정책금융기획관': '정책금융기획관',
      '기획조정실': '기획조정실 · 정책기획관',
      '국고실': '국고실 · 국고정책관/국채정책과',
      '국제금융국': '국제금융국 · 국제금융심의관/외환제도과',
      '국제경제관리관': '국제경제관리관',
      '대외경제국': '대외경제국 · 대외경제심의관',
      '개발금융국': '개발금융국 · 개발금융총괄과',
      '공공정책국': '공공정책국 · 공공혁신심의관',
      '해당없음': '비소관'
    };
    return officeMap[q.mainDept] || q.mainDept;
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
  function renderQueryList() {
    const filtered = currentFilter === 'all' ? sampleQueries : sampleQueries.filter(q => q.type === currentFilter);

    // 필터 버튼별 건수 카운팅
    const countAll = $('#filterCountAll');
    const countSingle = $('#filterCountSingle');
    const countMulti = $('#filterCountMulti');
    const countNone = $('#filterCountNone');
    if (countAll) countAll.textContent = sampleQueries.length;
    if (countSingle) countSingle.textContent = sampleQueries.filter(q => q.type === 'single').length;
    if (countMulti) countMulti.textContent = sampleQueries.filter(q => q.type === 'multi').length;
    if (countNone) countNone.textContent = sampleQueries.filter(q => q.type === 'none').length;

    queryList.innerHTML = filtered.map(q => {
      const reason = getAIReason(q);
      const barColor = q.confidence >= 90 ? 'var(--green)' : q.confidence >= 75 ? 'var(--primary)' : 'var(--orange)';
      const needsReview = q.confidence < 80;
      const reviewBadge = needsReview ? `<span class="query-review-badge">검토필요</span>` : '';
      return `
      <div class="query-card${needsReview ? ' needs-review' : ''}" data-qid="${q.id}" data-type="${q.type}">
        <div class="query-card-head">
          <span class="query-num ${q.type}">Q${q.id}</span>
          ${reviewBadge}
          <span class="query-type ${q.type}">${q.typeLabel}</span>
        </div>
        <div class="query-text">${q.text}</div>
        <div class="query-dept">
          <span class="dept-tag main">주관: ${q.mainDept}</span>
          ${q.coopDept ? `<span class="dept-tag">협조: ${q.coopDept}</span>` : ''}
          ${q.type === 'none' && q.org ? `<span class="dept-tag">비소관: ${q.org}</span>` : ''}
        </div>
        <div class="query-ai-reason">
          <span class="ai-reason-label">AI 분류 근거:</span>
          <span class="ai-reason-text">${reason}</span>
        </div>
        <div class="query-confidence-bar">
          <span class="confidence-label">신뢰도</span>
          <div class="confidence-bar-wrap">
            <div class="confidence-bar-fill" style="width:${q.confidence}%;background:${barColor}"></div>
          </div>
          <span class="confidence-value">${q.confidence}%</span>
        </div>
        ${q.conflict ? `<div class="query-conflict"><span class="conflict-icon">⚡</span><span class="conflict-text">룰 충돌: <strong>${q.conflict.ruleLabel}</strong> → ${q.conflict.ruleDept} / AI 추천 → ${q.conflict.aiDept}</span></div>` : ''}
        <div class="query-card-foot">
          <button class="query-edit-btn" data-qid="${q.id}">수정</button>
        </div>
      </div>`;
    }).join('');

    // Edit buttons
    $$('.query-edit-btn', queryList).forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const qid = parseInt(btn.dataset.qid);
        openEditModal(qid);
      });
    });

    // Card click → 원본 보기의 해당 번호 박스로 이동 + 상세 패널 갱신
    $$('.query-card', queryList).forEach(card => {
      card.addEventListener('click', () => {
        const qid = parseInt(card.dataset.qid);
        const idx = sampleQueries.findIndex(q => q.id === qid);
        if (idx === -1) return;
        activeQueryIndex = idx;
        renderDocContentForFile();
        const box = $(`.orig-query-box[data-qidx="${idx}"]`, $('#docOriginal'));
        if (box) box.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }

  function handleFilterChange(e) {
    currentFilter = e.detail.filter;
    renderQueryList();
  }

  // ─── Panel Layout / Reorder / Resize ───
  const LAYOUT_KEY = 'panel-layout-intake-v5';
  const DEFAULT_PANEL_ORDER = ['left', 'center', 'right'];
  const DEFAULT_PANEL_WIDTHS = { left: 300, right: 400 };
  const PANEL_MIN_WIDTHS = { left: 220, center: 340, right: 300 };

  function isResponsivePanelMode() {
    return window.matchMedia('(max-width: 1024px)').matches;
  }

  function getPanelKey(panel, index = 0) {
    return panel?.dataset?.panel || panel?.id || `panel-${index}`;
  }

  function getPanels(container = $('.three-panel')) {
    return container ? Array.from(container.querySelectorAll(':scope > .panel')) : [];
  }

  function getPanelHandles(container = $('.three-panel')) {
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

  function getCurrentPanelLayoutState(container = $('.three-panel')) {
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
    if (isResponsivePanelMode()) {
      container.style.removeProperty('grid-template-columns');
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

    const widths = fitPanelWidths(container, state.order, state.widthsByPanel || {});
    applyPanelWidths(container, widths);
  }

  function savePanelLayoutState(container = $('.three-panel')) {
    if (isResponsivePanelMode()) return;
    const state = getCurrentPanelLayoutState(container);
    if (state) localStorage.setItem(LAYOUT_KEY, JSON.stringify(state));
  }

  function restorePanelLayoutState(container = $('.three-panel')) {
    if (!container) return;
    const saved = localStorage.getItem(LAYOUT_KEY);
    if (!saved) return;
    try {
      applyPanelLayoutState(container, JSON.parse(saved));
    } catch (e) {
      localStorage.removeItem(LAYOUT_KEY);
    }
  }

  function getDefaultPanelLayoutState(container = $('.three-panel')) {
    const available = getAvailablePanelWidth(container);
    const centerWidth = Math.max(PANEL_MIN_WIDTHS.center, available - DEFAULT_PANEL_WIDTHS.left - DEFAULT_PANEL_WIDTHS.right);
    return {
      order: [...DEFAULT_PANEL_ORDER],
      widthsByPanel: { left: DEFAULT_PANEL_WIDTHS.left, center: centerWidth, right: DEFAULT_PANEL_WIDTHS.right }
    };
  }

  function setPanelCollapsed(panel, shouldCollapse) {
    const container = $('.three-panel');
    if (!panel || !container) return;
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
    const container = $('.three-panel');
    const state = getCurrentPanelLayoutState(container);
    if (!state) return;
    const nextOrder = [...state.order.slice(1), state.order[0]];
    applyPanelLayoutState(container, { order: nextOrder, widthsByPanel: state.widthsByPanel });
    savePanelLayoutState(container);
    showToast('패널 위치가 변경되었습니다.');
  }

  // ─── Panel Drag & Drop ───
  function initPanelDragDrop() {
    const container = $('.three-panel');
    if (!container) return;
    let draggedPanel = null;

    getPanels(container).forEach(panel => {
      const head = panel.querySelector('.panel-head') || panel.querySelector('.center-header');
      if (!head) return;
      head.style.cursor = 'grab';
      head.setAttribute('draggable', 'true');
      head.querySelectorAll('button, input, select, a, [contenteditable]').forEach(el => {
        el.setAttribute('draggable', 'false');
        el.addEventListener('pointerdown', event => event.stopPropagation());
        el.addEventListener('mousedown', event => event.stopPropagation());
        el.addEventListener('dragstart', event => event.preventDefault());
      });

      head.addEventListener('dragstart', e => {
        if (e.target.closest('button, input, select, a')) { e.preventDefault(); return; }
        draggedPanel = panel;
        container.classList.add('panel-dragging');
        panel.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/x-ai-one-panel', getPanelKey(panel));
      });

      head.addEventListener('dragend', () => {
        panel.style.opacity = '';
        draggedPanel = null;
        container.classList.remove('panel-dragging');
        getPanels(container).forEach(item => item.classList.remove('drag-over'));
      });
    });

    container.addEventListener('dragover', e => {
      if (!draggedPanel) return;
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';
      const target = e.target.closest('.panel');
      if (target && target !== draggedPanel) {
        getPanels(container).forEach(item => item.classList.remove('drag-over'));
        target.classList.add('drag-over');
      }
    });

    container.addEventListener('dragleave', e => {
      if (!draggedPanel) return;
      e.target.closest('.panel')?.classList.remove('drag-over');
    });

    container.addEventListener('drop', e => {
      if (!draggedPanel) return;
      e.preventDefault();
      e.stopPropagation();
      const target = e.target.closest('.panel');
      if (!target || target === draggedPanel) return;
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
    const container = $('.three-panel');
    if (!container) return;
    restorePanelLayoutState(container);

    container.addEventListener('mousedown', e => {
      const handle = e.target.closest('.panel-resize-handle');
      if (!handle || isResponsivePanelMode()) return;
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
    let wasResponsive = isResponsivePanelMode();
    if (wasResponsive) container.style.removeProperty('grid-template-columns');
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(() => {
        const responsive = isResponsivePanelMode();
        if (responsive) {
          container.style.removeProperty('grid-template-columns');
          lastContainerWidth = container.clientWidth;
          wasResponsive = true;
          return;
        }
        if (wasResponsive) {
          wasResponsive = false;
          const saved = localStorage.getItem(LAYOUT_KEY);
          if (saved) {
            try { applyPanelLayoutState(container, JSON.parse(saved)); }
            catch (e) { localStorage.removeItem(LAYOUT_KEY); applyPanelLayoutState(container, getDefaultPanelLayoutState(container)); }
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
      layoutResetBtn.addEventListener('pointerdown', stopResetInteraction);
      layoutResetBtn.addEventListener('click', (event) => {
        stopResetInteraction(event);
        localStorage.removeItem(LAYOUT_KEY);
        getPanels(container).forEach(panel => panel.classList.remove('panel-collapsed'));
        applyPanelLayoutState(container, getDefaultPanelLayoutState(container));
        clearPanelInteractionState();
        showToast('레이아웃이 기본값으로 초기화되었습니다.');
      });
    }
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

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getSortedSessions() {
    const normalizedTerm = runListSearchTerm.trim().toLowerCase();
    return [...sessions]
      .filter(session => !normalizedTerm || [
        session.title,
        session.date,
        session.time,
        ...(session.files || [])
      ].join(' ').toLowerCase().includes(normalizedTerm))
      .sort((a, b) => {
        const pinDiff = Number(Boolean(b.pinned)) - Number(Boolean(a.pinned));
        if (pinDiff) return pinDiff;
        const aDate = `${a.date || ''} ${a.time || ''}`;
        const bDate = `${b.date || ''} ${b.time || ''}`;
        return runListSortOrder === 'oldest' ? aDate.localeCompare(bDate) : bDate.localeCompare(aDate);
      });
  }

  function persistSessionPreferences() {
    try {
      const items = sessions.map(session => ({
        id: session.id,
        title: session.title,
        pinned: Boolean(session.pinned),
        memberCount: Number(session.memberCount || 0)
      }));
      localStorage.setItem(SESSION_PREF_KEY, JSON.stringify({ items }));
    } catch (error) {}
  }

  function hydrateSessionPreferences() {
    try {
      const saved = JSON.parse(localStorage.getItem(SESSION_PREF_KEY) || 'null');
      if (!saved || !Array.isArray(saved.items)) return;
      const baseMap = new Map(sessions.map(session => [session.id, session]));
      const restored = saved.items
        .map(item => {
          const session = baseMap.get(Number(item.id));
          if (!session) return null;
          session.title = String(item.title || session.title).trim() || session.title;
          session.pinned = Boolean(item.pinned);
          if (Number.isFinite(Number(item.memberCount))) session.memberCount = Number(item.memberCount);
          return session;
        })
        .filter(Boolean);
      sessions.splice(0, sessions.length, ...restored);
      if (!sessions.some(session => session.id === activeSessionId)) {
        activeSessionId = sessions[0]?.id ?? null;
      }
    } catch (error) {}
  }

  function renderDrawer() {
    const sortedSessions = getSortedSessions();
    $('#runCount').textContent = sessions.length + '건';
    const runListTotal = $('#runListTotal');
    if (runListTotal) runListTotal.textContent = String(sessions.length);
    $('#runList').innerHTML = sortedSessions.length ? sortedSessions.map(s => `
      <li class="run-item${s.id === activeSessionId ? ' active' : ''}${s.pinned ? ' pinned' : ''}" data-session="${s.id}" title="파일 ${(s.files || []).length}건 · 의원 ${Number(s.memberCount || 0)}명 · 질의 ${Number(s.queryCount || 0)}건">
        <button class="run-item-main" type="button" aria-label="${escapeHtml(s.title)} 실행 건 열기">
          <span class="run-dot ${s.status === 'done' ? '' : 'pending'}"></span>
          <div class="run-info">
            <span class="run-title-row">
              <span class="run-title">${escapeHtml(s.title)}</span>
              ${s.pinned ? '<span class="run-pinned-label" title="고정됨">고정</span>' : ''}
            </span>
            <span class="run-time">${escapeHtml(s.date)} ${escapeHtml(s.time)} <span class="run-session-status${s.status === 'done' ? '' : ' pending'}">${s.status === 'done' ? '완료' : '진행중'}</span></span>
            <span class="run-session-badges">
              <span class="run-session-badge file">파일 ${(s.files || []).length}건</span>
              <span class="run-session-badge member">의원 ${Number(s.memberCount || 0)}명</span>
              <span class="run-session-badge query">질의 ${Number(s.queryCount || 0)}건</span>
            </span>
          </div>
        </button>
        <div class="run-item-actions" aria-label="실행 건 관리">
          <div class="run-action-wrap">
            <button class="run-action-more-btn" type="button" data-session-more="${s.id}" aria-label="더보기" aria-expanded="false">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/></svg>
            </button>
            <div class="run-action-menu hidden" data-session-menu="${s.id}">
              <button class="run-menu-item" type="button" data-action="pin"><span class="run-menu-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m14 4 6 6-3 1-4 4-1 5-2-2 1-5 4-4-1-5z"/><path d="m5 19 5-5"/></svg></span><span class="run-menu-text">${s.pinned ? '목록 상단 고정 해제' : '목록 상단에 고정'}</span></button>
              <button class="run-menu-item" type="button" data-action="rename"><span class="run-menu-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg></span><span class="run-menu-text">제목 변경</span></button>
              <button class="run-menu-item danger" type="button" data-action="delete"><span class="run-menu-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6m3 0V4h8v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></span><span class="run-menu-text">삭제</span></button>
            </div>
          </div>
        </div>
      </li>
    `).join('') : `<li class="run-empty">${runListSearchTerm ? '검색 결과가 없습니다.' : '저장된 실행 건이 없습니다.'}</li>`;

    $$('.run-item', $('#runList')).forEach(item => {
      const sid = parseInt(item.dataset.session, 10);
      const mainButton = $('.run-item-main', item);
      if (mainButton) {
        mainButton.addEventListener('click', () => {
          loadSession(sid);
          closeDrawer();
        });
      }
      const moreBtn = $('.run-action-more-btn', item);
      const actionMenu = $('.run-action-menu', item);
      if (moreBtn && actionMenu) {
        moreBtn.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          const willOpen = actionMenu.classList.contains('hidden');
          closeRunActionMenus();
          if (willOpen) {
            actionMenu.classList.remove('hidden');
            moreBtn.setAttribute('aria-expanded', 'true');
          }
        });
      }
      $$('.run-menu-item', item).forEach(button => {
        button.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          const action = button.dataset.action;
          closeRunActionMenus();
          if (action === 'pin') toggleSessionPin(sid);
          if (action === 'rename') openSessionRenameModal(sid);
          if (action === 'delete') requestSessionDelete(sid);
        });
      });
    });

    $('#workLog').innerHTML = sampleLogs.map(l => `
      <li>
        <span class="log-time">${escapeHtml(l.time)}</span>
        ${escapeHtml(l.msg)}
      </li>
    `).join('');
  }


  function closeRunActionMenus() {
    $$('.run-action-menu', $('#runList')).forEach(menu => menu.classList.add('hidden'));
    $$('.run-action-more-btn', $('#runList')).forEach(btn => btn.setAttribute('aria-expanded', 'false'));
  }

  function toggleSessionPin(sid) {
    const session = sessions.find(item => item.id === sid);
    if (!session) return;
    session.pinned = !session.pinned;
    persistSessionPreferences();
    renderDrawer();
    showToast(session.pinned ? '실행 건을 목록 상단에 고정했습니다.' : '실행 건 고정을 해제했습니다.');
  }

  function openSessionRenameModal(sid) {
    const session = sessions.find(item => item.id === sid);
    if (!session) return;
    let modal = $('#customModalBackdrop');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'customModalBackdrop';
      modal.className = 'custom-modal-backdrop';
      document.body.appendChild(modal);
    }
    modal.innerHTML = `<div class="custom-modal session-rename-modal">
      <div class="custom-modal-icon confirm">✎</div>
      <div class="custom-modal-title">실행 건 제목 변경</div>
      <div class="custom-modal-msg">목록에서 구분하기 쉬운 제목으로 변경할 수 있습니다.</div>
      <label class="session-rename-label" for="sessionRenameInput">실행 건 제목</label>
      <input class="session-rename-input" id="sessionRenameInput" type="text" maxlength="60" value="${escapeHtml(session.title)}" autocomplete="off" />
      <div class="session-rename-error hidden" id="sessionRenameError">제목을 입력해 주세요.</div>
      <div class="custom-modal-actions"><button class="btn-cancel" id="sessionRenameCancel">취소</button><button class="btn-confirm" id="sessionRenameSave">저장</button></div>
    </div>`;
    modal.classList.remove('hidden');
    const input = $('#sessionRenameInput');
    const close = () => modal.classList.add('hidden');
    const save = () => {
      const title = String(input?.value || '').trim();
      const error = $('#sessionRenameError');
      if (!title) {
        error?.classList.remove('hidden');
        input?.focus();
        return;
      }
      session.title = title;
      persistSessionPreferences();
      close();
      renderDrawer();
      showToast('실행 건 제목을 변경했습니다.');
    };
    $('#sessionRenameCancel')?.addEventListener('click', close);
    $('#sessionRenameSave')?.addEventListener('click', save);
    input?.addEventListener('input', () => $('#sessionRenameError')?.classList.add('hidden'));
    input?.addEventListener('keydown', event => {
      if (event.key === 'Enter') save();
      if (event.key === 'Escape') close();
    });
    modal.onclick = event => { if (event.target === modal) close(); };
    setTimeout(() => { input?.focus(); input?.select(); }, 0);
  }

  function requestSessionDelete(sid) {
    const session = sessions.find(item => item.id === sid);
    if (!session) return;
    customConfirm(
      '실행 건 삭제',
      `<strong>${escapeHtml(session.title)}</strong><br>실행 건과 목록 이력을 삭제하시겠습니까?`,
      () => deleteSession(sid),
      'danger'
    );
  }

  function deleteSession(sid) {
    const index = sessions.findIndex(item => item.id === sid);
    if (index < 0) return;
    const [deleted] = sessions.splice(index, 1);
    persistSessionPreferences();

    if (activeSessionId === sid) {
      const nextSession = getSortedSessions()[0];
      if (nextSession) {
        loadSession(nextSession.id);
      } else {
        activeSessionId = null;
        resetAll({ full: false, showMessage: false });
      }
    }
    renderDrawer();
    showToast(`"${deleted.title}" 실행 건을 삭제했습니다.`);
  }

  function loadSession(sid) {
    const session = sessions.find(s => s.id === sid);
    if (!session) return;
    activeSessionId = sid;
    workspaceTitle = session.title || workspaceTitle;
    workspaceMemberCount = Number.isFinite(Number(session.memberCount)) ? Number(session.memberCount) : 0;
    renderWorkspaceMeta();
    try { localStorage.setItem(WORKSPACE_META_KEY, JSON.stringify({ title: workspaceTitle, memberCount: workspaceMemberCount })); } catch (error) {}

    // Load files from session
    uploadedFiles = session.files.map(name => {
      const ext = name.split('.').pop().toLowerCase();
      let type = 'txt';
      if (ext === 'pdf') type = 'pdf';
      else if (ext === 'hwp') type = 'hwp';
      else if (ext === 'docx') type = 'docx';
      else if (['png','jpg','jpeg'].includes(ext)) type = 'img';
      return { name, type, size: '1.0MB', status: 'done', chunks: Math.floor(Math.random() * 10) + 6 };
    });

    activeFileIndex = 0;
    renderFileList();
    if (uploadedFiles.length > 0) {
      loadFileData(0);
    } else {
      sampleQueries.length = 0;
      docContent.innerHTML = `<div class="doc-placeholder"><svg viewBox="0 0 24 24" class="placeholder-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><p>문서를 업로드하면 여기에 표시됩니다</p></div>`;
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
    $('#editType').value = ['single', 'multi', 'none'].includes(editingQuery.type) ? editingQuery.type : 'single';
    $('#editMainDept').value = editingQuery.mainDept;
    $('#editCoopDept').value = editingQuery.coopDept;
    $('#editOrg').value = '재정경제부';
    editModal.classList.remove('hidden');
  }

  function closeEditModal() {
    editModal.classList.add('hidden');
    editingQuery = null;
  }

  function applyEdit() {
    if (!editingQuery) return;
    const typeMap = { single: '단일소관', multi: '복수소관', none: '비소관' };
    editingQuery.text = $('#editQueryText').value;
    editingQuery.type = $('#editType').value;
    editingQuery.typeLabel = typeMap[$('#editType').value] || '단일소관';
    editingQuery.mainDept = $('#editMainDept').value;
    editingQuery.coopDept = $('#editCoopDept').value;
    editingQuery.org = '재정경제부';
    closeEditModal();
    renderQueryList();
    renderDocContent();
    showToast('매칭부서가 수정되었습니다.');
  }

  function clearPanelInteractionState() {
    $$('.panel').forEach(panel => {
      panel.classList.remove('drag-over', 'panel-selected', 'selected');
      panel.style.opacity = '';
    });
    $$('.panel-resize-handle.active, .doc-split-handle.active').forEach(handle => handle.classList.remove('active'));
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection && selection.removeAllRanges) selection.removeAllRanges();
    }
    const activeElement = document.activeElement;
    if (activeElement && typeof activeElement.blur === 'function') activeElement.blur();
  }

  function stopResetInteraction(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    clearPanelInteractionState();
  }

  function requestAiReclassification() {
    if (!uploadedFiles.length || !sampleQueries.length) {
      showToast('재분류할 질의가 없습니다.');
      return;
    }

    customConfirm(
      'AI 재분류',
      'AI 재분류를 실행하면 사용자가 수정한 담당실국 및 협조실국이 AI 추천 결과로 다시 변경됩니다.<br>계속하시겠습니까?',
      executeAiReclassification,
      'danger'
    );
  }

  function executeAiReclassification() {
    const activeFile = uploadedFiles[activeFileIndex];
    const sourceData = activeFile ? fileDataMap[activeFile.name] : null;
    showIntakeSkeleton('AI가 질의와 실국 정보를 다시 분류하고 있습니다...');

    setTimeout(() => {
      const baselineById = new Map((sourceData?.queries || []).map(query => [query.id, query]));
      sampleQueries.forEach(query => {
        const baseline = baselineById.get(query.id);
        if (!baseline) {
          query.confidence = Math.max(70, Math.min(99, Number(query.confidence || 80)));
          return;
        }
        query.type = baseline.type;
        query.typeLabel = baseline.typeLabel;
        query.mainDept = baseline.mainDept;
        query.coopDept = baseline.coopDept;
        query.org = baseline.org;
        query.confidence = baseline.confidence;
        query.conflict = baseline.conflict ? { ...baseline.conflict } : undefined;
      });

      hideIntakeSkeleton();
      activeQueryIndex = Math.min(activeQueryIndex, Math.max(0, sampleQueries.length - 1));
      renderDocContentForFile();
      renderQueryList();
      if (activeFile) {
        fileConfirmState[activeFile.name] = 'confirm';
        delete confirmedQuerySnapshots[activeFile.name];
        updateConfirmBtnUI();
      }
      showToast('AI 재분류가 완료되었습니다.');
      if (window.AIOneNotifications) {
        window.AIOneNotifications.notifyLongTask(
          '질의 재분류 완료',
          '수정된 질의의 담당실국 및 협조실국이 AI 추천 결과로 갱신되었습니다.',
          'intake'
        );
      }
    }, 1100);
  }

  // ─── 실국별 알림 담당자 설정 ───
  function buildDefaultNotificationAssignments() {
    return notificationDepartmentDirectory.reduce((result, group) => {
      result[group.dept] = group.staff.slice(0, 2).map(person => person.id);
      return result;
    }, {});
  }

  function loadNotificationAssignees() {
    const defaults = buildDefaultNotificationAssignments();
    notificationDepartmentAssignments = { ...defaults };
    try {
      const saved = JSON.parse(localStorage.getItem(NOTIFICATION_ASSIGNEE_KEY) || '{}');
      if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return;
      notificationDepartmentDirectory.forEach(group => {
        const validIds = new Set(group.staff.map(person => person.id));
        const selected = Array.isArray(saved[group.dept])
          ? [...new Set(saved[group.dept])].filter(id => validIds.has(id))
          : [];
        notificationDepartmentAssignments[group.dept] = Array.isArray(saved[group.dept])
          ? selected
          : defaults[group.dept];
      });
    } catch (error) {
      notificationDepartmentAssignments = defaults;
    }
  }

  function saveNotificationAssignees() {
    try {
      localStorage.setItem(NOTIFICATION_ASSIGNEE_KEY, JSON.stringify(notificationDepartmentAssignments));
    } catch (error) {}
    updateNotificationAssigneeButton();
  }

  function getNotificationDepartmentGroup(dept) {
    return notificationDepartmentDirectory.find(group => group.dept === dept) || null;
  }

  function getNotificationDepartmentsForQueries(queries = sampleQueries) {
    const departments = [];
    (queries || []).forEach(query => {
      [...splitNotificationDepartments(query.mainDept), ...splitNotificationDepartments(query.coopDept)].forEach(dept => {
        if (!departments.includes(dept)) departments.push(dept);
      });
    });
    return departments;
  }

  function getNotificationRoutingForQueries(queries = sampleQueries) {
    const sourceQueries = Array.isArray(queries) ? queries : [];
    const departments = getNotificationDepartmentsForQueries(sourceQueries).map(dept => {
      const group = getNotificationDepartmentGroup(dept);
      const selectedIds = Array.isArray(notificationDepartmentAssignments[dept])
        ? notificationDepartmentAssignments[dept]
        : [];
      const recipients = group
        ? group.staff.filter(person => selectedIds.includes(person.id)).map(person => ({ ...person, dept }))
        : [];
      const matchedQueries = sourceQueries.flatMap((query, index) => {
        const roles = [];
        if (splitNotificationDepartments(query.mainDept).includes(dept)) roles.push('담당');
        if (splitNotificationDepartments(query.coopDept).includes(dept)) roles.push('협조');
        if (!roles.length) return [];
        return [{
          id: query.id,
          number: query.number || index + 1,
          title: query.summary || query.text || `질의 ${index + 1}`,
          role: roles.join('·')
        }];
      });
      return { dept, recipients, queries: matchedQueries, configured: recipients.length > 0 };
    });
    const uniqueRecipients = [];
    const recipientKeys = new Set();
    departments.forEach(route => {
      route.recipients.forEach(person => {
        const key = `${route.dept}:${person.id}`;
        if (recipientKeys.has(key)) return;
        recipientKeys.add(key);
        uniqueRecipients.push(person);
      });
    });
    return { departments, recipients: uniqueRecipients };
  }

  function updateNotificationAssigneeButton() {
    const button = $('#notificationAssigneeBtn');
    if (!button) return;

    const configuredDepartmentCount = notificationDepartmentDirectory.filter(group => {
      const selected = notificationDepartmentAssignments[group.dept] || [];
      return selected.length > 0;
    }).length;

    button.classList.toggle('has-assignee', configuredDepartmentCount > 0);
    button.title = '실국별 알림 담당자 설정';
  }

  function openNotificationAssigneeModal() {
    let modal = $('#customModalBackdrop');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'customModalBackdrop';
      modal.className = 'custom-modal-backdrop';
      document.body.appendChild(modal);
    }

    const workingAssignments = notificationDepartmentDirectory.reduce((result, group) => {
      const saved = notificationDepartmentAssignments[group.dept];
      result[group.dept] = Array.isArray(saved)
        ? [...saved]
        : group.staff.slice(0, 2).map(person => person.id);
      return result;
    }, {});

    modal.innerHTML = `<div class="custom-modal notification-assignee-modal notification-dept-modal">
      <div class="notification-modal-head">
        <div>
          <div class="custom-modal-title notification-modal-title">실국별 알림 담당자 설정</div>
          <div class="notification-modal-desc">재정경제부 조직도 기준으로 알림을 받을 실국담당자를 지정합니다. 주관국·협조국 확정 후 지정된 담당자에게 알림이 전송됩니다.</div>
        </div>
        <button class="notification-modal-close" id="notificationModalClose" type="button" aria-label="닫기">×</button>
      </div>
      <div class="notification-process-note">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="9"/></svg>
        <span>재정경제부 조직도에서 부총리·차관 소관 조직을 선택한 후 실국별 알림 담당자를 지정합니다. 질의 확정 시 주관국·협조국을 기준으로 수신자가 자동 설정됩니다.</span>
      </div>
      <div class="notification-org-layout">
        <aside class="notification-org-panel" aria-label="조직 선택">
          <div class="notification-org-panel-title">조직 선택</div>
          <div class="notification-org-list" id="notificationOrgList"></div>
        </aside>
        <section class="notification-dept-panel">
          <div class="notification-dept-toolbar">
            <label class="notification-dept-search" for="notificationDeptSearch">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>
              <input id="notificationDeptSearch" type="search" placeholder="실국명 또는 담당자 검색" autocomplete="off">
              <button id="notificationDeptSearchClear" class="notification-dept-search-clear hidden" type="button" aria-label="검색어 지우기">×</button>
            </label>
            <div class="notification-dept-result" id="notificationDeptResult"></div>
          </div>
          <div class="notification-dept-grid" id="notificationDeptGrid"></div>
        </section>
      </div>
      <div class="notification-dept-feedback" id="notificationDeptFeedback" aria-live="polite"></div>
      <div class="custom-modal-actions notification-modal-actions">
        <button class="btn-cancel" id="notificationModalCancel">취소</button>
        <button class="btn-confirm" id="notificationModalSave">설정 저장</button>
      </div>
    </div>`;
    modal.classList.remove('hidden');

    const grid = $('#notificationDeptGrid');
    const orgList = $('#notificationOrgList');
    const deptSearch = $('#notificationDeptSearch');
    const deptSearchClear = $('#notificationDeptSearchClear');
    const deptResult = $('#notificationDeptResult');
    const feedback = $('#notificationDeptFeedback');
    let selectedOrganization = 'all';
    let departmentSearchTerm = '';
    const setFeedback = (message = '', type = '') => {
      if (!feedback) return;
      feedback.textContent = message;
      feedback.className = `notification-dept-feedback${type ? ` ${type}` : ''}`;
    };

    const getVisibleDepartments = () => {
      const normalizedTerm = departmentSearchTerm.trim().toLowerCase();
      return notificationDepartmentDirectory.filter(group => {
        const organizationMatched = selectedOrganization === 'all'
          || (selectedOrganization.startsWith('org:') && group.organization === selectedOrganization.slice(4))
          || (selectedOrganization.startsWith('dept:') && group.dept === selectedOrganization.slice(5));
        if (!organizationMatched) return false;
        if (!normalizedTerm) return true;
        const searchable = [
          group.organization,
          group.dept,
          ...(group.subunits || []),
          ...group.staff.flatMap(person => [person.name, person.position])
        ].join(' ').toLowerCase();
        return searchable.includes(normalizedTerm);
      });
    };

    const expandedOrganizations = new Set(notificationOrganizationOrder);
    const renderOrganizationList = () => {
      if (!orgList) return;
      const specialItems = [
        { key: 'all', label: '전체 조직', count: notificationDepartmentDirectory.length }
      ];
      const specialHtml = specialItems.map(item => {
        const selected = selectedOrganization === item.key;
        return `<button class="notification-org-item notification-tree-special${selected ? ' selected' : ''}" type="button" data-organization="${escapeHtml(item.key)}" aria-pressed="${selected}">
          <span>${escapeHtml(item.label)}</span><strong>${item.count}</strong>
        </button>`;
      }).join('');
      const treeHtml = notificationOrganizationOrder.map(organization => {
        const groups = notificationDepartmentDirectory.filter(group => group.organization === organization);
        const expanded = expandedOrganizations.has(organization);
        const orgKey = `org:${organization}`;
        const orgSelected = selectedOrganization === orgKey;
        return `<div class="notification-tree-group${expanded ? ' expanded' : ''}">
          <button class="notification-tree-parent${orgSelected ? ' selected' : ''}" type="button" data-tree-org="${escapeHtml(organization)}" aria-expanded="${expanded}" aria-pressed="${orgSelected}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>
            <span>${escapeHtml(organization)}</span><strong>${groups.length}</strong>
          </button>
          <div class="notification-tree-children${expanded ? '' : ' hidden'}">
            ${groups.map(group => {
              const deptKey = `dept:${group.dept}`;
              const selected = selectedOrganization === deptKey;
              return `<button class="notification-tree-leaf${selected ? ' selected' : ''}" type="button" data-tree-dept="${escapeHtml(group.dept)}" aria-pressed="${selected}">
                <span>${escapeHtml(group.dept)}</span>
              </button>`;
            }).join('')}
          </div>
        </div>`;
      }).join('');
      orgList.innerHTML = specialHtml + treeHtml;
      $$('.notification-tree-special', orgList).forEach(button => {
        button.addEventListener('click', () => {
          selectedOrganization = button.dataset.organization || 'all';
          setFeedback('');
          renderDepartmentSettings();
        });
      });
      $$('.notification-tree-parent', orgList).forEach(button => {
        button.addEventListener('click', () => {
          const organization = button.dataset.treeOrg || '';
          if (!organization) return;
          if (expandedOrganizations.has(organization)) expandedOrganizations.delete(organization);
          else expandedOrganizations.add(organization);
          selectedOrganization = `org:${organization}`;
          setFeedback('');
          renderDepartmentSettings();
        });
      });
      $$('.notification-tree-leaf', orgList).forEach(button => {
        button.addEventListener('click', event => {
          event.stopPropagation();
          selectedOrganization = `dept:${button.dataset.treeDept || ''}`;
          setFeedback('');
          renderDepartmentSettings();
        });
      });
    };

    const renderDepartmentSettings = () => {
      renderOrganizationList();
      const visibleDepartments = getVisibleDepartments();
      if (deptResult) {
        const organizationLabel = selectedOrganization === 'all' ? '전체 조직'
          : selectedOrganization.startsWith('org:') ? selectedOrganization.slice(4)
          : selectedOrganization.startsWith('dept:') ? selectedOrganization.slice(5)
          : selectedOrganization;
        deptResult.textContent = `${organizationLabel} · ${visibleDepartments.length}개 조직`;
      }
      if (deptSearchClear) deptSearchClear.classList.toggle('hidden', !departmentSearchTerm);

      if (!visibleDepartments.length) {
        grid.innerHTML = `<div class="notification-dept-empty">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>
          <strong>조건에 맞는 실국이 없습니다.</strong>
          <span>다른 조직을 선택하거나 검색어를 변경해 주세요.</span>
        </div>`;
        return;
      }

      grid.innerHTML = visibleDepartments.map(group => {
        const groupIndex = notificationDepartmentDirectory.indexOf(group);
        const selectedIds = workingAssignments[group.dept] || [];
        return `<section class="notification-dept-card" data-dept-index="${groupIndex}">
          <div class="notification-dept-card-head">
            <div class="notification-dept-heading">
              <span class="notification-dept-org">${escapeHtml(group.organization)}</span>
              <div class="notification-dept-name">${escapeHtml(group.dept)}</div>
            </div>
            <span class="notification-dept-count">${selectedIds.length}명</span>
          </div>
          ${(group.subunits || []).length ? `<div class="notification-dept-subunits" title="${escapeHtml((group.subunits || []).join(' · '))}">${(group.subunits || []).map(unit => `<span>${escapeHtml(unit)}</span>`).join('')}</div>` : ''}
          <div class="notification-dept-staff-list">
            ${group.staff.map(person => {
              const selected = selectedIds.includes(person.id);
              return `<button class="notification-dept-staff${selected ? ' selected' : ''}" type="button" data-dept-index="${groupIndex}" data-person-id="${person.id}" aria-pressed="${selected}">
                <span class="notification-assignee-avatar">${escapeHtml(person.name.slice(0, 1))}</span>
                <span class="notification-assignee-info">
                  <span class="notification-assignee-name">${escapeHtml(person.name)} ${escapeHtml(person.position)}</span>
                  <span class="notification-assignee-meta">${escapeHtml(group.dept)}${selected ? ' · 실국담당자' : ''}</span>
                </span>
                <span class="notification-check" aria-hidden="true">${selected ? '✓' : ''}</span>
              </button>`;
            }).join('')}
          </div>
        </section>`;
      }).join('');

      $$('.notification-dept-staff', grid).forEach(button => {
        button.addEventListener('click', () => {
          const group = notificationDepartmentDirectory[Number(button.dataset.deptIndex)];
          if (!group) return;
          const personId = button.dataset.personId;
          const selectedIds = workingAssignments[group.dept] || [];
          const isSelected = selectedIds.includes(personId);
          workingAssignments[group.dept] = isSelected
            ? selectedIds.filter(id => id !== personId)
            : [...selectedIds, personId];
          setFeedback(`${group.dept} 담당자 ${workingAssignments[group.dept].length}명이 지정되었습니다.`, 'success');
          renderDepartmentSettings();
        });
      });
    };

    deptSearch?.addEventListener('input', () => {
      departmentSearchTerm = deptSearch.value || '';
      renderDepartmentSettings();
    });
    deptSearchClear?.addEventListener('click', () => {
      departmentSearchTerm = '';
      if (deptSearch) {
        deptSearch.value = '';
        deptSearch.focus();
      }
      renderDepartmentSettings();
    });

    const close = () => modal.classList.add('hidden');
    $('#notificationModalClose')?.addEventListener('click', close);
    $('#notificationModalCancel')?.addEventListener('click', close);
    $('#notificationModalSave')?.addEventListener('click', () => {
      notificationDepartmentAssignments = Object.fromEntries(
        Object.entries(workingAssignments).map(([dept, ids]) => [dept, [...ids]])
      );
      saveNotificationAssignees();
      close();
      showToast(`조직 ${notificationDepartmentDirectory.length}개의 알림 담당자 설정을 저장했습니다.`);
    });
    modal.onclick = event => { if (event.target === modal) close(); };
    renderDepartmentSettings();
  }

  // ─── Reset ───
  function resetWorkspaceMetaToDefault() {
    workspaceTitle = '제목없는 국회질의';
    workspaceMemberCount = 0;
    saveWorkspaceMeta();
    renderWorkspaceMeta();
  }

  function resetAll(options = {}) {
    const { full = false, showMessage = true, resetWorkspaceMeta = false } = options;

    uploadedFiles = [];
    sampleQueries.length = 0;
    activeFileIndex = 0;
    activeQueryIndex = 0;
    currentFilter = 'all';
    editingQuery = null;
    lastDocText = '';

    const fileInput = $('#fileInput');
    if (fileInput) fileInput.value = '';
    if (resetWorkspaceMeta) resetWorkspaceMetaToDefault();
    renderFileList();

    const docOriginal = $('#docOriginal');
    if (docOriginal) {
      docOriginal.innerHTML = `<div class="doc-placeholder"><svg viewBox="0 0 24 24" class="placeholder-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><p>문서를 업로드하면 원본이 표시됩니다</p></div>`;
      docOriginal.style.removeProperty('--doc-zoom-scale');
    }

    docContent.innerHTML = `<div class="doc-placeholder"><svg viewBox="0 0 24 24" class="placeholder-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><p>문서를 업로드하면 질의 추출 결과가 표시됩니다</p></div>`;
    queryList.innerHTML = `<div class="doc-placeholder" style="padding:40px 20px"><svg viewBox="0 0 24 24" class="placeholder-icon"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg><p>질의 분류 결과가 여기에 표시됩니다</p></div>`;

    const statExtracted = $('#statExtracted');
    if (statExtracted) statExtracted.textContent = '0';
    ['filterCountAll', 'filterCountSingle', 'filterCountMulti', 'filterCountNone'].forEach(id => {
      const el = $('#' + id);
      if (el) el.textContent = '0';
    });
    $$('.filter-btn').forEach(btn => {
      const isActive = btn.dataset.filter === 'all';
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });

    const fileName = $('#activeFileName');
    if (fileName) fileName.textContent = '파일을 선택하세요';

    updateDocStatusBar('');

    if (full) {
      documentZoom = 100;
      updateDocStatusBar('');

      Object.keys(fileConfirmState).forEach(key => delete fileConfirmState[key]);
      updateConfirmBtnUI();

      const comparePanel = $('.panel-center.doc-compare-fullscreen');
      if (comparePanel) comparePanel.classList.remove('doc-compare-fullscreen');
      document.body.classList.remove('doc-compare-fullscreen-open');
      const docFitBtn = $('#docFitBtn');
      if (docFitBtn) {
        docFitBtn.classList.remove('active');
        docFitBtn.setAttribute('aria-pressed', 'false');
        docFitBtn.setAttribute('title', '질의 원본 · 결과 비교 전체보기');
        docFitBtn.setAttribute('aria-label', '질의 원본 · 결과 비교 전체보기');
      }

      document.body.classList.remove('fullscreen-mode');
      const topbarLogoBtn = $('#topbarLogoBtn');
      if (topbarLogoBtn) topbarLogoBtn.classList.add('hidden');

      closeDrawer();
      const ruleDrawer = $('#ruleDrawer');
      const ruleBackdrop = $('#ruleDrawerBackdrop');
      if (ruleDrawer) ruleDrawer.classList.add('hidden');
      if (ruleBackdrop) ruleBackdrop.classList.add('hidden');
    }

    clearPanelInteractionState();

    if (showMessage) {
      showToast(full ? '전체 초기화되었습니다.' : '질의 업로드 패널이 초기화되었습니다.');
    }
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

  // Topbar logo click → exit fullscreen
  const topbarLogoBtn = $('#topbarLogoBtn');
  if (topbarLogoBtn) {
    topbarLogoBtn.addEventListener('click', () => {
      document.body.classList.remove('fullscreen-mode');
      topbarLogoBtn.classList.add('hidden');
      showToast('일반 모드');
    });
  }

  // ─── Confirm/Notify State per File ───
  // States: 'confirm' | 'notify' | 'done'
  const fileConfirmState = {};
  const confirmedQuerySnapshots = {};

  function getActiveConfirmKey() {
    const activeFile = uploadedFiles[activeFileIndex];
    return activeFile?.name || `session-${activeSessionId || 'current'}`;
  }

  function createConfirmedQuerySnapshot() {
    return sampleQueries.map((query, index) => ({
      id: query.id,
      number: index + 1,
      text: query.text,
      summary: query.summary || query.text,
      type: query.type,
      typeLabel: query.typeLabel,
      mainDept: splitNotificationDepartments(query.mainDept).join(', '),
      coopDept: splitNotificationDepartments(query.coopDept).join(', ')
    }));
  }

  function handleConfirmBtn() {
    const btn = $('#confirmBtn');
    if (!btn) return;
    const fileKey = getActiveConfirmKey();
    const state = fileConfirmState[fileKey] || 'confirm';

    if (state === 'confirm') {
      customConfirm('질의 확정', '질의 및 실국을 확정하시겠습니까?', () => {
        const snapshot = createConfirmedQuerySnapshot();
        confirmedQuerySnapshots[fileKey] = snapshot;
        fileConfirmState[fileKey] = 'notify';
        updateConfirmBtnUI();
        updateNotificationAssigneeButton();
        const routing = getNotificationRoutingForQueries(snapshot);
        showToast(`질의 ${snapshot.length}건이 확정되었습니다. 배정 실국 ${routing.departments.length}개가 알림 대상으로 설정되었습니다.`);
      });
      return;
    }

    if (state !== 'notify') return;

    const confirmedQueries = confirmedQuerySnapshots[fileKey] || [];
    if (!confirmedQueries.length) {
      showToast('확정된 질의 정보가 없습니다. 질의를 다시 확정해 주세요.');
      fileConfirmState[fileKey] = 'confirm';
      updateConfirmBtnUI();
      return;
    }

    const routing = getNotificationRoutingForQueries(confirmedQueries);
    const queryCards = confirmedQueries.map((query, index) => {
      const assignedDepartments = [];
      splitNotificationDepartments(query.mainDept).forEach(dept => assignedDepartments.push({ dept, role: '담당' }));
      splitNotificationDepartments(query.coopDept).forEach(dept => {
        if (!assignedDepartments.some(item => item.dept === dept && item.role === '협조')) {
          assignedDepartments.push({ dept, role: '협조' });
        }
      });

      const departmentRows = assignedDepartments.map(item => {
        const route = routing.departments.find(entry => entry.dept === item.dept);
        const recipients = route?.recipients || [];
        const recipientNames = recipients.length
          ? recipients.map(person => `${person.name} ${person.position}`).join(', ')
          : '지정된 실국담당자 없음';
        return `<div class="notification-query-dept-row">
          <span class="notification-route-query-role">${escapeHtml(item.role)}</span>
          <strong class="notification-query-dept-name">${escapeHtml(item.dept)}</strong>
          <span class="notification-query-recipient-count">${recipients.length}명</span>
          <span class="notification-query-recipient-names">${escapeHtml(recipientNames)}</span>
        </div>`;
      }).join('');

      return `<section class="notification-query-match-card">
        <div class="notification-query-match-head">
          <span class="notification-route-query-no">질의 ${query.number || index + 1}</span>
          <strong>${escapeHtml(query.summary || query.text || `질의 ${index + 1}`)}</strong>
        </div>
        <div class="notification-query-dept-list">${departmentRows || '<div class="notification-query-dept-empty">배정된 실국이 없습니다.</div>'}</div>
      </section>`;
    }).join('');

    const queryCount = confirmedQueries.length;
    const departmentCount = routing.departments.length;
    const recipientCount = routing.recipients.length;

    customConfirm(
      '확정 질의 · 실국알림 대상',
      `<div class="notification-route-overview"><strong>확정 질의 ${queryCount}건</strong><span>배정 실국 ${departmentCount}개 · 알림 대상 ${recipientCount}명</span></div><div class="notification-route-summary notification-query-route-summary">${queryCards}</div><div class="notification-route-api-note">질의별 배정 실국과 해당 실국의 알림 담당자 인원수 및 담당자명을 확인한 후 알림전송 버튼을 눌러 주세요.</div>`,
      () => {
        customAlert('실국알림 전송 안내', `확정된 질의 ${queryCount}건의 배정 실국 담당자 ${recipientCount}명에게 알림을 전송합니다.`);
        const confirmButton = $('#confirmBtn');
        if (confirmButton) {
          confirmButton.disabled = true;
          confirmButton.textContent = '알림전송중...';
        }
        showToast('AI 에이전트가 브리티 메신저 연계 API를 호출하고 있습니다.');
        setTimeout(() => {
          fileConfirmState[fileKey] = 'done';
          updateConfirmBtnUI();
          updateNotificationAssigneeButton();
          showToast(`알림전송이 완료되었습니다. 확정 질의 ${queryCount}건이 실국담당자 ${recipientCount}명에게 전달되었습니다.`);
        }, 900);
      },
      'confirm',
      '알림전송'
    );
  }

  function handleConfirmCancel() {
    const fileKey = getActiveConfirmKey();
    const state = fileConfirmState[fileKey] || 'confirm';
    if (state === 'notify') {
      customConfirm('확정 취소', '확정을 취소하고 이전 상태로 되돌리시겠습니까?', () => {
        fileConfirmState[fileKey] = 'confirm';
        delete confirmedQuerySnapshots[fileKey];
        updateConfirmBtnUI();
        updateNotificationAssigneeButton();
        showToast('확정이 취소되었습니다.');
      });
    }
  }

  function updateConfirmBtnUI() {
    const btn = $('#confirmBtn');
    if (!btn) return;
    const fileKey = getActiveConfirmKey();
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
    updateNotificationAssigneeButton();
  }

  // ─── Rule Management ───
  const classifyRules = [
    { id: 1, keywords: '에너지', condition: '"에너지" 단독 이슈', dept: '혁신성장실', priority: 1, conflict: 'rule', active: true },
    { id: 2, keywords: '친환경 에너지, 미래산업, 구조개혁', condition: '"친환경 에너지", "미래산업", "구조개혁" 함께 포함 시', dept: '혁신성장실', priority: 2, conflict: 'both', active: true },
    { id: 3, keywords: '청년, 일자리', condition: '"청년" + "일자리" 조합', dept: '경제구조개혁국', priority: 2, conflict: 'rule', active: true },
    { id: 4, keywords: '청년, 주거', condition: '"청년" + "주거" 조합', dept: '민생경제국', priority: 2, conflict: 'both', active: false },
    { id: 5, keywords: '청년, 복지, 재정지원', condition: '"청년" + "복지/재정지원" 조합', dept: '민생경제국', priority: 3, conflict: 'ai', active: true }
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
    const now = new Date();
    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ].join('.');
    const fileDate = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ].join('-');

    const queries = sampleQueries;
    const activeFile = uploadedFiles[activeFileIndex];
    const executionFileName = activeFile ? activeFile.name : ($('#activeFileName')?.textContent || '');
    const meta = docMetaMap[executionFileName] || DEFAULT_DOC_META;
    const executor = '박재정 주무관';

    const normalizeMemberName = (value) => String(value || '')
      .replace(/\s*\(인\)\s*/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const extractDeadline = (value) => {
      const text = String(value || '');
      const koreanDate = text.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
      if (koreanDate) {
        return [
          koreanDate[1],
          String(koreanDate[2]).padStart(2, '0'),
          String(koreanDate[3]).padStart(2, '0')
        ].join('.');
      }
      const dottedDate = text.match(/(\d{4})[.\-/]\s*(\d{1,2})[.\-/]\s*(\d{1,2})/);
      if (dottedDate) {
        return [
          dottedDate[1],
          String(dottedDate[2]).padStart(2, '0'),
          String(dottedDate[3]).padStart(2, '0')
        ].join('.');
      }
      return '';
    };

    const normalizeExcelValue = (value) => {
      if (value === null || value === undefined) return 'NULL';
      const text = String(value).trim();
      return text === '' ? 'NULL' : text;
    };

    const csvCell = (value) => {
      const text = normalizeExcelValue(value).replace(/\r?\n/g, ' ').replace(/"/g, '""');
      return `"${text}"`;
    };

    const headers = [
      '실행일',
      '실행파일명',
      '실행자',
      '요구일',
      '질의의원명',
      '교섭단체명',
      '질의ID',
      '질의번호',
      '질의명',
      '담당실국',
      '협조실국',
      '제출기한'
    ];

    const requestDate = meta.date || '';
    const memberName = normalizeMemberName(meta.memberName);
    const partyName = meta.partyName || '';
    const deadline = extractDeadline(meta.closing);

    const rows = queries.map((q, i) => [
      today,
      executionFileName,
      executor,
      requestDate,
      memberName,
      partyName,
      'Q-' + now.getFullYear() + '-' + String(q.id).padStart(4, '0'),
      i + 1,
      q.text,
      q.mainDept || '',
      q.coopDept || '',
      deadline
    ]);

    let csv = '\uFEFF';
    csv += headers.map(csvCell).join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(csvCell).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '질의목록_추천실국_' + fileDate + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('질의목록 엑셀 파일이 다운로드되었습니다.');
  }

  // ─── Custom Modal ───
  function customConfirm(title, msg, onConfirm, type = 'confirm', confirmLabel = '확인') {
    let modal = $('#customModalBackdrop');
    if (!modal) { modal = document.createElement('div'); modal.id = 'customModalBackdrop'; modal.className = 'custom-modal-backdrop'; document.body.appendChild(modal); }
    const iconCls = type === 'danger' ? 'danger' : 'confirm';
    const btnCls = type === 'danger' ? 'btn-confirm danger' : 'btn-confirm';
    const confirmIcon = type === 'danger'
      ? '⚠'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5 12 4l8 7.5"/><path d="M6 10.5V19h12v-8.5"/><path d="M9 13h6"/><path d="M12 10v6"/></svg>';
    modal.innerHTML = `<div class="custom-modal"><div class="custom-modal-icon ${iconCls}">${confirmIcon}</div><div class="custom-modal-title">${title}</div><div class="custom-modal-msg">${msg}</div><div class="custom-modal-actions"><button class="btn-cancel" id="cmCancel">취소</button><button class="${btnCls}" id="cmConfirm">${confirmLabel}</button></div></div>`;
    modal.classList.remove('hidden');
    $('#cmCancel').addEventListener('click', () => modal.classList.add('hidden'));
    $('#cmConfirm').addEventListener('click', () => { modal.classList.add('hidden'); if (onConfirm) onConfirm(); });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
  }

  function customAlert(title, msg) {
    let modal = $('#customModalBackdrop');
    if (!modal) { modal = document.createElement('div'); modal.id = 'customModalBackdrop'; modal.className = 'custom-modal-backdrop'; document.body.appendChild(modal); }
    modal.innerHTML = `<div class="custom-modal"><div class="custom-modal-icon alert">!</div><div class="custom-modal-title">${title}</div><div class="custom-modal-msg">${msg}</div><div class="custom-modal-actions"><button class="btn-confirm" id="cmOk">확인</button></div></div>`;
    modal.classList.remove('hidden');
    $('#cmOk').addEventListener('click', () => modal.classList.add('hidden'));
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

  // ─── Toast ───
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2500);
  }

  // ─── Preparing Menu (준비중 메뉴 안내) ───
  $$('.nav-link[data-soon]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      customAlert('준비중', '이 화면은 프로토타입에 아직 포함되어 있지 않습니다.');
    });
  });


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
      const entered = Number(directInput.value);
      applyPercent(entered);
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

  // ─── Start ───
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

  init();
})();
