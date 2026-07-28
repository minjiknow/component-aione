# Radio 컴포넌트

여러 선택지 중 하나만 고를 때 사용합니다. 별도 JS 컴포넌트를 만들지 않고 브라우저 기본 `<input type="radio">`를 사용합니다.

- 필수 CSS: `component/radio/radio.css`
- 필수 JS: 없음
- 검수 페이지: `component/radio/radio.html`
- 상태: `checked`, `disabled`
- 변경 대상: `id`, `name`, `value`, label 문구

```html
<fieldset class="choice-group">
    <legend class="choice-group-label">처리 방식</legend>
    <div class="choice-list choice-list-inline">
        <label class="radio-label">
            <input type="radio" name="processingMode" value="automatic" checked />
            <span class="choice-title">자동 처리</span>
        </label>
        <label class="radio-label">
            <input type="radio" name="processingMode" value="manual" />
            <span class="choice-title">수동 검토</span>
        </label>
    </div>
</fieldset>
```

한 그룹의 radio는 반드시 동일한 `name`을 사용합니다. 선택 여부는 클래스가 아니라 input의 `checked` 속성 또는 DOM의 `input.checked`로 제어합니다.
