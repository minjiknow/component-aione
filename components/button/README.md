# Button 컴포넌트

버튼은 별도 HTML fragment를 불러오지 않고 일반 HTML에 공통 CSS 클래스를 직접 적용합니다. 작은 버튼을 비동기 include하는 대신 `.button`, `.icon-button`, `.icon`을 화면 전체의 공통 API로 사용합니다.

- 대표 검수: `components/index.html`의 Actions 영역
- 전체 일반 버튼: `components/button/button.html`
- 전체 아이콘 버튼: `components/button/icon-button.html`
- 필수 CSS: 공통 버튼은 `css/common.css`; 페이지 전용 버튼은 상세 카탈로그에 표시된 해당 페이지 CSS
- JS: `data-icon`을 사용하는 경우 `js/common.js`의 아이콘 경로 해석 기능 사용

## 일반 버튼

필요한 형태를 아래 마크업에서 복사해 화면에 직접 작성합니다.

```html
<button type="button" class="button button-primary">저장</button>
```

아이콘이 포함된 일반 버튼도 같은 방식으로 작성합니다.

```html
<button type="button" class="button button-ghost">
    <img class="icon icon-small" data-icon="plus" alt="" aria-hidden="true" />
    룰 추가
</button>
```

검은색 강조 버튼은 `button-dark`, 테두리 버튼은 `button-outline`, 삭제 액션은 `button-danger`를 사용합니다.

작은 액션은 실제 질의분류 화면과 동일하게 세로 패딩으로 24px 높이를 만듭니다.

```html
<button type="button" class="button button-sm button-outline">AI재분류</button>
<button type="button" class="button button-sm button-primary">확정</button>
```

## 아이콘 버튼

일반 아이콘 전용 버튼에는 `.icon-button`을 사용합니다. 화면 기능이나 배치에 필요한 기존 클래스는 함께 유지할 수 있습니다.

```html
<button
    type="button"
    class="icon-button"
    aria-label="패널 위치 변경"
    title="패널 위치 변경"
>
    <img class="icon icon-primary" data-icon="panel-swap" alt="" aria-hidden="true" />
</button>
```

테두리가 없는 버튼은 `icon-button-ghost`, 주요 액션은 `icon-button-primary`, 삭제 액션은 `icon-button-danger`를 조합합니다.

```html
<button type="button" class="icon-button icon-button-ghost panel-collapse-btn" aria-label="패널 접기">
    <img class="icon icon-small" data-icon="panel-collapse" alt="" aria-hidden="true" />
</button>
```

브랜드 버튼은 일반 아이콘 버튼의 상태 효과를 사용하지 않습니다. `.brand-icon-button`과 28px 전용 `.icon-brand`를 사용하며 `icon-button-ghost`를 조합하지 않습니다.

```html
<button type="button" class="brand-icon-button topbar-logo-btn" aria-label="일반 모드로 복귀">
    <img class="icon icon-brand" data-icon="ai-one-logo" alt="" aria-hidden="true" />
</button>
```

## 크기 체계

| 용도 | 버튼 규격 | 높이 결정 방식 | 아이콘 크기 |
|---|---:|---|---:|
| 작은 텍스트 버튼 | `.button-sm` 렌더 높이 24px | `padding: 4px 10px`, `min-height: auto` | 필요 시 `.icon-xsmall` 12px |
| 기본 텍스트 버튼 | `.button` 렌더 높이 32px | `min-height: 32px`, `padding: 0 12px` | `.icon-small` 14px |

| 용도 | 버튼 크기 | 아이콘 크기 |
|---|---:|---:|
| 작은 아이콘 버튼 | `.icon-button-sm` 24×24px | `.icon-small` 14×14px |
| 메시지 액션 버튼 | `.icon-button-message` 28×28px | `.icon-small` 14×14px |
| 기본 아이콘 버튼 | `.icon-button` 32×32px | `.icon-primary` 16×16px |
| 메시지 전송 버튼 | `.icon-button-send` 36×36px | `.icon-primary` 16×16px |
| 큰 아이콘을 넣은 기본 버튼 | `.icon-button` 32×32px | `.icon-large` 24×24px |
| 브랜드 전용 버튼 | `.brand-icon-button` 28×28px | `.icon-brand` 28×28px |
| 대형 아이콘 버튼 | `.icon-button-lg` 38×38px | `.icon-xlarge` 32×32px |

아이콘의 `width`, `height` 속성이나 화면별 크기 CSS는 작성하지 않습니다. 크기는 공통 아이콘 클래스로 지정합니다.

아이콘 버튼에는 보이는 텍스트가 없으므로 `aria-label`을 반드시 작성합니다. `title`은 마우스 사용자에게 같은 설명을 제공할 때 함께 작성합니다.

## 미리보기

`components/index.html`의 Actions 영역에서는 대표 변형을 확인하고, 각 카드의 **더보기**로 일반 버튼과 아이콘 버튼의 전체 상세 카탈로그를 확인합니다. 두 상세 HTML은 검수용 독립 페이지이며 운영 화면에서 include하지 않습니다. 탭, 필터, 칩, 메뉴, 내비게이션은 일반 액션 버튼과 동작·상태 체계가 달라 각각의 UI 컴포넌트로 관리합니다.
