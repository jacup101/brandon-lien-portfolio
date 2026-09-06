import type { FieldSchema } from '../types/collectionSchema';

// Mirrors site-assets-backend's defaultForField (see collections/validate.ts)
// — used client-side to seed a blank form (Add) or fill in any field a
// stored entry doesn't have yet (an older entry, or a field added to the
// schema since), so SchemaForm's inputs are always controlled.
export function defaultForField(field: FieldSchema): unknown {
  if (field.type === 'array') return [];
  if (field.type === 'checkbox') return false;
  if (field.type === 'number') return null;
  return '';
}

export function emptyValueForFields(fields: FieldSchema[]): Record<string, unknown> {
  const value: Record<string, unknown> = {};
  for (const field of fields) value[field.key] = defaultForField(field);
  return value;
}
