/* =========================================================
   NANOBO Admin — Helpers partagés (auth, API, UI)
   ========================================================= */

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'same-origin',
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const message = (data && data.error) || `Erreur (${res.status})`;
    const err = new Error(data && data.detail ? `${message} (${data.detail})` : message);
    err.status = res.status;
    err.code = data && data.code;
    throw err;
  }
  return data;
}

async function apiUpload(path, formData) {
  const res = await fetch(path, { method: 'POST', body: formData, credentials: 'same-origin' });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const message = (data && data.error) || `Erreur (${res.status})`;
    const err = new Error(data && data.detail ? `${message} (${data.detail})` : message);
    err.status = res.status;
    err.code = data && data.code;
    throw err;
  }
  return data;
}

async function requireAuthOrRedirect() {
  try {
    const { authenticated } = await api('/api/admin/session');
    if (!authenticated) {
      location.href = '/admin';
      return false;
    }
    return true;
  } catch {
    location.href = '/admin';
    return false;
  }
}

async function logoutAdmin() {
  try {
    await api('/api/admin/logout', { method: 'POST' });
  } catch {
    /* ignore */
  }
  location.href = '/admin';
}

/* ---------- Toast ---------- */
function ensureToastEl() {
  let el = document.getElementById('admin-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'admin-toast';
    el.className = 'admin-toast';
    document.body.appendChild(el);
  }
  return el;
}

function toast(message, type = 'success') {
  const el = ensureToastEl();
  el.className = 'admin-toast' + (type === 'error' ? ' error' : '');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 3200);
}

/* ---------- Confirm modal ---------- */
function ensureModalEl() {
  let overlay = document.getElementById('confirm-modal');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'confirm-modal';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box">
        <h3 id="confirm-modal-title">Confirmer</h3>
        <p id="confirm-modal-text"></p>
        <div class="modal-actions">
          <button class="btn btn-outline" id="confirm-modal-cancel">Annuler</button>
          <button class="btn btn-danger" id="confirm-modal-ok" style="background:#e5484d;color:#fff;border-color:#e5484d">Confirmer</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }
  return overlay;
}

function confirmModal(title, message) {
  const overlay = ensureModalEl();
  overlay.querySelector('#confirm-modal-title').textContent = title;
  overlay.querySelector('#confirm-modal-text').textContent = message;
  overlay.classList.add('show');
  return new Promise((resolve) => {
    const cleanup = (result) => {
      overlay.classList.remove('show');
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      overlay.removeEventListener('click', onOverlay);
      resolve(result);
    };
    const okBtn = overlay.querySelector('#confirm-modal-ok');
    const cancelBtn = overlay.querySelector('#confirm-modal-cancel');
    const onOk = () => cleanup(true);
    const onCancel = () => cleanup(false);
    const onOverlay = (e) => { if (e.target === overlay) cleanup(false); };
    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    overlay.addEventListener('click', onOverlay);
  });
}

/* ---------- Utils ---------- */
function slugifyClient(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatBytes(n) {
  if (!n && n !== 0) return '—';
  if (n < 1024) return n + ' o';
  if (n < 1024 * 1024) return (n / 1024).toFixed(0) + ' Ko';
  return (n / (1024 * 1024)).toFixed(1) + ' Mo';
}

function formatPriceAdmin(n) {
  return Number(n || 0).toFixed(2).replace('.', ',') + ' MAD';
}

function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

/* ---------- Tag input (tailles, couleurs, tags) ---------- */
function createTagInput(container, { initial = [], placeholder = '', colorMap = null, suggestions = [] } = {}) {
  container.classList.add('tag-input-box');
  const values = [...initial];

  const inputEl = document.createElement('input');
  inputEl.type = 'text';
  inputEl.placeholder = placeholder;

  function render() {
    container.querySelectorAll('.tag-chip').forEach((el) => el.remove());
    values.forEach((val, idx) => {
      const chip = document.createElement('span');
      chip.className = 'tag-chip';
      const swatch = colorMap && colorMap[val] ? `<span class="swatch" style="background:${colorMap[val]}"></span>` : '';
      chip.innerHTML = `${swatch}${val}`;
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', () => {
        values.splice(idx, 1);
        render();
      });
      chip.appendChild(removeBtn);
      container.insertBefore(chip, inputEl);
    });
  }

  function addValue(raw) {
    const val = raw.trim();
    if (!val) return;
    if (!values.includes(val)) values.push(val);
    inputEl.value = '';
    render();
  }

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addValue(inputEl.value);
    } else if (e.key === 'Backspace' && !inputEl.value && values.length) {
      values.pop();
      render();
    }
  });
  inputEl.addEventListener('blur', () => {
    if (inputEl.value.trim()) addValue(inputEl.value);
  });

  container.appendChild(inputEl);
  render();

  let suggestionsEl = null;
  if (suggestions.length) {
    suggestionsEl = document.createElement('div');
    suggestionsEl.className = 'tag-suggestions';
    suggestions.forEach((s) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tag-suggestion-btn';
      btn.textContent = '+ ' + s;
      btn.addEventListener('click', () => addValue(s));
      suggestionsEl.appendChild(btn);
    });
    container.parentNode.insertBefore(suggestionsEl, container.nextSibling);
  }

  return {
    getValues: () => [...values],
    setValues: (arr) => {
      values.length = 0;
      values.push(...arr);
      render();
    },
  };
}

/* ---------- Liste dynamique (détails produit) ---------- */
function createDynList(container, addBtn, { initial = [], placeholder = '' } = {}) {
  function addRow(value = '') {
    const row = document.createElement('div');
    row.className = 'dyn-list-row';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = placeholder;
    input.value = value;
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.innerHTML = uiIconAdmin('trash');
    removeBtn.addEventListener('click', () => row.remove());
    row.appendChild(input);
    row.appendChild(removeBtn);
    container.appendChild(row);
  }

  (initial.length ? initial : ['']).forEach((v) => addRow(v));
  addBtn.addEventListener('click', () => addRow(''));

  return {
    getValues: () =>
      Array.from(container.querySelectorAll('input'))
        .map((i) => i.value.trim())
        .filter(Boolean),
  };
}

/* Mini set d'icônes utilisées côté admin (indépendant de public/js/icons.js) */
function uiIconAdmin(name) {
  const icons = {
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6.4 6.9.7-5.2 4.7 1.5 6.8L12 17.8 5.9 21.1l1.5-6.8-5.2-4.7 6.9-.7z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><polyline points="7 8 12 3 17 8"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14 21 3"/><path d="M21 3h-6"/><path d="M21 3v6"/><path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6"/></svg>',
  };
  return icons[name] || '';
}
