# AI-ONE Platform Prototype

현재 프로토타입을 파일 역할별로 분리한 정적 HTML 프로젝트입니다.

## 폴더

- `pages`: 공통 컴포넌트로 조합한 현재 화면 HTML
- `css`: `pages`에서 사용하는 화면 CSS와 공통 `common.css`
- `js`: 화면별 JavaScript와 공통 `common.js`
- `component`: 컴포넌트 카탈로그, 검수 페이지, include용 fragment
- `assets`: 컴포넌트 검수에 사용하는 아이콘

## 시작 파일

- 메인 화면: `pages/ai-home.html`
- 컴포넌트 카탈로그: `component/index.html`

## 로컬 실행

소스를 다운로드한 뒤 HTML 파일을 더블클릭하는 `file://` 방식으로 열지 말고, 프로젝트 루트에 로컬 웹 서버(가상 서버)를 연결해 실행해 주세요. 공통 컴포넌트의 fragment와 화면 자산을 `fetch()` 및 iframe으로 불러오기 때문에 서버 없이 열면 일부 컴포넌트가 표시되지 않거나 동작하지 않을 수 있습니다.

프로젝트 루트에서 아래 명령을 실행합니다.

```bash
python -m http.server 8000
```

서버 실행 후 브라우저에서 필요한 화면에 접속합니다.

- 메인 화면: `http://localhost:8000/pages/ai-home.html`
- 공통 컴포넌트 카탈로그: `http://localhost:8000/component/index.html`
- 공통 컴포넌트 기반 페이지: `http://localhost:8000/pages/ai-home.html`

개발 도구의 Live Server를 사용하는 경우에도 프로젝트 루트를 서버 기준 경로로 지정해 주세요.

로컬 작업 폴더의 `backup`은 구조 변경 전 원본 보관용이며, 실제 화면에서 참조하지 않아 Git에서 제외합니다.
