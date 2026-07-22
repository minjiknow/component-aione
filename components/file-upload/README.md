# File Upload 컴포넌트

- 실제 fragment: `file-upload.html`
- 검수 위치: `components/index.html`의 Forms 영역
- 필수 CSS: `css/common.css`
- 필수 JS: `js/common.js`
- 필수 슬롯: `title`, `hints`, `input`

```html
<div data-include="file-upload/file-upload" data-include-source="html">
    <template data-slot="title"><p class="file-upload-title">파일을 업로드하세요</p></template>
    <template data-slot="hints"><span class="file-upload-hint">PDF, DOCX, HWP</span></template>
    <template data-slot="input"><input type="file" id="fileInput" multiple /></template>
</div>
```

파일이 선택되거나 드롭되면 업로드 영역에서 `app:file-upload` CustomEvent가 발생합니다.

```js
uploadZone.addEventListener("app:file-upload", (event) => {
    const files = event.detail.files;
    const source = event.detail.source; // input | drop
});
```

JSP에서는 실제 업로드 API와 multipart form 정책에 맞게 input의 `name`, `accept`, `multiple`을 지정합니다. `data-file-upload-zone`, `role`, `tabindex`, `aria-label`은 키보드와 드래그 동작을 위해 유지합니다.
