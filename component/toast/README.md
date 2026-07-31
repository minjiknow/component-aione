# Toast 컴포넌트

화면 하단 중앙에 짧은 작업 결과를 표시하는 공통 Toast입니다. 첨부 시안의 흰색 배경, 얇은 테두리, 라운드 모서리와 그림자를 기준으로 하며 메시지는 호출할 때마다 변경할 수 있습니다.

- Fragment: `component/toast/toast.fragment.html`
- 필수 CSS: `component/toast/toast.css`; 버튼이 포함된 데모/사용 화면은 `component/button/button.css`
- 필수 JS: `component/toast/toast.js`
- 검수 페이지: `component/toast/toast.html`
- 루트: `.ai-one-toast[data-toast]`
- 메시지: `.ai-one-toast-message[data-toast-message]`
- 실제 사용: `pages/ai-answer.html`, `js/ai-answer-page.js`

```html
<div class="ai-one-toast" id="pageToast" data-toast
    role="status" aria-live="polite" aria-atomic="true" hidden>
    <span class="ai-one-toast-message" data-toast-message></span>
</div>
```

```js
window.AIOneToast.show(
    "v1.0(09:18) 답변서 초안을 다운로드합니다.",
    {
        target: "#pageToast",
        duration: 2000
    }
);
```

`target`은 Toast 요소 또는 CSS 선택자를 받습니다. 생략하면 문서의 첫 번째 `[data-toast]`를 사용합니다. `duration`은 밀리초 단위이며 기본값은 `2000`입니다. `0`을 전달하면 자동으로 닫히지 않습니다.

```js
window.AIOneToast.hide("#pageToast");
```

Toast는 보조기기에 변경된 메시지를 알리기 위해 `role="status"`, `aria-live="polite"`, `aria-atomic="true"`를 유지합니다. HTML 문자열을 삽입하지 않고 `textContent`로 메시지를 반영합니다.
