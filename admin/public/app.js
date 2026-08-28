const listEl = document.getElementById('entry-list');
const statusEl = document.getElementById('status');
const saveOrderBtn = document.getElementById('save-order-btn');
const addBtn = document.getElementById('add-btn');
const cancelBtn = document.getElementById('cancel-btn');
const dialog = document.getElementById('entry-dialog');
const form = document.getElementById('entry-form');
const dialogTitle = document.getElementById('dialog-title');
const formError = document.getElementById('form-error');
const imageHint = document.getElementById('image-hint');
const currentImagePreview = document.getElementById('current-image-preview');

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

async function loadEntries() {
  entries = await fetchJSON('/api/entries');
  orderDirty = false;
  saveOrderBtn.disabled = true;
  render();
}

function render() {
  listEl.innerHTML = '';
  entries.forEach((entry) => {
    const li = document.createElement('li');
    li.className = 'pp-gallery-card admin-card';
    li.draggable = true;
    li.dataset.id = entry.id;

    li.innerHTML = `
      <div class="admin-image-wrap">
        <img src="/site-assets${entry.imgPath}?v=${entry.updatedAt || 0}" alt="" />
        <div class="pp-gallery-overlay">
          <p class="pp-gallery-title">${escapeHtml(entry.title)}</p>
          <p class="pp-gallery-role">${escapeHtml(entry.role)}</p>
          <p class="pp-gallery-type">${escapeHtml(entry.type)}${entry.year ? ' · ' + escapeHtml(entry.year) : ''}</p>
        </div>
        ${entry.featured ? '<span class="admin-featured-badge">Featured</span>' : ''}
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
    const { git } = await fetchJSON('/api/entries/reorder', {
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
  if (!confirm(`Delete "${entry.title}"? This cannot be undone from this tool.`)) return;
  try {
    const { git } = await fetchJSON(`/api/entries/${encodeURIComponent(entry.id)}`, { method: 'DELETE' });
    showStatus(`Removed "${entry.title}".` + describeGit(git), false);
    await loadEntries();
  } catch (err) {
    showStatus(err.message, true);
  }
}

function openAddDialog() {
  form.reset();
  document.getElementById('entry-id').value = '';
  dialogTitle.textContent = 'Add Credit';
  imageHint.textContent = '(required — auto-compressed on save)';
  document.getElementById('field-image').required = true;
  currentImagePreview.hidden = true;
  formError.hidden = true;
  dialog.showModal();
}

function openEditDialog(entry) {
  form.reset();
  document.getElementById('entry-id').value = entry.id;
  document.getElementById('field-title').value = entry.title;
  document.getElementById('field-role').value = entry.role;
  document.getElementById('field-type').value = entry.type;
  document.getElementById('field-year').value = entry.year;
  document.getElementById('field-link').value = entry.link;
  document.getElementById('field-featured').checked = entry.featured;
  dialogTitle.textContent = 'Edit Credit';
  imageHint.textContent = '(optional — leave blank to keep current image; auto-compressed on save)';
  document.getElementById('field-image').required = false;
  currentImagePreview.src = `/site-assets${entry.imgPath}?v=${entry.updatedAt || 0}`;
  currentImagePreview.hidden = false;
  formError.hidden = true;
  dialog.showModal();
}

async function submitForm(e) {
  e.preventDefault();
  formError.hidden = true;

  const id = document.getElementById('entry-id').value;
  const formData = new FormData(form);
  formData.set('featured', document.getElementById('field-featured').checked ? 'true' : 'false');
  if (!formData.get('image') || formData.get('image').size === 0) {
    formData.delete('image');
  }

  try {
    const { git, entry } = id
      ? await fetchJSON(`/api/entries/${encodeURIComponent(id)}`, { method: 'PUT', body: formData })
      : await fetchJSON('/api/entries', { method: 'POST', body: formData });
    dialog.close();
    showStatus(`Saved "${entry.title}".` + describeGit(git), false);
    await loadEntries();
  } catch (err) {
    formError.textContent = err.message;
    formError.hidden = false;
  }
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

addBtn.addEventListener('click', openAddDialog);
cancelBtn.addEventListener('click', () => dialog.close());
saveOrderBtn.addEventListener('click', saveOrder);
form.addEventListener('submit', submitForm);

loadEntries().catch((err) => showStatus(err.message, true));
