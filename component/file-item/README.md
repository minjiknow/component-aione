# FileItem 컴포넌트

`FileList` 안에서 업로드 파일 하나를 표시하는 행입니다. 기본형은 AI Intake가 생성하는 `.file-item-main`, `.file-item-side`, `.file-status` 구조를 사용하고, `simple` 변형은 AI Answer의 dot·제목·상태 Badge 구조를 그대로 사용합니다.

- 필수 CSS: `component/file-list/file-list.css`, `component/file-item/file-item.css`, `component/dropdownmenu/dropdownmenu.css`
- 필수 JS: `component/dropdownmenu/dropdownmenu.js`, 선택·고정·삭제 결과를 처리하는 화면 스크립트
- 검수 페이지: `component/file-item/file-item.html`
- 행: `.file-list li`
- 파일 선택 영역: `.file-item-main`
- 파일 정보: `.file-icon`, `.file-info`, `.file-name`, `.file-meta`
- 상태와 메뉴: `.file-item-side`, `.file-status-group`, `.file-action-wrap`
- 상태: `.active`, `.pinned`, `.processing`
- Simple 행: `.file-item-simple`

```html
<li class="active" data-file-idx="0">
    <button class="file-item-main" type="button" aria-label="파일 보기">
        <div class="file-icon pdf">PDF</div>
        <div class="file-info">
            <span class="file-name">예결위_질의서_박소연의원.pdf</span>
            <span class="file-meta">1.3MB</span>
        </div>
    </button>
    <div class="file-item-side">
        <span class="file-status-group final">
            <span class="file-status parsed">청킹 완료</span>
            <span class="file-status query-count final">질의 9건</span>
        </span>
        <div class="file-action-wrap dropdown-menu-component" data-dropdown-menu>
            <button class="file-more-btn" type="button" data-dropdown-trigger
                aria-haspopup="menu" aria-label="파일 옵션"
                aria-expanded="false" aria-controls="fileActionMenu"
                title="파일 옵션">...</button>
            <div class="dropdown-menu dropdown-menu-compact"
                id="fileActionMenu" role="menu"
                data-placement="bottom-end" hidden>
                <button type="button" class="dropdown-menu-item"
                    role="menuitem" data-menu-value="pin">목록 고정</button>
                <button type="button" class="dropdown-menu-item danger"
                    role="menuitem" data-menu-value="delete">삭제</button>
            </div>
        </div>
    </div>
</li>
```

FileItem을 단독 목록으로 사용하지 않고 항상 `.file-list` 안에 배치합니다. 확장자와 처리 단계는 기존 클래스 조합만 사용합니다.

## Simple 변형

React에서 `simple={true}`를 전달하면 dot, 제목과 상태 Badge를 렌더링합니다. prop은 렌더링 구조만 선택하며, 최종 FileItem DOM은 AI Answer의 원래 클래스인 `.file-item-simple`, `.file-dot`, `.file-name-simple`, `.file-status-badge`를 사용합니다.

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
