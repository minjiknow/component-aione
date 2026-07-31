(() => {
  'use strict';

  const scriptUrl = document.currentScript?.src || new URL('component-include-loader.js', document.baseURI).href;
  const componentRoot = new URL('./', scriptUrl);
  const loadedAssets = new Map();
  const fileFallbackRegistryAsset = 'component-file-fallbacks.generated.js?v=20260731-3';
  const layerControllerAsset = '_shared/layer-controller.js?v=20260730-1';
  const modalControllerAsset = 'modal/modal.js?v=20260730-2';
  let fileFallbackRegistryReady = null;
  let generatedId = 0;

  const registry = {
    progressbar: {
      defaults: { value: '0' }
    },
    'document-statusbar': {
      defaults: {
        target: '',
        scrollTarget: '',
        pageSelector: '',
        fullscreenTarget: '',
        zoom: '100',
        minZoom: '50',
        maxZoom: '200',
        step: '10',
        characterCount: '0',
        page: '1',
        pageTotal: '1'
      },
      styles: [
        'button/button.css?v=20260731-3',
        'document-statusbar/document-statusbar.css?v=20260730-2'
      ],
      scripts: ['document-statusbar/document-statusbar.js?v=20260730-1']
    },
    toast: {},
    sidebar: {
      fragment: 'sidebar/sidebar.html?v=20260731-2',
      styles: [
        'button/button.css?v=20260731-3',
        'modal/modal.css?v=20260731-3',
        'sidebar/sidebar.css?v=20260731-4'
      ],
      scripts: [
        layerControllerAsset,
        modalControllerAsset,
        'sidebar/sidebar.js?v=20260731-2'
      ]
    },
    panel: {
      fragment: 'panel/panel.html?v=20260731-1',
      styles: ['panel/panel.css?v=20260731-3'],
      scripts: []
    },
	'three-panel': {
		fragment: 'panel/three-panel.html?v=20260729-2',
		styles: ['panel/panel.css?v=20260731-3', 'handler/handler.css?v=20260730-1'],
		scripts: ['handler/handler.js?v=20260730-2'],
      defaults: {
        leftSize: 'medium',
        rightSize: 'large'
      }
    },
    topbar: {
      defaults: {
        title: 'AI 워크스페이스',
        subtitle: 'AI 기반 업무 지원',
        primaryActionLabel: '새 질의분류',
        primaryActionPage: 'intake',
        primaryActionName: 'new-question',
        secondaryActionLabel: '실행 목록',
        secondaryActionPage: 'intake'
      },
      fragment: 'topbar/topbar.fragment?v=20260730-1',
      styles: ['button/button.css?v=20260731-3', 'topbar/topbar.css?v=20260731-4'],
      scripts: []
    },
    'file-upload': {
      fragment: 'file-upload/file-upload.html?v=20260729-5',
      styles: ['file-upload/file-upload.css?v=20260731-3'],
      scripts: []
    },
    'chat-message': {
      defaults: { variant: 'chatbot', role: 'ai', status: 'complete' },
      styles: ['button/button.css?v=20260731-3', 'chat-message/chat-message.css?v=20260731-3']
    },
    promptcomposer: {
      fragment: 'promptcomposer/promptcomposer.fragment.html?v=20260731-2',
      defaults: { placeholder: 'AI-ONE에게 물어보기' },
      styles: [
        'button/button.css?v=20260731-3',
        'dropdownmenu/dropdownmenu.css?v=20260731-3',
        'promptcomposer/promptcomposer.css?v=20260731-4'
      ],
      scripts: ['dropdownmenu/dropdownmenu.js', 'promptcomposer/promptcomposer.js']
    },
    datatable: {
      defaults: { maxWidth: '740px', maxHeight: '370px' },
      styles: ['dropdownmenu/dropdownmenu.css?v=20260731-3', 'datatable/datatable.css?v=20260730-6'],
      scripts: ['dropdownmenu/dropdownmenu.js', 'datatable/datatable.js']
    },
    dropdownmenu: {
      styles: ['button/button.css?v=20260731-3', 'dropdownmenu/dropdownmenu.css?v=20260731-3']
    },
    modal: {
      fragment: 'modal/modal.fragment?v=20260731-2',
      defaults: { size: 'medium', modalClass: '' },
      styles: [
        'button/button.css?v=20260731-3',
        '_shared/form-control.css?v=20260730-6',
        'input/input.css?v=20260731-3',
        'select/select.css?v=20260731-3',
        'textarea/textarea.css?v=20260731-3',
        'modal/modal.css?v=20260731-3'
      ],
      scripts: [
        layerControllerAsset,
        modalControllerAsset,
        'modal/account-modal.js?v=20260731-2',
        'modal/notification-assignee.js?v=20260730-1'
      ]
    },
    sidepop: {
      fragment: 'sidepop/sidepop.fragment?v=20260730-2',
      defaults: {
        size: 'small',
        variant: 'run-list',
        runListTitle: '실행 목록',
        modifierClass: '',
        bodyClass: '',
        footerClass: '',
        renameModal: '',
        deleteModal: ''
      },
      styles: [
        'button/button.css?v=20260731-3',
        'dropdownmenu/dropdownmenu.css?v=20260731-3',
        'radio/radio.css',
        'toggle/toggle.css',
        'sidepop/sidepop.css?v=20260731-3'
      ],
      scripts: [
        'dropdownmenu/dropdownmenu.js',
        layerControllerAsset,
        'sidepop/sidepop.js?v=20260731-1'
      ]
    }
  };

  function getDefinition(name) {
    const custom = registry[name] || {};
    return {
      fragment: custom.fragment || `${name}/${name}.fragment.html`,
      styles: custom.styles || [`${name}/${name}.css`],
      scripts: custom.scripts || [`${name}/${name}.js`],
      defaults: { ...(custom.defaults || {}) }
    };
  }

  function loadAsset(relativePath, type) {
    const url = new URL(relativePath, componentRoot).href;
    const canonicalUrl = url.split(/[?#]/, 1)[0];
    if (loadedAssets.has(url)) return loadedAssets.get(url);
    const existing = type === 'style'
      ? Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find(link => (
        link.href.split(/[?#]/, 1)[0] === canonicalUrl
      ))
      : Array.from(document.scripts).find(script => script.src.split(/[?#]/, 1)[0] === canonicalUrl);
    if (existing) {
      const isReady = existing.dataset.componentAssetReady === 'true'
        || (type === 'style' && Boolean(existing.sheet))
        || (type === 'script'
          && (document.readyState === 'complete'
            || (!existing.defer && !existing.async)));
      const ready = isReady
        ? Promise.resolve(existing)
        : new Promise((resolve, reject) => {
          const cleanup = () => {
            existing.removeEventListener('load', handleLoad);
            existing.removeEventListener('error', handleError);
            window.removeEventListener('load', handleLoad);
          };
          const handleLoad = () => {
            cleanup();
            existing.dataset.componentAssetReady = 'true';
            resolve(existing);
          };
          const handleError = () => {
            cleanup();
            reject(new Error(`컴포넌트 자산을 불러오지 못했습니다: ${relativePath}`));
          };
          existing.addEventListener('load', handleLoad, { once: true });
          existing.addEventListener('error', handleError, { once: true });
          window.addEventListener('load', handleLoad, { once: true });
        });
      loadedAssets.set(url, ready);
      return ready;
    }

    if (type === 'script') {
      const scriptPromise = new Promise((resolve, reject) => {
        const element = Object.assign(document.createElement('script'), {
          src: url
        });
        element.dataset.componentAsset = relativePath;
        element.addEventListener('load', () => {
          element.dataset.componentAssetReady = 'true';
          resolve(element);
        }, { once: true });
        element.addEventListener('error', () => {
          reject(new Error(`컴포넌트 자산을 불러오지 못했습니다: ${relativePath}`));
        }, { once: true });
        document.head.append(element);
      });
      loadedAssets.set(url, scriptPromise);
      return scriptPromise;
    }

    const promise = new Promise((resolve, reject) => {
      const element = Object.assign(document.createElement('link'), {
        rel: 'stylesheet',
        href: url
      });
      element.dataset.componentAsset = relativePath;
      element.addEventListener('load', () => {
        element.dataset.componentAssetReady = 'true';
        resolve(element);
      }, { once: true });
      element.addEventListener('error', () => reject(new Error(`컴포넌트 자산을 불러오지 못했습니다: ${relativePath}`)), { once: true });
      document.head.append(element);
    });

    loadedAssets.set(url, promise);
    return promise;
  }

  function getTemplateValues(host, name, defaults) {
    const values = { name, ...defaults };
    Object.entries(host.dataset).forEach(([key, value]) => {
      if (!key.startsWith('component') || key === 'componentInclude') return;
      const propName = key.slice('component'.length);
      values[propName.charAt(0).toLowerCase() + propName.slice(1)] = value;
    });
    if (name === 'sidepop') {
      if (!host.dataset.componentVariant && values.size === 'medium') {
        values.variant = 'content';
      }
      if (values.variant === 'rule-settings') {
        values.modifierClass = ' sidepop-rule-settings';
        values.bodyClass = ' rule-drawer-body';
        values.footerClass = ' rule-drawer-footer';
      }
    }
    if (name === 'three-panel') {
      const panelSizes = ['small', 'medium', 'large'];
      if (!panelSizes.includes(values.leftSize)) values.leftSize = defaults.leftSize;
      if (!panelSizes.includes(values.rightSize)) values.rightSize = defaults.rightSize;
    }
    if (name === 'modal') {
      if (!values.variant) {
        values.variant = values.size === 'small' ? 'action-menu' : 'content';
      }
      if (!values.label) {
        const modalLabels = {
          'action-menu': '대화 작업 메뉴',
          alert: '안내 팝업',
          'account-profile': '내 정보',
          'account-settings': '환경설정',
          cancel: '취소 확인 팝업',
          confirm: '결정 확인 팝업',
          content: '확인 팝업',
          form: '입력 폼 팝업',
          logout: '로그아웃 확인 팝업',
          'notification-assignee': '실국별 알림 담당자 설정',
          rename: '이름 변경 팝업'
        };
        values.label = modalLabels[values.variant] || '확인 팝업';
      }
      if (values.variant === 'notification-assignee') {
        values.size = 'large';
        values.modalClass = ' notification-assignee-modal notification-dept-modal';
      } else if (values.variant === 'account-profile') {
        values.size = 'medium';
        values.modalClass = ' account-profile-modal';
      } else if (values.variant === 'account-settings') {
        values.size = 'medium';
        values.modalClass = ' account-settings-modal';
      } else {
        values.modalClass = '';
      }
      values.backdropClass = values.variant === 'action-menu' ? ' modal-menu-backdrop' : '';
    }
    if (!values.id) {
      generatedId += 1;
      values.id = `${name}-${generatedId}`;
    }
    return values;
  }

  function escapeTemplateValue(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('"', '&quot;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }

  function renderTemplate(source, values) {
    return source.replace(/\{\{([a-zA-Z][\w-]*)\}\}/g, (_, key) => (
      Object.hasOwn(values, key) ? escapeTemplateValue(values[key]) : ''
    ));
  }

  function sanitizeFragmentSource(source) {
    return String(source)
      .replace(/<!--\s*Code injected by live-server\s*-->\s*/gi, '')
      .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');
  }

  function collectSlots(host) {
    return new Map(Array.from(host.querySelectorAll(':scope > template[data-slot]')).map(template => [
      template.dataset.slot,
      template.content.cloneNode(true)
    ]));
  }

  function applySlots(fragment, slots) {
    fragment.querySelectorAll('[data-slot]').forEach(slot => {
      const content = slots.get(slot.dataset.slot);
      if (content) slot.replaceChildren(content);
    });
  }

  function rebaseFragmentUrls(fragment, fragmentUrl) {
    ['href', 'src'].forEach(attribute => {
      fragment.querySelectorAll(`[${attribute}]`).forEach(element => {
        const value = element.getAttribute(attribute)?.trim();
        if (!value
          || value.startsWith('#')
          || value.startsWith('/')
          || /^[a-z][a-z\d+.-]*:/i.test(value)) return;
        element.setAttribute(attribute, new URL(value, fragmentUrl).href);
      });
    });
  }

  function ensureFileFallbackRegistry() {
    if (window.location.protocol !== 'file:') return Promise.resolve();
    if (window.AIOneComponentFileFallbacks) return Promise.resolve();
    if (!fileFallbackRegistryReady) {
      fileFallbackRegistryReady = loadAsset(fileFallbackRegistryAsset, 'script');
    }
    return fileFallbackRegistryReady;
  }

  function getFileFallback(name, fragmentPath) {
    if (window.location.protocol !== 'file:') return '';
    const canonicalPath = String(fragmentPath || '')
      .split(/[?#]/, 1)[0]
      .replace(/^\.\//, '');
    const registrySource = window.AIOneComponentFileFallbacks?.[canonicalPath];
    if (registrySource) return registrySource;

    const template = document.querySelector(`template[data-component-file-fallback="${name}"]`);
    return template?.innerHTML.trim() || '';
  }

  async function mount(host) {
    if (!(host instanceof HTMLElement)
      || ['loading', 'ready'].includes(host.dataset.componentState)) return;
    const name = host.dataset.componentInclude;
    if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) return;

    host.dataset.componentState = 'loading';
    const definition = getDefinition(name);
    const slots = collectSlots(host);
    const values = getTemplateValues(host, name, definition.defaults);

    try {
      const fragmentUrl = new URL(definition.fragment, componentRoot);
      const stylesReady = Promise.all(definition.styles.map(path => loadAsset(path, 'style')));
      await ensureFileFallbackRegistry();
      let fragmentSource = getFileFallback(name, definition.fragment);
      if (!fragmentSource) {
        const fragmentResponse = await fetch(fragmentUrl);
        if (!fragmentResponse.ok) {
          throw new Error(`컴포넌트 마크업을 불러오지 못했습니다: ${definition.fragment}`);
        }
        fragmentSource = await fragmentResponse.text();
      }
      await stylesReady;

      const template = document.createElement('template');
      template.innerHTML = renderTemplate(sanitizeFragmentSource(fragmentSource), values);
      rebaseFragmentUrls(template.content, fragmentUrl);
      applySlots(template.content, slots);
      host.replaceChildren(template.content);

      for (const path of definition.scripts) {
        await loadAsset(path, 'script');
      }

      host.dataset.componentState = 'ready';
      await mountAll(host);
      host.dispatchEvent(new CustomEvent('app:includes-ready', { bubbles: true }));
      host.dispatchEvent(new CustomEvent('component:ready', {
        bubbles: true,
        detail: { name, id: values.id }
      }));
    } catch (error) {
      host.dataset.componentState = 'error';
      host.replaceChildren(Object.assign(document.createElement('p'), {
        className: 'include-error',
        textContent: error.message
      }));
      host.dispatchEvent(new CustomEvent('component:error', {
        bubbles: true,
        detail: { name, error }
      }));
    }
  }

  async function mountAll(root = document) {
    const hosts = [];
    if (root instanceof HTMLElement
      && root.matches('[data-component-include]:not([data-component-state])')) hosts.push(root);
    root.querySelectorAll?.('[data-component-include]:not([data-component-state])').forEach(host => hosts.push(host));
    await Promise.all(hosts.map(mount));
  }

  function register(name, definition) {
    if (!/^[a-z][a-z0-9-]*$/.test(name)) throw new TypeError('컴포넌트 이름 형식이 올바르지 않습니다.');
    const current = registry[name] || {};
    registry[name] = {
      ...current,
      ...definition,
      defaults: {
        ...(current.defaults || {}),
        ...(definition.defaults || {})
      }
    };
  }

  window.AIOneComponents = Object.freeze({ mount, mountAll, register });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => mountAll());
  } else {
    mountAll();
  }
})();
