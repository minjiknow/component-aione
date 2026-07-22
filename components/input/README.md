# Input 컴포넌트

한 줄 값을 입력하는 라벨+Input 조합입니다. 아래 마크업을 복사해 사용하고 `components/index.html`의 Forms 영역에서 Default, Hover, Focus(Active), Error, Success, Disabled 상태를 확인합니다.

- 필수 CSS: `css/common.css`
- 필수 JS: 없음
- 변경 대상: `id`, `name`, label의 `for`, 도움말 ID와 문구
- 실제 상태 클래스: `.is-error`, `.is-success`
- 카탈로그 전용 상태 클래스: `.is-hover`, `.is-focus`

```html
<div class="field">
    <label class="field-label" for="workspaceName">워크스페이스 이름</label>
    <input class="form-input" id="workspaceName" name="workspaceName" type="text" placeholder="이름을 입력하세요" aria-describedby="workspaceNameHelp" />
    <p class="field-help" id="workspaceNameHelp">한글, 영문, 숫자를 사용할 수 있습니다.</p>
</div>
```

Error와 Success는 브라우저가 자동으로 판단하지 않으므로 검증 결과에 따라 각각 `.field.is-error`, `.field.is-success`를 적용합니다. Error에는 `aria-invalid="true"`와 `aria-describedby`를 함께 사용합니다. 필수 입력이면 보이는 `*` 표시와 함께 control에 `required`도 적용합니다.
