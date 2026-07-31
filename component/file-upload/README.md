# File Upload 컴포넌트

AI Intake의 실제 `.upload-zone` 구조와 스타일을 사용하는 공통 파일 업로드 영역입니다. 제목·안내문·파일 input을 슬롯으로 전달하고, 화면별 모양은 `type`, 패널 밀도는 `variant`로 각각 선택합니다.

- 실제 fragment: `file-upload.html`
- 검수 위치: `component/index.html`의 Forms 영역
- 필수 CSS: `component/file-upload/file-upload.css`
- 필수 JS: `js/common.js`
- 기본 아이콘: 기존 인라인 업로드 SVG
- 필수 슬롯: `title`, `content`, `input`
- 선택 슬롯: `icon` (`reference` 타입 전용)
- 타입: `data-component-type="reference"` (속성을 생략하면 기존 `default`)
- 밀도: `data-component-variant="compact"` (선택)

```html
<div
    id="workspaceUploadZone"
    aria-describedby="workspaceUploadContent"
    data-component-include="file-upload"
>
    <template data-slot="title">파일을 드래그하거나 클릭하여 업로드</template>
    <template data-slot="content">
        <span id="workspaceUploadContent">PDF, DOCX, HWP 파일을 선택할 수 있습니다.</span>
    </template>
    <template data-slot="input">
        <input type="file" id="workspaceFileInput" multiple accept=".pdf,.hwp,.docx" hidden />
    </template>
</div>
```

파일이 선택되거나 드롭되면 업로드 영역에서 `app:file-upload` CustomEvent가 발생합니다.

```js
uploadZone.addEventListener("app:file-upload", (event) => {
    const files = event.detail.files;
    const source = event.detail.source; // picker | drop
});
```

두 업무 화면에서 공통으로 사용하는 업로드 전 보안 분류는 `js/common.js`의 `window.AIOneUploadSecurity.validate(files)`가 담당합니다. 이 API는 화면을 직접 변경하지 않고 검사 결과만 반환하므로 차단 안내, 대외비 확인 Modal, 실제 업로드 호출은 페이지가 소유합니다.

```js
const { blocked, confidential, safeFiles } =
    await window.AIOneUploadSecurity.validate(files);
```

- `blocked`: 개인정보·민감정보가 감지된 결과
- `confidential`: 대외비·비공개·보안 문구가 감지된 결과
- `safeFiles`: 바로 업로드할 수 있는 `File` 배열

JSP에서는 실제 업로드 API와 multipart form 정책에 맞게 input의 `name`, `accept`, `multiple`을 지정합니다. `.upload-text`, `.upload-hint`는 fragment에 고정되어 있으므로 호출부에서는 텍스트만 전달합니다. `data-file-upload-zone`, `role`, `tabindex`, `aria-label`은 키보드와 드래그 동작을 위해 유지합니다.

## Reference 타입과 Compact 밀도

AI Workspace는 속성을 추가하지 않고 기존 `default` 타입을 사용합니다. AI Answer처럼 아이콘 모양이 다른 화면만 `reference` 타입을 선언하고, 패널 내부 여백도 줄여야 할 때 `compact` 밀도를 함께 사용합니다. 파일 선택·드롭 이벤트 계약은 두 타입이 같습니다.

```html
<div
    data-component-include="file-upload"
    data-component-type="reference"
    data-component-variant="compact"
>
    <template data-slot="icon">
        <img src="../assets/icons/copy.svg" data-icon="copy" alt="" />
    </template>
    <!-- title, content, input 슬롯 -->
</div>
```

## Fragment 소스

`file-upload.html`

```html
<!-- File upload component fragment: 모양(type)과 밀도(variant)를 독립적으로 선택합니다. -->
<div class="upload-zone" data-file-upload-zone role="button" tabindex="0" aria-label="파일을 드래그하거나 클릭하여 업로드">
    <svg class="upload-zone-default-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
    <span class="upload-zone-icon" data-slot="icon" aria-hidden="true"><img src="../../assets/icons/copy.svg" data-icon="copy" alt="" /></span>
    <p class="upload-text"><span data-slot="title"></span></p>
    <span class="upload-hint"><span data-slot="content"></span></span>
    <div data-slot="input"></div>
</div>
```
