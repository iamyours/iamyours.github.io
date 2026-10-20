(function () {
  'use strict';

  var currentScript =
    document.currentScript ||
    document.querySelector('script[src*="prompt-panel.js"][data-id]') ||
    document.querySelector('script[data-id]');

  var sceneId =
    currentScript && currentScript.dataset && currentScript.dataset.id
      ? String(currentScript.dataset.id).trim()
      : '';

  var promptUrl = sceneId ? '../prompts/' + sceneId + '.txt' : '';
  var cachedPrompt = null;
  var fetchPromise = null;

  function fetchPromptText() {
    if (cachedPrompt !== null) {
      return Promise.resolve(cachedPrompt);
    }
    if (fetchPromise) {
      return fetchPromise;
    }
    if (!promptUrl) {
      cachedPrompt = '未配置提示词 ID（data-id）。';
      return Promise.resolve(cachedPrompt);
    }
    fetchPromise = fetch(promptUrl)
      .then(function (res) {
        if (!res.ok) {
          throw new Error('HTTP ' + res.status);
        }
        return res.text();
      })
      .then(function (txt) {
        cachedPrompt = txt;
        fetchPromise = null;
        return cachedPrompt;
      })
      .catch(function () {
        fetchPromise = null;
        return '';
      });
    return fetchPromise;
  }

  async function copyText(text) {
    if (!text) return false;
    if (
      typeof navigator !== 'undefined' &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function'
    ) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {
        // Fallback to hidden textarea + document.execCommand('copy')
      }
    }
    try {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', 'readonly');
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      textarea.style.left = '-9999px';
      textarea.style.width = '1px';
      textarea.style.height = '1px';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      var ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return !!ok;
    } catch (e) {
      return false;
    }
  }

  function injectStyles() {
    if (document.getElementById('pp-injected-styles')) return;
    var style = document.createElement('style');
    style.id = 'pp-injected-styles';
    style.textContent = [
      '.pp-root {',
      '  position: fixed;',
      '  right: 16px;',
      '  bottom: 16px;',
      '  z-index: 2147483000;',
      '  font-family: "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif;',
      '  color: #3a2e24;',
      '  box-sizing: border-box;',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: flex-end;',
      '  gap: 10px;',
      '  pointer-events: none;',
      '}',
      '.pp-root *, .pp-root *::before, .pp-root *::after {',
      '  box-sizing: border-box;',
      '}',
      '.pp-btn {',
      '  pointer-events: auto;',
      '  appearance: none;',
      '  -webkit-appearance: none;',
      '  display: inline-flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  gap: 6px;',
      '  font-family: "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif;',
      '  font-size: 14px;',
      '  font-weight: 700;',
      '  line-height: 1.2;',
      '  color: #3a2e24;',
      '  background-color: #f3d77a;',
      '  border: 2px solid #3a2e24;',
      '  border-radius: 14px;',
      '  box-shadow: 0 3px 0 #3a2e24;',
      '  padding: 8px 14px;',
      '  cursor: pointer;',
      '  user-select: none;',
      '  -webkit-user-select: none;',
      '  text-decoration: none;',
      '  transition: transform 0.08s ease, box-shadow 0.08s ease, background-color 0.15s ease;',
      '}',
      '.pp-btn:hover {',
      '  background-color: #f7e08e;',
      '}',
      '.pp-btn:active {',
      '  transform: translateY(3px);',
      '  box-shadow: 0 0 0 #3a2e24;',
      '}',
      '.pp-btn-secondary {',
      '  background-color: #fbf4e2;',
      '}',
      '.pp-btn-secondary:hover {',
      '  background-color: #f3e8cc;',
      '}',
      '.pp-toggle-btn {',
      '  padding: 9px 16px;',
      '  font-size: 14px;',
      '}',
      '.pp-panel {',
      '  pointer-events: auto;',
      '  width: min(560px, 92vw);',
      '  background-color: #fffaf0;',
      '  border: 2px solid #3a2e24;',
      '  border-radius: 16px;',
      '  box-shadow: 0 6px 0 #3a2e24, 0 12px 28px rgba(58, 46, 36, 0.25);',
      '  overflow: hidden;',
      '  display: none;',
      '  flex-direction: column;',
      '}',
      '.pp-panel.pp-open {',
      '  display: flex;',
      '}',
      '.pp-header {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  gap: 8px;',
      '  padding: 10px 14px;',
      '  background: linear-gradient(#a6cc7a, #8cbc63);',
      '  border-bottom: 2px solid #3a2e24;',
      '  flex-wrap: wrap;',
      '}',
      '.pp-title {',
      '  margin: 0;',
      '  font-size: 15px;',
      '  font-weight: 800;',
      '  color: #3a2e24;',
      '}',
      '.pp-actions {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 8px;',
      '}',
      '.pp-actions .pp-btn {',
      '  padding: 5px 12px;',
      '  font-size: 13px;',
      '}',
      '.pp-body {',
      '  padding: 12px 14px;',
      '  background-color: #fbf4e2;',
      '}',
      '.pp-pre {',
      '  margin: 0;',
      '  width: 100%;',
      '  max-height: 60vh;',
      '  overflow-y: auto;',
      '  overflow-x: hidden;',
      '  white-space: pre-wrap;',
      '  word-break: break-word;',
      '  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;',
      '  font-size: 13px;',
      '  line-height: 1.6;',
      '  color: #3a2e24;',
      '  background-color: #fffaf0;',
      '  border: 2px solid #3a2e24;',
      '  border-radius: 12px;',
      '  padding: 12px;',
      '  user-select: text;',
      '  -webkit-user-select: text;',
      '}',
      '@media (max-width: 480px) {',
      '  .pp-root {',
      '    right: 12px;',
      '    bottom: 12px;',
      '  }',
      '  .pp-header {',
      '    padding: 8px 12px;',
      '  }',
      '  .pp-body {',
      '    padding: 10px 12px;',
      '  }',
      '}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(style);
  }

  function stopCanvasPropagation(el) {
    var events = [
      'pointerdown',
      'pointermove',
      'pointerup',
      'pointercancel',
      'mousedown',
      'mousemove',
      'mouseup',
      'touchstart',
      'touchmove',
      'touchend',
      'touchcancel',
      'wheel',
      'click',
      'dblclick',
      'contextmenu'
    ];
    for (var i = 0; i < events.length; i++) {
      el.addEventListener(
        events[i],
        function (e) {
          e.stopPropagation();
        },
        false
      );
    }
  }

  function mountPanel() {
    if (!document.body || document.querySelector('.pp-root')) return;
    injectStyles();

    var root = document.createElement('div');
    root.className = 'pp-root';

    var panel = document.createElement('section');
    panel.className = 'pp-panel';
    panel.setAttribute('aria-label', '生成这个场景的提示词');

    var header = document.createElement('div');
    header.className = 'pp-header';

    var title = document.createElement('h2');
    title.className = 'pp-title';
    title.textContent = '生成这个场景的提示词';

    var actions = document.createElement('div');
    actions.className = 'pp-actions';

    var copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'pp-btn pp-copy-btn';
    copyBtn.textContent = '复制';

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'pp-btn pp-btn-secondary pp-close-btn';
    closeBtn.textContent = '关闭';

    actions.appendChild(copyBtn);
    actions.appendChild(closeBtn);
    header.appendChild(title);
    header.appendChild(actions);

    var body = document.createElement('div');
    body.className = 'pp-body';

    var pre = document.createElement('pre');
    pre.className = 'pp-pre';
    pre.textContent = '正在加载提示词…';

    body.appendChild(pre);
    panel.appendChild(header);
    panel.appendChild(body);

    var toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'pp-btn pp-toggle-btn';
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.textContent = '📜 提示词';

    root.appendChild(panel);
    root.appendChild(toggleBtn);
    document.body.appendChild(root);

    stopCanvasPropagation(panel);
    stopCanvasPropagation(toggleBtn);

    var isOpen = false;
    function ensureLoaded() {
      return fetchPromptText().then(function (txt) {
        if (txt) {
          pre.textContent = txt;
        } else {
          pre.textContent = '未能加载提示词文本。';
        }
        return txt;
      });
    }

    function setOpen(nextOpen) {
      isOpen = !!nextOpen;
      if (isOpen) {
        panel.classList.add('pp-open');
        toggleBtn.setAttribute('aria-expanded', 'true');
        ensureLoaded();
      } else {
        panel.classList.remove('pp-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    }

    toggleBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(!isOpen);
    });

    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(false);
    });

    var copyTimer = null;
    copyBtn.addEventListener('click', async function (e) {
      e.stopPropagation();
      var txt = cachedPrompt !== null ? cachedPrompt : await ensureLoaded();
      var ok = await copyText(txt);
      if (copyTimer) {
        clearTimeout(copyTimer);
      }
      copyBtn.textContent = ok ? '已复制' : '复制失败';
      copyTimer = setTimeout(function () {
        copyBtn.textContent = '复制';
        copyTimer = null;
      }, 1500);
    });

    // Preload prompt quietly in the background
    ensureLoaded();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountPanel);
  } else {
    mountPanel();
  }
})();
