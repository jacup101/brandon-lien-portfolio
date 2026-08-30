/* Generic schema-driven field rendering + collection, shared by app.js and about.js. */

let draggedArrayRow = null;

function isScalarArraySchema(schema) {
  return schema.fields && schema.fields.length === 1 && schema.fields[0].key === 'value';
}

function getDragAfterRow(container, y) {
  const rows = [...container.querySelectorAll(':scope > .array-row:not(.dragging)')];
  let closest = { offset: -Infinity, row: null };
  for (const row of rows) {
    const box = row.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      closest = { offset, row };
    }
  }
  return closest.row;
}

function createArrayEditor(schema, values) {
  const container = document.createElement('div');
  container.className = 'array-editor';

  const rowsEl = document.createElement('div');
  rowsEl.className = 'array-rows';
  container.appendChild(rowsEl);

  function addRow(rowValue) {
    const row = document.createElement('div');
    row.className = 'array-row';
    row.draggable = true;

    const handle = document.createElement('span');
    handle.className = 'array-row-handle';
    handle.title = 'Drag to reorder';
    handle.textContent = '⠇';
    row.appendChild(handle);

    const fieldsWrap = document.createElement('div');
    fieldsWrap.className = 'array-row-fields';
    const scalar = isScalarArraySchema(schema);
    for (const subField of schema.fields) {
      const subValue = scalar ? rowValue : rowValue ? rowValue[subField.key] : undefined;
      fieldsWrap.appendChild(createFieldElement(subField, subValue));
    }
    row.appendChild(fieldsWrap);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'array-row-remove';
    removeBtn.title = 'Remove';
    removeBtn.textContent = '✕';
    removeBtn.addEventListener('click', () => row.remove());
    row.appendChild(removeBtn);

    row.addEventListener('dragstart', () => {
      draggedArrayRow = row;
      requestAnimationFrame(() => row.classList.add('dragging'));
    });
    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
      draggedArrayRow = null;
    });

    rowsEl.appendChild(row);
  }

  rowsEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!draggedArrayRow || draggedArrayRow.parentElement !== rowsEl) return;
    const after = getDragAfterRow(rowsEl, e.clientY);
    if (after == null) {
      rowsEl.appendChild(draggedArrayRow);
    } else if (after !== draggedArrayRow) {
      rowsEl.insertBefore(draggedArrayRow, after);
    }
  });
  rowsEl.addEventListener('drop', (e) => e.preventDefault());

  for (const value of values || []) addRow(value);

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'array-add-btn btn btn-secondary';
  addBtn.textContent = `+ Add ${schema.itemLabel || 'item'}`;
  addBtn.addEventListener('click', () => addRow(null));
  container.appendChild(addBtn);

  return container;
}

function createFieldElement(schema, value) {
  const wrap = document.createElement('div');
  wrap.className = `field-wrap field-wrap-${schema.type}`;
  wrap.dataset.fieldKey = schema.key;

  const label = document.createElement('label');
  label.className = 'field-label';
  label.textContent = schema.label + (schema.required ? ' *' : '');
  wrap.appendChild(label);

  if (schema.type === 'array') {
    wrap.appendChild(createArrayEditor(schema, value || []));
    return wrap;
  }

  let input;
  if (schema.type === 'textarea') {
    input = document.createElement('textarea');
    input.rows = 4;
    input.value = value ?? '';
  } else if (schema.type === 'checkbox') {
    input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = value === true;
  } else if (schema.type === 'select') {
    input = document.createElement('select');
    for (const opt of schema.options || []) {
      const optionEl = document.createElement('option');
      optionEl.value = opt.value;
      optionEl.textContent = opt.label;
      input.appendChild(optionEl);
    }
    input.value = value ?? (schema.options && schema.options[0] ? schema.options[0].value : '');
  } else if (schema.type === 'number') {
    input = document.createElement('input');
    input.type = 'number';
    input.value = value === null || value === undefined ? '' : value;
  } else {
    input = document.createElement('input');
    input.type = schema.type === 'url' ? 'url' : 'text';
    input.value = value ?? '';
  }
  input.dataset.fieldInput = 'true';
  if (schema.type === 'checkbox') {
    wrap.classList.add('field-wrap-inline');
  }
  if (schema.required) input.required = true;
  wrap.appendChild(input);

  if (schema.hint) {
    const hint = document.createElement('p');
    hint.className = 'field-hint';
    hint.textContent = schema.hint;
    wrap.appendChild(hint);
  }

  return wrap;
}

function collectFieldValue(schema, wrapEl) {
  if (schema.type === 'array') {
    const rowsEl = wrapEl.querySelector(':scope > .array-editor > .array-rows');
    const rows = [...rowsEl.children];
    const scalar = isScalarArraySchema(schema);
    return rows.map((row) => {
      const fieldsWrap = row.querySelector(':scope > .array-row-fields');
      if (scalar) {
        const subWrap = fieldsWrap.querySelector(':scope > .field-wrap');
        return collectFieldValue(schema.fields[0], subWrap);
      }
      const obj = {};
      for (const subField of schema.fields) {
        const subWrap = fieldsWrap.querySelector(`:scope > .field-wrap[data-field-key="${subField.key}"]`);
        obj[subField.key] = collectFieldValue(subField, subWrap);
      }
      return obj;
    });
  }

  const input = wrapEl.querySelector(':scope > [data-field-input]');
  if (schema.type === 'checkbox') return input.checked;
  if (schema.type === 'number') return input.value === '' ? null : Number(input.value);
  return input.value;
}

/** Renders every field in `fields` into `container` (cleared first), from `entry` (or blank). */
function renderFieldList(container, fields, entry) {
  container.innerHTML = '';
  for (const field of fields) {
    container.appendChild(createFieldElement(field, entry ? entry[field.key] : undefined));
  }
}

/** Reads `container`'s rendered fields back into a plain JS object matching `fields`. */
function collectFieldList(container, fields) {
  const result = {};
  for (const field of fields) {
    const wrap = container.querySelector(`:scope > .field-wrap[data-field-key="${field.key}"]`);
    result[field.key] = collectFieldValue(field, wrap);
  }
  return result;
}
