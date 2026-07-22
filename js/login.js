(function () {
  'use strict';

  function init() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const id = document.getElementById('userId').value.trim();
      const password = document.getElementById('userPw').value.trim();

      if (!id || !password) {
        alert('아이디와 비밀번호를 입력해주세요.');
        return;
      }

      window.location.href = window.AppCommon.resolveRoute('home');
    });
  }

  window.AppCommon.whenReady(init);
})();
