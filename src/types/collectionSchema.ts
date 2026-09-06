// Mirrors site-assets-backend's src/collections/types.ts — this is what
// GET /api/sites/:siteId/collections/:collectionId/schema returns. Kept as
// a plain type mirror (not a shared package) since these two repos are
// already independently deployed; drift here would just be a type error
// waiting to be noticed, not a runtime risk (the backend still validates
// for real via shapeData regardless of what this side thinks the shape is).
export type FieldType = 'text' | 'textarea' | 'url' | 'number' | 'checkbox' | 'select' | 'image' | 'array';

export interface FieldSchema {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  hint?: string;
  options?: { value: string; label: string }[]; // 'select' only
  fields?: FieldSchema[]; // 'array' only — sub-schema for each row
  itemLabel?: string; // 'array' only — e.g. "Credit", "Gallery item"
}

export interface CollectionSchema {
  id: string;
  label: string;
  fields: FieldSchema[];
}
