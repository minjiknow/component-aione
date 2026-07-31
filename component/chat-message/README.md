# ChatMessage 컴포넌트

AI Answer 패널과 AI-ONE 챗봇에서 사용자 질문과 AI 답변을 표시하는 공통 컴포넌트입니다.

- 필수 CSS: `component/chat-message/chat-message.css`
- 필수 JS: `component/chat-message/chat-message.js`
- 검수 페이지: `component/chat-message/chat-message.html`

- `variant`: 메시지가 사용되는 화면과 레이아웃
- `role`: 발화 주체
- `status`: 응답 진행 상태

`user`, `ai`는 variant가 아닙니다. `data-variant="user"` 또는 `data-variant="ai"`를 사용하지 않고 `data-role`로 구분합니다.

## 데이터 속성 계약

| 속성 | 허용값 | 필수 위치 | 용도 |
| --- | --- | --- | --- |
| `data-chat-message-list` | 값 없음 | 메시지 목록 | 공통 동작을 바인딩하는 목록 범위 |
| `data-variant` | `answer`, `chatbot` | 목록과 각 메시지 | 화면별 레이아웃과 스타일 선택 |
| `data-component` | `chat-message` | 각 메시지 | 컴포넌트 식별 |
| `data-role` | `user`, `ai` | 각 메시지 | 사용자 질문과 AI 답변 구분 |
| `data-status` | `complete`, `pending` | AI 메시지 필수, 사용자 메시지 선택 | 답변 완료 또는 생성 중 상태 |

목록의 `data-variant`와 목록에 포함된 모든 메시지의 `data-variant`는 반드시 같아야 합니다.

```html
<div class="chat-messages"
    data-chat-message-list
    data-variant="chatbot">
    <div class="chat-msg ai"
        data-component="chat-message"
        data-variant="chatbot"
        data-role="ai"
        data-status="complete">
        ...
    </div>
</div>
```

## Chatbot variant

`data-variant="chatbot"`은 AI-ONE 챗봇의 전체 너비 답변형입니다.

- 사용자 메시지: `.chat-msg.user`
- AI 메시지: 투명 배경과 목록 기준 100% 너비
- AI 아이콘: `.msg-avatar`
- 본문: `.msg-content`
- 대기 상태: 그라데이션 `.chat-typing-ellipsis`
- 필수 스타일: `component/chat-message/chat-message.css`

```html
<div class="chat-messages"
    data-chat-message-list
    data-variant="chatbot">
    <div class="chat-msg user"
        data-component="chat-message"
        data-variant="chatbot"
        data-role="user">
        2026년도 주요 재정지표를 알려줘.
    </div>

    <div class="chat-msg ai"
        data-component="chat-message"
        data-variant="chatbot"
        data-role="ai"
        data-status="complete">
        <div class="msg-avatar"><!-- 기존 AI 아이콘 SVG --></div>
        <div class="msg-content">요청하신 재정지표를 정리해 드릴게요.</div>
        <div class="msg-actions"><!-- 공통 액션 버튼 --></div>
    </div>
</div>
```

답변 생성 중에는 완료 메시지 대신 다음 상태를 렌더링합니다.

```html
<div class="chat-msg ai is-pending"
    data-component="chat-message"
    data-variant="chatbot"
    data-role="ai"
    data-status="pending"
    aria-busy="true">
    <div class="msg-avatar"><!-- 기존 AI 아이콘 SVG --></div>
    <div class="msg-content">
        <span class="chat-typing-ellipsis"
            role="status"
            aria-label="답변 생성 중">...</span>
    </div>
</div>
```

## Answer variant

`data-variant="answer"`는 AI Answer 우측 패널의 작은 말풍선형입니다.

- 사용자와 AI 메시지 모두 최대 너비 85%의 말풍선
- AI 메시지: 기존 `ai-search.svg`를 사용하는 보라·파랑 그라데이션 아바타
- 본문: `.msg-text`
- 시간: `.msg-time` 선택 사용
- 대기 상태: `.typing-cursor`
- 필수 스타일: `component/chat-message/chat-message.css`

```html
<div class="chat-messages"
    data-chat-message-list
    data-variant="answer">
    <div class="chat-msg user"
        data-component="chat-message"
        data-variant="answer"
        data-role="user"
        data-status="complete">
        <div class="msg-text">질의 답변서의 핵심 내용을 요약해 줘.</div>
        <span class="msg-time">14:31</span>
    </div>

    <div class="chat-msg ai"
        data-component="chat-message"
        data-variant="answer"
        data-role="ai"
        data-status="complete">
        <div class="msg-avatar">
            <img src="${contextPath}/assets/icons/ai-search.svg"
                alt="" aria-hidden="true" />
        </div>
        <div class="msg-text">핵심 재정지표와 정책 근거를 요약했습니다.</div>
        <span class="msg-time">14:32</span>
        <div class="msg-actions"><!-- 공통 액션 버튼 --></div>
    </div>
</div>
```

AI 답변 생성 중에는 완료 메시지 대신 `ChatMessage.createPending()`으로 대기 상태를 생성합니다. 제목과 설명은 작업 맥락에 맞게 바꿀 수 있습니다.

```js
const pendingMessage = ChatMessage.createPending({
    variant: 'answer',
    title: '생성 중',
    description: '답변서 초안을 생성하고 있습니다...'
});

document.querySelector('[data-chat-message-list][data-variant="answer"]')
    .append(pendingMessage);
```

생성되는 대기 상태 마크업은 `data-status="pending"`, `aria-busy="true"`를 포함하고, 안내 문구에는 `role="status"`를 적용합니다. 작업이 끝나면 해당 요소를 제거합니다.

## 액션

공통 액션을 사용하려면 `component/chat-message/chat-message.js`를 로드하고 버튼에 `data-action`을 지정합니다.

```html
<script src="${contextPath}/component/chat-message/chat-message.js"></script>
```

스크립트가 로드되면 `[data-chat-message-list]`를 자동으로 바인딩합니다. 화면별 콜백이 필요한 경우 같은 목록에 `ChatMessage.bind(messageList, options)`를 호출해 `onFeedback`, `onCopy`, `onRetry`를 전달할 수 있습니다.

```html
<div class="msg-actions">
    <button class="msg-action-btn" type="button"
        data-action="like" aria-label="좋아요"
        aria-pressed="false">...</button>
    <button class="msg-action-btn" type="button"
        data-action="dislike" aria-label="싫어요"
        aria-pressed="false">...</button>
    <button class="msg-action-btn" type="button"
        data-action="retry" aria-label="다시 생성">...</button>
    <button class="msg-action-btn" type="button"
        data-action="copy" aria-label="복사">...</button>
</div>
```

- 좋아요·싫어요: 서로 배타적으로 선택되며 `.active`와 `aria-pressed`가 함께 변경됩니다.
- 다시 생성: 현재 variant에 맞는 `pending` 상태를 표시합니다.
- 복사: Chatbot의 `.msg-content` 또는 Answer의 `.msg-text`를 복사합니다.
- 각 동작은 버블링되는 `chat-message:action` 이벤트로도 전달됩니다.

## 파일과 검수 위치

- 공통 동작: `component/chat-message/chat-message.js`
- Answer/Chatbot 스타일: `component/chat-message/chat-message.css`
- 통합 카탈로그: `component/index.html#card-chatmessage`
- 상세 검수: `component/chat-message/chat-message.html`
- 실제 사용: `html/ai-answer.html`, `html/ai-chatbot.html`
