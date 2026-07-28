# DataTable 컴포넌트

## Empty state

Empty는 테이블의 디자인 variant가 아니라 조회 결과 상태이므로 별도 컴포넌트로 분리하지 않습니다. 컨테이너에는 `data-state="empty"`, 빈 행 셀에는 `.data-table-empty`를 사용합니다.

```html
<div class="data-table-container" data-state="empty">
    <div class="data-table-scroll">
        <table class="data-table" data-datatable>
            <!-- 데이터가 있는 상태와 동일한 열 너비를 유지합니다. -->
            <colgroup>
                <col class="data-table-col-service" />
                <col class="data-table-col-type" />
                <col class="data-table-col-task" />
                <col class="data-table-col-updated" />
                <col class="data-table-col-status" />
                <col class="data-table-col-created" />
                <col class="data-table-col-actions" />
            </colgroup>
            <tbody>
                <tr>
                    <td class="data-table-empty"
                        colspan="7"
                        role="status">데이터가 조회되지 않습니다</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
```

빈 상태 문구는 `var(--text-muted)`, `calc(10px * var(--ui-font-scale, 1))`, `font-weight: 500` 조합을 사용합니다.

기존 AI-ONE 홈의 `history-table` 디자인을 공통 컴포넌트로 정리한 데이터 테이블입니다. 제목 헤더, 전체 보기 액션, 유형 Badge, 상태 점, 행 DropdownMenu를 조합합니다.

- Fragment: `component/datatable/datatable.fragment.html`
- 필수 CSS: `component/datatable/datatable.css`, `component/dropdownmenu/dropdownmenu.css`
- 필수 JS: `component/datatable/datatable.js`, `component/dropdownmenu/dropdownmenu.js`
- 검수 페이지: `component/datatable/datatable.html`
- 외곽: `.data-table-container`
- 기본 최대 너비: `740px` (`--data-table-max-width: 100%`로 전체 너비 사용 가능)
- 제목 헤더: `.data-table-header`
- 본문 스크롤과 고정 열 제목: `.data-table-scroll`
- 테이블: `[data-datatable]`, `.data-table`
- 유형: 기존 `.type-badge`
- 상태: 기존 `.status-dot`
- 행 메뉴: DropdownMenu 컴포넌트

```html
<div class="data-table-container">
    <header class="data-table-header">
        <h2 class="data-table-title">최근 사용 이력</h2>
        <button type="button"
            class="data-table-more">전체 이력 보기 ›</button>
    </header>

    <div class="data-table-scroll">
        <table class="data-table" data-datatable>
            <caption>최근 사용 이력</caption>
            <colgroup>
                <col class="data-table-col-service" />
                <col class="data-table-col-type" />
                <col class="data-table-col-task" />
                <col class="data-table-col-updated" />
                <col class="data-table-col-status" />
                <col class="data-table-col-created" />
                <col class="data-table-col-actions" />
            </colgroup>
            <thead>
                <tr>
                    <th scope="col">서비스명</th>
                    <th scope="col">유형</th>
                    <th scope="col">최근 작업명</th>
                    <th scope="col">최근 이용일</th>
                    <th scope="col">상태</th>
                    <th scope="col">등록일</th>
                    <th><span class="prompt-composer-file-input">행 메뉴</span></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <span class="data-table-service">
                            <img class="icon"
                                data-icon="document"
                                alt=""
                                aria-hidden="true" />
                            <span class="data-table-service-name">국회 답변서 초안 작성</span>
                        </span>
                    </td>
                    <td><span class="type-badge ai">AI초안</span></td>
                    <td>2026년 청년 고용 정책 관련 답변 초안</td>
                    <td>2026.05.20 10:24</td>
                    <td><span class="status-dot done">완료</span></td>
                    <td>2026.05.19</td>
                    <td class="data-table-actions">
                        <!-- DropdownMenu -->
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
```

## 사용 규칙

- `caption`은 화면에 보이지 않아도 표의 목적을 설명하도록 작성합니다.
- 열 제목은 `scope="col"`을 사용합니다.
- 서비스 아이콘은 기존 `assets/icons`를 사용합니다.
- 유형은 `.type-badge.ai`, `.search`, `.report`, `.doc`을 사용합니다.
- 완료 상태는 `.status-dot.done`, 진행 상태는 `.status-dot.progress`를 사용합니다.
- 테이블은 `max-width: 740px` 안에서 모든 열이 보이도록 배치되며 가로 스크롤을 만들지 않습니다.
- 행이 많아져 `.data-table-scroll`의 기본 최대 높이 `370px`을 넘으면 본문만 세로로 스크롤되고 `thead`의 열 제목은 상단에 고정됩니다.
- 페이지별로 표시 높이를 바꿔야 하면 `.data-table-scroll`에 `--data-table-max-height`를 지정합니다.
- 행 액션은 별도 버튼을 새로 만들지 않고 DropdownMenu 컴포넌트를 조합합니다.
