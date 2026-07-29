# FileList 컴포넌트

파일 업로드 후 표시되는 목록 전체 영역입니다. 기본형은 AI Intake의 현재 `.file-list-section` 구조를 사용하고, `simple` 변형은 AI Answer의 dot·제목·상태 Badge 목록 구조를 그대로 사용합니다. 목록 안의 한 행은 `FileItem` 컴포넌트 규칙을 따릅니다.

- 필수 CSS: `component/file-list/file-list.css`, `component/file-item/file-item.css`, `component/dropdownmenu/dropdownmenu.css`, `component/modal/modal.css`
- 필수 JS: 업로드 목록 렌더링 스크립트, `component/dropdownmenu/dropdownmenu.js`, `component/_shared/layer-controller.js`, `component/modal/modal.js`, `component/file-item/file-item.js`
- 검수 페이지: `component/file-list/file-list.html`
- 전체 영역: `.file-list-section`
- 헤더: `.file-list-header`
- 목록: `.file-list`
- 목록 항목: `FileItem`
- Simple 목록: `.file-list.simple`

```html
<div class="file-list-section"
    data-file-actions data-file-delete-modal="fileDeleteModal">
    <div class="file-list-header">
        <div class="file-list-heading">
            <span class="file-list-title">질의 업로드 목록</span>
        </div>
        <div class="upload-summary-inline" aria-label="업로드 현황">
            <span class="upload-summary-label">파일수/의원수</span>
            <span class="upload-summary-value">2 / 2</span>
        </div>
    </div>
    <ul class="file-list" id="fileList">
        <!-- FileItem 반복 -->
    </ul>
</div>
```

`FileList`는 목록 컨테이너와 업로드 현황을 담당합니다. 파일명·확장자·처리 상태·개별 메뉴는 `FileItem`에서 구성합니다.

## Simple 변형

간단 목록은 `.file-list`에 `.simple`을 추가하고, 각 행에 `FileItem`의 Simple 마크업을 사용합니다.

```html
<ul class="file-list simple" aria-label="간단 파일 목록">
    <li class="file-item-simple">
        <span class="file-dot"
            style="background:var(--red)"
            aria-hidden="true"></span>
        <span class="file-name-simple">예결위_질의서_박소연의원.pdf</span>
        <span class="file-status-badge done">청킹 완료 9청크</span>
        <button class="file-remove-simple" type="button"
            aria-label="파일 삭제">×</button>
    </li>
</ul>
```

`.simple`을 생략하면 기존 기본형 목록 구조를 사용합니다.

Simple형의 `.file-remove-simple`은 평상시 `opacity: 0`이라 보이지 않지만 너비는 유지됩니다. `.file-item-simple`을 hover하면 기존 AI Answer 스타일에 따라 `×` 버튼이 표시됩니다.

기본형의 각 FileItem에는 `.file-action-wrap.dropdown-menu-component` 안에 기존 `.file-more-btn`과 `목록 고정`·`삭제` 소형 메뉴를 렌더링합니다.

`file-item.js`가 FileList 안의 선택, 목록 고정·해제, 삭제 확인 Modal과 실제 항목 제거를 함께 처리합니다. 고정 상태에서는 해당 항목이 목록 상단으로 이동하고 메뉴 문구가 `목록 고정 해제`로 바뀝니다. 삭제 후에는 `.upload-summary-file-count`를 남은 기본형 FileItem 수에 맞춰 갱신합니다.

동적으로 FileItem을 추가한 뒤에는 DropdownMenu와 FileItem 동작을 다시 초기화합니다.

```js
window.AIOneDropdownMenu?.init(fileList);
window.AIOneFileItem?.init(fileList.closest('[data-file-actions]'));
```
