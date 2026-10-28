/* Shared site footer.
 *
 * Drop this script on a page that has no static footer and it appends a
 * translated footer at the end of <body>. Pages that already contain a
 * <footer class="site-footer"> (the crawler-friendly static version used on
 * the content pages) are left untouched, so the footer is never duplicated.
 *
 * Translations are registered by /site/i18n/{zh,en}.js on the content pages
 * and by /3d/i18n/{zh,en}.js on the 3D pages. The footer keys live in both
 * dictionaries, and I18N.apply() handles language switching.
 */
(function () {
  'use strict';

  var FALLBACK = {
    'footer.nav': '页脚导航',
    'footer.about': '关于',
    'footer.contact': '联系',
    'footer.privacy': '隐私政策',
    'footer.terms': '使用条款',
    'footer.github': 'GitHub',
    'footer.copyright': '© 2026 iamyours'
  };

  var LINKS = [
    { href: '/about/', key: 'footer.about', text: '关于' },
    { href: '/contact/', key: 'footer.contact', text: '联系' },
    { href: '/privacy/', key: 'footer.privacy', text: '隐私政策' },
    { href: '/terms/', key: 'footer.terms', text: '使用条款' },
    {
      href: 'https://github.com/iamyours',
      key: 'footer.github',
      text: 'GitHub',
      external: true
    }
  ];

  function tr(key) {
    try {
      if (window.I18N && typeof window.I18N.t === 'function' && window.I18N.has(key)) {
        return window.I18N.t(key);
      }
    } catch (e) {}
    return FALLBACK[key] || key;
  }

  function ensureStyles() {
    if (document.querySelector('link[data-site-footer-css]')) return;
    var head = document.head || document.documentElement;
    if (!head) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/site/footer.css';
    link.setAttribute('data-site-footer-css', '');
    head.appendChild(link);
  }

  function build(options) {
    var opts = options || {};
    var footer = document.createElement('footer');
    footer.className = 'site-footer' + (opts.compact ? ' site-footer--compact' : '');
    footer.setAttribute('data-site-footer', '');

    var nav = document.createElement('nav');
    nav.className = 'site-footer-links';
    nav.setAttribute('aria-label', tr('footer.nav'));
    nav.setAttribute('data-i18n-attr', 'aria-label:footer.nav');

    for (var i = 0; i < LINKS.length; i++) {
      var item = LINKS[i];
      var a = document.createElement('a');
      a.href = item.href;
      a.setAttribute('data-i18n', item.key);
      a.textContent = tr(item.key) || item.text;
      if (item.external) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      nav.appendChild(a);
    }

    var copy = document.createElement('span');
    copy.className = 'site-footer-copy';
    copy.setAttribute('data-i18n', 'footer.copyright');
    copy.textContent = tr('footer.copyright');

    footer.appendChild(nav);
    footer.appendChild(copy);
    return footer;
  }

  function mount(target, options) {
    var host = target || document.body;
    if (!host) return null;
    if (document.querySelector('.site-footer')) return document.querySelector('.site-footer');

    ensureStyles();
    var footer = build(options);
    host.appendChild(footer);

    try {
      if (window.I18N && typeof window.I18N.apply === 'function') {
        window.I18N.apply(footer);
      }
    } catch (e) {}

    return footer;
  }

  window.SiteFooter = {
    build: build,
    mount: mount
  };

  function autoMount() {
    if (!document.querySelector('.site-footer')) {
      mount(document.body);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoMount);
  } else {
    autoMount();
  }
})();
