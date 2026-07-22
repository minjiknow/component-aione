(function () {
    "use strict";

    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];

    // ─── Data ───
    const treeData = [
        { name: "전체 자료", icon: "📂", indent: 0, id: "root", open: true },
        { name: "국정감사", icon: "📁", indent: 1, id: "audit", parent: "root" },
        { name: "추가질의", icon: "📁", indent: 1, id: "extra", parent: "root" },
        { name: "2025년", icon: "📁", indent: 1, id: "y2025", parent: "root", open: true },
        { name: "입법위원회", icon: "📁", indent: 2, id: "legis", parent: "y2025" },
        { name: "기획재정위원회", icon: "📁", indent: 2, id: "finance", parent: "y2025", active: true },
        { name: "정무위원회", icon: "📁", indent: 2, id: "admin", parent: "y2025" },
        { name: "2024년", icon: "📁", indent: 1, id: "y2024", parent: "root" },
        { name: "미래전략", icon: "📁", indent: 2, id: "future", parent: "y2024" },
        { name: "답변서", icon: "📁", indent: 0, id: "answers" },
        { name: "보고서", icon: "📁", indent: 0, id: "reports" },
        { name: "법령/지침", icon: "📁", indent: 0, id: "laws" },
        { name: "통계자료", icon: "📁", indent: 0, id: "stats" },
    ];

    const files = [
        { name: "260402_재경위_전체 의원 질의에 대한 답변_통합본.hwp", size: "3.2MB", type: "pdf" },
        { name: "지방채 인수를 해야 하는 법적 의무.hwpx", size: "1.1MB", type: "docx" },
        { name: "지방교부세가 지급되고 있고 지방채 인수시 추경 편성 이유.hwpx", size: "0.8MB", type: "docx" },
    ];

    const recommendations = [
        // 유사답변서 (과거답변서 + 마스터답변)
        {
            id: 1,
            title: "260402_재경위_전체 의원 질의에 대한 답변_통합본",
            score: 91,
            rank: 1,
            meta: "과거답변서 · 2026년 · 기획재정위원회",
            category: "similar",
            desc: "공자기금 지방채 인수 제도 개요, 추경 편성 배경, 지원조건(5년 거치 10년 상환) 등 포함.",
            tags: ["과거답변서", "지방채인수"],
            preview: {
                org: "기획재정위원회 · 2026년",
                title: "재경위 전체 의원 질의에 대한 답변 통합본",
                sections: [
                    {
                        title: "활용 가능 문단",
                        items: ["공자기금은 지방재정 지원을 목적으로 지자체가 발행하는 지방채를 장기 저리로 인수하여 자금을 지원함", "특정 자본적 지출 사업의 원활한 추진을 위해 필요한 경우 추경을 통해 인수 예산을 편성함"],
                    },
                    { title: "초안 반영 제안", items: ["제도 개요 표(지원대상/사업/조건/절차) 직접 활용", "금리 수치 최신 고시 기준 확인 필요"] },
                ],
            },
        },
        {
            id: 2,
            title: "지방채 인수를 해야 하는 법적 의무",
            score: 88,
            rank: 2,
            meta: "참고문서 · 법령근거 · 재정정책국",
            category: "similar",
            desc: "지방재정법 시행령 제11조, 공공자금관리기금법 시행령 제2조 등 법적 근거 정리.",
            tags: ["법령근거", "공자기금"],
            preview: {
                org: "재정정책국 · 법령분석",
                title: "지방채 인수를 해야 하는 법적 의무",
                sections: [
                    { title: "활용 가능 문단", items: ["지방재정법 시행령 제11조에 따라 행안부가 지방채 발행계획을 수립", "공공자금관리기금법 시행령 제2조에 의거하여 기금 운용"] },
                    { title: "초안 반영 제안", items: ["집행절차 법적 근거로 활용", "제도 정당성 강조 시 인용"] },
                ],
            },
        },
        {
            id: 3,
            title: "지방교부세가 지급되고 있고 지방채 인수시 지자체 채무는 증가함에도 추경을 편성해야 하는 이유",
            score: 95,
            rank: 3,
            meta: "원본질의 · 2026년 · 기획재정위원회",
            category: "similar",
            desc: "본 질의에 대한 직접 답변 자료. 공자기금 제도 개요, 추경 배경, 광주·전남 사례 포함.",
            tags: ["원본답변", "추경편성"],
            preview: {
                org: "기획재정위원회 · 2026년",
                title: "지방채 인수 추경 편성 사유 답변",
                sections: [
                    { title: "활용 가능 문단", items: ["지자체의 특정 자본적 지출 사업 수행을 위해 공자기금이 지방채를 장기 저리로 인수", "광주·전남 통합특별시 출범 관련 약 1,000억 원 규모 추경 수요"] },
                    { title: "초안 반영 제안", items: ["답변 요약문 직접 활용", "추경 사례 및 지자체별 수요 인용"] },
                ],
            },
        },
        {
            id: 4,
            title: "민주당 반대로 무산된 TK통합법 관련 지방채 인수 추경안 견해",
            score: 76,
            meta: "참고답변 · 2026년 · 기획재정위원회",
            category: "similar",
            desc: "TK통합법 통과 시 지방채 인수 추경안 포함 가능성에 대한 정부 견해.",
            tags: ["참고답변", "TK통합"],
            preview: {
                org: "기획재정위원회 · 2026년",
                title: "TK통합법 관련 지방채 인수 견해",
                sections: [
                    { title: "활용 가능 문단", items: ["통합법 통과 시 추가 지방채 인수 수요 발생 가능", "현행 추경안은 광주·전남 통합 수요만 반영"] },
                    { title: "초안 반영 제안", items: ["비교 논거로 활용 가능", "정치적 맥락은 답변서에서 제외 권장"] },
                ],
            },
        },
        // 참고자료 (첨부자료 + 초안 근거자료)
        {
            id: 5,
            title: "지방채 인수 예산 현황표 ('16~'26)",
            score: 95,
            rank: 1,
            meta: "참고자료 · 첨부용 · 재정정책국",
            category: "reference",
            desc: "연도별 지방채 인수 계획/실적/인수잔액 현황. 2016년~2025년 전체 추이.",
            tags: ["첨부자료", "인수현황"],
            preview: {
                org: "재정정책국 · 2026년",
                title: "지방채 인수 예산 현황표",
                sections: [
                    { title: "포함 항목", items: ["'25년 예산(최종): 12,100억, 결산: 10,712억", "'26년 본예산: 1,000억, 추경안: 2,000억 (증감 +1,000)", "'25년 인수잔액: 71,532억"] },
                    { title: "활용 방안", items: ["답변서 표 삽입용 (예산 현황)", "연도별 추이 시각자료로 활용"] },
                ],
            },
        },
        {
            id: 6,
            title: "광주·전남 통합 관련 추경 수요 상세",
            score: 92,
            rank: 2,
            meta: "참고자료 · 근거자료 · 지역발전정책국",
            category: "reference",
            desc: "전남광주통합특별시 설치 특별법 관련 추경 규모(1,000억) 및 지자체별 세부 수요.",
            tags: ["근거자료", "광주전남"],
            preview: {
                org: "지역발전정책국 · 2026년",
                title: "광주·전남 통합 관련 추경 수요",
                sections: [
                    { title: "주요 내용", items: ["출범일: 2026.7.1. (특별법 '26.3.5. 시행)", "전남: 안내표지판, 통합전산망 등 700억 원", "광주: 재난관리기금, 재해구호기금 등 195억 원"] },
                    { title: "활용 방안", items: ["추경 편성 사례 직접 근거", "지자체별 수요 명세로 인용"] },
                ],
            },
        },
        {
            id: 7,
            title: "세수추계 및 세입경정 운용 자료",
            score: 84,
            rank: 3,
            meta: "참고자료 · 분석자료 · 세제실",
            category: "reference",
            desc: "국채 발행 없이 초과세수만으로 추경 편성. 세목별 규모 및 추계위원회 검증 결과.",
            tags: ["세입경정", "세수추계"],
            preview: {
                org: "세제실 · 2026년",
                title: "세수추계 및 세입경정 운용",
                sections: [
                    { title: "주요 내용", items: ["초과세수 기반 추경 편성 (국채 발행 無)", "세목별: 법인세(+148), 증권거래세(+52), 농특세(+51)", "세수추계위원회(3.20) 및 민간자문단(3.24) 검증"] },
                    { title: "활용 방안", items: ["추경 재원 건전성 설명 시 활용", "세입 증액 경정 근거"] },
                ],
            },
        },
        {
            id: 8,
            title: "세수추계 오차 분석 및 개선 방안",
            score: 72,
            meta: "참고자료 · 분석보고서 · 세제실",
            category: "reference",
            desc: "과거 세수추계 오차 원인 분석. 법인+자산세수 비중(37.8%)이 OECD 평균(22.8%) 대비 높음.",
            tags: ["분석보고서", "세수오차"],
            preview: {
                org: "세제실 · 2026년",
                title: "세수추계 오차 분석",
                sections: [
                    { title: "주요 내용", items: ["오차 원인: 경제여건 급변, 세수 오버슈팅 오인, 정책 조정", "구조적 취약성: 법인+자산세 비중 37.8% (OECD 22.8%)", "예정처 전망과 정부안 차이: △1.7조 원"] },
                    { title: "활용 방안", items: ["세수 관련 후속 질의 대비 참고", "추경 편성 배경 보충 설명"] },
                ],
            },
        },
    ];

    let selectedRecIds = [1]; // 다중 선택 지원

    const draftContent = `<div class="draft-view">
  <div class="draft-head">
    <span class="draft-head-title">답변서 초안</span>
    <button class="icon-button icon-button-ghost panel-move-btn" id="draftDownloadBtn" aria-label="다운로드" title="다운로드">
      <img class="icon icon-small" data-icon="download" alt="" aria-hidden="true" />
    </button>
  </div>
  <div class="draft-editor" contenteditable="false">
    <div style="border:2px solid var(--border);border-radius:8px;padding:16px 24px;margin-bottom:24px;display:flex;align-items:center;gap:16px;">
      <div style="width:40px;height:40px;border:2px solid var(--text-primary);border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;">1</div>
      <div style="font-size:16px;font-weight:700;line-height:1.5;">지방교부세가 지급되고 있고 지방채 인수시 지자체 채무는 증가함에도 추경을 편성해야 하는 이유는?</div>
    </div>

    <div style="border:1px solid var(--border);border-radius:8px;padding:16px 20px;margin-bottom:24px;background:var(--surface-elevated);">
      <p style="margin:0;line-height:1.8;">□ 지방자치단체의 특정 자본적 지출 사업 수행을 위해 공공자금관리기금이 지방채를 장기 저리로 인수하여 지방재정을 지원하기 때문입니다.</p>
    </div>

    <h3 style="margin-top:24px;">□ 지방채 인수 추경 편성 배경</h3>
    <ul style="line-height:2;">
      <li>공공자금관리기금(공자기금)은 지방재정 지원을 목적으로 지방자치단체가 발행하는 지방채를 장기 저리로 인수하여 자금을 지원함 <sup style="color:var(--accent-blue);font-size:12px;">1,2</sup></li>
      <li>특히 도로, 지하철 건설, 공공용 시설 설치 및 지역개발사업 등 특정 자본적 지출 사업의 원활한 추진을 위해 필요한 경우 추경을 통해 인수 예산을 편성함 <sup style="color:var(--accent-blue);font-size:12px;">1,3</sup></li>
    </ul>

    <h3 style="margin-top:24px;">□ 공자기금 지방채 인수 제도 개요</h3>
    <p style="padding-left:16px;">ㅇ 지방채 인수의 구체적인 지원 대상 및 조건은 다음과 같음 <sup style="color:var(--accent-blue);font-size:12px;">1,3</sup></p>
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
      <li>광주·전남 통합특별시 출범(2026.7.1. 예정)과 관련하여 통합전산망 구축, 안내표지판 설치, 재난관리기금 조성 등 지자체의 실제 지방채 인수 수요가 발생함에 따라 이를 반영하여 추경을 편성함 <sup style="color:var(--accent-blue);font-size:12px;">1,4</sup></li>
    </ul>

    <hr style="margin:28px 0;border:none;border-top:1px solid var(--border);" />

    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <div style="background:var(--text-primary);color:#fff;border-radius:4px;padding:4px 10px;font-size:12px;font-weight:600;">참고 1</div>
      <span style="font-size:15px;font-weight:700;">공자기금 지방채 인수 제도</span>
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
    <p style="text-align:right;font-size:12px;color:var(--text-muted);margin-bottom:8px;">(단위: 억원)</p>
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
      <div style="background:var(--text-primary);color:#fff;border-radius:4px;padding:4px 10px;font-size:12px;font-weight:600;">참고 2</div>
      <span style="font-size:15px;font-weight:700;">광주·전남 통합 관련 추경 수요</span>
    </div>

    <h4 style="margin-bottom:8px;">(1) 출범 계획</h4>
    <ul style="line-height:2;">
      <li>전남광주통합특별시 설치를 위한 특별법 통과 후 '26.3.5. 시행, '26.7.1. 출범 예정 <sup style="color:var(--accent-blue);font-size:12px;">1</sup></li>
    </ul>

    <h4 style="margin-bottom:8px;">(2) 추경 규모 및 산출 근거 <sup style="color:var(--accent-blue);font-size:12px;">4</sup></h4>
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
      <div style="background:var(--text-primary);color:#fff;border-radius:4px;padding:4px 10px;font-size:12px;font-weight:600;">참고 3</div>
      <span style="font-size:15px;font-weight:700;">연도별 지방채 인수 실적</span>
    </div>

    <p style="text-align:right;font-size:12px;color:var(--text-muted);margin-bottom:8px;">(단위: 억원)</p>
    <table class="draft-table" style="font-size:12px;">
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
      <div style="background:var(--text-primary);color:#fff;border-radius:4px;padding:4px 10px;font-size:12px;font-weight:600;">참고 4</div>
      <span style="font-size:15px;font-weight:700;">출처</span>
    </div>
    <div style="font-size:12.5px;line-height:2.2;padding-left:8px;">
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
      <div style="background:var(--text-primary);color:#fff;border-radius:4px;padding:4px 10px;font-size:12px;font-weight:600;">참고 5</div>
      <span style="font-size:15px;font-weight:700;">추가 QA</span>
    </div>
    <div style="border:1px solid var(--border);border-radius:8px;padding:14px 18px;margin-bottom:14px;background:var(--surface-elevated);">
      <p style="margin:0 0 8px;font-weight:600;font-size:13px;">Q. 공자기금의 지방채 인수 지원이 가능한 사업 범위는 무엇인가요?</p>
      <p style="margin:0;font-size:12.5px;line-height:1.8;">□ 도로, 지하철 건설, 공용 및 공공용 시설의 설치, 지역개발사업 등 특정 자본적 지출 사업에 한해 지원이 가능하며, 경상적 사업비나 인건비 등은 지원 대상에서 제외됩니다.</p>
    </div>
    <div style="border:1px solid var(--border);border-radius:8px;padding:14px 18px;background:var(--surface-elevated);">
      <p style="margin:0 0 8px;font-weight:600;font-size:13px;">Q. 지방채 인수를 위한 집행 절차와 일정은 어떻게 되나요?</p>
      <p style="margin:0;font-size:12.5px;line-height:1.8;">□ 먼저 9월 중 행정안전부가 지방채 발행계획을 마련하여 협의하고, 10월 말까지 지자체별 발행계획을 승인받은 후, 해당 지자체가 지방의회 의결을 거쳐 연도 중에 지방채 인수를 요청하는 순서로 진행됩니다.</p>
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
    <!-- 좌: 기준 문서 -->
    <div class="cmp-col">
      <div class="cmp-col-head"><span class="cmp-col-title">기준 문서</span><span class="cmp-col-badge">재경위 · 2026년 · 91%</span></div>
      <div class="cmp-col-body">
        <h3 class="cmp-doc-title">260402_재경위_전체 의원 질의에 대한 답변_통합본</h3>
        <div class="cmp-section"><strong>1. 활용 가능 문단</strong>
          <p class="cmp-sub-title">활용 가능 문단</p>
          <p>• 공자기금은 지방재정 지원을 목적으로 지자체가 발행하는 지방채를 장기 저리로 인수하여 자금을 지원함</p>
          <p>• 도로, 지하철 건설, 공공용 시설 설치 및 지역개발사업 등 특정 자본적 지출 사업의 원활한 추진을 위해 추경을 통해 인수 예산을 편성함</p>
        </div>
        <div class="cmp-section"><strong>2. 초안 반영 제안</strong>
          <p>• 제도 개요 표(지원대상/사업/조건/절차) 그대로 활용 가능</p>
          <p>• 금리 수치('26.2분기 3.435%)는 최신 고시 기준 확인 필요</p>
        </div>
        <div class="cmp-section"><strong>3. 비교 관점</strong>
          <p>• 광주·전남 통합특별시(2026.7.1. 출범) 사례가 추경의 직접적 근거임</p>
          <p>• 지방채 인수 예산 현황('25 예산 12,100 → '26 추경안 2,000)으로 증감 확인</p>
        </div>
      </div>
    </div>
    <div class="cmp-col-resize" data-cmp-resize="0"></div>
    <!-- 중: 비교 문서 -->
    <div class="cmp-col">
      <div class="cmp-col-head"><span class="cmp-col-title">비교 문서</span><span class="cmp-col-badge blue">현재 답변서 초안</span></div>
      <div class="cmp-col-body">
        <h3 class="cmp-doc-title">국회 기획재정위원회 질의에 대한 답변(초안)</h3>
        <div class="cmp-section"><strong>1. 질의 요지</strong>
          <p>• 지방교부세 지급에도 지방채 인수로 채무가 증가하면서 추경을 편성해야 하는 이유</p>
        </div>
        <div class="cmp-section"><strong>2. 답변 내용</strong>
          <p>• 공자기금은 지방재정 지원을 목적으로 지방채를 <mark>장기 저리</mark>로 인수하여 자금 지원</p>
          <p>• 특정 자본적 지출 사업(도로, 지하철, 공공시설, 지역개발)의 원활한 추진을 위해 추경 편성</p>
          <p class="hl-change">• <strong>인수조건:</strong> 5년 거치 10년 분할 상환, '26.2분기 금리 3.435%</p>
          <p>• 광주·전남 통합특별시 출범 관련 약 1,000억 원 규모 추경 수요</p>
        </div>
        <div class="cmp-section"><strong>3. 예산 현황</strong>
          <p>• '25년 예산(최종) 12,100억 → 결산 10,712억</p>
          <p>• '26년 본예산 1,000억 → 추경안 2,000억 (증감 +1,000, 100%)</p>
        </div>
      </div>
    </div>
    <div class="cmp-col-resize" data-cmp-resize="1"></div>
    <!-- 우: 차이점 분석 -->
    <div class="cmp-col cmp-col-analysis">
      <div class="cmp-col-head"><span class="cmp-col-title">차이점 분석</span><span class="cmp-col-badge gray">자동 비교</span></div>
      <div class="cmp-col-body">
        <div class="analysis-card">
          <div class="analysis-card-head"><span class="analysis-title">답변 논리</span><span class="analysis-badge red">일치</span></div>
          <p class="analysis-desc">원문과 초안 모두 공자기금 지방채 인수의 목적과 추경 편성 불가피성을 동일한 논리로 설명합니다.</p>
        </div>
        <div class="analysis-card">
          <div class="analysis-card-head"><span class="analysis-title">수치 정보</span><span class="analysis-badge orange">확인 필요</span></div>
          <p class="analysis-desc">인수금리 3.435%('26.2분기)는 분기별 변동 금리로, 답변 시점 기준 최신 고시 확인이 필요합니다.</p>
        </div>
        <div class="analysis-card">
          <div class="analysis-card-head"><span class="analysis-title">사례 반영</span><span class="analysis-badge purple">정확 반영</span></div>
          <p class="analysis-desc">광주·전남 통합특별시(2026.7.1. 출범) 관련 추경 수요(전남 700억, 광주 195억)가 원문 그대로 반영되었습니다.</p>
        </div>
        <div class="analysis-card">
          <div class="analysis-card-head"><span class="analysis-title">표현 톤</span><span class="analysis-badge green">적정</span></div>
          <p class="analysis-desc">국회 답변 형식에 부합하며, 제도 설명과 근거 수치가 체계적으로 구성되어 있습니다.</p>
        </div>
        <div class="analysis-apply"><button class="btn-outline">차이점 초안 반영</button></div>
      </div>
    </div>
  </div>
  `;

    const chatTopics = [
        { title: "지방채 인수 추경 답변서 초안 작성", time: "11:05", id: 0 },
        { title: "공자기금 인수금리 조건 정리", time: "10:22", id: 1 },
        { title: "광주·전남 통합특별시 추경 수요", time: "어제", id: 2 },
    ];

    const chatConversations = [
        // Topic 0: 지방채 인수 추경 답변서 초안 작성
        [
            {
                role: "ai",
                text: "답변서 초안 작성을 시작합니다. 지방채 인수 및 추경 관련 참조자료 7건을 분석 완료했습니다.\n\n📌 분석 결과 요약:\n• 최고 유사도: 95% (지방채 인수 추경 편성 사유 답변)\n• 인용 가능 문단: 5개\n• 수치 업데이트 필요: 1건 (금리 최신 고시)",
                time: "10:45",
            },
            { role: "user", text: "공자기금 지방채 인수 제도 개요와 추경 편성 배경을 중심으로 답변서 초안을 작성해줘.", time: "10:50" },
            {
                role: "ai",
                text: '참조자료를 기반으로 초안을 작성했습니다.\n\n✅ 반영 내용:\n• 답변 요약: "특정 자본적 지출 사업 수행을 위해 공자기금이 지방채를 장기 저리로 인수"\n• 제도 개요 표: 지원대상/사업/조건/절차\n• 인수금리: 공자기금 예탁금리와 동일(분기별 고정), \'26.2분기 3.435%\n• 인수기간: 5년 거치 10년 분할 상환\n\n⚠️ 확인 필요:\n• 금리는 분기별 변동이므로 답변 시점 기준 최신 고시 확인 필요',
                time: "10:55",
            },
            { role: "user", text: "광주·전남 통합특별시 관련 추경 사례도 추가해줘. 지자체별 수요도 포함해서.", time: "11:00" },
            {
                role: "ai",
                text: "추경 편성 사례를 추가했습니다.\n\n추가 내용:\n• 광주·전남 통합특별시 출범(2026.7.1. 예정)\n• 지방채 인수 수요: 약 1,000억 원 규모\n• 전남: 안내표지판 설치, 통합전산망 구축(300억) 등 총 700억 원\n• 광주: 재난관리기금, 재해구호기금 조성 등 총 195억 원\n\n예산 현황표도 반영 완료:\n• '25년 예산 12,100억 / 결산 10,712억\n• '26년 본예산 1,000억 → 추경안 2,000억 (증감 +1,000, 100%)",
                time: "11:03",
            },
        ],
        // Topic 1: 공자기금 인수금리 조건 정리
        [
            { role: "ai", text: "공자기금 지방채 인수 금리 조건을 정리합니다. 어떤 기준이 필요하신가요?", time: "10:10" },
            { role: "user", text: "최근 분기별 금리 변동 추이를 정리해줘.", time: "10:15" },
            {
                role: "ai",
                text: "공자기금 지방채 인수금리 추이입니다.\n\n산정 기준: 전분기 공자기금 총괄계정 평균 조달금리 + 기금운용경비(0.1%p)\n\n| 분기 | 금리(%) |\n|------|--------|\n| '25.1분기 | 2.975 |\n| '25.2분기 | 2.794 |\n| '25.3분기 | 2.683 |\n| '25.4분기 | 2.713 |\n| '26.1분기 | 2.957 |\n| '26.2분기 | 3.435 |\n\n인수기간: 5년 거치 10년 분할 상환\n출처: 공공자금관리기금 운용계획",
                time: "10:20",
            },
        ],
        // Topic 2: 광주·전남 통합특별시 추경 수요
        [
            { role: "ai", text: "광주·전남 통합특별시 관련 추경 수요를 정리합니다.", time: "어제" },
            { role: "user", text: "출범 일정이랑 지자체별 세부 수요 정리해줘.", time: "어제" },
            {
                role: "ai",
                text: "광주·전남 통합 관련 추경 수요입니다.\n\n📋 출범 계획:\n• 전남광주통합특별시 설치를 위한 특별법 통과\n• '26.3.5. 시행 → '26.7.1. 출범 예정\n\n💰 추경 규모: 약 1,000억 원\n\n📊 지자체별 세부 수요:\n• 전남(700억 원): 통합특별시 안내표지판 설치, 통합전산망 구축(300억 원) 등\n• 광주(195억 원): 재난관리기금 및 재해구호기금 조성 등\n\n* '26년 본예산 규모(1,000억 원)를 감안하여 산출\n\n답변서에 추경 편성의 구체적 사례로 인용하기에 적합합니다.",
                time: "어제",
            },
        ],
    ];

    let activeChatTopic = 0;

    // ─── State ───
    let currentTab = "recommend";
    let selectedRec = 0;
    let currentFilter = "all";
    let isReset = false;

    // ─── Draft Versions ───
    let draftVersions = [{ id: 1, label: "v1.0", time: "초안 생성", content: draftContent }];
    let activeDraftVersion = 0;

    // ─── Render ───
    function init() {
        renderTree();
        renderFiles();
        renderRecommendations();
        renderPreview(recommendations[0]);
        renderSelectedRefs();
        renderChatTopics();
        renderChatMessages();
        bindEvents();
        bindFilterChips();
        bindApplyToChat();
    }

    function renderTree() {
        const tree = $("#folderTree");
        if (!tree) return;
        tree.innerHTML = treeData
            .map((d) => {
                const hasChildren = treeData.some((c) => c.parent === d.id);
                const arrow = hasChildren ? (d.open ? "▾" : "▸") : "";
                return `<div class="tree-item${d.indent ? " i" + d.indent : ""}${d.active ? " active" : ""}" data-id="${d.id}" data-has-children="${hasChildren}">
        <span class="t-arrow">${arrow}</span><span class="t-icon">${d.icon}</span><span class="t-name">${d.name}</span>
      </div>`;
            })
            .join("");

        // Event delegation for tree
        tree.addEventListener("click", (e) => {
            const item = e.target.closest(".tree-item");
            if (!item) return;
            const id = item.dataset.id;
            const node = treeData.find((d) => d.id === id);
            if (!node) return;

            // Toggle open/close if has children
            const hasChildren = treeData.some((c) => c.parent === id);
            if (hasChildren) {
                node.open = !node.open;
            }

            // Set active
            treeData.forEach((d) => (d.active = false));
            node.active = true;

            // Update path
            updateFolderPath(node);

            // Re-render
            renderTreeItems();
        });

        renderTreeItems();
    }

    function renderTreeItems() {
        const tree = $("#folderTree");
        if (!tree) return;
        // Determine visible items based on open state
        const visible = [];
        treeData.forEach((d) => {
            if (d.indent === 0) {
                visible.push(d);
            } else {
                // Check if all ancestors are open
                let parent = treeData.find((p) => p.id === d.parent);
                let show = true;
                while (parent) {
                    if (!parent.open) {
                        show = false;
                        break;
                    }
                    parent = treeData.find((p) => p.id === parent.parent);
                }
                if (show) visible.push(d);
            }
        });

        tree.innerHTML = visible
            .map((d) => {
                const hasChildren = treeData.some((c) => c.parent === d.id);
                const arrow = hasChildren ? (d.open ? "▾" : "▸") : "&nbsp;";
                return `<div class="tree-item${d.indent ? " i" + d.indent : ""}${d.active ? " active" : ""}" data-id="${d.id}">
        <span class="t-arrow">${arrow}</span><span class="t-icon">${d.icon}</span><span class="t-name">${d.name}</span>
      </div>`;
            })
            .join("");
    }

    function updateFolderPath(node) {
        const pathEl = $(".folder-path");
        if (!pathEl) return;
        // Build path from node up to root
        const parts = [node.name];
        let current = node;
        while (current.parent) {
            current = treeData.find((d) => d.id === current.parent);
            if (current) parts.unshift(current.name);
        }
        pathEl.textContent = "필터 항목 · " + parts.join(" > ");
    }

    function renderFiles() {
        const list = $("#fileList");
        list.innerHTML = files
            .map((f, i) => {
                let dotColor = "var(--red)";
                if (f.type === "docx" || (f.type === "pdf" && f.name.includes("법적"))) dotColor = "var(--primary)";
                else if (f.type === "xls") dotColor = "var(--green)";
                else if (f.type === "docx") dotColor = "var(--primary)";
                if (f.type === "pdf") dotColor = "var(--red)";
                if (f.type === "docx") dotColor = "var(--primary)";
                if (f.type === "xls") dotColor = "var(--green)";
                return `<li class="file-item-simple" data-file-idx="${i}">
        <span class="file-dot" style="background:${dotColor}"></span>
        <span class="file-name-simple">${f.name}</span>
        <span class="file-size-simple">${f.size}</span>
        <button type="button" class="icon-button icon-button-ghost file-remove-simple" data-idx="${i}" aria-label="파일 삭제">×</button>
        <span class="file-collapsed-icon fc-${f.type}" title="${f.name}">${f.type}</span>
      </li>`;
            })
            .join("");

        // Remove button
        list.querySelectorAll(".file-remove-simple").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.idx);
                files.splice(idx, 1);
                renderFiles();
            });
        });

        // Update count
        const fileCount = $("#fileCount");
        if (fileCount) fileCount.textContent = files.length;

        // Toggle upload guide
        const uploadGuide = $(".upload-guide");
        if (uploadGuide) uploadGuide.style.display = files.length > 0 ? "none" : "";
    }

    function createRecommendationCard(recommendation) {
        const cardTemplate = $("#recommendationCardTemplate");
        const tagTemplate = $("#recommendationTagTemplate");
        const card = cardTemplate?.content.firstElementChild?.cloneNode(true);
        if (!card) return null;

        const isSelected = selectedRecIds.includes(recommendation.id);
        const checkbox = $('input[type="checkbox"]', card);
        const rank = $("[data-rec-rank]", card);
        const tags = $("[data-rec-tags]", card);

        card.dataset.id = recommendation.id;
        card.classList.toggle("active", isSelected);
        checkbox.checked = isSelected;
        checkbox.dataset.recId = recommendation.id;

        $("[data-rec-title]", card).textContent = recommendation.title;
        $("[data-rec-score]", card).textContent = `${recommendation.score}%`;
        rank.textContent = recommendation.rank ? `TOP ${recommendation.rank}` : "";
        rank.classList.toggle("hidden", !recommendation.rank);
        $("[data-rec-meta]", card).textContent = recommendation.meta;
        $("[data-rec-desc]", card).textContent = recommendation.desc;

        if (tagTemplate) {
            const tagElements = recommendation.tags.map((tagText) => {
                const tag = tagTemplate.content.firstElementChild.cloneNode(true);
                tag.textContent = tagText;
                return tag;
            });
            tags.replaceChildren(...tagElements);
        }

        return card;
    }

    function renderRecommendations() {
        const filtered = currentFilter === "all" ? recommendations : recommendations.filter((r) => r.category === currentFilter);
        const cards = filtered.map(createRecommendationCard).filter(Boolean);
        $("#recommendList").replaceChildren(...cards);

        // Checkbox multi-select
        $$('.rec-card input[type="checkbox"]').forEach((cb) => {
            cb.addEventListener("change", (e) => {
                e.stopPropagation();
                const id = parseInt(cb.dataset.recId);
                if (cb.checked) {
                    if (!selectedRecIds.includes(id)) selectedRecIds.push(id);
                } else {
                    selectedRecIds = selectedRecIds.filter((x) => x !== id);
                }
                renderRecommendations();
                renderSelectedRefs();
                // Show preview of last selected
                const lastId = selectedRecIds[selectedRecIds.length - 1];
                const rec = recommendations.find((r) => r.id === lastId);
                if (rec) renderPreview(rec);
            });
        });

        // Card click → preview (without toggling checkbox)
        $$(".rec-card").forEach((card) => {
            card.addEventListener("click", (e) => {
                if (e.target.closest(".rec-checkbox")) return;
                const id = parseInt(card.dataset.id);
                const rec = recommendations.find((r) => r.id === id);
                if (rec) renderPreview(rec);
            });
        });
    }

    function renderPreview(rec) {
        if (!rec) return;
        const badge = $(".center-right .sub-badge");
        if (badge) badge.textContent = "유사도 " + rec.score + "%";
        $("#previewBody").innerHTML = `
      <div class="pv-org">${rec.preview.org}</div>
      <div class="pv-title">${rec.preview.title}</div>
      ${rec.preview.sections
          .map(
              (s) => `
        <div class="pv-section"><div class="pv-section-title">${s.title}</div><ul class="pv-list">${s.items.map((i) => `<li>${i}</li>`).join("")}</ul></div>
      `,
          )
          .join("")}
    `;
    }

    function renderSelectedRefs() {
        const list = $("#selectedRefsList");
        const count = $("#selectedRefsCount");
        if (!list) return;
        const selected = recommendations.filter((r) => selectedRecIds.includes(r.id));
        if (count) count.textContent = selected.length;
        list.innerHTML = selected
            .map(
                (r) => `<li data-ref-id="${r.id}">
      <span class="ref-score">${r.score}%</span>
      <span class="ref-name">${r.title}</span>
      <span class="ref-remove" data-remove-id="${r.id}">×</span>
    </li>`,
            )
            .join("");

        // Remove button
        $$(".ref-remove", list).forEach((btn) => {
            btn.addEventListener("click", () => {
                const id = parseInt(btn.dataset.removeId);
                selectedRecIds = selectedRecIds.filter((x) => x !== id);
                renderSelectedRefs();
                renderRecommendations();
            });
        });

        // Toggle refs guide
        const refsGuide = $(".selected-refs-guide");
        if (refsGuide) refsGuide.style.display = selected.length > 0 ? "none" : "";

        // Toggle footer message
        const refsFooter = $("#selectedRefsFooter");
        if (refsFooter) refsFooter.classList.toggle("hidden", selected.length === 0);
    }

    function renderChatTopics() {
        const el = $("#chatTopics");
        el.innerHTML = chatTopics
            .map(
                (t, i) =>
                    `<div class="chat-topic${i === activeChatTopic ? " active" : ""}${t.pinned ? " pinned" : ""}" data-topic="${i}">
        <span class="ct-title">💬 ${t.title}</span>
        <span class="ct-time">${t.time}</span>
        <button type="button" class="icon-button icon-button-ghost icon-button-sm ct-more" data-topic-idx="${i}" aria-label="더보기"><img class="icon icon-small" data-icon="more-horizontal" alt="" aria-hidden="true" /></button>
        <div class="ct-menu hidden" data-menu-idx="${i}">
          <button class="ct-menu-item" data-action="share"><img class="icon icon-small" data-icon="share" alt="" aria-hidden="true" />대화 공유</button>
          <button class="ct-menu-item" data-action="pin"><img class="icon icon-small" data-icon="pin" alt="" aria-hidden="true" />${t.pinned ? "고정 해제" : "고정"}</button>
          <button class="ct-menu-item" data-action="rename"><img class="icon icon-small" data-icon="rename" alt="" aria-hidden="true" />이름 변경</button>
          <button class="ct-menu-item ct-menu-danger" data-action="delete"><img class="icon icon-small" data-icon="delete" alt="" aria-hidden="true" />삭제</button>
        </div>
      </div>`,
            )
            .join("");

        // Click to switch conversation
        el.addEventListener("click", (e) => {
            // Ignore if clicking more button or menu
            if (e.target.closest(".ct-more") || e.target.closest(".ct-menu")) return;
            const topic = e.target.closest(".chat-topic");
            if (!topic) return;
            activeChatTopic = parseInt(topic.dataset.topic);
            $$(".chat-topic", el).forEach((t) => t.classList.remove("active"));
            topic.classList.add("active");
            renderChatMessages();
            // Close drawer
            const drawer = $("#chatDrawer");
            const backdrop = $("#chatDrawerBackdrop");
            if (drawer) drawer.classList.add("hidden");
            if (backdrop) backdrop.classList.add("hidden");
        });

        // More button (⋮) → toggle context menu
        $$(".ct-more", el).forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const idx = btn.dataset.topicIdx;
                // Close all other menus
                $$(".ct-menu", el).forEach((m) => {
                    if (m.dataset.menuIdx !== idx) m.classList.add("hidden");
                });
                const menu = $(`.ct-menu[data-menu-idx="${idx}"]`, el);
                if (menu) menu.classList.toggle("hidden");
            });
        });

        // Menu actions
        $$(".ct-menu-item", el).forEach((item) => {
            item.addEventListener("click", (e) => {
                e.stopPropagation();
                const menu = item.closest(".ct-menu");
                const idx = parseInt(menu.dataset.menuIdx);
                const action = item.dataset.action;
                menu.classList.add("hidden");

                if (action === "share") {
                    showToast("대화 공유 링크가 복사되었습니다.");
                } else if (action === "pin") {
                    chatTopics[idx].pinned = !chatTopics[idx].pinned;
                    renderChatTopics();
                    showToast(chatTopics[idx].pinned ? "대화가 고정되었습니다." : "고정이 해제되었습니다.");
                } else if (action === "rename") {
                    openRenameModal(idx);
                } else if (action === "delete") {
                    customConfirm(
                        "대화 삭제",
                        "이 대화를 삭제하시겠습니까?",
                        () => {
                            chatTopics.splice(idx, 1);
                            chatConversations.splice(idx, 1);
                            if (activeChatTopic >= chatTopics.length) activeChatTopic = Math.max(0, chatTopics.length - 1);
                            renderChatTopics();
                            renderChatMessages();
                            showToast("대화가 삭제되었습니다.");
                        },
                        "danger",
                    );
                }
            });
        });

        // Close menu on outside click
        document.addEventListener("click", () => {
            $$(".ct-menu", el).forEach((m) => m.classList.add("hidden"));
        });
    }

    function renderChatMessages() {
        const el = $("#chatMessages");
        const msgs = chatConversations[activeChatTopic] || [];
        el.innerHTML = msgs
            .map((m, i) => {
                const actions =
                    m.role === "ai"
                        ? `<div class="msg-actions">
        <button class="icon-button icon-button-ghost icon-button-message msg-action-btn" data-action="like" data-idx="${i}" aria-label="좋아요" title="좋아요"><img class="icon icon-small" data-icon="thumbs-up" alt="" aria-hidden="true" /></button>
        <button class="icon-button icon-button-ghost icon-button-message msg-action-btn" data-action="dislike" data-idx="${i}" aria-label="싫어요" title="싫어요"><img class="icon icon-small" data-icon="thumbs-down" alt="" aria-hidden="true" /></button>
        <button class="icon-button icon-button-ghost icon-button-message msg-action-btn" data-action="retry" data-idx="${i}" aria-label="다시 생성" title="다시 생성"><img class="icon icon-small" data-icon="regenerate" alt="" aria-hidden="true" /></button>
        <button class="icon-button icon-button-ghost icon-button-message msg-action-btn" data-action="copy" data-idx="${i}" aria-label="복사" title="복사"><img class="icon icon-small" data-icon="copy" alt="" aria-hidden="true" /></button>
        <button class="icon-button icon-button-ghost icon-button-message msg-action-btn" data-action="more" data-idx="${i}" aria-label="더보기" title="더보기"><img class="icon icon-small" data-icon="more-horizontal" alt="" aria-hidden="true" /></button>
      </div>`
                        : "";
                return `<div class="chat-msg ${m.role}">${m.text.replace(/\n/g, "<br>")}${m.time ? `<span class="msg-time">${m.time}</span>` : ""}${actions}</div>`;
            })
            .join("");
        el.scrollTop = el.scrollHeight;

        // Bind message action buttons
        $$(".msg-action-btn", el).forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const idx = parseInt(btn.dataset.idx);
                if (action === "like") {
                    btn.classList.toggle("active");
                    showToast("피드백이 반영되었습니다.");
                } else if (action === "dislike") {
                    btn.classList.toggle("active");
                    showToast("피드백이 반영되었습니다.");
                } else if (action === "retry") {
                    showToast("답변을 다시 생성합니다.");
                } else if (action === "copy") {
                    const msg = chatConversations[activeChatTopic][idx];
                    if (msg) {
                        navigator.clipboard
                            .writeText(msg.text)
                            .then(() => showToast("복사되었습니다."))
                            .catch(() => showToast("복사되었습니다."));
                    }
                } else if (action === "more") {
                    showToast("추가 옵션");
                }
            });
        });
    }

    function switchTab(tab) {
        currentTab = tab;
        const body = $("#centerBody");

        // Restore left panel if collapsed by compare tab
        if (tab !== "compare") {
            const leftPanel = $(".panel-folder");
            if (leftPanel && leftPanel.classList.contains("panel-collapsed")) {
                window.AppCommon.setThreePanelCollapsed(leftPanel, false);
            }
        }

        if (tab === "recommend") {
            body.innerHTML = "";
            body.innerHTML = `<div class="split-handler center-split" data-component="split-handler" data-split-min="100" id="tabRecommend">
        <div class="split-handler-left center-left">
          <div class="sub-head"><span class="sub-title">관련자료 추천 목록</span><span class="sub-badge">유사도순</span></div>
          <div class="filter-bar">
            <button class="filter-chip active" data-f="all">전체</button>
            <button class="filter-chip" data-f="similar">유사답변서</button>
            <button class="filter-chip" data-f="reference">참고자료</button>
          </div>
          <div class="recommend-list" id="recommendList"></div>
          <div class="rec-apply-bar"><button class="btn-outline" id="applyToChat">선택 자료 초안에 반영</button></div>
        </div>
        <div class="split-handler-handle" role="separator" aria-label="좌우 영역 크기 조절" aria-orientation="vertical" tabindex="0"></div>
        <div class="split-handler-right center-right">
          <div class="sub-head"><span class="sub-title">문서 미리보기</span><span class="sub-badge blue">유사도 94%</span></div>
          <div class="preview-body" id="previewBody"></div>
        </div>
      </div>`;
            bindFilterChips();
            renderRecommendations();
            renderPreview(recommendations[0]);
            bindApplyToChat();
        } else if (tab === "draft") {
            if (isReset || files.length === 0) {
                body.innerHTML = `<div class="empty-state"><img class="empty-state-icon" data-icon="edit" alt="" aria-hidden="true" /><p class="empty-title">답변서 초안이 없습니다</p><p class="empty-desc">우측 AI 채팅에 질의 내용이나 검색 키워드를 입력하여 초안을 생성해 보세요</p></div>`;
                return;
            }
            body.innerHTML = `<div class="draft-view-wrapper">
      <div class="draft-version-bar">
        <div class="draft-doc-tabs" id="draftDocTabs">
          <button class="draft-doc-tab active" data-dtab="0">답변서 초안 <span class="draft-doc-tab-close" data-dtab-close="0">×</span></button>
        </div>
        <div class="version-bar-right">
          <span class="version-label">버전</span>
          <select class="version-select" id="versionSelect">
            ${draftVersions.map((v, i) => `<option value="${i}"${i === activeDraftVersion ? " selected" : ""}>${v.label} (${v.time})</option>`).join("")}
          </select>
          <button class="icon-button verify-icon-btn" id="verifyRefreshBtn" aria-label="초기화" title="초기화"><img class="icon icon-small" data-icon="regenerate" alt="" aria-hidden="true" /></button>
          <button class="icon-button verify-icon-btn" id="verifyDownloadBtn" aria-label="다운로드" title="다운로드"><img class="icon icon-small" data-icon="download" alt="" aria-hidden="true" /></button>
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
      ${draftContent}<div class="draft-status-bar">
        <div class="draft-status-left">
          <span class="draft-stat">글자 수: <strong id="draftCharCount">0</strong></span>
          <span class="draft-stat-sep">|</span>
          <span class="draft-stat">페이지 <strong id="draftPageNum">1</strong>/<strong id="draftPageTotal">1</strong></span>
        </div>
        <div class="draft-status-right">
          <button class="icon-button draft-zoom-btn" id="draftZoomOut" aria-label="축소">−</button>
          <span class="draft-zoom-val" id="draftZoomVal">100%</span>
          <button class="icon-button draft-zoom-btn" id="draftZoomIn" aria-label="확대">+</button>
          <button class="icon-button draft-zoom-btn" id="draftFitBtn" aria-label="전체화면" title="전체화면">
            <img class="icon icon-small" data-icon="expand" alt="" aria-hidden="true" />
          </button>
        </div>
      </div></div>`;
            initDraftStatusBar();
            initDraftVerify();
            initDraftVersionBar();
        } else if (tab === "compare") {
            if (isReset || files.length === 0) {
                body.innerHTML = `<div class="empty-state"><img class="empty-state-icon" data-icon="clipboard" alt="" aria-hidden="true" /><p class="empty-title">비교할 답변서가 없습니다</p><p class="empty-desc">답변서 초안을 생성하면 유사답변서와 비교할 수 있습니다</p></div>`;
                return;
            }
            // Auto-collapse left panel
            const leftPanel = $(".panel-folder");
            if (leftPanel && !leftPanel.classList.contains("panel-collapsed")) {
                window.AppCommon.setThreePanelCollapsed(leftPanel, true);
            }
            body.innerHTML = `<div class="compare-view">${compareContent}</div>`;
            initCompareResize();
        }
    }

    function initCompareResize() {
        $$(".cmp-col-resize").forEach((handle) => {
            handle.addEventListener("mousedown", (e) => {
                e.preventDefault();
                const left = handle.previousElementSibling;
                const right = handle.nextElementSibling;
                if (!left || !right) return;
                const startX = e.clientX;
                const startLeftW = left.offsetWidth;
                const startRightW = right.offsetWidth;
                handle.classList.add("active");
                document.body.style.cursor = "col-resize";
                document.body.style.userSelect = "none";
                const onMouseMove = (ev) => {
                    const diff = ev.clientX - startX;
                    const newLeftW = Math.max(150, startLeftW + diff);
                    const newRightW = Math.max(150, startRightW - diff);
                    left.style.flex = "none";
                    left.style.width = newLeftW + "px";
                    right.style.flex = "none";
                    right.style.width = newRightW + "px";
                };
                const onMouseUp = () => {
                    handle.classList.remove("active");
                    document.body.style.cursor = "";
                    document.body.style.userSelect = "";
                    document.removeEventListener("mousemove", onMouseMove);
                    document.removeEventListener("mouseup", onMouseUp);
                };
                document.addEventListener("mousemove", onMouseMove);
                document.addEventListener("mouseup", onMouseUp);
            });
        });
    }

    function bindFilterChips() {
        $$(".filter-chip").forEach((chip) => {
            chip.addEventListener("click", () => {
                $$(".filter-chip").forEach((c) => c.classList.remove("active"));
                chip.classList.add("active");
                currentFilter = chip.dataset.f || "all";
                renderRecommendations();
                const filtered = currentFilter === "all" ? recommendations : recommendations.filter((r) => r.category === currentFilter);
                if (filtered.length) renderPreview(filtered[0]);
                updateFilterDesc(currentFilter);
                bindApplyToChat();
                bindSelectAll();
            });
        });
        updateFilterDesc(currentFilter);
        bindSelectAll();
    }

    function bindSelectAll() {
        const selectAll = $("#recSelectAll");
        if (!selectAll) return;
        const filtered = currentFilter === "all" ? recommendations : recommendations.filter((r) => r.category === currentFilter);
        selectAll.checked = filtered.length > 0 && filtered.every((r) => selectedRecIds.includes(r.id));
        selectAll.addEventListener("change", () => {
            if (selectAll.checked) {
                filtered.forEach((r) => {
                    if (!selectedRecIds.includes(r.id)) selectedRecIds.push(r.id);
                });
            } else {
                const filteredIds = filtered.map((r) => r.id);
                selectedRecIds = selectedRecIds.filter((id) => !filteredIds.includes(id));
            }
            renderRecommendations();
            renderSelectedRefs();
        });
    }

    function bindApplyToChat() {
        const btn = $("#applyToChat");
        if (!btn) return;
        btn.addEventListener("click", () => {
            if (selectedRecIds.length === 0) {
                showToast("자료를 선택해주세요.");
                return;
            }
            const selected = recommendations.filter((r) => selectedRecIds.includes(r.id));
            const titles = selected.map((r) => r.title).join(", ");
            const prompt = `다음 자료를 참고하여 답변서 초안을 생성해주세요:\n${selected.map((r, i) => `${i + 1}. ${r.title} (유사도 ${r.score}%)`).join("\n")}`;

            // Send to chat
            const now = new Date();
            const time = now.getHours() + ":" + String(now.getMinutes()).padStart(2, "0");
            chatConversations[activeChatTopic].push({ role: "user", text: prompt, time });
            renderChatMessages();

            setTimeout(() => {
                chatConversations[activeChatTopic].push({
                    role: "ai",
                    text: `선택하신 ${selected.length}건의 자료를 분석하여 답변서 초안에 반영합니다.\n\n📋 반영 자료:\n${selected.map((r) => "• " + r.title).join("\n")}\n\n초안 생성을 시작합니다. "답변서 초안" 탭에서 결과를 확인하세요.`,
                    time,
                });
                renderChatMessages();
            }, 800);

            showToast(`${selected.length}건의 자료가 초안에 반영됩니다.`);
        });
    }

    function updateFilterDesc(filter) {
        let descEl = $(".filter-desc");
        const list = $(".recommend-list") || $("#recommendList");
        if (!list) return;
        if (!descEl) {
            descEl = document.createElement("div");
            descEl.className = "filter-desc";
            list.parentElement.insertBefore(descEl, list);
        }
        if (filter === "similar") {
            descEl.textContent = "과거 답변서와 마스터답변 중 현재 질의와 유사도가 높은 자료를 추천합니다.";
            descEl.style.display = "";
        } else if (filter === "reference") {
            descEl.textContent = "답변서에 첨부하거나 답변서 초안 생성 시 근거로 활용할 수 있는 참고자료입니다.";
            descEl.style.display = "";
        } else {
            descEl.style.display = "none";
        }
    }

    // ─── Events ───
    function bindEvents() {
        // Logout
        const logoutBtn = $(".logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                customConfirm("로그아웃", "로그아웃 하시겠습니까?", () => {
                    window.AppCommon.logout();
                });
            });
        }

        // Top tabs
        $$(".top-tab").forEach((tab) =>
            tab.addEventListener("click", () => {
                $$(".top-tab").forEach((t) => t.classList.remove("active"));
                tab.classList.add("active");
                switchTab(tab.dataset.tab);
            }),
        );

        // Filter chips (initial)
        bindFilterChips();

        // Upload zone
        const uploadZone = $("#uploadZone");
        if (uploadZone) uploadZone.addEventListener("app:file-upload", (event) => addUploadFiles(event.detail.files));

        // Chat
        $("#chatSendBtn").addEventListener("click", sendChat);
        $("#chatInput").addEventListener("keydown", (e) => {
            if (e.key === "Enter") sendChat();
        });

        // New Chat button
        const newChatBtn = $("#newChatBtn");
        if (newChatBtn) {
            newChatBtn.addEventListener("click", () => {
                const newId = chatTopics.length;
                const now = new Date();
                const time = now.getHours() + ":" + String(now.getMinutes()).padStart(2, "0");
                chatTopics.push({ title: "새 대화 #" + (newId + 1), time, id: newId });
                chatConversations.push([{ role: "ai", text: "새 대화가 시작되었습니다. 무엇을 도와드릴까요?", time }]);
                activeChatTopic = newId;
                renderChatTopics();
                renderChatMessages();
                showToast("새 채팅이 생성되었습니다.");
            });
        }

        // Chat list toggle (drawer)
        const chatListToggle = $("#chatListToggle");
        const chatDrawer = $("#chatDrawer");
        const chatDrawerBackdrop = $("#chatDrawerBackdrop");
        const chatDrawerClose = $("#chatDrawerClose");

        function openChatDrawer() {
            if (chatDrawer) chatDrawer.classList.remove("hidden");
            if (chatDrawerBackdrop) chatDrawerBackdrop.classList.remove("hidden");
        }
        function closeChatDrawer() {
            if (chatDrawer) chatDrawer.classList.add("hidden");
            if (chatDrawerBackdrop) chatDrawerBackdrop.classList.add("hidden");
        }

        if (chatListToggle) chatListToggle.addEventListener("click", openChatDrawer);
        if (chatDrawerClose) chatDrawerClose.addEventListener("click", closeChatDrawer);
        if (chatDrawerBackdrop) chatDrawerBackdrop.addEventListener("click", closeChatDrawer);

        // Drawer position toggle
        const drawerPosBtn = $("#drawerPosBtn");
        if (drawerPosBtn && chatDrawer) {
            drawerPosBtn.addEventListener("click", () => {
                chatDrawer.classList.toggle("drawer-left");
                const label = $("#drawerPosLabel");
                if (chatDrawer.classList.contains("drawer-left")) {
                    if (label) label.textContent = "우측으로 이동";
                } else {
                    if (label) label.textContent = "좌측으로 이동";
                }
            });
        }

        // Chat mode buttons
        $$(".mode-btn").forEach((btn) =>
            btn.addEventListener("click", () => {
                $$(".mode-btn").forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                const desc = $("#chatModeDesc");
                if (desc) {
                    if (btn.dataset.mode === "fast") {
                        desc.textContent = "간단한 지시만으로 문서 초안을 빠르게 생성합니다.";
                    } else {
                        desc.textContent = "좌측 자료 폴더와 업로드 파일의 요구사항을 우선 반영해 초안을 생성합니다.";
                    }
                }
            }),
        );

        // Chat tags
        $$(".chat-tag").forEach((tag) =>
            tag.addEventListener("click", () => {
                const input = $("#chatInput");
                input.value = tag.textContent + ": ";
                input.focus();
            }),
        );

        // Buttons
        const resetBtn = $("#resetBtn");
        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                // Clear files
                files.length = 0;
                renderFiles();
                // Clear selected refs
                selectedRecIds = [];
                renderSelectedRefs();
                // Reset filter
                currentFilter = "all";
                // Switch to recommend tab
                $$(".top-tab").forEach((t) => t.classList.remove("active"));
                $$(".top-tab")[0].classList.add("active");
                // Show empty states
                const centerBody = $("#centerBody");
                if (centerBody) {
                    centerBody.innerHTML = `<div class="empty-state"><img class="empty-state-icon" data-icon="search" alt="" aria-hidden="true" /><p class="empty-title">검색된 추천 자료가 없습니다</p><p class="empty-desc">우측 AI 채팅에 질의 내용이나 검색 키워드를 입력해 보세요<br/>AI가 관련 유사답변서와 참고자료를 추천합니다</p></div>`;
                }
                // Reset chat
                chatConversations[0] = [
                    { role: "ai", text: "안녕하세요! 답변서 초안 작성을 도와드리겠습니다. 파일을 업로드하면 관련 자료를 분석합니다.", time: new Date().getHours() + ":" + String(new Date().getMinutes()).padStart(2, "0") },
                ];
                activeChatTopic = 0;
                renderChatMessages();
                // Reset versions
                draftVersions.length = 1;
                activeDraftVersion = 0;
                // Update file count
                const fileCount = $("#fileCount");
                if (fileCount) fileCount.textContent = "0";
                isReset = true;
                // Update tab counts
                const tabRec = $("#tabCountRecommend");
                const tabDraft = $("#tabCountDraft");
                const tabCompare = $("#tabCountCompare");
                if (tabRec) tabRec.textContent = "0";
                if (tabDraft) tabDraft.textContent = "0";
                if (tabCompare) tabCompare.textContent = "0";
                showToast("초기화되었습니다.");
            });
        }

        // Collapsed add button → trigger file input
        const collapsedAddBtn = $("#collapsedAddBtn");
        if (collapsedAddBtn) {
            collapsedAddBtn.addEventListener("click", () => {
                const fileInput = $("#fileInput");
                if (fileInput) fileInput.click();
            });
        }

        // Left panel vertical resize (between upload and selected refs)
        const leftResizeHandle = $("#leftPanelResizeHandle");
        if (leftResizeHandle) {
            leftResizeHandle.addEventListener("mousedown", (e) => {
                e.preventDefault();
                const uploadSection = $(".folder-upload-section");
                const refsSection = $("#selectedRefsSection");
                if (!uploadSection || !refsSection) return;
                const startY = e.clientY;
                const startUploadH = uploadSection.offsetHeight;
                const startRefsH = refsSection.offsetHeight;
                leftResizeHandle.classList.add("active");
                document.body.style.cursor = "row-resize";
                document.body.style.userSelect = "none";

                const onMouseMove = (ev) => {
                    const diff = ev.clientY - startY;
                    const newUploadH = Math.max(80, startUploadH + diff);
                    const newRefsH = Math.max(60, startRefsH - diff);
                    uploadSection.style.flex = "none";
                    uploadSection.style.height = newUploadH + "px";
                    refsSection.style.flex = "none";
                    refsSection.style.height = newRefsH + "px";
                };
                const onMouseUp = () => {
                    leftResizeHandle.classList.remove("active");
                    document.body.style.cursor = "";
                    document.body.style.userSelect = "";
                    document.removeEventListener("mousemove", onMouseMove);
                    document.removeEventListener("mouseup", onMouseUp);
                };
                document.addEventListener("mousemove", onMouseMove);
                document.addEventListener("mouseup", onMouseUp);
            });
        }

        // Fullscreen
        if ($("#fullscreenBtn")) {
            $("#fullscreenBtn").addEventListener("click", () => {
                document.body.classList.toggle("fullscreen-mode");
                if (document.body.classList.contains("fullscreen-mode")) {
                    showToast("전체화면 모드");
                } else {
                    showToast("일반 모드");
                }
            });
        }

        // Tree items handled by event delegation in renderTree
    }

    // ─── File Upload ───
    function addUploadFiles(newFiles) {
        newFiles.forEach((file) => {
            const ext = file.name.split(".").pop().toLowerCase();
            let type = "txt";
            if (ext === "pdf") type = "pdf";
            else if (ext === "hwp") type = "hwp";
            else if (ext === "docx" || ext === "doc") type = "docx";
            else if (ext === "xlsx" || ext === "xls") type = "xls";
            else if (["png", "jpg", "jpeg", "tif", "tiff"].includes(ext)) type = "img";
            const size = (file.size / 1024 / 1024).toFixed(1) + "MB";
            files.push({ name: file.name, size, type });
        });
        isReset = false;
        renderFiles();
        showToast(`${newFiles.length}건 파일이 업로드되었습니다.`);
        const fileCount = $("#fileCount");
        if (fileCount) fileCount.textContent = files.length;
    }

    function sendChat() {
        const input = $("#chatInput");
        const text = input.value.trim();
        if (!text) return;
        const now = new Date();
        const time = now.getHours() + ":" + String(now.getMinutes()).padStart(2, "0");
        chatConversations[activeChatTopic].push({ role: "user", text, time });
        renderChatMessages();
        input.value = "";
        setTimeout(() => {
            chatConversations[activeChatTopic].push({ role: "ai", text: "답변서 초안을 수정했습니다. 요청하신 내용이 반영되었습니다.", time });
            renderChatMessages();
            // Create new draft version
            const vNum = draftVersions.length + 1;
            const vLabel = "v" + vNum + ".0";
            draftVersions.push({ id: vNum, label: vLabel, time: time, content: draftContent });
            activeDraftVersion = draftVersions.length - 1;
            // Update version select if on draft tab
            const vSelect = $("#versionSelect");
            if (vSelect) {
                const opt = document.createElement("option");
                opt.value = activeDraftVersion;
                opt.textContent = vLabel + " (" + time + ")";
                opt.selected = true;
                vSelect.appendChild(opt);
            }
            showToast("답변서 초안 " + vLabel + "이 생성되었습니다.");
        }, 800);
    }

    // ─── Draft Version Bar ───
    let openDocTabs = [{ id: 0, label: "답변서 초안", versionIdx: 0 }];
    let activeDocTab = 0;

    function initDraftVersionBar() {
        // Version select change
        const versionSelect = $("#versionSelect");
        if (versionSelect) {
            versionSelect.addEventListener("change", () => {
                const idx = parseInt(versionSelect.value);
                activeDraftVersion = idx;
                const ver = draftVersions[idx];
                const existing = openDocTabs.find((t) => t.versionIdx === idx);
                if (!existing) {
                    const newTab = { id: openDocTabs.length, label: ver.label, versionIdx: idx };
                    openDocTabs.push(newTab);
                    activeDocTab = newTab.id;
                } else {
                    activeDocTab = existing.id;
                }
                renderDocTabs();
            });
        }

        // Refresh button (clear verification highlights)
        const refreshBtn = $("#verifyRefreshBtn");
        if (refreshBtn) {
            refreshBtn.addEventListener("click", () => {
                clearVerification();
                showToast("검증 결과가 초기화되었습니다.");
            });
        }

        // Download button
        const downloadBtn = $("#verifyDownloadBtn");
        if (downloadBtn) {
            downloadBtn.addEventListener("click", () => {
                showToast("답변서 초안을 다운로드합니다.");
            });
        }

        // Doc tab clicks
        bindDocTabEvents();
    }

    function renderDocTabs() {
        const container = $("#draftDocTabs");
        if (!container) return;
        container.innerHTML = openDocTabs
            .map((t) => `<button class="draft-doc-tab${t.id === activeDocTab ? " active" : ""}" data-dtab="${t.id}">${t.label} <span class="draft-doc-tab-close" data-dtab-close="${t.id}">×</span></button>`)
            .join("");
        bindDocTabEvents();
    }

    function bindDocTabEvents() {
        const container = $("#draftDocTabs");
        if (!container) return;
        $$(".draft-doc-tab", container).forEach((tab) => {
            tab.addEventListener("click", (e) => {
                if (e.target.closest(".draft-doc-tab-close")) return;
                activeDocTab = parseInt(tab.dataset.dtab);
                $$(".draft-doc-tab", container).forEach((t) => t.classList.remove("active"));
                tab.classList.add("active");
            });
        });
        $$(".draft-doc-tab-close", container).forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.dtabClose);
                if (openDocTabs.length <= 1) return; // keep at least one
                openDocTabs = openDocTabs.filter((t) => t.id !== id);
                if (activeDocTab === id) activeDocTab = openDocTabs[0].id;
                renderDocTabs();
            });
        });
    }

    // ─── Draft Verify ───
    const verifyRefData = [
        { file: "260402_재경위_전체 의원 질의에 대한 답변_통합본.hwp", org: "기획재정부 · 2026.04 · p.3", quote: '"공공자금관리기금은 지방재정 지원을 목적으로 지방자치단체가 발행하는 지방채를 장기 저리로 인수하여 자금을 지원함"' },
        { file: "지방채 인수를 해야 하는 법적 의무.hwpx", org: "재정정책국 · 법령분석 · p.1", quote: '"지방재정법 시행령 제11조, 공공자금관리기금법 시행령 제2조에 의거하여 지방채 인수를 집행한다"' },
        { file: "지방교부세가 지급되고 있고 지방채 인수시 추경 편성 이유.hwpx", org: "기획재정위원회 · 2026년 · p.2", quote: '"특정 자본적 지출 사업의 원활한 추진을 위해 필요한 경우 추경을 통해 인수 예산을 편성함"' },
        { file: "민주당 반대로 무산된 TK통합법 관련 견해.hwpx", org: "기획재정위원회 · 2026년 · p.1", quote: '"광주·전남 통합특별시 출범과 관련하여 통합전산망 구축 등 실제 수요가 발생함에 따라 추경을 편성함"' },
    ];

    function initDraftVerify() {
        runVerification();

        // Checkbox mode switching - re-run on change
        $$(".verify-check").forEach((chk) => {
            chk.addEventListener("change", () => {
                clearVerification();
                if ($('.verify-check[data-mode="highlight"]').checked || $('.verify-check[data-mode="source"]').checked) {
                    runVerification();
                }
            });
        });
    }

    function runVerification() {
        const editor = $(".draft-editor");
        if (!editor) return;
        const highlightOn = $('.verify-check[data-mode="highlight"]') && $('.verify-check[data-mode="highlight"]').checked;
        const sourceOn = $('.verify-check[data-mode="source"]') && $('.verify-check[data-mode="source"]').checked;

        const sentences = $$("li, p", editor);
        let sentenceIdx = 0;
        sentences.forEach((el) => {
            if (!el.textContent.trim() || el.textContent.trim().length < 10) return;
            el.classList.remove("verify-green", "verify-yellow", "verify-red");
            el.querySelectorAll(".verify-badge").forEach((b) => b.remove());

            sentenceIdx++;
            const rand = Math.random();
            let cls, badgeText, badgeCls;
            if (rand < 0.6) {
                cls = "verify-green";
                badgeText = `[${Math.ceil(Math.random() * 4)}]`;
                badgeCls = "verify-badge-green";
            } else if (rand < 0.85) {
                cls = "verify-yellow";
                badgeText = "[주의]";
                badgeCls = "verify-badge-yellow";
            } else {
                cls = "verify-red";
                badgeText = "[출처없음]";
                badgeCls = "verify-badge-red";
            }
            if (highlightOn) el.classList.add(cls);
            el.dataset.verifyIdx = sentenceIdx;
            if (sourceOn) {
                el.insertAdjacentHTML("beforeend", ` <sup class="verify-badge ${badgeCls}" data-vbadge="${sentenceIdx}">${badgeText}</sup>`);
            }
        });

        // Bind click on verified sentences
        $$(".verify-green, .verify-yellow, .verify-red", editor).forEach((el) => {
            el.style.cursor = "pointer";
            el.addEventListener("click", () => openVerifyDetail(el));
        });
    }

    function clearVerification() {
        const editor = $(".draft-editor");
        if (!editor) return;
        $$(".verify-green, .verify-yellow, .verify-red", editor).forEach((el) => {
            el.classList.remove("verify-green", "verify-yellow", "verify-red");
            el.style.cursor = "";
        });
        $$(".verify-badge", editor).forEach((b) => b.remove());
        const detail = $(".verify-detail-panel");
        if (detail) detail.remove();
        const resHandle = $(".draft-split-area > .split-handler-handle");
        if (resHandle) resHandle.remove();
        const splitArea = $(".draft-split-area");
        const draftView = $(".draft-view");
        if (splitArea && draftView) {
            splitArea.parentNode.insertBefore(draftView, splitArea);
            draftView.classList.remove("split-handler-left");
            splitArea.remove();
        }
        const wrapper = $(".draft-view-wrapper");
        if (wrapper) wrapper.classList.remove("verify-split");
    }

    function openVerifyDetail(el) {
        const wrapper = $(".draft-view-wrapper");
        if (!wrapper) return;

        // Create split container if not exists
        let splitArea = $(".draft-split-area");
        const draftView = $(".draft-view");
        if (!splitArea && draftView) {
            splitArea = document.createElement("div");
            splitArea.className = "split-handler draft-split-area";
            splitArea.dataset.component = "split-handler";
            splitArea.dataset.splitMin = "100";
            draftView.parentNode.insertBefore(splitArea, draftView);
            draftView.classList.add("split-handler-left");
            splitArea.appendChild(draftView);
        }

        // Add split mode
        wrapper.classList.add("verify-split");

        // Get or create detail panel
        let detail = $(".verify-detail-panel");
        if (!detail) {
            // Add resize handle
            let resizeHandle = splitArea.querySelector(".split-handler-handle");
            if (!resizeHandle) {
                resizeHandle = document.createElement("div");
                resizeHandle.className = "split-handler-handle";
                resizeHandle.setAttribute("role", "separator");
                resizeHandle.setAttribute("aria-label", "좌우 영역 크기 조절");
                resizeHandle.setAttribute("aria-orientation", "vertical");
                resizeHandle.tabIndex = 0;
                splitArea.appendChild(resizeHandle);
            }
            detail = document.createElement("div");
            detail.className = "split-handler-right verify-detail-panel";
            splitArea.appendChild(detail);
        }

        const sentText = el.textContent.replace(/\[\d+\]|\[주의\]|\[출처없음\]/g, "").trim();
        const idx = el.dataset.verifyIdx || "01";
        const isGreen = el.classList.contains("verify-green");
        const isYellow = el.classList.contains("verify-yellow");

        // Pick random refs
        const ref1 = verifyRefData[Math.floor(Math.random() * verifyRefData.length)];
        const ref2 = verifyRefData[Math.floor(Math.random() * verifyRefData.length)];

        let statusBadge = '<span class="vd-status-badge green">근거 확인</span>';
        if (isYellow) statusBadge = '<span class="vd-status-badge yellow">주의</span>';
        if (!isGreen && !isYellow) statusBadge = '<span class="vd-status-badge red">출처 누락</span>';

        detail.innerHTML = `
      <div class="vd-header">
        <div class="vd-header-left">
          <span class="vd-title">근거 상세 확인</span>
          <span class="vd-desc">선택 문장의 출처, 원문, 검토 의견</span>
        </div>
        ${statusBadge}
      </div>
      <div class="vd-tabs">
        <button class="vd-tab active" data-vd-tab="ref">근거자료</button>
        <button class="vd-tab" data-vd-tab="risk">위험표현</button>
      </div>
      <div class="vd-body" id="vdBody">
        <div class="vd-tab-content" data-vd-content="ref">
          <div class="vd-section">
            <div class="vd-section-head"><span class="vd-section-title">선택 문장</span><span class="vd-sentence-num">문장 ${String(idx).padStart(2, "0")}</span></div>
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
            <div class="vd-section-head"><span class="vd-section-title">선택 문장</span><span class="vd-sentence-num">문장 ${String(idx).padStart(2, "0")}</span></div>
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
      <button type="button" class="icon-button icon-button-ghost vd-close" id="verifyDetailClose" aria-label="검증 상세 닫기">×</button>
    `;

        // Close button
        $("#verifyDetailClose").addEventListener("click", () => {
            detail.remove();
            const resHandle = $(".draft-split-area > .split-handler-handle");
            if (resHandle) resHandle.remove();
            wrapper.classList.remove("verify-split");
            // Restore draft-view out of split area
            const splitArea = $(".draft-split-area");
            const draftView = $(".draft-view");
            if (splitArea && draftView) {
                splitArea.parentNode.insertBefore(draftView, splitArea);
                draftView.classList.remove("split-handler-left");
                splitArea.remove();
            }
        });

        // Tab switching
        $$(".vd-tab", detail).forEach((tab) => {
            tab.addEventListener("click", () => {
                $$(".vd-tab", detail).forEach((t) => t.classList.remove("active"));
                tab.classList.add("active");
                const target = tab.dataset.vdTab;
                $$(".vd-tab-content", detail).forEach((c) => c.classList.add("hidden"));
                const content = $(`.vd-tab-content[data-vd-content="${target}"]`, detail);
                if (content) content.classList.remove("hidden");
            });
        });
    }

    // ─── Draft Status Bar ───
    function initDraftStatusBar() {
        const editor = $(".draft-editor");
        if (!editor) return;

        // Character count
        const text = editor.innerText || editor.textContent || "";
        const charCount = text.replace(/\s/g, "").length;
        const charEl = $("#draftCharCount");
        if (charEl) charEl.textContent = charCount.toLocaleString();

        // Page estimate (roughly 2000 chars per page)
        const pages = Math.max(1, Math.ceil(charCount / 2000));
        const pageNum = $("#draftPageNum");
        const pageTotal = $("#draftPageTotal");
        if (pageNum) pageNum.textContent = "1";
        if (pageTotal) pageTotal.textContent = pages;

        // Zoom
        let zoom = 100;
        const zoomVal = $("#draftZoomVal");
        const zoomIn = $("#draftZoomIn");
        const zoomOut = $("#draftZoomOut");
        const fitBtn = $("#draftFitBtn");

        function applyZoom() {
            editor.style.transform = "scale(" + zoom / 100 + ")";
            editor.style.transformOrigin = "top left";
            editor.style.width = 10000 / zoom + "%";
            if (zoomVal) zoomVal.textContent = zoom + "%";
        }

        if (zoomIn)
            zoomIn.addEventListener("click", () => {
                zoom = Math.min(200, zoom + 10);
                applyZoom();
            });
        if (zoomOut)
            zoomOut.addEventListener("click", () => {
                zoom = Math.max(50, zoom - 10);
                applyZoom();
            });
        if (fitBtn)
            fitBtn.addEventListener("click", () => {
                const wrapper = $(".draft-view-wrapper");
                if (!wrapper) return;
                wrapper.classList.toggle("draft-fullscreen");
                if (wrapper.classList.contains("draft-fullscreen")) {
                    showToast("전체화면 모드 (ESC로 종료)");
                } else {
                    showToast("일반 모드");
                }
            });

        // ESC key to exit draft fullscreen
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                const wrapper = $(".draft-view-wrapper.draft-fullscreen");
                if (wrapper) {
                    wrapper.classList.remove("draft-fullscreen");
                    showToast("일반 모드");
                }
            }
        });
    }

    // ─── Rename Modal ───
    function openRenameModal(idx) {
        let modal = $("#renameModal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "renameModal";
            modal.className = "rename-modal-backdrop hidden";
            modal.innerHTML = `<div class="rename-modal">
        <div class="rename-modal-head"><span>채팅 이름 변경</span><button type="button" class="icon-button icon-button-ghost rename-modal-close" id="renameModalClose" aria-label="채팅 이름 변경 닫기">×</button></div>
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

        const input = $("#renameInput");
        input.value = chatTopics[idx].title;
        modal.classList.remove("hidden");
        setTimeout(() => {
            input.focus();
            input.select();
        }, 100);

        const close = () => modal.classList.add("hidden");
        $("#renameModalClose").onclick = close;
        $("#renameCancelBtn").onclick = close;
        modal.onclick = (e) => {
            if (e.target === modal) close();
        };
        $("#renameConfirmBtn").onclick = () => {
            const val = input.value.trim();
            if (val) {
                chatTopics[idx].title = val;
                renderChatTopics();
                showToast("이름이 변경되었습니다.");
            }
            close();
        };
        input.onkeydown = (e) => {
            if (e.key === "Enter") $("#renameConfirmBtn").click();
        };
    }

    // ─── Custom Modal (confirm/alert) ───
    function customConfirm(title, msg, onConfirm, type = "confirm") {
        let modal = $("#customModalBackdrop");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "customModalBackdrop";
            modal.className = "custom-modal-backdrop";
            document.body.appendChild(modal);
        }
        const iconCls = type === "danger" ? "danger" : "confirm";
        const btnCls = type === "danger" ? "btn-confirm danger" : "btn-confirm";
        modal.innerHTML = `<div class="custom-modal">
      <div class="custom-modal-icon ${iconCls}">${type === "danger" ? "⚠" : "?"}</div>
      <div class="custom-modal-title">${title}</div>
      <div class="custom-modal-msg">${msg}</div>
      <div class="custom-modal-actions">
        <button class="btn-cancel" id="cmCancel">취소</button>
        <button class="${btnCls}" id="cmConfirm">확인</button>
      </div>
    </div>`;
        modal.classList.remove("hidden");
        $("#cmCancel").addEventListener("click", () => modal.classList.add("hidden"));
        $("#cmConfirm").addEventListener("click", () => {
            modal.classList.add("hidden");
            if (onConfirm) onConfirm();
        });
        modal.addEventListener("click", (e) => {
            if (e.target === modal) modal.classList.add("hidden");
        });
    }

    function customAlert(title, msg) {
        let modal = $("#customModalBackdrop");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "customModalBackdrop";
            modal.className = "custom-modal-backdrop";
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
        modal.classList.remove("hidden");
        $("#cmOk").addEventListener("click", () => modal.classList.add("hidden"));
        modal.addEventListener("click", (e) => {
            if (e.target === modal) modal.classList.add("hidden");
        });
    }

    function showToast(msg) {
        const t = $("#toast");
        t.textContent = msg;
        t.classList.remove("hidden");
        setTimeout(() => t.classList.add("hidden"), 2000);
    }

    window.AppCommon.whenReady(init);
})();
