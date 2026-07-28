(() => {
  'use strict';

  const scriptUrl = document.currentScript?.src || new URL('component-loader.js', document.baseURI).href;
  const componentRoot = new URL('./', scriptUrl);
  const loadedAssets = new Map();
  let generatedId = 0;

  const registry = {
    progressbar: {
      defaults: { value: '0' }
    },
    toast: {},
    'chat-message': {
      defaults: { variant: 'chatbot', role: 'ai', status: 'complete' },
      styles: ['button/button.css', 'chat-message/chat-message.css']
    },
    promptcomposer: {
      styles: [
        'button/button.css',
        'dropdownmenu/dropdownmenu.css',
        'promptcomposer/promptcomposer.css'
      ],
      scripts: ['dropdownmenu/dropdownmenu.js', 'promptcomposer/promptcomposer.js']
    },
    datatable: {
      defaults: { maxWidth: '740px', maxHeight: '370px' },
      styles: ['dropdownmenu/dropdownmenu.css', 'datatable/datatable.css'],
      scripts: ['dropdownmenu/dropdownmenu.js', 'datatable/datatable.js']
    },
    dropdownmenu: {
      styles: ['button/button.css', 'dropdownmenu/dropdownmenu.css']
    },
    modal: {
      defaults: { size: 'medium' },
      styles: ['button/button.css', 'form-field/form-field.css', 'modal/modal.css'],
      scripts: ['_shared/layer-controller.js', 'modal/modal.js']
    },
    sidepop: {
      defaults: { size: 'small', variant: 'run-list' },
      styles: [
        'button/button.css',
        'radio/radio.css',
        'toggle/toggle.css',
        'form-field/form-field.css',
        'sidepop/sidepop.css'
      ],
      scripts: ['_shared/layer-controller.js', 'sidepop/sidepop.js']
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
    if (loadedAssets.has(url)) return loadedAssets.get(url);
    const existing = type === 'style'
      ? Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find(link => link.href === url)
      : Array.from(document.scripts).find(script => script.src === url);
    if (existing) {
      const ready = Promise.resolve(existing);
      loadedAssets.set(url, ready);
      return ready;
    }

    if (type === 'script') {
      const scriptPromise = import(url).catch(() => {
        throw new Error(`컴포넌트 자산을 불러오지 못했습니다: ${relativePath}`);
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
      element.addEventListener('load', resolve, { once: true });
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
    if (name === 'sidepop'
      && !host.dataset.componentVariant
      && values.size === 'medium') {
      values.variant = 'content';
    }
    if (name === 'modal') {
      if (!values.variant) {
        values.variant = values.size === 'small' ? 'action-menu' : 'content';
      }
      if (!values.label) {
        values.label = values.variant === 'action-menu' ? '대화 작업 메뉴' : '확인 팝업';
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
      const [fragmentResponse] = await Promise.all([
        fetch(new URL(definition.fragment, componentRoot)),
        ...definition.styles.map(path => loadAsset(path, 'style'))
      ]);
      if (!fragmentResponse.ok) throw new Error(`컴포넌트 마크업을 불러오지 못했습니다: ${definition.fragment}`);

      const template = document.createElement('template');
      template.innerHTML = renderTemplate(await fragmentResponse.text(), values);
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
    registry[name] = { ...definition };
  }

  window.AIOneComponents = Object.freeze({ mount, mountAll, register });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => mountAll());
  } else {
    mountAll();
  }
})();
