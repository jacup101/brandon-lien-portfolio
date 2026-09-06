import { FormEvent, ReactNode, useCallback, useEffect, useState } from 'react';
import * as adminApi from '../../lib/adminApi';
import { emptyValueForFields } from '../../lib/schemaDefaults';
import type { FieldSchema } from '../../types/collectionSchema';
import SchemaForm from './SchemaForm';
import './CollectionAdminSection.css'; // reuses the .admin-editor-* full-page layout

// The "document" counterpart to CollectionAdminSection — for singleton
// content like About, which has no list, no add/delete, no reorder: just
// one thing to edit. Always renders as the full-page split (form + live
// preview), since there's nothing to show before that.
interface DocumentAdminSectionProps {
  documentId: string;
  label: string;
  renderPreview: (formValue: Record<string, unknown>) => ReactNode;
  token: string;
  onApiError: (err: unknown) => string;
}

function DocumentAdminSection({ documentId, label, renderPreview, token, onApiError }: DocumentAdminSectionProps) {
  const [fields, setFields] = useState<FieldSchema[] | null>(null);
  const [formValue, setFormValue] = useState<Record<string, unknown>>({});
  const [loadError, setLoadError] = useState('');
  const [status, setStatus] = useState<{ message: string; error?: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    try {
      const [schema, doc] = await Promise.all([
        adminApi.getDocumentSchema(documentId, token),
        adminApi.getDocument(documentId, token),
      ]);
      setFields(schema.fields);
      setFormValue({ ...emptyValueForFields(schema.fields), ...doc.data });
    } catch (err) {
      setLoadError(onApiError(err));
    }
  }, [documentId, token, onApiError]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await adminApi.putDocument(documentId, formValue, token);
      setStatus({ message: `Saved "${label}".` });
    } catch (err) {
      setFormError(onApiError(err));
    } finally {
      setSaving(false);
    }
  }

  if (loadError) {
    return (
      <>
        <p className="admin-status admin-status-error">{loadError}</p>
        <button type="button" className="admin-btn admin-btn-secondary" onClick={load}>
          Retry
        </button>
      </>
    );
  }

  if (!fields) {
    return <p className="admin-loading">Loading…</p>;
  }

  return (
    <form className="admin-editor-page" onSubmit={handleSubmit}>
      <div className="admin-editor-header">
        <span />
        <h1>Edit {label}</h1>
        <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {status && <p className={`admin-status ${status.error ? 'admin-status-error' : ''}`}>{status.message}</p>}
      {formError && <p className="admin-form-error admin-editor-error">{formError}</p>}

      <div className="admin-editor-body">
        <div className="admin-editor-form-pane">
          <SchemaForm fields={fields} value={formValue} onChange={setFormValue} token={token} />
        </div>
        <div className="admin-editor-preview-pane">
          <p className="admin-editor-preview-label">Live Preview</p>
          <div className="admin-editor-preview-frame">{renderPreview(formValue)}</div>
        </div>
      </div>
    </form>
  );
}

export default DocumentAdminSection;
