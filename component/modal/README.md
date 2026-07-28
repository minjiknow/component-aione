# Modal 컴포넌트

Modal은 `small`, `medium`, `large`의 3단계 크기를 제공합니다. 기존 Small 380px은 Medium으로, 기존 Medium 960px은 Large로 변경했습니다.

| 크기 | 용도 | 클래스 | 너비 |
|---|---|---|---:|
| Small | AI Answer 대화 작업 메뉴 | `.custom-modal.modal-small` | 160px |
| Medium | 확인·경고 모달 | `.custom-modal.modal-medium` | 380px |
| Large | 입력 폼 등 넓은 모달 | `.custom-modal.modal-large` | 960px |

Small의 메뉴 구조와 SVG 아이콘은 `ai-answer`의 `.ct-menu`, `.ct-menu-item`을 기준으로 옮겼습니다. 메뉴 외부는 원본처럼 어둡게 덮지 않지만, 바깥 클릭과 `Escape`로 닫을 수 있도록 투명 backdrop을 유지합니다.

## 의존성

```html
<link rel="stylesheet" href="${contextPath}/component/form-field/form-field.css" />
<link rel="stylesheet" href="${contextPath}/component/modal/modal.css" />
<script src="${contextPath}/component/_shared/layer-controller.js"></script>
<script src="${contextPath}/component/modal/modal.js"></script>
```

- Fragment: `component/modal/modal.fragment.html`
- 열기: `[data-modal-open="<layer-id>"]`
- 레이어: `[data-modal]`, `.custom-modal-backdrop`
- 닫기: `[data-modal-close]`
- 검수 페이지: `component/modal/modal.html`

## Include

크기를 생략하면 기존 확인 모달과 호환되는 Medium이 기본입니다. Small을 선택하면 `action-menu`, Medium과 Large는 `content` variant가 자동으로 적용됩니다.

```html
<!-- Small: AI Answer 대화 작업 메뉴 -->
<button type="button" data-modal-open="actionMenuModal">대화 작업</button>
<div data-component-include="modal"
    data-component-id="actionMenuModal"
    data-component-size="small"></div>

<!-- Medium: 확인·경고 모달 -->
<button type="button" data-modal-open="deleteModal">삭제</button>
<div data-component-include="modal"
    data-component-id="deleteModal">
    <template data-slot="title">작업을 삭제할까요?</template>
    <template data-slot="description">삭제한 작업은 다시 복구할 수 없습니다.</template>
    <template data-slot="actions">
        <button type="button" class="btn-cancel" data-modal-close>취소</button>
        <button type="button" class="btn-confirm danger">삭제</button>
    </template>
</div>
```

## 직접 작성

```html
<div class="custom-modal-backdrop modal-menu-backdrop" id="actionMenuModal" data-modal hidden>
    <section class="custom-modal modal-small"
        role="dialog"
        aria-modal="true"
        aria-label="대화 작업 메뉴">
        <div class="modal-action-menu" role="menu">
            <button type="button"
                class="modal-action-item"
                role="menuitem"
                data-modal-close>대화 공유</button>
            <button type="button"
                class="modal-action-item"
                role="menuitem"
                data-modal-close>고정</button>
            <button type="button"
                class="modal-action-item"
                role="menuitem"
                data-modal-close>이름 변경</button>
            <button type="button"
                class="modal-action-item danger"
                role="menuitem"
                data-modal-close>삭제</button>
        </div>
    </section>
</div>
```

```html
<div class="custom-modal-backdrop" id="deleteModal" data-modal hidden>
    <section class="custom-modal modal-medium"
        role="dialog"
        aria-modal="true"
        aria-labelledby="deleteModalTitle"
        aria-describedby="deleteModalDescription">
        <div class="custom-modal-icon danger" aria-hidden="true">⚠</div>
        <div class="custom-modal-title" id="deleteModalTitle">작업을 삭제할까요?</div>
        <div class="custom-modal-msg" id="deleteModalDescription">
            삭제한 작업은 다시 복구할 수 없습니다.
        </div>
        <div class="custom-modal-actions">
            <button type="button" class="btn-cancel" data-modal-close>취소</button>
            <button type="button" class="btn-confirm danger">삭제</button>
        </div>
    </section>
</div>
```

```html
<div class="custom-modal-backdrop" id="renameModal" data-modal hidden>
    <section class="custom-modal notification-assignee-modal modal-large"
        role="dialog"
        aria-modal="true"
        aria-labelledby="renameModalTitle">
        <!-- 넓은 입력 폼 내용 -->
    </section>
</div>
```

열려 있는 동안 `Tab` 포커스는 레이어 내부에 유지되고, 닫은 뒤에는 열기 버튼으로 돌아갑니다.
