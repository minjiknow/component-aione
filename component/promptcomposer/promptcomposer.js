(() => {
  'use strict';

  function init(root = document) {
    const composers = [];
    if (root instanceof Element && root.matches('[data-prompt-composer]')) composers.push(root);
    root.querySelectorAll?.('[data-prompt-composer]').forEach(composer => composers.push(composer));

    composers.forEach(composer => {
      if (composer.dataset.promptComposerReady === 'true') return;

      const input = composer.querySelector('[data-prompt-input]');
      const submitButton = composer.querySelector('[data-prompt-submit]');
      const attachButton = composer.querySelector('[data-prompt-attach]');
      const fileInput = composer.querySelector('[data-prompt-file-input]');
      const fileList = composer.querySelector('[data-prompt-files]');
      const currentCount = composer.querySelector('[data-prompt-current]');
      const form = composer.matches('form') ? composer : composer.querySelector('form');
      if (!input || !submitButton || !form) return;

      let selectedFiles = [];
      const maxLength = Number(input.getAttribute('maxlength')) || 0;
      const isMultiline = input.tagName === 'TEXTAREA';

      const syncInput = () => {
        if (isMultiline) {
          input.style.height = 'auto';
          input.style.height = `${Math.min(input.scrollHeight, 180)}px`;
        }
        submitButton.disabled = input.value.trim().length === 0;

        if (currentCount) {
          currentCount.textContent = String(input.value.length);
          currentCount.closest('.prompt-composer-counter')?.classList.toggle(
            'is-limit',
            maxLength > 0 && input.value.length >= maxLength
          );
        }
      };

      const renderFiles = () => {
        if (!fileList) return;
        fileList.replaceChildren();
        selectedFiles.forEach((file, index) => {
          const item = document.createElement('span');
          item.className = 'prompt-composer-file';

          const name = document.createElement('span');
          name.className = 'prompt-composer-file-name';
          name.textContent = file.name;

          const removeButton = document.createElement('button');
          removeButton.type = 'button';
          removeButton.className = 'icon-button icon-button-ghost icon-button-sm';
          removeButton.dataset.promptFileRemove = String(index);
          removeButton.setAttribute('aria-label', `${file.name} 삭제`);
          removeButton.textContent = '×';

          item.append(name, removeButton);
          fileList.append(item);
        });
      };

      input.addEventListener('input', syncInput);
      input.addEventListener('keydown', event => {
        if (event.key !== 'Enter' || event.isComposing) return;
        if (isMultiline && event.shiftKey) return;
        event.preventDefault();
        if (!submitButton.disabled) form.requestSubmit(submitButton);
      });

      attachButton?.addEventListener('click', () => fileInput?.click());
      fileInput?.addEventListener('change', () => {
        selectedFiles = Array.from(fileInput.files || []);
        renderFiles();
        composer.dispatchEvent(new CustomEvent('promptcomposer:files-change', {
          bubbles: true,
          detail: { files: selectedFiles.slice() }
        }));
      });
      fileList?.addEventListener('click', event => {
        const removeButton = event.target.closest('[data-prompt-file-remove]');
        if (!removeButton) return;
        selectedFiles.splice(Number(removeButton.dataset.promptFileRemove), 1);
        if (fileInput) fileInput.value = '';
        renderFiles();
        composer.dispatchEvent(new CustomEvent('promptcomposer:files-change', {
          bubbles: true,
          detail: { files: selectedFiles.slice() }
        }));
      });
      form.addEventListener('submit', event => {
        event.preventDefault();
        const value = input.value.trim();
        if (!value) return;
        composer.dispatchEvent(new CustomEvent('promptcomposer:submit', {
          bubbles: true,
          detail: {
            value,
            files: selectedFiles.slice()
          }
        }));
      });

      composer.dataset.promptComposerReady = 'true';
      syncInput();
    });
  }

  window.AIOnePromptComposer = Object.freeze({ init });
  document.addEventListener('DOMContentLoaded', () => init());
  document.addEventListener('app:includes-ready', event => init(event.target));
})();
