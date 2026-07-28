# Toggle 컴포넌트

기능을 즉시 켜거나 끄는 설정에 사용합니다. 내부 상태는 브라우저 기본 `<input type="checkbox">`로 관리하고 `role="switch"`로 스위치 의미를 전달합니다.

- 필수 CSS: `component/toggle/toggle.css`
- 필수 JS: 없음
- 검수 페이지: `component/toggle/toggle.html`
- 상태: `checked`, `disabled`
- 변경 대상: `name`, 제목, 설명

```html
<label class="toggle-row">
    <span class="toggle-content">
        <span class="toggle-title">자동 분류</span>
        <span class="toggle-desc">분류 규칙을 자동으로 적용합니다.</span>
    </span>
    <span class="toggle-switch">
        <input type="checkbox" name="autoClassification" role="switch" checked />
        <span class="toggle-slider" aria-hidden="true"></span>
    </span>
</label>
```

토글은 저장 전에 여러 옵션을 선택하는 용도보다 변경 즉시 적용되는 on/off 설정에 사용합니다. 상태는 input의 `checked`, 비활성은 `disabled`로 제어합니다.
