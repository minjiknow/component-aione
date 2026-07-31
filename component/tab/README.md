# Tab 컴포넌트

콘텐츠 영역을 같은 위치에서 전환할 때 사용합니다. 기본 `Tab`은 `ai-intake` 문서 보기의 밑줄형 텍스트 탭, `Tab Button`은 `ai-answer`의 상단 버튼형 탭을 공통화한 컴포넌트입니다. 콘텐츠 자체를 전환하면 Tab을 사용하고, 한 목록의 조건만 좁히는 경우에는 기존 `Filter Button`을 사용합니다.

- 필수 CSS: `component/count-badge/count-badge.css`, `component/tab/tab.css`
- 필수 JS: `js/common.js`
- 검수 페이지: `component/tab/tab.html`, `component/tab/tab-button.html`
- 공통 루트: `.tabs[data-tabs]`
- 전환 이벤트: `app:tab-change`

## 기본 Tab

`ai-intake`의 `하이라이트 보기 / 텍스트 보기 / 원본 보기`에서 사용하던 하단선, 텍스트 색상, 높이를 그대로 사용합니다.

```html
<div class="tabs" data-tabs>
    <div class="tab-list" role="tablist" aria-label="문서 보기">
        <button type="button" class="tab"
            id="documentTabHighlight" role="tab" aria-selected="false"
            aria-controls="documentTabPanelHighlight" data-tab-value="highlight"
            tabindex="-1">
            하이라이트 보기
        </button>
        <button type="button" class="tab"
            id="documentTabText" role="tab" aria-selected="false"
            aria-controls="documentTabPanelText" data-tab-value="text"
            tabindex="-1">
            텍스트 보기
        </button>
        <button type="button" class="tab is-active"
            id="documentTabOriginal" role="tab" aria-selected="true"
            aria-controls="documentTabPanelOriginal" data-tab-value="original">
            원본 보기
        </button>
    </div>

    <section class="tab-panel"
        id="documentTabPanelHighlight" role="tabpanel"
        aria-labelledby="documentTabHighlight" tabindex="0" hidden>
        하이라이트 내용
    </section>
    <section class="tab-panel"
        id="documentTabPanelText" role="tabpanel"
        aria-labelledby="documentTabText" tabindex="0" hidden>
        텍스트 내용
    </section>
    <section class="tab-panel is-active"
        id="documentTabPanelOriginal" role="tabpanel"
        aria-labelledby="documentTabOriginal" tabindex="0">
        원본 내용
    </section>
</div>
```

## Tab Button

`pages/ai-answer.html`의 상단 작업 탭과 같은 라운드, hover, 활성 색상을 사용하며 버튼의 최소 높이는 `30px`로 명시합니다. 탭 목록은 항목 너비만큼만 차지하고, 좁은 화면에서는 최대 너비 안에서 가로 스크롤됩니다. 구조와 동작은 기본 Tab과 같고 탭 목록과 버튼 클래스만 변경합니다. 탭별 건수는 별도 스타일을 복제하지 않고 `CountBadge`의 `.filter-count`를 조합합니다.

```html
<div class="tabs" data-tabs>
    <div class="tab-button-list" role="tablist" aria-label="답변서 작업">
        <button type="button" class="tab-button is-active"
            id="answerTabRecommend" role="tab" aria-selected="true"
            aria-controls="answerTabPanelRecommend" data-tab-value="recommend">
            관련자료 추천
            <span class="filter-count" aria-label="8건">8</span>
        </button>
        <button type="button" class="tab-button"
            id="answerTabDraft" role="tab" aria-selected="false"
            aria-controls="answerTabPanelDraft" data-tab-value="draft"
            tabindex="-1">
            답변서 초안
            <span class="filter-count" aria-label="1건">1</span>
        </button>
        <button type="button" class="tab-button"
            id="answerTabCompare" role="tab" aria-selected="false"
            aria-controls="answerTabPanelCompare" data-tab-value="compare"
            tabindex="-1">
            답변서 비교
            <span class="filter-count" aria-label="1건">1</span>
        </button>
    </div>

    <section class="tab-panel is-active"
        id="answerTabPanelRecommend" role="tabpanel"
        aria-labelledby="answerTabRecommend" tabindex="0">
        관련자료 추천 내용
    </section>
    <section class="tab-panel"
        id="answerTabPanelDraft" role="tabpanel"
        aria-labelledby="answerTabDraft" tabindex="0" hidden>
        답변서 초안 내용
    </section>
    <section class="tab-panel"
        id="answerTabPanelCompare" role="tabpanel"
        aria-labelledby="answerTabCompare" tabindex="0" hidden>
        답변서 비교 내용
    </section>
</div>
```

### Soft Variant

참고 자료처럼 외곽 그룹 테두리 없이 활성 탭만 옅은 파란 배경과 테두리로 표시하려면 탭 목록에 `data-tab-button-variant="soft"`를 추가합니다. 탭 의미·키보드 동작·패널 연결 방식은 채움형과 같습니다.

```html
<div class="tabs" data-tabs>
    <div class="tab-button-list" role="tablist"
        aria-label="자료 유형" data-tab-button-variant="soft">
        <button type="button" class="tab-button is-active"
            id="sourceTabAll" role="tab" aria-selected="true"
            aria-controls="sourceTabPanelAll" data-tab-value="all">
            전체 <span class="filter-count" aria-label="8건">8</span>
        </button>
        <button type="button" class="tab-button"
            id="sourceTabRecommend" role="tab" aria-selected="false"
            aria-controls="sourceTabPanelRecommend" data-tab-value="recommend"
            tabindex="-1">
            관련자료 추천 <span class="filter-count" aria-label="8건">8</span>
        </button>
        <button type="button" class="tab-button"
            id="sourceTabReference" role="tab" aria-selected="false"
            aria-controls="sourceTabPanelReference" data-tab-value="reference"
            tabindex="-1">
            참조소스 <span class="filter-count" aria-label="0건">0</span>
        </button>
    </div>

    <!-- 각 탭과 연결되는 tab-panel을 같은 tabs 루트 안에 배치합니다. -->
</div>
```

## 동작 및 접근성 규칙

- 탭의 `aria-controls`는 연결된 패널 `id`를 가리키고, 패널의 `aria-labelledby`는 탭 `id`를 가리킵니다.
- 초기 탭에는 `aria-selected="true"`와 `.is-active`를 적용합니다. 나머지 탭은 `tabindex="-1"`, 패널은 `hidden`으로 시작합니다.
- 비활성 탭에는 `disabled`, `aria-disabled="true"`, `tabindex="-1"`을 함께 적용합니다.
- 카운트에는 `.filter-count`와 실제 건수를 읽을 수 있는 `aria-label`을 함께 사용합니다.
- 활성 탭에는 hover 모양을 추가하지 않고 현재 활성 스타일을 그대로 유지합니다.
- 기본 `.tab-list`는 내부 스크롤을 만들지 않으므로 화면 너비에 맞는 개수의 탭만 배치합니다.
- `common.js`가 클릭, `ArrowLeft`, `ArrowRight`, `Home`, `End` 키 이동과 패널의 `hidden` 상태를 동기화합니다.
- 화면 안의 모든 탭과 패널 `id`는 고유해야 합니다.
- 선택 후 추가 작업이 필요하면 루트에서 `app:tab-change` 이벤트를 수신합니다.

```js
document.querySelector("[data-tabs]").addEventListener("app:tab-change", (event) => {
    console.log(event.detail.value);
});
```
