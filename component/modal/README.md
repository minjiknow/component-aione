# Modal 컴포넌트

Modal은 `small`, `medium`, `large`의 3단계 크기를 제공합니다. 기존 Small 380px은 Medium으로, 기존 Medium 960px은 Large로 변경했습니다.

| 크기 | 용도 | 클래스 | 너비 |
|---|---|---|---:|
| Small | AI Answer 대화 작업 메뉴 | `.custom-modal.modal-small` | 160px |
| Medium | 확인·경고·결정 모달 | `.custom-modal.modal-medium` | 380px |
| Large | 조직·담당자 선택 등 넓은 설정 모달 | `.custom-modal.modal-large` | 960px |

Small의 메뉴 구조와 SVG 아이콘은 `ai-answer`의 `.ct-menu`, `.ct-menu-item`을 기준으로 옮겼습니다. 가로 더보기 아이콘 버튼의 오른쪽 끝에 맞춰 메뉴를 배치하고, 버튼 하단에서 10px 떨어진 위치에 표시합니다. 아래 공간이 부족할 때만 버튼 위쪽으로 전환해 화면 밖으로 잘리지 않게 합니다. 메뉴 외부는 원본처럼 어둡게 덮지 않지만, 바깥 클릭과 `Escape`로 닫을 수 있도록 투명 backdrop을 유지합니다.

Small 메뉴 아이콘은 기존 `assets/icons` SVG 파일을 `<img>`로 참조합니다. Modal fragment 안에 inline SVG를 두지 않아 VS Code Live Server에서도 표준 `modal.fragment.html` 응답이 변형되지 않습니다.

`form` variant는 Medium 구조를 바탕으로 400px 너비를 사용합니다. 별도 배경 레이어를 만들지 않고 다른 Modal과 동일한 `.custom-modal-backdrop`을 사용합니다.

`data-component-variant`는 모달의 의미와 기본 표현을 구분합니다.

| Variant | 용도 | 기본 표현 |
|---|---|---|
| `action-menu` | 대화 작업 메뉴 | 투명 backdrop과 메뉴 목록 |
| `content` | 삭제·경고 등 일반 콘텐츠 | 경고 아이콘과 슬롯 콘텐츠 |
| `confirm` | 사용자의 결정을 다시 확인 | 기존 질의 확정 화면과 같은 파란 선형 확정 아이콘과 슬롯 콘텐츠 |
| `cancel` | 확정된 작업의 취소를 다시 확인 | 파란 선형 확정 아이콘과 슬롯 콘텐츠 |
| `alert` | 준비 중 등 확인만 필요한 안내 | 노란 느낌표 아이콘과 단일 확인 버튼 |
| `account-profile` | Sidebar의 내 정보 | 사용자 요약·계정 정보와 확인 버튼 |
| `account-settings` | Sidebar의 환경설정 | 화면 모드·강조 컬러·응답 완료 알림 |
| `form` | 질의분류·담당실국 등 값 수정 | 헤더·입력 영역·우측 정렬 액션 |
| `rename` | 실행 건 제목·채팅 이름 변경 | 파란 편집 아이콘, 안내 문구, 단일 입력 필드와 중앙 액션 |

Medium 확인·안내 모달은 기존 화면과 동일하게 제목 `15px / 700`, 설명 `12px / 1.6`을 사용합니다. 설명 안의 파일명처럼 강조가 필요한 텍스트만 `<strong>`으로 표시합니다.

## 의존성

```html
<link rel="stylesheet" href="${contextPath}/component/button/button.css" />
<link rel="stylesheet" href="${contextPath}/component/modal/modal.css" />
<script src="${contextPath}/component/_shared/layer-controller.js"></script>
<script src="${contextPath}/component/modal/modal.js"></script>
```

입력 폼을 Modal body 슬롯에 조합할 때만 `component/_shared/form-control.css`와 해당 Input, Select, Textarea CSS를 추가합니다.
질의분류 수정 폼은 `component/modal/query-edit-modal.js`를 추가하면 기존 Query Card 데이터를 채우고 `query-edit-modal:apply` 이벤트로 수정값을 전달할 수 있습니다.
실국별 알림 담당자 설정은 `backup/20260726` AI Intake와 동일한 960px 조직도형 모달입니다. Include 방식에서는 `notification-assignee` variant를 지정하면 전용 마크업과 `component/modal/notification-assignee.js`가 함께 로드되어 조직 필터, 검색, 담당자 선택과 저장 이벤트가 초기화됩니다. 화면 전용 배치·색상·반응형 CSS는 공통 `modal.css`에서 주석 처리해 보존하고 `css/ai-workspace.css`가 소유합니다.

- Fragment: `component/modal/modal.fragment`
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
    <template data-slot="title">확정 취소</template>
    <template data-slot="description">확정을 취소하고 이전 상태로 되돌리시겠습니까?</template>
    <template data-slot="actions">
        <button type="button" class="btn-cancel" data-modal-close>취소</button>
        <button type="button" class="btn-confirm" data-modal-close>확인</button>
    </template>
</div>

<!-- Medium: 로그아웃 확인 모달 -->
<button type="button" data-modal-open="sidebarLogoutModal">로그아웃</button>
<div data-component-include="modal"
    data-component-id="sidebarLogoutModal"
    data-component-variant="logout"
    data-component-label="로그아웃 확인">
    <template data-slot="title">로그아웃</template>
    <template data-slot="description">AI-ONE에서 로그아웃하시겠습니까?</template>
    <template data-slot="actions">
        <button type="button" class="btn-cancel" data-modal-close>취소</button>
        <button type="button" class="btn-confirm danger" data-modal-close>로그아웃</button>
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

<!-- 실행 목록·채팅 목록 이름 변경 -->
<div data-component-include="modal"
    data-component-id="listRenameModal"
    data-component-variant="rename"
    data-component-label="실행 건 제목 변경">
    <template data-slot="title">실행 건 제목 변경</template>
    <template data-slot="description">
        <p class="modal-rename-helper">목록에서 구분하기 쉬운 제목으로 변경할 수 있습니다.</p>
        <label class="modal-rename-field" for="listRenameInput">
            <span class="modal-rename-label">실행 건 제목</span>
            <input class="form-input" id="listRenameInput"
                data-sidepop-rename-input />
        </label>
        <p class="modal-rename-error"
            data-sidepop-rename-error hidden>제목을 입력해 주세요.</p>
    </template>
    <template data-slot="actions">
        <button type="button" class="btn-cancel" data-modal-close>취소</button>
        <button type="button" class="btn-confirm"
            data-sidepop-rename-confirm>저장</button>
    </template>
</div>

<!-- Medium: 질의분류 · 담당실국 수정 폼 -->
<div data-component-include="modal"
    data-component-id="queryEditModal"
    data-component-variant="form"
    data-component-label="질의분류 및 담당실국 수정">
    <template data-slot="title">
        <span>질의분류 · 담당실국</span>
        <button type="button" class="query-edit-modal-close"
            data-modal-close aria-label="닫기">×</button>
    </template>
    <template data-slot="description">
        <div class="form-group">
            <label>
                <span>질의명</span>
                <textarea class="form-textarea" rows="3"
                    data-query-edit-text></textarea>
            </label>
        </div>
        <!-- 같은 방식으로 data-query-edit-type, data-query-edit-main-dept,
             data-query-edit-coop-dept, data-query-edit-org 필드를 조합합니다. -->
    </template>
    <template data-slot="actions">
        <button type="button" class="btn-cancel" data-modal-close>취소</button>
        <button type="button" class="btn-confirm"
            data-query-edit-apply>수정 적용</button>
    </template>
</div>

<!-- Large: 실국별 알림 담당자 설정 -->
<button type="button" class="icon-button icon-button-workspace"
    data-modal-open="notificationAssigneeModal"
    aria-label="실국별 알림 담당자 설정"
    title="실국별 알림 담당자 설정">
    <img class="icon icon-primary" data-icon="notification-assignee" alt="" aria-hidden="true" />
</button>

<div data-component-include="modal"
    data-component-id="notificationAssigneeModal"
    data-component-variant="notification-assignee"
    data-component-label="실국별 알림 담당자 설정"></div>
```

`logout` variant는 `assets/icons/logout.svg`를 사용하고 확인 버튼에는 위험 동작 modifier인 `.danger`를 적용합니다. 액션의 `취소`, `로그아웃` 버튼은 참고 화면과 같은 `72 × 34px` 크기로 표시됩니다.

Modal 컴포넌트는 열기·닫기·포커스 이동과 표현만 담당합니다. 확인 후 화면 버튼을 바꾸거나 다음 모달을 여는 업무 흐름은 사용하는 페이지에서 확인 버튼의 이벤트로 연결합니다.

실국별 알림 담당자 설정에서 저장 버튼을 누르면 `notification-assignee:save` 이벤트가 Large Modal에서 발생합니다. `event.detail.departmentCount`는 전체 실국 수, `event.detail.assigneeCount`는 선택한 담당자 수입니다.

Query Card의 수정 이벤트를 폼 모달에 연결하고 저장 결과를 받는 예시는 다음과 같습니다.

```js
document.addEventListener('query-card:edit', event => {
    window.AIOneQueryEditModal.open(
        '#queryEditModal',
        event.detail.query,
        document.activeElement
    );
});

document.addEventListener('query-edit-modal:apply', event => {
    if (event.target.id !== 'queryEditModal') return;
    updateQuestion(event.detail);
});
```

Small 작업 메뉴를 코드에서 직접 열 때도 기준 버튼을 두 번째 인수로 전달합니다.

```js
window.AIOneModal.open('#actionMenuModal', actionMenuButton);
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
<div class="custom-modal-backdrop" id="notificationAssigneeModal" data-modal hidden>
    <section class="custom-modal notification-assignee-modal notification-dept-modal"
        role="dialog" aria-modal="true" data-notification-assignee
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
        <div class="notification-process-note"><!-- 안내 문구 --></div>
        <div class="notification-org-layout">
            <aside class="notification-org-panel" aria-label="조직 선택">
                <div class="notification-org-panel-title">조직 선택</div>
                <div class="notification-org-list" data-notification-org-list></div>
            </aside>
            <section class="notification-dept-panel" aria-label="실국별 담당자">
                <div class="notification-dept-toolbar">
                    <label class="drawer-list-search notification-dept-search">
                        <input type="search" data-notification-search
                            aria-label="실국명 또는 담당자 검색" />
                        <button type="button"
                            class="drawer-search-clear notification-dept-search-clear"
                            data-notification-search-clear hidden>×</button>
                    </label>
                    <div class="notification-dept-result" data-notification-result></div>
                </div>
                <div class="notification-dept-grid" data-notification-dept-grid></div>
            </section>
        </div>
        <div class="notification-dept-feedback"
            data-notification-feedback aria-live="polite"></div>
        <div class="custom-modal-actions notification-modal-actions">
            <button type="button" class="btn-cancel" data-modal-close>취소</button>
            <button type="button" class="btn-confirm"
                data-notification-save data-modal-close>설정 저장</button>
        </div>
    </section>
</div>

<script src="${contextPath}/component/modal/notification-assignee.js"></script>
```

열려 있는 동안 `Tab` 포커스는 레이어 내부에 유지되고, 닫은 뒤에는 열기 버튼으로 돌아갑니다.
