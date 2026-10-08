// Shared DOM/formatting helpers used across all screens.
const Util = {
  el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === 'class') node.className = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else if (v !== null && v !== undefined) node.setAttribute(k, v);
    }
    for (const child of [].concat(children)) {
      if (child === null || child === undefined) continue;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    }
    return node;
  },

  todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },

  toUSDate(iso) {
    if (!iso) return '';
    const [y, m, d] = String(iso).split('-');
    if (!y || !m || !d) return iso;
    return `${m}/${d}/${y}`;
  },

  yearOptions() {
    const y = new Date().getFullYear();
    return [y - 2, y - 1, y, y + 1];
  },

  fmt(num, decimals = 2) {
    if (num === null || num === undefined || Number.isNaN(num)) return '';
    return Number(num).toFixed(decimals);
  },

  parseNum(v) {
    const n = parseFloat(v);
    return Number.isNaN(n) ? null : n;
  },

  toast(msg, ms = 3200) {
    let host = document.getElementById('toast-host');
    if (!host) {
      host = Util.el('div', { id: 'toast-host' });
      document.body.appendChild(host);
    }
    const t = Util.el('div', { class: 'toast' }, msg);
    host.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 250);
    }, ms);
  },

  confirmDialog(message) {
    return Promise.resolve(window.confirm(message));
  },

  navigate(hash) {
    if (location.hash === hash) window.dispatchEvent(new HashChangeEvent('hashchange'));
    else location.hash = hash;
  },

  qs(params) {
    return Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
  },

  parseQuery(hash) {
    const qIndex = hash.indexOf('?');
    if (qIndex === -1) return {};
    const out = {};
    for (const pair of hash.slice(qIndex + 1).split('&')) {
      if (!pair) continue;
      const [k, v] = pair.split('=');
      out[decodeURIComponent(k)] = decodeURIComponent(v || '');
    }
    return out;
  },

  async buildVarietalSelect(selected) {
    const names = await DB.varietalNames();
    const sel = Util.el('select', { class: 'input' });
    for (const name of names) {
      const opt = Util.el('option', { value: name }, name);
      if (name === selected) opt.selected = true;
      sel.appendChild(opt);
    }
    return sel;
  },

  buildVintageSelect(selected) {
    const years = Util.yearOptions();
    const sel = Util.el('select', { class: 'input' });
    const def = selected ?? years[2];
    for (const y of years) {
      const opt = Util.el('option', { value: y }, String(y));
      if (Number(y) === Number(def)) opt.selected = true;
      sel.appendChild(opt);
    }
    return sel;
  },

  card(children, extraClass = '') {
    return Util.el('div', { class: `card ${extraClass}`.trim() }, children);
  },

  field(labelText, inputNode, hint) {
    const wrap = Util.el('div', { class: 'field' }, [
      Util.el('label', {}, labelText),
      inputNode,
      hint ? Util.el('div', { class: 'hint' }, hint) : null,
    ]);
    return wrap;
  },

  pageHeader(title, backHash, actions = []) {
    return Util.el('div', { class: 'page-header' }, [
      backHash ? Util.el('button', { class: 'btn-icon', onclick: () => Util.navigate(backHash) }, '←') : null,
      Util.el('h1', {}, title),
      Util.el('div', { class: 'page-actions' }, actions),
    ]);
  },
};

window.Util = Util;
