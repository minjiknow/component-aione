(() => {
  'use strict';

  const bindings = new WeakMap();
  const retryTimers = new WeakMap();
  const copyTimers = new WeakMap();
  const aiAvatarSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>';

  function createPending({
    variant = 'answer',
    title = '생성 중',
    description = '답변서 초안을 생성하고 있습니다...'
  } = {}) {
    const message = document.createElement('div');
    message.className = 'chat-msg ai is-pending';
    message.dataset.component = 'chat-message';
    message.dataset.variant = variant;
    message.dataset.role = 'ai';
    message.dataset.status = 'pending';
    message.setAttribute('aria-busy', 'true');

    if (variant === 'answer') {
      message.classList.add('chat-typing');
      message.innerHTML = `<div class="typing-avatar">${aiAvatarSvg}</div>
        <div class="typing-content" role="status">
          <div class="typing-text-wrap">
            <span class="typing-title"></span>
            <span class="typing-desc"></span>
          </div>
          <div class="typing-dots" aria-hidden="true"><span></span><span></span><span></span></div>
        </div>`;
      message.querySelector('.typing-title').textContent = title;
      message.querySelector('.typing-desc').textContent = description;
      return message;
    }

    message.innerHTML = `<div class="msg-avatar">${aiAvatarSvg}</div>
      <div class="msg-content" role="status"><span class="chat-typing-ellipsis" aria-hidden="true">...</span></div>`;
    message.setAttribute('aria-label', title);
    return message;
  }

  function getMessage(button) {
    return button.closest('[data-component="chat-message"], .chat-msg');
  }

  function emitAction(message, action, detail = {}) {
    if (!message) return;
    message.dispatchEvent(new CustomEvent('chat-message:action', {
      bubbles: true,
      detail: { action, ...detail }
    }));
  }

  function setFeedback(button, message, options) {
    const action = button.dataset.action;
    const shouldActivate = button.getAttribute('aria-pressed') !== 'true';
    const actions = button.closest('.msg-actions');

    actions?.querySelectorAll('[data-action="like"], [data-action="dislike"]').forEach(feedbackButton => {
      feedbackButton.classList.remove('active');
      feedbackButton.setAttribute('aria-pressed', 'false');
    });

    if (shouldActivate) {
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');
    }

    emitAction(message, action, {
      selected: shouldActivate,
      value: shouldActivate ? action : null
    });
    options.onFeedback?.({
      action,
      button,
      message,
      selected: shouldActivate,
      value: shouldActivate ? action : null
    });
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.append(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    if (!copied) throw new Error('Clipboard copy failed');
  }

  async function writeClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    fallbackCopy(text);
  }

  function showCopyFeedback(button) {
    const originalLabel = button.getAttribute('aria-label') || '복사';
    const originalTitle = button.title || '복사';
    const activeTimer = copyTimers.get(button);
    if (activeTimer) window.clearTimeout(activeTimer);

    button.classList.add('active');
    button.setAttribute('aria-label', '복사됨');
    button.title = '복사됨';

    copyTimers.set(button, window.setTimeout(() => {
      button.classList.remove('active');
      button.setAttribute('aria-label', originalLabel);
      button.title = originalTitle;
      copyTimers.delete(button);
    }, 1200));
  }

  async function copyMessage(button, message, options) {
    const text = options.getText?.({ button, message })
      ?? message?.querySelector('.msg-content, .msg-text')?.innerText
      ?? '';

    try {
      await writeClipboard(text.trim());
      showCopyFeedback(button);
      emitAction(message, 'copy', { copied: true, text });
      options.onCopy?.({ button, message, copied: true, text });
    } catch {
      emitAction(message, 'copy', { copied: false, text });
      options.onCopy?.({ button, message, copied: false, text });
    }
  }

  function simulateRetry(message) {
    if (!message || message.classList.contains('is-pending')) return;

    const content = message.querySelector('.msg-content, .msg-text');
    const actions = message.querySelector('.msg-actions');
    if (!content || !actions) return;

    const activeTimer = retryTimers.get(message);
    if (activeTimer) window.clearTimeout(activeTimer);

    const originalContent = content.innerHTML;
    message.classList.add('is-pending');
    message.dataset.status = 'pending';
    message.setAttribute('aria-busy', 'true');
    const variant = message.dataset.variant
      || message.closest('[data-chat-message-list]')?.dataset.variant;
    content.innerHTML = variant === 'answer'
      ? '<span class="typing-cursor" role="status" aria-label="답변 생성 중"></span>'
      : '<span class="chat-typing-ellipsis" role="status" aria-label="답변 생성 중">...</span>';
    actions.hidden = true;

    retryTimers.set(message, window.setTimeout(() => {
      content.innerHTML = originalContent;
      actions.hidden = false;
      message.classList.remove('is-pending');
      message.dataset.status = 'complete';
      message.removeAttribute('aria-busy');
      retryTimers.delete(message);
      emitAction(message, 'retry-complete');
    }, 800));
  }

  function bind(root, options) {
    if (!root) return;

    const currentBinding = bindings.get(root);
    if (currentBinding) {
      if (options) currentBinding.options = options;
      return;
    }

    const binding = { options: options || {} };
    root.addEventListener('click', event => {
      const target = event.target instanceof Element ? event.target : null;
      const button = target?.closest('.msg-action-btn[data-action]');
      if (!button || !root.contains(button)) return;

      const action = button.dataset.action;
      if (!['like', 'dislike', 'retry', 'copy'].includes(action)) return;

      event.stopPropagation();
      const message = getMessage(button);

      if (action === 'like' || action === 'dislike') {
        setFeedback(button, message, binding.options);
        return;
      }
      if (action === 'copy') {
        copyMessage(button, message, binding.options);
        return;
      }

      emitAction(message, 'retry');
      if (typeof binding.options.onRetry === 'function') {
        binding.options.onRetry({ button, message });
      } else {
        simulateRetry(message);
      }
    });

    bindings.set(root, binding);
  }

  function autoBind(root = document) {
    const lists = [];
    if (root instanceof Element && root.matches('[data-chat-message-list]')) lists.push(root);
    root.querySelectorAll?.('[data-chat-message-list]').forEach(messageList => lists.push(messageList));
    lists.forEach(messageList => bind(messageList));
  }

  window.ChatMessage = Object.freeze({ bind, autoBind, createPending });
  document.addEventListener('DOMContentLoaded', () => autoBind());
  document.addEventListener('app:includes-ready', event => autoBind(event.target));
})();
