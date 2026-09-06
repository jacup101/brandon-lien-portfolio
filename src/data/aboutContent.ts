import data from './aboutContent.json';
import type { SocialLink } from '../components/social/SocialLinks';

export interface AboutStripImage {
  path: string;
  cropTop: boolean;
}

export interface AboutContent {
  bioParagraphs: string[];
  portraitImage: string;
  stripImages: AboutStripImage[];
  socialLinks: SocialLink[];
}

export const ABOUT_CONTENT = data as AboutContent;
