export type FieldType = 'text' | 'textarea' | 'url' | 'number' | 'checkbox' | 'select' | 'array';

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

export interface PrimaryImageConfig {
  key: string;
  label: string;
  requiredOnAdd?: boolean;
}

export interface CollectionConfig {
  id: string;
  label: string;
  dataFile: string; // relative to repo root
  imageDir: string; // relative to repo root
  imagePathPrefix: string; // public URL prefix matching imageDir, e.g. /assets/film/web
  idField: 'id' | 'slug';
  titleField: string; // used for commit messages / display
  primaryImage?: PrimaryImageConfig;
  fields: FieldSchema[];
}

const POST_SOUND: CollectionConfig = {
  id: 'post-sound',
  label: 'Post-Sound',
  dataFile: 'src/data/postProductionWork.json',
  imageDir: 'public/assets/film/web',
  imagePathPrefix: '/assets/film/web',
  idField: 'id',
  titleField: 'title',
  primaryImage: { key: 'imgPath', label: 'Image', requiredOnAdd: true },
  fields: [
    { key: 'title', label: 'Title', type: 'text', required: true },
    { key: 'role', label: 'Role', type: 'text', required: true },
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      required: true,
      options: [
        { value: 'Feature', label: 'Feature' },
        { value: 'Short', label: 'Short' },
        { value: 'Vertical', label: 'Vertical' },
      ],
    },
    { key: 'year', label: 'Year', type: 'text' },
    { key: 'link', label: 'Link', type: 'url' },
    { key: 'featured', label: 'Featured', type: 'checkbox' },
  ],
};

const FILM: CollectionConfig = {
  id: 'film',
  label: 'Film',
  dataFile: 'src/data/filmWork.json',
  imageDir: 'public/assets/film/web',
  imagePathPrefix: '/assets/film/web',
  idField: 'slug',
  titleField: 'title',
  primaryImage: { key: 'imgPath', label: 'Image' },
  fields: [
    {
      key: 'slug',
      label: 'Slug',
      type: 'text',
      required: true,
      hint: 'URL identifier, e.g. "el-malcriado" for /film/el-malcriado. Changing this changes the page URL.',
    },
    { key: 'title', label: 'Title', type: 'text', required: true },
    { key: 'year', label: 'Year', type: 'text' },
    { key: 'role', label: 'Role', type: 'text' },
    { key: 'blurb', label: 'Blurb (list view)', type: 'textarea' },
    { key: 'description', label: 'Description (detail page)', type: 'textarea' },
    { key: 'imgContain', label: 'Fit image (don’t crop to fill)', type: 'checkbox' },
    { key: 'subtitleLayout', label: 'Subtitle layout', type: 'checkbox' },
    { key: 'videoUrl', label: 'Video embed URL', type: 'url' },
    { key: 'imdbUrl', label: 'IMDb URL', type: 'url' },
    { key: 'heroImg', label: 'Hero image path', type: 'text', hint: 'e.g. /assets/msj-2023.jpg' },
    { key: 'galleryColumns', label: 'Gallery columns', type: 'number' },
    { key: 'credit', label: 'Credit footer line', type: 'textarea' },
    {
      key: 'credits',
      label: 'Credits',
      type: 'array',
      itemLabel: 'Credit',
      fields: [
        { key: 'role', label: 'Role', type: 'text', required: true },
        { key: 'names', label: 'Names', type: 'text', required: true },
      ],
    },
    {
      key: 'laurels',
      label: 'Laurel images',
      type: 'array',
      itemLabel: 'Laurel image path',
      fields: [{ key: 'value', label: 'Image path', type: 'text', required: true }],
    },
    {
      key: 'gallery',
      label: 'Gallery',
      type: 'array',
      itemLabel: 'Gallery item',
      fields: [
        {
          key: 'type',
          label: 'Type',
          type: 'select',
          required: true,
          options: [
            { value: 'video', label: 'Video (YouTube embed URL)' },
            { value: 'link', label: 'Link' },
            { value: 'image', label: 'Image' },
            { value: 'instagram', label: 'Instagram embed' },
          ],
        },
        { key: 'url', label: 'URL', type: 'url', required: true },
        { key: 'label', label: 'Label', type: 'text' },
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'role', label: 'Role', type: 'text' },
        { key: 'imgPath', label: 'Image path', type: 'text' },
      ],
    },
  ],
};

const MUSIC: CollectionConfig = {
  id: 'music',
  label: 'Music',
  dataFile: 'src/data/musicProjects.json',
  imageDir: 'public/assets/music/web',
  imagePathPrefix: '/assets/music/web',
  idField: 'slug',
  titleField: 'title',
  primaryImage: { key: 'imgPath', label: 'Image' },
  fields: [
    {
      key: 'slug',
      label: 'Slug',
      type: 'text',
      required: true,
      hint: 'URL identifier, e.g. "reminiscences" for /music/reminiscences. Changing this changes the page URL.',
    },
    { key: 'title', label: 'Title', type: 'text', required: true },
    {
      key: 'groupId',
      label: 'Section',
      type: 'select',
      required: true,
      options: [
        { value: 'featured-projects', label: 'Featured Projects' },
        { value: 'collaborations', label: 'Collaborations' },
      ],
    },
    { key: 'role', label: 'Role', type: 'text' },
    { key: 'year', label: 'Year', type: 'text' },
    { key: 'albumName', label: 'Album name', type: 'text' },
    { key: 'description', label: 'Description (list view)', type: 'textarea', required: true },
    { key: 'detailDescription', label: 'Description (detail page)', type: 'textarea' },
    { key: 'videoUrl', label: 'Video embed URL', type: 'url' },
    { key: 'pdfUrl', label: 'PDF path', type: 'text' },
    { key: 'spotifyEmbedUrl', label: 'Spotify embed URL', type: 'url' },
    { key: 'appleMusicEmbedUrl', label: 'Apple Music embed URL', type: 'url' },
    { key: 'bandcampEmbedUrl', label: 'Bandcamp embed URL', type: 'url' },
    { key: 'bandcampEmbedHeight', label: 'Bandcamp embed height', type: 'number' },
    { key: 'tidalEmbedUrl', label: 'Tidal embed URL', type: 'url' },
    { key: 'soundcloudEmbedUrl', label: 'SoundCloud embed URL', type: 'url' },
    {
      key: 'embedLayout',
      label: 'Embed layout',
      type: 'select',
      options: [
        { value: '', label: 'Default (stacked)' },
        { value: 'side-by-side', label: 'Side by side' },
      ],
    },
    {
      key: 'bannerLayout',
      label: 'Banner layout',
      type: 'select',
      options: [
        { value: '', label: 'Default' },
        { value: 'vertical', label: 'Vertical' },
      ],
    },
    {
      key: 'extraVideoUrls',
      label: 'Extra video embed URLs',
      type: 'array',
      itemLabel: 'Video URL',
      fields: [{ key: 'value', label: 'URL', type: 'url', required: true }],
    },
    {
      key: 'bannerImages',
      label: 'Banner images',
      type: 'array',
      itemLabel: 'Banner image path',
      fields: [{ key: 'value', label: 'Image path', type: 'text', required: true }],
    },
    {
      key: 'carouselImages',
      label: 'Carousel images',
      type: 'array',
      itemLabel: 'Carousel image path',
      fields: [{ key: 'value', label: 'Image path', type: 'text', required: true }],
    },
    {
      key: 'links',
      label: 'Links',
      type: 'array',
      itemLabel: 'Link',
      fields: [
        { key: 'label', label: 'Label', type: 'text', required: true },
        { key: 'href', label: 'URL', type: 'url', required: true },
      ],
    },
  ],
};

export const COLLECTIONS: CollectionConfig[] = [POST_SOUND, FILM, MUSIC];

export function getCollection(id: string): CollectionConfig | undefined {
  return COLLECTIONS.find((c) => c.id === id);
}
