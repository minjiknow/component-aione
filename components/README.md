# AI-ONE HTML 컴포넌트 인계 가이드

이 폴더의 HTML은 JSP 개발자가 화면을 구현할 때 기준으로 사용하는 퍼블리싱 원본입니다. 클래스명은 외부에서 전달받은 화면과의 호환성을 위해 유지합니다.

## 파일 역할

- `README.md`: 복사용 마크업과 필수 CSS/JS, 상태, 슬롯, 이벤트, ID 규칙을 설명하는 개발 계약입니다.
- `컴포넌트명.html`: 페이지가 실제로 include하는 실행형 컴포넌트에만 둡니다. `html`, `head`, `body`, CSS, JS를 포함하지 않습니다.
- `button/button.html`, `button/icon-button.html`: Button 전체 변형을 확인하는 검수용 독립 페이지이며 include fragment가 아닙니다.
- `_preview/component-preview.css`: 통합 카탈로그와 Button 상세 카탈로그에서만 사용합니다. 운영 페이지에는 포함하지 않습니다.
- `index.html`: 모든 컴포넌트와 Form 상태의 대표 형태를 외부 include 없이 직접 확인하는 통합 검수 페이지입니다.

Input, Select, Textarea, Button처럼 화면에 직접 작성하는 작은 컴포넌트는 별도 fragment를 만들지 않고 README의 마크업을 복사합니다. Button 상세 카탈로그 HTML도 시각 검수용일 뿐 include하지 않습니다. Topbar, Sidebar, Panel처럼 페이지가 include하는 컴포넌트만 HTML fragment를 유지합니다.

## 공통 의존성

```html
<link rel="stylesheet" href="${contextPath}/css/common.css" />
<script src="${contextPath}/js/common.js"></script>
```

JSP에서는 실제 프로젝트의 context path 정책에 맞게 경로만 변환합니다. README 예제와 실행형 fragment의 클래스명 및 `data-*` 속성은 변경하지 않습니다.

## 상태 규칙

- Hover와 Focus는 CSS의 `:hover`, `:focus`, `:focus-within`으로 동작합니다.
- `index.html`의 `.is-hover`, `.is-focus`는 상태를 항상 표시하기 위한 카탈로그 전용 클래스입니다.
- `.is-error`, `.is-success`는 서버 또는 클라이언트 검증 결과에 따라 개발 코드에서 적용하는 실제 상태 클래스입니다.
- Error 상태에는 `aria-invalid="true"`와 오류 메시지를 가리키는 `aria-describedby`를 함께 적용합니다.
- Disabled 상태는 클래스가 아니라 폼 요소의 `disabled` 속성을 우선 사용합니다.

## ID 규칙

- Input, Select, Textarea의 `id`, `name`, label의 `for`는 화면 데이터 키에 맞게 변경합니다.
- `aria-describedby`가 가리키는 도움말/오류 메시지 ID도 같은 접두어를 사용합니다.
- Sidebar와 Topbar는 고정 ID를 포함한 singleton 컴포넌트이므로 화면당 한 번만 포함합니다.

## HTML include 규칙

퍼블리싱 검수 환경에서는 다음 형식으로 fragment를 불러옵니다.

```html
<div data-include="panel/panel" data-include-source="html">
    <!-- 슬롯 내용 -->
</div>
```

JSP 개발에서는 `data-include` 로더를 그대로 사용할 필요가 없습니다. 같은 fragment를 JSP include, tag file 또는 layout template으로 치환하되 최종 렌더링 DOM이 `index.html`의 미리보기와 같도록 유지합니다.

## 인계 전 체크리스트

- README 예제 또는 실행형 fragment와 `index.html`의 클래스 조합이 일치하는가
- `index.html`이 외부 HTML include 없이 렌더링되는가
- 모든 버튼에 `type="button"` 또는 의도한 `type="submit"`이 있는가
- 모든 form label의 `for`와 control의 `id`가 연결되는가
- 동적 오류 메시지에 `aria-invalid`, `aria-describedby`가 연결되는가
- 고정 ID를 가진 singleton이 한 화면에 중복되지 않는가
- JS 의존 컴포넌트의 이벤트와 `data-*` 속성이 README에 명시되는가
