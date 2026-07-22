# JSP fragment compatibility

`components` 폴더의 HTML fragment가 퍼블리싱 원본입니다. 이 폴더의 JSPF는 동일 경로 규칙으로 연결하기 위한 개발 참고본입니다.

- HTML: `components/panel/panel.html`
- JSPF: `includes/jsp/panel/panel.jspf`

Topbar와 Sidebar처럼 큰 singleton은 JSPF에서 canonical HTML fragment를 정적 include합니다. 실제 프로젝트에 반영할 때는 빌드 구조에 맞게 include 경로를 context 또는 tag file 방식으로 치환할 수 있습니다. 최종 렌더링 DOM의 클래스와 `data-*` 속성은 HTML fragment와 동일해야 합니다.
