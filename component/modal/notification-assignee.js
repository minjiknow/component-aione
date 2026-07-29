(() => {
  'use strict';

  const organizationOrder = [
    '부총리 직속',
    '제1차관 직속',
    '제1차관 소관',
    '제1차관 추진단',
    '제2차관 직속',
    '제2차관 소관'
  ];

  const staffNames = [
    '이수빈', '정우진', '문가영', '김민지', '박도윤', '이서현', '최지훈', '정하윤', '오세진', '한유진',
    '송민재', '윤서아', '장현우', '배지민', '임수호', '이준호', '정민지', '강현우', '김하린', '백승우',
    '조서윤', '최예원', '김성민', '장다은', '박준서', '이하연', '윤민호', '서지원', '한승민', '임유나',
    '강지호', '송혜진', '우민석', '김도현', '박하늘', '조유진', '정하연', '박성진', '이예원', '최민준'
  ];

  function createStaff(department, offset) {
    const safeKey = department.replace(/[^가-힣a-zA-Z0-9]/g, '-');
    return [0, 1, 2].map(index => ({
      id: `${safeKey}-${offset + index}`,
      name: staffNames[(offset + index) % staffNames.length],
      position: index === 0 ? '사무관' : '주무관'
    }));
  }

  const departmentDirectory = [
    { organization: '부총리 직속', department: '대변인', subunits: ['홍보담당관'], staff: createStaff('대변인', 0) },
    { organization: '부총리 직속', department: '감사관', subunits: ['감사담당관'], staff: createStaff('감사관', 3) },
    { organization: '부총리 직속', department: '입법심의관', subunits: [], staff: createStaff('입법심의관', 6) },
    { organization: '부총리 직속', department: '전략기획관', subunits: [], staff: createStaff('전략기획관', 9) },
    { organization: '부총리 직속', department: '장관정책보좌관', subunits: [], staff: createStaff('장관정책보좌관', 12) },
    { organization: '제1차관 직속', department: '인사과', subunits: [], staff: createStaff('인사과', 15) },
    { organization: '제1차관 직속', department: '운영지원과', subunits: [], staff: createStaff('운영지원과', 18) },
    { organization: '제1차관 직속', department: '차관보', subunits: [], staff: createStaff('차관보', 21) },
    { organization: '제1차관 소관', department: '경제정책국', subunits: ['거시경제심의관', '종합정책과', '경제분석과'], staff: createStaff('경제정책국', 24) },
    { organization: '제1차관 소관', department: '민생경제국', subunits: ['물가정책과', '인력정책과', '복지경제과'], staff: createStaff('민생경제국', 27) },
    { organization: '제1차관 소관', department: '경제구조개혁국', subunits: ['노동시장경제과', '연금보건경제과', '청년정책과'], staff: createStaff('경제구조개혁국', 30) },
    { organization: '제1차관 소관', department: '혁신성장실', subunits: ['정책조정관', '산업경제과', '서비스경제과'], staff: createStaff('혁신성장실', 33) },
    { organization: '제1차관 소관', department: '세제실', subunits: ['조세정책과', '소득세제과', '법인세제과'], staff: createStaff('세제실', 36) },
    { organization: '제1차관 추진단', department: '초혁신경제추진단', subunits: ['기획총괄과', '전략지원과'], staff: createStaff('초혁신경제추진단', 39) },
    { organization: '제1차관 추진단', department: '조세개혁추진단', subunits: ['총괄기획팀', '보유세개편팀'], staff: createStaff('조세개혁추진단', 42) },
    { organization: '제1차관 추진단', department: '수출플러스지원단', subunits: ['총괄기획팀', '글로벌진출팀'], staff: createStaff('수출플러스지원단', 45) },
    { organization: '제2차관 직속', department: '정책금융기획관', subunits: [], staff: createStaff('정책금융기획관', 48) },
    { organization: '제2차관 직속', department: '금융입법담당관', subunits: [], staff: createStaff('금융입법담당관', 51) },
    { organization: '제2차관 직속', department: '공공금융담당관', subunits: [], staff: createStaff('공공금융담당관', 54) },
    { organization: '제2차관 소관', department: '기획조정실', subunits: ['정책기획관', '기획재정담당관'], staff: createStaff('기획조정실', 57) },
    { organization: '제2차관 소관', department: '국고실', subunits: ['국고정책관', '국채정책과', '회계결산과'], staff: createStaff('국고실', 60) },
    { organization: '제2차관 소관', department: '국제경제관리관', subunits: ['국제금융국', '대외경제국'], staff: createStaff('국제경제관리관', 63) },
    { organization: '제2차관 소관', department: '국제금융국', subunits: ['국제금융과', '외화자금과', '외환제도과'], staff: createStaff('국제금융국', 66) },
    { organization: '제2차관 소관', department: '대외경제국', subunits: ['대외경제총괄과', '통상정책과'], staff: createStaff('대외경제국', 69) },
    { organization: '제2차관 소관', department: '개발금융국', subunits: ['개발금융총괄과', '국제기구과'], staff: createStaff('개발금융국', 72) },
    { organization: '제2차관 소관', department: '공공정책국', subunits: ['공공정책총괄과', '평가분석과'], staff: createStaff('공공정책국', 75) }
  ];

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function initializeModal(modal) {
    if (modal.dataset.notificationAssigneeReady === 'true') return;

    const organizationList = modal.querySelector('[data-notification-org-list]');
    const departmentGrid = modal.querySelector('[data-notification-dept-grid]');
    const searchInput = modal.querySelector('[data-notification-search]');
    const searchClear = modal.querySelector('[data-notification-search-clear]');
    const result = modal.querySelector('[data-notification-result]');
    const feedback = modal.querySelector('[data-notification-feedback]');
    if (!organizationList || !departmentGrid || !searchInput || !result) return;

    const assignments = new Map(departmentDirectory.map(group => [
      group.department,
      new Set(group.staff.slice(0, 2).map(person => person.id))
    ]));
    const expandedOrganizations = new Set(organizationOrder);
    let selectedOrganization = 'all';
    let searchTerm = '';

    function setFeedback(message = '', type = '') {
      if (!feedback) return;
      feedback.textContent = message;
      feedback.className = `notification-dept-feedback${type ? ` ${type}` : ''}`;
    }

    function getVisibleDepartments() {
      const normalizedSearch = searchTerm.trim().toLowerCase();
      return departmentDirectory.filter(group => {
        const matchesOrganization = selectedOrganization === 'all'
          || selectedOrganization === `org:${group.organization}`
          || selectedOrganization === `dept:${group.department}`;
        if (!matchesOrganization) return false;
        if (!normalizedSearch) return true;

        const searchableText = [
          group.organization,
          group.department,
          ...group.subunits,
          ...group.staff.flatMap(person => [person.name, person.position])
        ].join(' ').toLowerCase();
        return searchableText.includes(normalizedSearch);
      });
    }

    function renderOrganizationList() {
      const allSelected = selectedOrganization === 'all';
      const allItem = `
        <button type="button" class="notification-org-item notification-tree-special${allSelected ? ' selected' : ''}"
          data-notification-organization="all" aria-pressed="${allSelected}">
          <span>전체 조직</span><strong>${departmentDirectory.length}</strong>
        </button>`;
      const tree = organizationOrder.map(organization => {
        const groups = departmentDirectory.filter(group => group.organization === organization);
        const expanded = expandedOrganizations.has(organization);
        const organizationKey = `org:${organization}`;
        const selected = selectedOrganization === organizationKey;
        return `
          <div class="notification-tree-group${expanded ? ' expanded' : ''}">
            <button type="button" class="notification-tree-parent${selected ? ' selected' : ''}"
              data-notification-organization="${escapeHtml(organizationKey)}"
              data-notification-tree-parent="${escapeHtml(organization)}"
              aria-expanded="${expanded}" aria-pressed="${selected}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>
              <span>${escapeHtml(organization)}</span><strong>${groups.length}</strong>
            </button>
            <div class="notification-tree-children"${expanded ? '' : ' hidden'}>
              ${groups.map(group => {
                const departmentKey = `dept:${group.department}`;
                const departmentSelected = selectedOrganization === departmentKey;
                return `
                  <button type="button" class="notification-tree-leaf${departmentSelected ? ' selected' : ''}"
                    data-notification-organization="${escapeHtml(departmentKey)}"
                    aria-pressed="${departmentSelected}">
                    <span>${escapeHtml(group.department)}</span>
                  </button>`;
              }).join('')}
            </div>
          </div>`;
      }).join('');
      organizationList.innerHTML = allItem + tree;
    }

    function renderDepartmentGrid() {
      const visibleDepartments = getVisibleDepartments();
      const selectedLabel = selectedOrganization === 'all'
        ? '전체 조직'
        : selectedOrganization.split(':').slice(1).join(':');
      result.textContent = `${selectedLabel} · ${visibleDepartments.length}개 조직`;
      if (searchClear) searchClear.hidden = !searchTerm;

      if (!visibleDepartments.length) {
        departmentGrid.innerHTML = `
          <div class="notification-dept-empty">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>
            <strong>조건에 맞는 실국이 없습니다.</strong>
            <span>다른 조직을 선택하거나 검색어를 변경해 주세요.</span>
          </div>`;
        return;
      }

      departmentGrid.innerHTML = visibleDepartments.map(group => {
        const groupIndex = departmentDirectory.indexOf(group);
        const selectedIds = assignments.get(group.department) || new Set();
        return `
          <section class="notification-dept-card">
            <div class="notification-dept-card-head">
              <div class="notification-dept-heading">
                <span class="notification-dept-org">${escapeHtml(group.organization)}</span>
                <div class="notification-dept-name">${escapeHtml(group.department)}</div>
              </div>
              <span class="notification-dept-count">${selectedIds.size}명</span>
            </div>
            ${group.subunits.length ? `
              <div class="notification-dept-subunits" title="${escapeHtml(group.subunits.join(' · '))}">
                ${group.subunits.map(unit => `<span>${escapeHtml(unit)}</span>`).join('')}
              </div>` : ''}
            <div class="notification-dept-staff-list">
              ${group.staff.map(person => {
                const selected = selectedIds.has(person.id);
                return `
                  <button type="button" class="notification-dept-staff${selected ? ' selected' : ''}"
                    data-notification-department-index="${groupIndex}"
                    data-notification-person="${escapeHtml(person.id)}"
                    aria-pressed="${selected}">
                    <span class="notification-assignee-avatar">${escapeHtml(person.name.slice(0, 1))}</span>
                    <span class="notification-assignee-info">
                      <span class="notification-assignee-name">${escapeHtml(person.name)} ${escapeHtml(person.position)}</span>
                      <span class="notification-assignee-meta">${escapeHtml(group.department)}${selected ? ' · 실국담당자' : ''}</span>
                    </span>
                    <span class="notification-check" aria-hidden="true">${selected ? '✓' : ''}</span>
                  </button>`;
              }).join('')}
            </div>
          </section>`;
      }).join('');
    }

    function render() {
      renderOrganizationList();
      renderDepartmentGrid();
    }

    organizationList.addEventListener('click', event => {
      const button = event.target.closest('[data-notification-organization]');
      if (!button) return;

      const parentOrganization = button.dataset.notificationTreeParent;
      if (parentOrganization) {
        if (expandedOrganizations.has(parentOrganization)) expandedOrganizations.delete(parentOrganization);
        else expandedOrganizations.add(parentOrganization);
      }
      selectedOrganization = button.dataset.notificationOrganization || 'all';
      setFeedback();
      render();
    });

    departmentGrid.addEventListener('click', event => {
      const button = event.target.closest('[data-notification-person]');
      if (!button) return;

      const group = departmentDirectory[Number(button.dataset.notificationDepartmentIndex)];
      if (!group) return;
      const selectedIds = assignments.get(group.department) || new Set();
      const personId = button.dataset.notificationPerson;
      if (selectedIds.has(personId)) selectedIds.delete(personId);
      else selectedIds.add(personId);
      assignments.set(group.department, selectedIds);
      setFeedback(`${group.department} 담당자 ${selectedIds.size}명이 지정되었습니다.`, 'success');
      renderDepartmentGrid();
    });

    searchInput.addEventListener('input', () => {
      searchTerm = searchInput.value;
      setFeedback();
      renderDepartmentGrid();
    });

    searchClear?.addEventListener('click', () => {
      searchTerm = '';
      searchInput.value = '';
      searchInput.focus();
      setFeedback();
      renderDepartmentGrid();
    });

    modal.querySelector('[data-notification-save]')?.addEventListener('click', () => {
      const selectedCount = Array.from(assignments.values())
        .reduce((total, selectedIds) => total + selectedIds.size, 0);
      modal.dispatchEvent(new CustomEvent('notification-assignee:save', {
        bubbles: true,
        detail: { departmentCount: departmentDirectory.length, assigneeCount: selectedCount }
      }));
    });

    modal.dataset.notificationAssigneeReady = 'true';
    render();
  }

  function init(root = document) {
    if (root.matches?.('[data-notification-assignee]')) initializeModal(root);
    root.querySelectorAll?.('[data-notification-assignee]').forEach(initializeModal);
  }

  window.AIOneNotificationAssignee = Object.freeze({ init });
  document.addEventListener('DOMContentLoaded', () => init());
  document.addEventListener('app:includes-ready', event => init(event.target));
})();
