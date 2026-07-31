# FileItem 컴포넌트

`FileList` 안에서 업로드 파일 하나를 표시하는 행입니다. 국회질의분류 기본형은 순번 원형, 파일 형식 색상점, 파일명·용량, 질의 건수와 옵션 메뉴를 사용합니다. `simple` 변형은 AI Answer의 dot·제목·상태 Badge 구조를 그대로 사용합니다.

- 필수 CSS: `component/file-list/file-list.css`, `component/file-item/file-item.css`, `component/dropdownmenu/dropdownmenu.css`, `component/modal/modal.css`
- 필수 JS: `component/dropdownmenu/dropdownmenu.js`, `component/_shared/layer-controller.js`, `component/modal/modal.js`, `component/file-item/file-item.js`
- 검수 페이지: `component/file-item/file-item.html`
- 행: `.file-list li`
- 파일 선택 영역: `.file-item-main`
- 파일 정보: `.file-index`, `.file-type-dot`, `.file-info`, `.file-name`, `.file-meta`
- 상태와 메뉴: `.file-item-side`, `.file-status-group`, `.file-action-wrap`
- 상태: `.active`, `.pinned`, `.processing`
- Simple 행: `.file-item-simple`

```html
<div data-file-actions data-file-delete-modal="fileDeleteModal">
    <ul class="file-list">
        <li class="active" data-file-idx="0">
            <button class="file-item-main" type="button" aria-label="파일 보기">
                <span class="file-index">24</span>
                <span class="file-type-dot pdf" aria-hidden="true"></span>
                <span class="file-icon file-icon-collapsed pdf"
                    aria-hidden="true">PDF</span>
                <div class="file-info">
                    <span class="file-name">예결위_질의서_박소연의원.pdf</span>
                    <span class="file-meta">1.3MB</span>
                </div>
            </button>
            <div class="file-item-side">
                <span class="file-status query-count final">질의9건</span>
                <div class="file-action-wrap dropdown-menu-component" data-dropdown-menu>
                    <button class="file-more-btn" type="button" data-dropdown-trigger
                        aria-haspopup="menu" aria-label="파일 옵션"
                        aria-expanded="false" aria-controls="fileActionMenu"
                        title="파일 옵션">
                        <img class="icon icon-small"
                            data-icon="more-vertical"
                            alt=""
                            aria-hidden="true" />
                    </button>
                    <div class="dropdown-menu dropdown-menu-compact"
                        id="fileActionMenu" role="menu"
                        data-placement="bottom-end" hidden>
                        <button type="button" class="dropdown-menu-item"
                            role="menuitem" data-menu-value="pin"
                            aria-pressed="false">목록 고정</button>
                        <button type="button" class="dropdown-menu-item danger"
                            role="menuitem" data-menu-value="delete">삭제</button>
                    </div>
                </div>
            </div>
        </li>
    </ul>
</div>
```

FileItem을 단독 목록으로 사용하지 않고 항상 `.file-list` 안에 배치합니다. `.file-type-dot`과 `.file-icon-collapsed`에는 같은 `pdf`, `hwp`, `docx`, `txt` 형식 클래스를 사용합니다. 접힘 아이콘은 기본형에서는 숨겨지고 상위 FileList가 `.is-collapsed`일 때만 표시됩니다. 처리 중에는 `processing`을 추가합니다.

## 선택·고정·삭제 동작

동작 범위에 `data-file-actions`와 삭제 확인 Modal ID를 지정합니다.

```html
<div data-file-actions data-file-delete-modal="fileDeleteModal">
    <ul class="file-list"><!-- FileItem 반복 --></ul>
</div>
```

`file-item.js`는 다음 동작을 공통으로 처리합니다.

- `.file-item-main` 클릭: 같은 FileList 안의 `.active` 항목 변경
- `data-menu-value="pin"` 선택: `.pinned` 상태와 `aria-pressed` 변경, 고정 항목을 목록 상단으로 이동
- 고정 시 메뉴 문구를 `목록 고정 해제`로, 해제 시 `목록 고정`으로 변경
- 고정 시 `.file-meta`에 `· 목록 고정`을 추가하고 해제 시 제거
- `data-menu-value="delete"` 또는 `.file-remove-simple` 선택: 파일명을 표시한 삭제 확인 Modal 열기
- `[data-file-delete-confirm]` 선택: 해당 FileItem 제거

삭제 Modal에는 파일명 표시용 `[data-file-delete-name]`과 확인 버튼 `[data-file-delete-confirm]`을 둡니다. 고정과 삭제가 완료되면 각각 `fileitem:pinchange`, `fileitem:delete` 이벤트가 발생합니다.

- `fileitem:pinchange`: `event.detail.pinned`, `event.detail.fileName`
- `fileitem:delete`: `event.detail.fileName`

## Simple 변형

정적 마크업에서 Simple 구조를 선택하면 dot, 제목과 상태 Badge를 렌더링합니다. 최종 FileItem DOM은 AI Answer의 원래 클래스인 `.file-item-simple`, `.file-dot`, `.file-name-simple`, `.file-status-badge`를 사용합니다.

```html
<li class="file-item-simple">
    <span class="file-dot"
        style="background:var(--red)"
        aria-hidden="true"></span>
    <span class="file-name-simple">예결위_질의서_박소연의원.pdf</span>
    <span class="file-status-badge done">청킹 완료 9청크</span>
    <button class="file-remove-simple" type="button"
        aria-label="파일 삭제">×</button>
</li>
```

처리 중 파일은 기존 `.processing` 상태만 추가합니다.

```html
<span class="file-dot processing"
    style="background:var(--primary)"
    aria-hidden="true"></span>
```

Simple 변형에는 `.file-size-simple`을 렌더링하지 않습니다. 상태는 기존 `.file-status-badge`의 `.parsing`, `.summarizing`, `.chunking`, `.done` 조합을 사용합니다.

`.file-remove-simple`은 평상시 `opacity: 0`으로 숨겨지기 때문에 버튼 공간은 그대로 유지됩니다. `.file-item-simple`을 hover하면 `opacity: 1`이 되어 `×`가 표시됩니다.
