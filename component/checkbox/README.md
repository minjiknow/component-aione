# Checkbox 컴포넌트

여러 항목을 독립적으로 선택할 때 사용합니다. 별도 JS 컴포넌트를 만들지 않고 브라우저 기본 `<input type="checkbox">`를 유지해 폼 전송, 키보드 조작, 접근성 동작을 그대로 사용합니다.

- 필수 CSS: `component/checkbox/checkbox.css`
- 필수 JS: 없음
- 검수 페이지: `component/checkbox/checkbox.html`
- 상태: `checked`, `disabled`
- 크기: Medium `.checkbox-control-md` `16px`, Small `.checkbox-control-sm` `14px`, XSmall `.checkbox-control-xs` `13px`
- 변경 대상: `id`, `name`, `value`, label 문구

```html
<label class="checkbox-label">
    <input class="checkbox-control" type="checkbox" id="emailNotification" name="notificationChannel" value="email" />
    <span class="choice-content">
        <span class="choice-title">이메일</span>
        <span class="choice-desc">업무 알림을 이메일로 받습니다.</span>
    </span>
</label>
```

작은 크기는 기본 클래스와 크기 modifier를 함께 사용합니다.

```html
<input class="checkbox-control checkbox-control-md" type="checkbox" aria-label="추천 자료 선택" />
<input class="checkbox-control checkbox-control-sm" type="checkbox" aria-label="하이라이트 표시" />
```

여러 체크박스의 제목이 필요하면 `fieldset`과 `legend`로 묶습니다. 체크 여부는 클래스가 아니라 input의 `checked` 속성 또는 DOM의 `input.checked`로 제어합니다.
