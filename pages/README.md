# Pages

`pages` 폴더에는 공통 컴포넌트를 조합한 화면별 프로토타입이 있습니다.

## 실행 전 확인

소스를 다운로드한 뒤 `pages/*.html` 파일을 실행하려면 가상 서버(로컬 웹 서버) 연결이 필요합니다.

페이지에서 `component/component-loader.js`가 공통 컴포넌트의 fragment 파일을 `fetch()`로 불러오므로, fallback이 없는 HTML 파일을 `file://` 방식으로 직접 열면 브라우저 보안 정책에 의해 컴포넌트가 정상적으로 표시되지 않을 수 있습니다.

- `ai-home.html`: Sidebar, DataTable, Toast, Modal의 `file://` fallback을 포함하므로 직접 열기와 로컬 서버 실행을 모두 지원합니다.
- `ai-workspace.html`: 원본 fragment를 사용하므로 로컬 서버에서 실행합니다.

프로젝트 루트에서 가상 서버를 실행한 뒤 `http://localhost` 주소로 페이지에 접속해 주세요.

예시:

```bash
python -m http.server 8000
```

서버 실행 후 아래와 같이 접속합니다.

```text
http://localhost:8000/pages/ai-workspace.html
```
