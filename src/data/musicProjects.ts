export interface MusicLink {
  label: string;
  href: string;
}

export interface MusicProject {
  slug: string;
  title: string;
  imgPath?: string;
  bannerImages?: string[];
  role?: string;
  description: string;
  year?: string;
  links?: MusicLink[];
  detailDescription?: string;
  videoUrl?: string;
  pdfUrl?: string;
  spotifyEmbedUrl?: string;
  appleMusicEmbedUrl?: string;
  bandcampEmbedUrl?: string;
}

export interface MusicProjectGroup {
  id: string;
  title: string;
  description: string;
  projects: MusicProject[];
}

export const MUSIC_PAGE_INTRO = `As an independent artist, I write music that draws from a wide variety of influences. The music that I write is always authentic to who I was, who I am, and what I was feeling, and I love it dearly and unconditionally despite whatever rough edges it may have.`;

export const MUSIC_PROJECT_GROUPS: MusicProjectGroup[] = [
  {
    id: 'featured-projects',
    title: 'Featured Projects',
    description: 'Solo releases and soundtrack work.',
    projects: [
      {
        slug: 'love-cycles',
        title: 'Love Cycles',
        description: 'Page in progress. Streaming links, embeds, music videos, and artwork will be added here.',
        detailDescription: 'Love Cycles is in progress. This page will hold embeds, streaming links, music videos, and related materials as they are assembled.',
      },
      {
        slug: 'reminiscences',
        title: 'Reminiscences',
        imgPath: '/assets/music/web/reminiscences.jpg',
        bannerImages: [
          '/assets/music/reminiscences/web/ill-see-you-in-my-dreams-cover.jpg',
          '/assets/music/reminiscences/web/lily-comparison-frames.jpg',
        ],
        role: 'Album',
        year: '2020',
        description: 'Page in progress. Listening links, visuals, and supporting materials will be added here.',
        detailDescription: 'My first full length album, full of music for lonely nights. Released January 12, 2020.\n\nAll songs written by, performed by, and produced by Brandon Lien.',
        videoUrl: 'https://www.youtube.com/embed/dB8AFshInnU',
        pdfUrl: '/assets/music/reminiscences/Brandon Lien - REMINISCENCES - Liner Notes.pdf',
        spotifyEmbedUrl: 'https://open.spotify.com/embed/album/28eKNxaUhILADxxdCh7kKy?utm_source=generator',
        appleMusicEmbedUrl: 'https://embed.music.apple.com/us/album/reminiscences/1490456375',
        bandcampEmbedUrl: 'https://brandonlien.bandcamp.com/album/reminiscences?from=embed',
        links: [
          {
            label: 'Full YouTube Playlist',
            href: 'https://www.youtube.com/playlist?list=PL2pSAL-QGzovMCZY6T33c6Femd0l8523O',
          },
        ],
      },
      {
        slug: 'meld-soundtrack',
        title: 'MELD Soundtrack',
        imgPath: '/assets/music/web/meld-soundtrack.jpg',
        role: 'Original Soundtrack',
        description: 'Page in progress. Cues, credits, embeds, and platform links will be added here.',
      },
      {
        slug: 'aimless',
        title: 'Aimless',
        imgPath: '/assets/music/web/aimless.jpg',
        description: 'Page in progress. Music video, streaming links, and project notes will be added here.',
      },
    ],
  },
  {
    id: 'collaborations',
    title: 'Collaborations',
    description: 'Work made with and alongside other artists.',
    projects: [
      {
        slug: 'aspirations',
        title: 'Aspirations',
        imgPath: '/assets/music/web/aspirations.jpg',
        description: 'Page in progress. Credits, embeds, and release links will be added here.',
      },
      {
        slug: 'just-out-of-focus',
        title: 'Just Out of Focus',
        imgPath: '/assets/music/web/just-out-of-focus.jpg',
        description: 'Page in progress. Streaming links, media embeds, and accompanying visuals will be added here.',
      },
    ],
  },
];
