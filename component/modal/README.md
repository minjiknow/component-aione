# Modal 컴포넌트

Modal은 `small`, `medium`, `large`의 3단계 크기를 제공합니다. 기존 Small 380px은 Medium으로, 기존 Medium 960px은 Large로 변경했습니다.

| 크기 | 용도 | 클래스 | 너비 |
|---|---|---|---:|
| Small | AI Answer 대화 작업 메뉴 | `.custom-modal.modal-small` | 160px |
| Medium | 확인·경고·결정 모달 | `.custom-modal.modal-medium` | 380px |
| Large | 조직·담당자 선택 등 넓은 설정 모달 | `.custom-modal.modal-large` | 960px |

Small의 메뉴 구조와 SVG 아이콘은 `ai-answer`의 `.ct-menu`, `.ct-menu-item`을 기준으로 옮겼습니다. 가로 더보기 아이콘 버튼의 오른쪽 끝에 맞춰 메뉴를 배치하고, 버튼 하단에서 10px 떨어진 위치에 표시합니다. 아래 공간이 부족할 때만 버튼 위쪽으로 전환해 화면 밖으로 잘리지 않게 합니다. 메뉴 외부는 원본처럼 어둡게 덮지 않지만, 바깥 클릭과 `Escape`로 닫을 수 있도록 투명 backdrop을 유지합니다.

`data-component-variant`는 모달의 의미와 기본 표현을 구분합니다.

| Variant | 용도 | 기본 표현 |
|---|---|---|
| `action-menu` | 대화 작업 메뉴 | 투명 backdrop과 메뉴 목록 |
| `content` | 삭제·경고 등 일반 콘텐츠 | 경고 아이콘과 슬롯 콘텐츠 |
| `confirm` | 사용자의 결정을 다시 확인 | 파란 물음표 아이콘과 슬롯 콘텐츠 |
| `cancel` | 확정된 작업의 취소를 다시 확인 | 빨간 경고 아이콘과 슬롯 콘텐츠 |
| `alert` | 준비 중 등 확인만 필요한 안내 | 노란 느낌표 아이콘과 단일 확인 버튼 |

## 의존성

```html
<link rel="stylesheet" href="${contextPath}/component/button/button.css" />
<link rel="stylesheet" href="${contextPath}/component/modal/modal.css" />
<script src="${contextPath}/component/_shared/layer-controller.js"></script>
<script src="${contextPath}/component/modal/modal.js"></script>
```

입력 폼을 Modal body 슬롯에 조합할 때만 `component/_shared/form-control.css`와 해당 Input, Select, Textarea CSS를 추가합니다.
실국별 알림 담당자 설정 Large Modal은 같은 폴더의 `notification-assignee.js`를 추가해 조직 필터, 검색, 담당자 선택 상태를 초기화합니다.

- Fragment: `component/modal/modal.fragment.html`
- 열기: `[data-modal-open="<layer-id>"]`
- 레이어: `[data-modal]`, `.custom-modal-backdrop`
- 닫기: `[data-modal-close]`
- 검수 페이지: `component/modal/modal.html`

## Include

크기를 생략하면 기존 확인 모달과 호환되는 Medium이 기본입니다. Small을 선택하면 `action-menu`, Medium과 Large는 `content` variant가 자동으로 적용됩니다.

```html
<!-- Small: AI Answer 대화 작업 메뉴 -->
<button type="button"
    class="icon-button icon-button-ghost modal-action-trigger"
    data-modal-open="actionMenuModal"
    aria-label="대화 작업 메뉴 열기"
    title="대화 작업">
    <img class="icon icon-primary"
        src="${contextPath}/assets/icons/more-horizontal.svg"
        alt="" aria-hidden="true" />
</button>
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

<!-- Medium: 결정 확인 모달 -->
<button type="button" data-modal-open="questionConfirmModal">질의 확정</button>
<div data-component-include="modal"
    data-component-id="questionConfirmModal"
    data-component-variant="confirm"
    data-component-label="질의 확정 확인">
    <template data-slot="title">질의 확정</template>
    <template data-slot="description">질의 및 실국을 확정하시겠습니까?</template>
    <template data-slot="actions">
        <button type="button" class="btn-cancel" data-modal-close>취소</button>
        <button type="button" class="btn-confirm" data-modal-close>확인</button>
    </template>
</div>

<!-- Medium: 확정 취소 확인 모달 -->
<button type="button" data-modal-open="questionCancelModal">확정 취소</button>
<div data-component-include="modal"
    data-component-id="questionCancelModal"
    data-component-variant="cancel"
    data-component-label="질의 확정 취소 확인">
    <template data-slot="title">질의 확정을 취소할까요?</template>
    <template data-slot="description">확정한 질의와 실국을 다시 편집할 수 있는 상태로 변경합니다.</template>
    <template data-slot="actions">
        <button type="button" class="btn-cancel" data-modal-close>돌아가기</button>
        <button type="button" class="btn-confirm danger" data-modal-close>확정 취소</button>
    </template>
</div>

<!-- Medium: 준비 중 안내 모달 -->
<button type="button" data-modal-open="preparingModal">준비중</button>
<div data-component-include="modal"
    data-component-id="preparingModal"
    data-component-variant="alert"
    data-component-label="준비중 안내">
    <template data-slot="title">준비중</template>
    <template data-slot="description">이 화면은 프로토타입에 아직 포함되어 있지 않습니다.</template>
    <template data-slot="actions">
        <button type="button" class="btn-confirm" data-modal-close>확인</button>
    </template>
</div>

<!-- Large: 실국별 알림 담당자 설정 -->
<button type="button" class="icon-button icon-button-cyan"
    data-modal-open="notificationAssigneeModal"
    aria-label="실국별 알림 담당자 설정"
    title="실국별 알림 담당자 설정">
    <img class="icon icon-large" data-icon="notification-assignee" alt="" aria-hidden="true" />
</button>
```

Modal 컴포넌트는 열기·닫기·포커스 이동과 표현만 담당합니다. 확인 후 화면 버튼을 바꾸거나 다음 모달을 여는 업무 흐름은 사용하는 페이지에서 확인 버튼의 이벤트로 연결합니다.

Small 작업 메뉴를 코드에서 직접 열 때도 기준 버튼을 두 번째 인수로 전달합니다.

```js
window.AIOneModal.open('#actionMenuModal', actionMenuButton);
```

실국별 알림 담당자 설정에서 저장 버튼을 누르면 `notification-assignee:save` 이벤트가 Large Modal에서 발생합니다. `event.detail.departmentCount`는 전체 실국 수, `event.detail.assigneeCount`는 선택한 담당자 수입니다.

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
<div class="custom-modal-backdrop" id="notificationAssigneeModal" data-modal hidden>
    <section class="custom-modal notification-assignee-modal modal-large"
        role="dialog"
        aria-modal="true"
        data-notification-assignee
        aria-labelledby="notificationAssigneeModalTitle">
        <div class="notification-modal-head">
            <div>
                <div class="custom-modal-title notification-modal-title"
                    id="notificationAssigneeModalTitle">실국별 알림 담당자 설정</div>
                <div class="notification-modal-desc">
                    재정경제부 조직도 기준으로 알림을 받을 실국담당자를 지정합니다.
                </div>
            </div>
            <button type="button" class="notification-modal-close"
                data-modal-close aria-label="닫기">×</button>
        </div>
        <!-- notification-process-note, notification-org-layout, actions 조합 -->
    </section>
</div>
```

열려 있는 동안 `Tab` 포커스는 레이어 내부에 유지되고, 닫은 뒤에는 열기 버튼으로 돌아갑니다.
