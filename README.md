# AI-ONE Platform Prototype

현재 프로토타입을 파일 역할별로 분리한 정적 HTML 프로젝트입니다.

## 폴더

- `html`: 실제 화면 HTML
- `css`: 화면별 CSS와 공통 `common.css`
- `js`: 화면별 JavaScript와 공통 `common.js`
- `component`: 컴포넌트 카탈로그, 검수 페이지, include용 fragment
- `assets`: 컴포넌트 검수에 사용하는 아이콘

## 시작 파일

- 메인 화면: `html/ai-home.html`
- 컴포넌트 카탈로그: `component/index.html`

로컬 작업 폴더의 `backup`은 구조 변경 전 원본 보관용이며, 실제 화면에서 참조하지 않아 Git에서 제외합니다.
