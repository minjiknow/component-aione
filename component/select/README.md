# Select 컴포넌트

기존 화면의 `form-select`를 그대로 사용하는 라벨+Select 조합입니다. 공통 외곽 구조는 `form-field/form-field.html`을 사용하고 `component/index.html`의 Forms 영역에서 전체 상태를 확인합니다.

- 필수 CSS: `css/common.css`
- 필수 JS: 없음
- 변경 대상: `id`, `name`, label의 `for`, option의 `value`와 문구
- 실제 상태 클래스: `.is-error`, `.is-success`
- 카탈로그 전용 상태 클래스: `.is-hover`, `.is-focus`

```html
<div data-include="form-field/form-field" data-include-source="html">
    <template data-slot="label">
        <label class="field-label" for="department">추천 실국</label>
    </template>
    <template data-slot="control">
        <select class="form-select" id="department" name="department" aria-describedby="departmentHelp">
            <option value="">실국을 선택하세요</option>
            <option value="budget">예산실</option>
            <option value="tax">세제실</option>
        </select>
    </template>
    <template data-slot="meta">
        <p class="field-help" id="departmentHelp">목록에서 하나의 항목을 선택합니다.</p>
    </template>
</div>
```

Error와 Success는 검증 결과에 따라 `.field.is-error`, `.field.is-success`를 적용하는 선택 상태이며 자동으로 표시되지 않습니다. 필수 선택이면 `required`를 사용하고 빈 option은 `value=""`를 유지합니다.
