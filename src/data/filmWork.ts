import data from './filmWork.json';

export interface GalleryItem {
  type: 'video' | 'link' | 'image' | 'instagram';
  url: string;
  label?: string;
  imgPath?: string;
  title?: string;
  role?: string;
}

export interface CreditBlock {
  role: string;
  names: string;
}

export interface FilmItem {
  slug: string;
  title: string;
  year?: string;
  role: string;
  blurb: string;
  imgPath?: string;
  imgContain?: boolean;
  subtitleLayout?: boolean;
  description?: string;
  videoUrl?: string;
  credit?: string;
  credits?: CreditBlock[];
  laurels?: string[];
  gallery?: GalleryItem[];
  galleryColumns?: number;
  heroImg?: string;
  imdbUrl?: string;
}

export const FILM_WORK = data as FilmItem[];
