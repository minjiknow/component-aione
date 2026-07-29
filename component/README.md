# AI-ONE HTML 컴포넌트 인계 가이드

이 폴더의 HTML은 JSP 개발자가 화면을 구현할 때 기준으로 사용하는 퍼블리싱 원본입니다. 클래스명은 외부에서 전달받은 화면과의 호환성을 위해 유지합니다.

## 파일 역할

- `README.md`: 복사용 마크업과 필수 CSS/JS, 상태, 슬롯, 이벤트, ID 규칙을 설명하는 개발 계약입니다.
- `컴포넌트명.html`: 해당 컴포넌트만 독립적으로 확인하는 검수 페이지입니다.
- `컴포넌트명.fragment.html`: 페이지 또는 JSP가 include하는 마크업입니다. `html`, `head`, `body`, CSS, JS를 포함하지 않습니다.
- `컴포넌트명.css`: 해당 컴포넌트가 소유하는 스타일입니다. 화면 CSS인 `css/ai-*.css`를 의존하지 않습니다.
- `컴포넌트명.js`: 해당 컴포넌트의 초기화, 상태, 이벤트 API를 소유합니다.
- `_shared/form-control.css`: Input, Select, Textarea를 조합할 때 사용하는 label, help, row 배치 유틸리티입니다.
- `file-upload/file-upload.html`: AI Intake 업로드 영역을 기준으로 고정 아이콘과 변경 가능한 title, content, input 슬롯을 제공하는 공통 include fragment입니다.
- `service-card/service-card.js`: AI-ONE 홈의 기존 Service Card를 데이터 목록으로 렌더링하는 DOM API입니다.
- `query-card/query-card.js`: AI Intake와 질의 워크스페이스가 질의 분류 결과 카드를 공통 렌더링하는 DOM API입니다.
- `_preview/component-preview.css`: 통합 카탈로그와 Button 상세 카탈로그에서만 사용합니다. 운영 페이지에는 포함하지 않습니다.
- `index.html`: 기존 Sidebar 형태에서 `Actions`, `Display`, `Forms`, `Layouts`, `Navigation` 분류별 컴포넌트 메뉴를 선택하는 통합 검수 진입 페이지입니다. 빈 해시와 `#home`은 AI-ONE 홈을, `#card-<component-id>`는 선택한 컴포넌트를 표시합니다. Button과 Icon Button은 상세 카탈로그를 바로 표시하고 나머지는 대표 카드를 표시합니다.
- `componentgroup-card.html`: 모든 컴포넌트와 Form 상태의 대표 형태를 외부 include 없이 직접 렌더링하는 카드 모음 페이지입니다.

ProgressBar, Toast, ChatMessage, PromptComposer, DataTable, DropdownMenu, Modal, SidePop은 각 폴더의 `fragment.html`, CSS, JS를 한 묶음으로 관리합니다. `component-loader.js`는 선언된 컴포넌트의 자산을 문서당 한 번만 로드하고, 마크업 삽입 후 컴포넌트 초기화 이벤트를 발생시킵니다. React 런타임을 사용하는 것은 아니지만 컴포넌트별 소유권과 초기화 경계를 같은 방식으로 유지합니다.

로더는 fragment 안의 상대 `src`, `href`를 fragment 파일 기준의 절대 URL로 보정합니다. `file://`에서 검수가 필요한 진입 페이지는 원격 fetch 대신 사용할 `<template data-component-file-fallback="<name>">`을 직접 제공할 수 있으며, fallback의 최종 DOM은 원본 fragment와 함께 관리합니다.

DropdownMenu의 공식 예제는 기존 `html/ai-home.html`과 `html/ai-chatbot.html`의 모델 선택 메뉴를 공통화한 다크 단일 선택형입니다. 일반 라이트 액션 메뉴는 기존 화면 출처가 확인되지 않아 공식 기존 스타일 예제에서 제외합니다.

Modal은 AI Answer의 `대화 작업 팝업` Small 160px, 기존 `삭제 팝업` Medium 380px, AI Intake의 `실국별 알림 담당자 설정` Large 960px의 3단계로 검수합니다. 기존 화면의 마크업과 시각 규칙은 재사용하되 스타일 소유권은 `component/modal/modal.css`에 둡니다.

### ChatMessage 속성 규칙

ChatMessage의 `data-variant`는 발화자가 아니라 화면별 표현 방식을 선택합니다. 허용값은 AI Answer의 `answer`와 AI-ONE 챗봇의 `chatbot`이며, 메시지 목록과 목록 안의 각 메시지에 같은 값을 적용합니다. 발화자는 `data-role="user|ai"`, 응답 상태는 `data-status="complete|pending"`로 구분합니다. 전체 마크업과 동작 계약은 `chat-message/README.md`를 기준으로 사용합니다.

## 공통 기반과 컴포넌트 의존성

```html
<link rel="stylesheet" href="${contextPath}/css/common.css" />
<link rel="stylesheet" href="${contextPath}/component/<name>/<name>.css" />
<script src="${contextPath}/component/component-loader.js" defer></script>
```

`common.css`는 토큰, reset, 공통 환경만 담당합니다. 모든 컴포넌트는 `component/<name>/<name>.css`를 필수 엔트리로 가지며, 컴포넌트의 표현과 동작은 각 폴더의 CSS/JS에서 가져옵니다. 페이지에서 정적 include를 사용하는 경우에도 해당 컴포넌트 CSS/JS를 함께 한 번만 포함합니다.

## 폴더 구조

- 실제 화면은 `html`, 화면별 스타일은 `css`, 화면별 스크립트는 `js`에 둡니다.
- 공통 환경설정과 화면 모드는 `css/common.css`, `js/common.js`를 사용합니다.
- 컴포넌트 전용 마크업, 스타일, 동작은 `component/<name>/` 안에서 함께 관리합니다.
- 컴포넌트 검수는 `component/index.html`에서 메뉴를 선택하고, 실제 카드는 `component/componentgroup-card.html`에서 확인합니다.
- `_preview` 파일은 컴포넌트 검수에만 사용하며 실제 화면에는 포함하지 않습니다.

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

퍼블리싱 검수 환경에서는 다음 형식으로 컴포넌트를 불러옵니다. `data-component-*`는 fragment의 `{{속성명}}`에 전달됩니다.

```html
<div data-component-include="progressbar" data-component-value="82">
    <template data-slot="label">신뢰도</template>
</div>
<script src="${contextPath}/component/component-loader.js" defer></script>
```

슬롯은 include 요소의 직계 자식인 `<template data-slot="...">`으로 전달합니다. Modal이나 SidePop처럼 외부 트리거와 ID를 맞춰야 하는 컴포넌트는 `data-component-id`를 지정합니다.

```html
<button type="button" data-modal-open="deleteWorkModal">삭제</button>
<div data-component-include="modal" data-component-id="deleteWorkModal"></div>
```

`file://` fallback은 해당 문서에서 직접 열기까지 지원해야 할 때만 추가합니다.

```html
<template data-component-file-fallback="sidebar">
    <!-- component/sidebar/sidebar.html과 동일한 최종 마크업 -->
</template>
```

JSP 개발에서는 로더를 그대로 사용할 필요가 없습니다. 같은 `*.fragment.html`을 JSP include, tag file 또는 layout template으로 치환하고 CSS/JS를 번들에서 한 번만 포함하되 최종 DOM과 `data-*` 계약은 유지합니다.

## 인계 전 체크리스트

- README 예제 또는 실행형 fragment와 `index.html`의 클래스 조합이 일치하는가
- `index.html`이 외부 HTML include 없이 렌더링되는가
- 모든 버튼에 `type="button"` 또는 의도한 `type="submit"`이 있는가
- 모든 form label의 `for`와 control의 `id`가 연결되는가
- 동적 오류 메시지에 `aria-invalid`, `aria-describedby`가 연결되는가
- 고정 ID를 가진 singleton이 한 화면에 중복되지 않는가
- JS 의존 컴포넌트의 이벤트와 `data-*` 속성이 README에 명시되는가
