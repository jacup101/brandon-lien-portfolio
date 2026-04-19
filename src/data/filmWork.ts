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
}

export const FILM_WORK: FilmItem[] = [
  {
    slug: 'el-malcriado',
    title: 'El Malcriado: The Voice of the Farm Worker',
    year: '2024',
    role: 'Director, Editor',
    blurb: 'Documentary short film about the publication El Malcriado and the role of its first run during the farmworker movement. Created as a part of the Farmworker Movement Collection by the Tom & Ethel Bradley Center at California State University Northridge. Recipient of National Endowment for the Humanities grant.',
    imgPath: '/assets/film/web/el-malcriado.jpg',
    description: 'A documentary about the voice of the farmworker movement, the publication El Malcriado, covering the first run from its inception in 1964 to 1967. El Malcriado played a pivotal role in distributing information about the strike, boycott, and union; its satirical cartoons and editorials also captured the cultural revolutionary inspired psyche of the movement.',
    videoUrl: 'https://www.youtube.com/embed/5OqH0IIgEY8',
    credit: 'Created using oral histories and photographic material from collections at the California State University Northridge Tom and Ethel Bradley Center. Recipient of National Endowment for the Humanities grant. © Tom and Ethel Bradley Center',
  },
  {
    slug: 'shades-of-trish',
    title: 'Shades of Trish',
    year: '2021',
    role: 'Director, Producer',
    blurb: 'Documentary short film about Trish Thuy Trang, a Vietnamese American singer, entrepreneur, mother, and artist. Created for California State University Northridge Vietnamese Student Association\'s Vietnamese Culture Night.',
    imgPath: '/assets/film/web/shades-of-trish.jpg',
    description: 'Created for California State University Northridge Vietnamese Student Association\'s Vietnamese Culture Night. This documentary is about Trish Thuy Trang, a Vietnamese American singer, entrepreneur, mother, and artist.',
    videoUrl: 'https://www.youtube.com/embed/cQIKE_zjR0U',
    credits: [
      { role: 'Directed and Produced by', names: 'Brandon Lien' },
      { role: 'Executive Producers', names: 'Tommy Trang & Tinn Ou' },
      { role: 'Co-producer', names: 'John Lee' },
      { role: 'Production Manager', names: 'Kelly Tsan' },
      { role: 'Assistant Editor', names: 'Brandon Tran' },
      { role: 'Visual Effects', names: 'Jonathan Park' },
      { role: 'Transcription', names: 'Dylan Djoenadi' },
      { role: 'Additional Photography', names: 'Andrea Ornelas, Brandon Tran, Shou Jin, Brian Ly' },
      { role: 'Special thanks', names: 'Megumi Ikeda, Sophia Ha, Debra Duguil, John Lam, Ashley Yu, Nicole Prasertsit, An\u00A0Nguyen, An\u00A0Pham, Allison\u00A0Dang' },
    ],
    credit: 'Music and footage courtesy of Asia Entertainment, Inc. and Trish Thuy Trang\nCalifornia State University, Northridge - Vietnamese Student Association\n© 2021 by Brandon Lien. All rights reserved.',
    laurels: ['/assets/laurel-afla-2021.png'],
  },
  {
    slug: 'csun-bradley-center',
    title: 'CSUN Bradley Center',
    role: 'Video Editor, Videographer',
    blurb: 'The Tom & Ethel Bradley Center at California State University Northridge is a repository and archive of photographic and audiovisual work primarily documenting the social, cultural, and political lives of the diverse communities of Los Angeles and Southern California from the 1910s to present.',
    imgPath: '/assets/csun-bradley-center.png',
    imgContain: true,
    subtitleLayout: true,
    galleryColumns: 3,
    description: 'I have worked at California State University Northridge\'s Tom & Ethel Bradley Center since 2021 as a video editor, videographer, transcriptionist, and researcher.\n\nThe Bradley Center is a repository and archive of photographic and audiovisual work primarily documenting the social, cultural, and political lives of the diverse communities of Los Angeles and Southern California from the 1910s to present.\n\nI started working as a student, and then after graduating, continued to work under a grant from the National Endowment for the Humanities. I worked on the Black Power Archives, Black Entertainment Archives, and Farmworker Movement oral history collections.\n\nSelected work below; more can be found on the Bradley Center\'s website and YouTube channel.',
    gallery: [
      { type: 'link', url: '/film/el-malcriado', label: 'El Malcriado: The Voice of the Farm Worker', imgPath: '/assets/film/web/el-malcriado.jpg' },
      { type: 'video', url: 'https://www.youtube.com/embed/rvLna6YadDY' },
      { type: 'video', url: 'https://www.youtube.com/embed/V7W1o69llZM' },
      { type: 'video', url: 'https://www.youtube.com/embed/3nLvwHfOB38' },
      { type: 'video', url: 'https://www.youtube.com/embed/Lv8zWMfWq4M' },
      { type: 'video', url: 'https://www.youtube.com/embed/CRx4P9XlvXk' },
      { type: 'video', url: 'https://www.youtube.com/embed/dbdjgOJLT1c' },
      { type: 'video', url: 'https://www.youtube.com/embed/PggDy9ggZhA' },
      { type: 'video', url: 'https://www.youtube.com/embed/HG9sZ3KkEGo' },
      { type: 'video', url: 'https://www.youtube.com/embed/OA3vVwGAbRw' },
      { type: 'video', url: 'https://www.youtube.com/embed/8azyQUgFkYw' },
      { type: 'video', url: 'https://www.youtube.com/embed/WJrLuqNFip4' },
      { type: 'video', url: 'https://www.youtube.com/embed/so5orX3HCIY' },
    ],
  },
  {
    slug: 'museum-of-social-justice',
    title: 'Museum of Social Justice',
    role: 'Videographer',
    blurb: 'Located in the heart of Los Angeles on Olvera Street, the Museum of Social Justice is dedicated to telling the neglected stories of the diverse people of Los Angeles from the perspective of marginalized groups.',
    imgPath: '/assets/museum-of-social-justice.png',
    imgContain: true,
    heroImg: '/assets/msj-2023.jpg',
    description: 'Videography work for the Museum of Social Justice\'s exhibitions, events, and annual Tardeada gatherings that honor the social justice work and legacies of prominent community members. The Museum of Social Justice is dedicated to telling the neglected stories of the diverse people of Los Angeles from the perspective of marginalized groups.',
    videoUrl: 'https://www.youtube.com/embed/MGLViK_wpGo',
  },
  {
    slug: 'music-videos',
    title: 'Music Videos',
    role: '',
    blurb: '',
    galleryColumns: 3,
    gallery: [
      { type: 'video', url: 'https://www.youtube.com/embed/g_doKsKotOE', title: 'Gertrude - Rude EP Visualizers', role: 'Director, Editor' },
      { type: 'video', url: 'https://www.youtube.com/embed/mMUrLdyDnOw', title: 'James McNary - Aspirations (feat. Brandon Lien)', role: 'Director' },
      { type: 'video', url: 'https://www.youtube.com/embed/yJhgF9sA41Y', title: 'Brandon Lien - Aimless', role: 'Director, Editor, Animator' },
      { type: 'video', url: 'https://www.youtube.com/embed/dB8AFshInnU', title: 'Brandon Lien - I\'ll See You In My Dreams', role: 'Director, Editor' },
      { type: 'video', url: 'https://www.youtube.com/embed/r7oS8wt8nsw', title: 'Brandon Lien - Yumeji\'s Theme (In the Mood For Love Cover)', role: 'Director, Editor' },
      { type: 'video', url: 'https://www.youtube.com/embed/o4S4gwpT47w', title: 'Brandon Lien - NBA Theme Songs Cover', role: 'Director, Editor' },
      { type: 'video', url: 'https://www.youtube.com/embed/h8r2mE9Xkck', title: 'S.A.F. - Rick Dalton', role: 'Re-recording Mixer' },
      { type: 'video', url: 'https://www.youtube.com/embed/tzVKfI6TncM', title: 'Sophie Marks - Easy To Dream', role: 'Sound Designer' },
    ],
  },
  {
    slug: 'music-session-videography',
    title: 'Music Session Videography',
    role: '',
    blurb: '',
    gallery: [
      { type: 'video', url: 'https://www.youtube.com/embed/1A271MZ2jys' },
      { type: 'video', url: 'https://www.youtube.com/embed/k2Ox7SsVnJ8' },
      { type: 'video', url: 'https://www.youtube.com/embed/IVTmTyScfrc' },
      { type: 'video', url: 'https://www.youtube.com/embed/DNNycSUjFzY' },
      { type: 'video', url: 'https://www.youtube.com/embed/gONlKlTKEqY' },
      { type: 'video', url: 'https://www.youtube.com/embed/O-0iqO7T9L8' },
      { type: 'video', url: 'https://www.youtube.com/embed/gkgNBwVvBhQ' },
      { type: 'video', url: 'https://www.youtube.com/embed/RSE_6bG-NIE' },
      { type: 'video', url: 'https://www.youtube.com/embed/7U8VAdrFESk' },
      { type: 'video', url: 'https://www.youtube.com/embed/5yF8NMXHJhs' },
      { type: 'video', url: 'https://www.youtube.com/embed/veptj6ILMcU' },
      { type: 'video', url: 'https://www.youtube.com/embed/JUNUCXphgCM' },
      { type: 'video', url: 'https://www.youtube.com/embed/NtQ4XBNzkps' },
      { type: 'video', url: 'https://www.youtube.com/embed/yHCP4Fh30Q4' },
    ],
  },
  {
    slug: 'other-film-work',
    title: 'Other Film Work',
    role: '',
    blurb: '',
    gallery: [
      { type: 'link', url: 'https://www.instagram.com/p/DPwIH4vDjco/', label: 'One Battle After Another - Aerial Cinematography Breakdown with Dylan Goss Part 1', role: 'B Camera Operator', imgPath: '/assets/dylangoss1.jpg' },
      { type: 'link', url: 'https://www.instagram.com/p/DP_youCDD1g/', label: 'One Battle After Another - Aerial Cinematography Breakdown with Dylan Goss Part 2', role: 'B Camera Operator', imgPath: '/assets/dylangoss2.jpg' },
      { type: 'video', url: 'https://www.youtube.com/embed/raSp0dxSchU', title: 'Handmade Keyhole Fundraiser Video', role: 'Director of Photography' },
    ],
  },
];
