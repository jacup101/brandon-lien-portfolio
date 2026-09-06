import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import * as adminApi from '../../lib/adminApi';
import { publicAssetUrl } from '../../lib/backendApi';
import { compressImage } from '../../lib/compressImage';
import { defaultForField, emptyValueForFields } from '../../lib/schemaDefaults';
import type { FieldSchema } from '../../types/collectionSchema';
import './SchemaForm.css';

// Renders an editing form directly from a collection's field schema (as
// served by GET /api/sites/:siteId/collections/:collectionId/schema) —
// one generic renderer for every collection, instead of a hand-built form
// per collection. New field types just need a case added here; new
// collections (Music, etc.) need nothing at all on this side.

interface SchemaFormProps {
  fields: FieldSchema[];
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  token: string;
}

function SchemaForm({ fields, value, onChange, token }: SchemaFormProps) {
  return (
    <>
      {fields.map((field) => (
        <SchemaField
          key={field.key}
          field={field}
          value={value[field.key]}
          onChange={(fieldValue) => onChange({ ...value, [field.key]: fieldValue })}
          token={token}
        />
      ))}
    </>
  );
}

interface SchemaFieldProps {
  field: FieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  token: string;
}

function SchemaField({ field, value, onChange, token }: SchemaFieldProps) {
  switch (field.type) {
    case 'text':
    case 'url':
      return (
        <label className="admin-field">
          <span>{field.label}</span>
          <input
            type={field.type === 'url' ? 'url' : 'text'}
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
          />
          {field.hint && <span className="admin-field-hint">{field.hint}</span>}
        </label>
      );

    case 'textarea':
      return (
        <label className="admin-field">
          <span>{field.label}</span>
          <textarea
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            rows={4}
          />
        </label>
      );

    case 'number':
      return (
        <label className="admin-field">
          <span>{field.label}</span>
          <input
            type="number"
            value={value === null || value === undefined ? '' : (value as number)}
            onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          />
        </label>
      );

    case 'checkbox':
      return (
        <label className="admin-field admin-checkbox-label">
          <input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} />
          {field.label}
        </label>
      );

    case 'select':
      return (
        <label className="admin-field">
          <span>{field.label}</span>
          <select value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} required={field.required}>
            <option value="" disabled>
              Choose…
            </option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      );

    case 'image':
      return <ImageField field={field} value={(value as string) ?? ''} onChange={onChange} token={token} />;

    case 'array':
      return <ArrayField field={field} value={(value as unknown[]) ?? []} onChange={onChange} token={token} />;

    default:
      return null;
  }
}

function ImageField({ field, value, onChange, token }: { field: FieldSchema; value: string; onChange: (v: string) => void; token: string }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const compressed = await compressImage(file);
      const asset = await adminApi.uploadAsset(compressed, file.name, token);
      onChange(asset.r2Key);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <label className="admin-field">
      <span>{field.label}</span>
      {value && <img src={publicAssetUrl(value)} alt="" className="admin-field-image-preview" />}
      <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
      {uploading && <span className="admin-field-hint">Uploading…</span>}
      {error && <span className="admin-form-error">{error}</span>}
    </label>
  );
}

function ArrayField({ field, value, onChange, token }: { field: FieldSchema; value: unknown[]; onChange: (v: unknown[]) => void; token: string }) {
  const subFields = field.fields ?? [];
  // Matches site-assets-backend's shapeArrayRow: a single sub-field named
  // "value" means each row is stored as a bare scalar, not an object.
  const isScalar = subFields.length === 1 && subFields[0].key === 'value';
  const itemLabel = field.itemLabel ?? 'Item';

  function updateRow(index: number, rowValue: unknown) {
    const next = [...value];
    next[index] = rowValue;
    onChange(next);
  }

  function removeRow(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function moveRow(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function addRow() {
    onChange([...value, isScalar ? defaultForField(subFields[0]) : emptyValueForFields(subFields)]);
  }

  return (
    <div className="admin-field admin-array-field">
      <span className="admin-array-field-label">{field.label}</span>
      {value.map((row, index) => (
        <div className="admin-array-row" key={index}>
          <div className="admin-array-row-body">
            {isScalar ? (
              <SchemaField
                field={{ ...subFields[0], label: `${itemLabel} ${index + 1}` }}
                value={row}
                onChange={(v) => updateRow(index, v)}
                token={token}
              />
            ) : (
              <SchemaForm
                fields={subFields}
                value={(row as Record<string, unknown>) ?? {}}
                onChange={(v) => updateRow(index, v)}
                token={token}
              />
            )}
          </div>
          <div className="admin-array-row-actions">
            <button type="button" onClick={() => moveRow(index, -1)} disabled={index === 0} aria-label="Move up">
              <ChevronUp size={14} />
            </button>
            <button
              type="button"
              onClick={() => moveRow(index, 1)}
              disabled={index === value.length - 1}
              aria-label="Move down"
            >
              <ChevronDown size={14} />
            </button>
            <button
              type="button"
              className="admin-array-row-remove"
              onClick={() => removeRow(index)}
              aria-label={`Remove ${itemLabel}`}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="admin-btn admin-btn-secondary admin-array-add-btn" onClick={addRow}>
        + Add {itemLabel}
      </button>
    </div>
  );
}

export default SchemaForm;
