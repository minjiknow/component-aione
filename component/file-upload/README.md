# File Upload 컴포넌트

AI Intake의 실제 `.upload-zone` 구조와 스타일을 사용하는 공통 파일 업로드 영역입니다. 업로드 SVG 아이콘은 고정하고 제목과 내용, 파일 input만 화면에 맞게 전달합니다.

- 실제 fragment: `file-upload.html`
- 검수 위치: `component/index.html`의 Forms 영역
- 필수 CSS: `css/common.css`
- 필수 JS: `js/common.js`
- 고정 요소: AI Intake 업로드 SVG 아이콘
- 필수 슬롯: `title`, `content`, `input`

```html
<div
    id="workspaceUploadZone"
    aria-describedby="workspaceUploadContent"
    data-include="file-upload/file-upload"
    data-include-source="html"
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

JSP에서는 실제 업로드 API와 multipart form 정책에 맞게 input의 `name`, `accept`, `multiple`을 지정합니다. `.upload-text`, `.upload-hint`는 fragment에 고정되어 있으므로 호출부에서는 텍스트만 전달합니다. `data-file-upload-zone`, `role`, `tabindex`, `aria-label`은 키보드와 드래그 동작을 위해 유지합니다.

## Fragment 소스

`file-upload.html`

```html
<!-- File upload component fragment: 아이콘은 고정하고 title, content, input 슬롯을 전달합니다. -->
<div class="upload-zone" data-file-upload-zone role="button" tabindex="0" aria-label="파일을 드래그하거나 클릭하여 업로드">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
    <p class="upload-text"><span data-slot="title"></span></p>
    <span class="upload-hint"><span data-slot="content"></span></span>
    <div data-slot="input"></div>
</div>
```
