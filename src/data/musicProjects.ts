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
        carouselImages: [
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
        bandcampEmbedUrl: 'https://bandcamp.com/EmbeddedPlayer/album=3398792718/size=large/bgcol=333333/linkcol=0f91ff/artwork=small/transparent=true/',
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
        role: 'Album',
        year: '2018',
        description: 'Page in progress. Cues, credits, embeds, and platform links will be added here.',
        detailDescription: 'An album of songs written for my short films I made in high school. Released December 21, 2018.\n\nAll songs written by, performed by, and produced by Brandon Lien.',
        videoUrl: 'https://www.youtube.com/embed/LvddUb418-4',
        extraVideoUrls: ['https://www.youtube.com/embed/yeQeI2DDSWQ'],
        spotifyEmbedUrl: 'https://open.spotify.com/embed/album/3cWp6W4wqaE7ew93dPBoDs?utm_source=generator',
        appleMusicEmbedUrl: 'https://embed.music.apple.com/us/album/meld-soundtrack/1487523018',
        bandcampEmbedUrl: 'https://bandcamp.com/EmbeddedPlayer/album=1362522846/size=large/bgcol=333333/linkcol=0f91ff/artwork=small/transparent=true/',
      },
      {
        slug: 'aimless',
        title: 'Aimless',
        imgPath: '/assets/music/web/aimless.jpg',
        role: 'Single',
        year: '2021',
        albumName: 'Reminiscences',
        description: 'Page in progress. Music video, streaming links, and project notes will be added here.',
        detailDescription: 'A single I wrote about the feelings I felt the months after releasing my album Reminiscences. Released February 19, 2021.',
        videoUrl: 'https://www.youtube.com/embed/yJhgF9sA41Y',
        spotifyEmbedUrl: 'https://open.spotify.com/embed/album/1jlQuCiXIf4tsV8vXwlUpa?utm_source=generator',
        appleMusicEmbedUrl: 'https://embed.music.apple.com/us/album/aimless-single/1548195504',
        bandcampEmbedUrl: 'https://bandcamp.com/EmbeddedPlayer/track=2924214827/size=large/bgcol=333333/linkcol=0f91ff/tracklist=false/artwork=small/transparent=true/',
        bandcampEmbedHeight: 120,
        carouselImages: [
          '/assets/music/aimless/web/aimless.jpg',
          '/assets/music/aimless/web/aimless-face-destruction.jpg',
          '/assets/music/aimless/web/aimless-washed-out-face.jpg',
          '/assets/music/aimless/web/aimless-face-series-1.jpg',
          '/assets/music/aimless/web/aimless-face-series-2.jpg',
          '/assets/music/aimless/web/aimless-face-series-3.jpg',
        ],
      },
    ],
  },
  {
    id: 'collaborations',
    title: 'Collaborations',
    description: 'Work made with and alongside other artists.',
    projects: [
      {
        slug: 'starships-in-galactus',
        title: 'Starships in Galactus',
        imgPath: '/assets/music/web/starships-in-galactus.jpg',
        role: 'Track',
        year: '2024',
        description: 'A track by KawaiiSteez featuring Brandon Lien, from A Moment 2 Forget (2024).',
        detailDescription: 'A track by KawaiiSteez featuring Brandon Lien, from the album A Moment 2 Forget. Released 2024.',
        albumName: 'A Moment 2 Forget',
        bandcampEmbedUrl: 'https://bandcamp.com/EmbeddedPlayer/album=3544757301/size=large/bgcol=333333/linkcol=0f91ff/tracklist=false/artwork=small/track=3280428417/transparent=true/',
        bandcampEmbedHeight: 120,
        soundcloudEmbedUrl: 'https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fkawaiisteez%2Fstarships-in-galactus-ft&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false',
      },
      {
        slug: 'aspirations',
        title: 'Aspirations',
        imgPath: '/assets/music/web/aspirations.jpg',
        role: 'Track',
        year: '2022',
        description: 'A track featured on James McNary\'s album It Got Scary (2022).',
        detailDescription: 'A track featured on James McNary\'s album It Got Scary. Released 2022.',
        albumName: 'It Got Scary',
        videoUrl: 'https://www.youtube.com/embed/mMUrLdyDnOw',
        appleMusicEmbedUrl: 'https://embed.music.apple.com/us/song/aspirations/1647579246',
        tidalEmbedUrl: 'https://embed.tidal.com/tracks/251220519',
        embedLayout: 'side-by-side',
        carouselImages: [
          '/assets/music/aspirations/web/title-still.jpg',
          '/assets/music/aspirations/web/lien-still-1.jpg',
          '/assets/music/aspirations/web/lien-still-2.jpg',
        ],
        links: [
          { label: 'Aspirations Guitar Playthrough', href: 'https://youtu.be/bewwYLQGKzw' },
        ],
      },
      {
        slug: 'just-out-of-focus',
        title: 'Just Out of Focus',
        imgPath: '/assets/music/web/just-out-of-focus.jpg',
        role: 'Track',
        year: '2020',
        description: 'A track featured on Jam \'n\' Slate\'s album Is There Room in the Story For Us? (2020).',
        detailDescription: 'A track featured on Jam \'n\' Slate\'s album Is There Room in the Story For Us? Released April 17, 2020.',
        albumName: 'Is There Room in the Story For Us?',
        spotifyEmbedUrl: 'https://open.spotify.com/embed/track/54woOw600GX4seWbu68dgG?utm_source=generator',
        appleMusicEmbedUrl: 'https://embed.music.apple.com/us/album/just-out-of-focus-feat-brandon-lien/1503131684?i=1503131686',
        bandcampEmbedUrl: 'https://bandcamp.com/EmbeddedPlayer/album=3026327990/size=large/bgcol=333333/linkcol=0f91ff/tracklist=false/artwork=small/track=191630611/transparent=true/',
        bandcampEmbedHeight: 120,
      },
    ],
  },
];
