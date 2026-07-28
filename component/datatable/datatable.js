(() => {
  'use strict';

  function init(root = document) {
    const tables = [];
    if (root instanceof Element && root.matches('[data-datatable]')) tables.push(root);
    root.querySelectorAll?.('[data-datatable]').forEach(table => tables.push(table));

    tables.forEach(table => {
      if (table.dataset.dataTableReady === 'true') return;
      const tbody = table.tBodies[0];
      if (!tbody) return;

      const rowCheckboxes = () => Array.from(table.querySelectorAll('[data-table-select-row]'));
      const selectAll = table.querySelector('[data-table-select-all]');
      const emitSelection = () => {
        const checkboxes = rowCheckboxes().filter(input => !input.disabled);
        const selected = checkboxes.filter(input => input.checked);
        checkboxes.forEach(input => {
          const row = input.closest('tr');
          row?.classList.toggle('is-selected', input.checked);
          row?.setAttribute('aria-selected', String(input.checked));
        });
        if (selectAll) {
          selectAll.checked = checkboxes.length > 0 && selected.length === checkboxes.length;
          selectAll.indeterminate = selected.length > 0 && selected.length < checkboxes.length;
        }
        table.dispatchEvent(new CustomEvent('datatable:selection-change', {
          bubbles: true,
          detail: {
            selectedValues: selected.map(input => input.value)
          }
        }));
      };

      selectAll?.addEventListener('change', () => {
        rowCheckboxes().forEach(input => {
          if (!input.disabled) input.checked = selectAll.checked;
        });
        emitSelection();
      });
      rowCheckboxes().forEach(input => input.addEventListener('change', emitSelection));

      table.querySelectorAll('[data-table-sort]').forEach(button => {
        button.addEventListener('click', () => {
          const header = button.closest('th');
          if (!header) return;
          const columnIndex = header.cellIndex;
          const nextDirection = header.getAttribute('aria-sort') === 'ascending'
            ? 'descending'
            : 'ascending';
          const sortType = button.dataset.sortType || 'text';
          const rows = Array.from(tbody.rows).filter(row => !row.querySelector('.data-table-empty'));

          const getValue = row => {
            const cell = row.cells[columnIndex];
            const rawValue = cell?.dataset.sortValue || cell?.textContent.trim() || '';
            if (sortType === 'number') {
              const numberValue = Number(rawValue.replace(/[^\d.-]/g, ''));
              return Number.isFinite(numberValue) ? numberValue : 0;
            }
            if (sortType === 'date') {
              const dateValue = Date.parse(rawValue);
              return Number.isNaN(dateValue) ? 0 : dateValue;
            }
            return rawValue;
          };

          rows.sort((rowA, rowB) => {
            const valueA = getValue(rowA);
            const valueB = getValue(rowB);
            const comparison = typeof valueA === 'number'
              ? valueA - valueB
              : String(valueA).localeCompare(String(valueB), 'ko', { numeric: true });
            return nextDirection === 'ascending' ? comparison : -comparison;
          });

          table.querySelectorAll('th[aria-sort]').forEach(item => item.setAttribute('aria-sort', 'none'));
          header.setAttribute('aria-sort', nextDirection);
          rows.forEach(row => tbody.appendChild(row));
          table.dispatchEvent(new CustomEvent('datatable:sort', {
            bubbles: true,
            detail: {
              column: button.dataset.tableSort,
              direction: nextDirection
            }
          }));
        });
      });

      table.dataset.dataTableReady = 'true';
      emitSelection();
    });
  }

  window.AIOneDataTable = Object.freeze({ init });
  document.addEventListener('DOMContentLoaded', () => init());
  document.addEventListener('app:includes-ready', event => init(event.target));
})();
