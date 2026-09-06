import data from './musicProjects.json';

export interface MusicLink {
  label: string;
  href: string;
}

export interface MusicProject {
  slug: string;
  title: string;
  imgPath?: string;
  bannerImages?: string[];
  bannerLayout?: 'vertical';
  carouselImages?: string[];
  role?: string;
  description: string;
  year?: string;
  links?: MusicLink[];
  detailDescription?: string;
  albumName?: string;
  videoUrl?: string;
  extraVideoUrls?: string[];
  pdfUrl?: string;
  spotifyEmbedUrl?: string;
  appleMusicEmbedUrl?: string;
  bandcampEmbedUrl?: string;
  bandcampEmbedHeight?: number;
  embedLayout?: 'side-by-side';
  tidalEmbedUrl?: string;
  soundcloudEmbedUrl?: string;
}

export interface FlatMusicProject extends MusicProject {
  groupId: 'featured-projects' | 'collaborations';
}

export interface MusicProjectGroup {
  id: string;
  title: string;
  description: string;
  projects: MusicProject[];
}

export const MUSIC_PAGE_INTRO = `As an independent artist, I write music that draws from a wide variety of influences. The music that I write is always authentic to who I was, who I am, and what I was feeling, and I love it dearly and unconditionally despite whatever rough edges it may have.`;

const FLAT_PROJECTS = data as FlatMusicProject[];

const GROUP_META: Record<FlatMusicProject['groupId'], { title: string; description: string }> = {
  'featured-projects': {
    title: 'Featured Projects',
    description: 'Solo releases and soundtrack work.',
  },
  collaborations: {
    title: 'Collaborations',
    description: 'Work made with and alongside other artists.',
  },
};

// Extracted so useMusicWork.ts can group live-fetched projects the exact
// same way, instead of only ever grouping this file's static JSON.
export function groupMusicProjects(projects: FlatMusicProject[]): MusicProjectGroup[] {
  return (Object.keys(GROUP_META) as FlatMusicProject['groupId'][]).map((id) => ({
    id,
    ...GROUP_META[id],
    projects: projects.filter((project) => project.groupId === id),
  }));
}

export const MUSIC_PROJECT_GROUPS: MusicProjectGroup[] = groupMusicProjects(FLAT_PROJECTS);
