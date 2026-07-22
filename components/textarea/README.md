# Textarea 컴포넌트

여러 줄 값을 입력하는 라벨+Textarea 조합입니다. 아래 마크업을 복사해 사용하고 `components/index.html`의 Forms 영역에서 전체 상태를 확인합니다.

- 필수 CSS: `css/common.css`
- 선택 JS: `js/common.js` (`data-character-count`를 사용하는 경우)
- 변경 대상: `id`, `name`, label의 `for`, `maxlength`, 도움말/글자 수 ID
- 실제 상태 클래스: `.is-error`, `.is-success`
- 카탈로그 전용 상태 클래스: `.is-hover`, `.is-focus`

```html
<div class="field" data-character-count>
    <label class="field-label" for="operationMemo">운영 메모</label>
    <textarea class="form-textarea" id="operationMemo" name="operationMemo" rows="4" maxlength="200" aria-describedby="operationMemoHelp operationMemoCount"></textarea>
    <div class="field-meta">
        <p class="field-help" id="operationMemoHelp">최대 200자까지 입력할 수 있습니다.</p>
        <span class="field-count" id="operationMemoCount"><span data-character-current>0</span>/200</span>
    </div>
</div>
```

`data-character-count`와 `maxlength`를 함께 사용하면 `common.js`가 현재 글자 수를 갱신합니다.

Error와 Success는 검증 결과에 따라 `.field.is-error`, `.field.is-success`를 적용하는 선택 상태이며 자동으로 표시되지 않습니다.
