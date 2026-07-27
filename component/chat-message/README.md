# ChatMessage 컴포넌트

AI-ONE 챗봇의 대화내역에서 사용자 질문과 AI 답변을 표시합니다. 현재 `ai-chatbot` 화면의 `.chat-msg` 마크업과 스타일을 그대로 사용합니다.

- 필수 CSS: `css/ai-chatbot.css`, `css/common.css`
- 필수 JS: 메시지 렌더링과 액션을 처리하는 화면 스크립트
- 검수 페이지: `component/chat-message/chat-message.html`
- 기본 메시지: `.chat-msg`
- 사용자 메시지: `.chat-msg.user`
- AI 메시지: `.chat-msg.ai`
- AI 아이콘: `.msg-avatar`
- 답변 내용: `.msg-content`
- 답변 액션: `.msg-actions`, `.msg-action-btn`

```html
<div class="chat-msg user">2026년도 주요 재정지표를 알려줘.</div>

<div class="chat-msg ai">
    <div class="msg-avatar"><!-- 기존 AI 아이콘 SVG --></div>
    <div class="msg-content">요청하신 재정지표를 정리해 드릴게요.</div>
    <div class="msg-actions">
        <button class="msg-action-btn" type="button"
            data-action="like" aria-label="좋아요"
            aria-pressed="false">...</button>
    </div>
</div>
```

사용자 메시지와 AI 메시지는 `.chat-messages` 안에 렌더링합니다. 좋아요·싫어요·재생성·복사 동작은 기존 화면 스크립트에서 연결하고, 활성 반응은 `.active`와 `aria-pressed`를 함께 갱신합니다.
