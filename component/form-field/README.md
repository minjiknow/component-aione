# Form Field 컴포넌트

Input, Select, Textarea가 공통으로 사용하는 라벨·컨트롤·도움말 영역을 묶는 컴포넌트입니다. 기존 `.field`, `.field-label`, `.field-help`, `.field-meta` 스타일과 상태 클래스를 그대로 사용합니다.

- 실제 fragment: `form-field.html`
- 검수 위치: `component/index.html`의 Forms 영역
- 필수 CSS: `component/form-field/form-field.css`
- 2열 Select 배치: 같은 CSS의 `.form-row`, `.flex1`
- 선택 JS: `js/common.js` (`data-character-count`를 사용하는 경우)
- 필수 슬롯: `label`, `control`, `meta`
- 실제 상태 클래스: `.is-error`, `.is-success`
- 카탈로그 전용 상태 클래스: `.is-hover`, `.is-focus`

호출부의 `class`, `data-character-count`, `aria-*` 속성은 fragment의 최상위 `.field`에 전달됩니다. Error 상태에서는 컨트롤에 `aria-invalid="true"`를 적용하고, `aria-describedby`로 오류 메시지를 연결합니다.

## 폼 묶음 사용 예시

```html
<div>
    <div class="field-spaced" data-include="form-field/form-field" data-include-source="html">
        <template data-slot="label">
            <label class="field-label" for="ruleName">룰명</label>
        </template>
        <template data-slot="control">
            <input class="form-input" id="ruleName" name="ruleName" type="text" placeholder="예: 세제 키워드 룰" aria-describedby="ruleNameHelp" />
        </template>
        <template data-slot="meta">
            <p class="field-help" id="ruleNameHelp">한글, 영문, 숫자를 사용할 수 있습니다.</p>
        </template>
    </div>

    <div class="form-row">
        <div class="field-spaced flex1" data-include="form-field/form-field" data-include-source="html">
            <template data-slot="label">
                <label class="field-label" for="department">추천 실국</label>
            </template>
            <template data-slot="control">
                <select class="form-select" id="department" name="department">
                    <option value="tax">세제실</option>
                    <option value="budget">예산실</option>
                </select>
            </template>
            <template data-slot="meta"></template>
        </div>
        <div class="field-spaced flex1" data-include="form-field/form-field" data-include-source="html">
            <template data-slot="label">
                <label class="field-label" for="scope">적용 범위</label>
            </template>
            <template data-slot="control">
                <select class="form-select" id="scope" name="scope">
                    <option value="current">현재 실행 건</option>
                    <option value="all">전체 적용</option>
                </select>
            </template>
            <template data-slot="meta"></template>
        </div>
    </div>

    <div class="field-spaced" data-include="form-field/form-field" data-include-source="html">
        <template data-slot="label">
            <label class="field-label" for="departmentSearch">실국 검색</label>
        </template>
        <template data-slot="control">
            <input class="form-input" id="departmentSearch" name="departmentSearch" type="search" placeholder="실국명 또는 담당자를 검색하세요" />
        </template>
        <template data-slot="meta"></template>
    </div>

    <div data-include="form-field/form-field" data-include-source="html" data-character-count>
        <template data-slot="label">
            <label class="field-label" for="operationMemo">운영 메모</label>
        </template>
        <template data-slot="control">
            <textarea class="form-textarea" id="operationMemo" name="operationMemo" rows="4" maxlength="200" aria-describedby="operationMemoHelp operationMemoCount"></textarea>
        </template>
        <template data-slot="meta">
            <div class="field-meta">
                <p class="field-help" id="operationMemoHelp">최대 200자까지 입력할 수 있습니다.</p>
                <span class="field-count" id="operationMemoCount"><span data-character-current>0</span>/200</span>
            </div>
        </template>
    </div>
</div>
```

## Fragment 소스

`form-field.html`

```html
<!-- Form field fragment: label, control, meta 슬롯을 모두 전달합니다. -->
<div class="field" data-component="form-field">
    <div data-slot="label"></div>
    <div data-slot="control"></div>
    <div data-slot="meta"></div>
</div>
```
