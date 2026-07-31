# Pages

`pages` 폴더에는 공통 컴포넌트를 조합한 화면별 프로토타입이 있습니다.

## 실행 전 확인

소스를 다운로드한 뒤 `pages/*.html` 파일을 실행하려면 가상 서버(로컬 웹 서버) 연결이 필요합니다.

페이지에서 `component/component-include-loader.js`가 공통 컴포넌트의 fragment 파일을 불러옵니다. 로컬 서버에서는 원본 fragment를 `fetch()`하고, `file://` 방식으로 직접 열면 자동 생성된 `component/component-file-fallbacks.generated.js`를 사용합니다.

`ai-home.html`, `ai-workspace.html`, `ai-answer.html`은 파일 직접 열기와 로컬 서버 실행을 모두 지원합니다. 공통 fragment를 수정한 뒤에는 `node scripts/build-component-file-fallbacks.mjs`를 실행해 파일 실행용 묶음을 갱신합니다.

세 페이지는 공통 Sidebar가 소유한 준비 중 Modal을 동일하게 사용합니다. 내 정보·환경설정·로그아웃은 `js/common.js`가 20260726 참조 화면과 동일한 계정 레이어로 열며, 별도의 화면 모드 저장값이 없거나 이전 버전의 저장값만 남아 있으면 라이트 모드로 시작합니다. 사용자가 환경설정에서 시스템·다크·라이트 모드를 선택한 뒤에는 그 선택을 유지합니다.

프로젝트 루트에서 가상 서버를 실행한 뒤 `http://localhost` 주소로 페이지에 접속해 주세요.

예시:

```bash
python -m http.server 8000
```

서버 실행 후 아래와 같이 접속합니다.

```text
http://localhost:8000/pages/ai-workspace.html
```
