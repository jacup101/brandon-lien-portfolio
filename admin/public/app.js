const listEl = document.getElementById('entry-list');
const statusEl = document.getElementById('status');
const saveOrderBtn = document.getElementById('save-order-btn');
const addBtn = document.getElementById('add-btn');
const cancelBtn = document.getElementById('cancel-btn');
const dialog = document.getElementById('entry-dialog');
const form = document.getElementById('entry-form');
const dialogTitle = document.getElementById('dialog-title');
const dialogFieldsEl = document.getElementById('dialog-fields');
const formError = document.getElementById('form-error');
const imageFieldWrap = document.getElementById('dialog-image-field');
const imageFieldLabel = document.getElementById('image-field-label');
const imageHint = document.getElementById('image-hint');
const currentImagePreview = document.getElementById('current-image-preview');
const fieldImageInput = document.getElementById('field-image');
const pageTitleEl = document.getElementById('page-title');
const pageSubtitleEl = document.getElementById('page-subtitle');
const collectionPanel = document.getElementById('collection-panel');
const aboutPanel = document.getElementById('about-panel');

const DEFAULT_SUBTITLE = 'Local-only — changes commit to git automatically, but never push.';

let collections = {};
let activeCollectionId = 'post-sound';
let entries = [];
let orderDirty = false;
let draggedEl = null;

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return body;
}

function showStatus(message, isError) {
  statusEl.textContent = message;
  statusEl.hidden = false;
  statusEl.className = 'status' + (isError ? ' status-error' : ' status-ok');
}

function describeGit(git) {
  if (!git) return '';
  if (git.committed) return ' Committed to git.';
  return ` Saved, but git commit failed: ${git.error}`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[c]);
}

async function init() {
  const list = await fetchJSON('/api/collections');
  collections = Object.fromEntries(list.map((c) => [c.id, c]));
  document.querySelectorAll('.admin-tab').forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
  switchTab('post-sound');
}

function switchTab(tabId) {
  document.querySelectorAll('.admin-tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === tabId));
  statusEl.hidden = true;

  if (tabId === 'about') {
    collectionPanel.hidden = true;
    aboutPanel.hidden = false;
    addBtn.hidden = true;
    saveOrderBtn.hidden = true;
    pageTitleEl.textContent = 'About Page';
    pageSubtitleEl.textContent = DEFAULT_SUBTITLE;
    loadAboutContent();
    return;
  }

  collectionPanel.hidden = false;
  aboutPanel.hidden = true;
  addBtn.hidden = false;
  saveOrderBtn.hidden = false;
  activeCollectionId = tabId;
  const config = collections[tabId];
  pageTitleEl.textContent = `${config.label} Entries`;
  pageSubtitleEl.textContent = DEFAULT_SUBTITLE;
  loadEntries().catch((err) => showStatus(err.message, true));
}

async function loadEntries() {
  entries = await fetchJSON(`/api/collections/${activeCollectionId}/entries`);
  orderDirty = false;
  saveOrderBtn.disabled = true;
  render();
}

// Local-mode images are a path under public/ (always starts with "/").
// Remote-mode images are an R2 key (e.g. "brandon-site/<uuid>.jpg", no
// leading slash) and need to go through the /remote-image proxy instead,
// since there's no local file to serve directly.
function resolveImageUrl(imgPath, updatedAt) {
  if (!imgPath) return null;
  const v = updatedAt || 0;
  return imgPath.startsWith('/')
    ? `/site-assets${imgPath}?v=${v}`
    : `/remote-image?key=${encodeURIComponent(imgPath)}&v=${v}`;
}

function cardImageSrc(config, entry) {
  if (!config.primaryImage) return null;
  return resolveImageUrl(entry[config.primaryImage.key], entry.updatedAt);
}

function cardSubtitle(entry) {
  return ['role', 'type', 'year']
    .map((key) => entry[key])
    .filter(Boolean)
    .join(' · ');
}

function render() {
  const config = collections[activeCollectionId];
  listEl.innerHTML = '';

  entries.forEach((entry) => {
    const id = entry[config.idField];
    const li = document.createElement('li');
    li.className = 'pp-gallery-card admin-card';
    li.draggable = true;
    li.dataset.id = id;

    const imgSrc = cardImageSrc(config, entry);
    const title = entry[config.titleField] || '(untitled)';
    const subtitle = cardSubtitle(entry);

    li.innerHTML = `
      <div class="admin-image-wrap">
        ${imgSrc ? `<img src="${imgSrc}" alt="" />` : '<div class="admin-image-placeholder"></div>'}
        <div class="pp-gallery-overlay">
          <p class="pp-gallery-title">${escapeHtml(title)}</p>
          ${subtitle ? `<p class="pp-gallery-role">${escapeHtml(subtitle)}</p>` : ''}
        </div>
        ${entry.featured === true ? '<span class="admin-featured-badge">Featured</span>' : ''}
        <span class="admin-drag-handle" title="Drag to reorder">&#9776;</span>
        <div class="admin-card-actions">
          <button type="button" class="admin-icon-btn" data-action="edit" title="Edit">&#9998;</button>
          <button type="button" class="admin-icon-btn danger" data-action="delete" title="Delete">&#10005;</button>
        </div>
      </div>
    `;

    li.querySelector('[data-action="edit"]').addEventListener('click', () => openEditDialog(entry));
    li.querySelector('[data-action="delete"]').addEventListener('click', () => deleteEntry(entry));

    li.addEventListener('dragstart', () => {
      draggedEl = li;
      requestAnimationFrame(() => li.classList.add('dragging'));
    });
    li.addEventListener('dragend', () => {
      li.classList.remove('dragging');
      draggedEl = null;
    });

    listEl.appendChild(li);
  });
}

function getDragAfterElement(container, x, y) {
  const cards = [...container.querySelectorAll('.admin-card:not(.dragging)')];
  let closest = { distance: Infinity, card: null, after: false };
  for (const card of cards) {
    const box = card.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const distance = (x - cx) ** 2 + (y - cy) ** 2;
    if (distance < closest.distance) {
      closest = { distance, card, after: x > cx };
    }
  }
  if (!closest.card) return null;
  return closest.after ? closest.card.nextElementSibling : closest.card;
}

listEl.addEventListener('dragover', (e) => {
  e.preventDefault();
  if (!draggedEl) return;
  const afterElement = getDragAfterElement(listEl, e.clientX, e.clientY);
  if (afterElement == null) {
    listEl.appendChild(draggedEl);
  } else if (afterElement !== draggedEl) {
    listEl.insertBefore(draggedEl, afterElement);
  }
  orderDirty = true;
  saveOrderBtn.disabled = false;
});
listEl.addEventListener('drop', (e) => e.preventDefault());

async function saveOrder() {
  const order = [...listEl.children].map((li) => li.dataset.id);
  try {
    const { git } = await fetchJSON(`/api/collections/${activeCollectionId}/entries/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    });
    orderDirty = false;
    saveOrderBtn.disabled = true;
    showStatus('Order saved.' + describeGit(git), false);
  } catch (err) {
    showStatus(err.message, true);
  }
}

async function deleteEntry(entry) {
  const config = collections[activeCollectionId];
  const id = entry[config.idField];
  const title = entry[config.titleField] || id;
  if (!confirm(`Delete "${title}"? This cannot be undone from this tool.`)) return;
  try {
    const { git } = await fetchJSON(`/api/collections/${activeCollectionId}/entries/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    showStatus(`Removed "${title}".` + describeGit(git), false);
    await loadEntries();
  } catch (err) {
    showStatus(err.message, true);
  }
}

function setupImageField(config, entry) {
  if (!config.primaryImage) {
    imageFieldWrap.hidden = true;
    return;
  }
  imageFieldWrap.hidden = false;
  imageFieldLabel.textContent = config.primaryImage.label;
  fieldImageInput.value = '';

  const isAdd = !entry;
  const required = Boolean(config.primaryImage.requiredOnAdd) && isAdd;
  fieldImageInput.required = required;

  const currentPath = entry ? entry[config.primaryImage.key] : '';
  if (currentPath) {
    currentImagePreview.src = resolveImageUrl(currentPath, entry.updatedAt);
    currentImagePreview.hidden = false;
  } else {
    currentImagePreview.hidden = true;
  }
  imageHint.textContent = isAdd
    ? required
      ? '(required — auto-compressed on save)'
      : '(optional — auto-compressed on save)'
    : '(optional — leave blank to keep current image; auto-compressed on save)';
}

function openAddDialog() {
  const config = collections[activeCollectionId];
  form.reset();
  document.getElementById('entry-id').value = '';
  dialogTitle.textContent = `Add ${config.label} Entry`;
  setupImageField(config, null);
  renderFieldList(dialogFieldsEl, config.fields, null);
  formError.hidden = true;
  dialog.showModal();
}

function openEditDialog(entry) {
  const config = collections[activeCollectionId];
  form.reset();
  document.getElementById('entry-id').value = entry[config.idField];
  dialogTitle.textContent = `Edit ${config.label} Entry`;
  setupImageField(config, entry);
  renderFieldList(dialogFieldsEl, config.fields, entry);
  formError.hidden = true;
  dialog.showModal();
}

async function submitForm(e) {
  e.preventDefault();
  formError.hidden = true;
  const config = collections[activeCollectionId];

  const id = document.getElementById('entry-id').value;
  const data = collectFieldList(dialogFieldsEl, config.fields);

  const formData = new FormData();
  formData.set('data', JSON.stringify(data));
  if (config.primaryImage && fieldImageInput.files[0]) {
    formData.set('image', fieldImageInput.files[0]);
  }

  try {
    const url = id
      ? `/api/collections/${activeCollectionId}/entries/${encodeURIComponent(id)}`
      : `/api/collections/${activeCollectionId}/entries`;
    const { git, entry } = await fetchJSON(url, { method: id ? 'PUT' : 'POST', body: formData });
    dialog.close();
    showStatus(`Saved "${entry[config.titleField]}".` + describeGit(git), false);
    await loadEntries();
  } catch (err) {
    formError.textContent = err.message;
    formError.hidden = false;
  }
}

addBtn.addEventListener('click', openAddDialog);
cancelBtn.addEventListener('click', () => dialog.close());
saveOrderBtn.addEventListener('click', saveOrder);
form.addEventListener('submit', submitForm);

init().catch((err) => showStatus(err.message, true));
