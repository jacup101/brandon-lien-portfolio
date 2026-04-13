export enum PostProductionWorkType {
  Feature = 'Feature',
  Short = 'Short',
  Vertical = 'Vertical',
}

export interface PostProductionWork {
  title: string;
  role: string;
  type: PostProductionWorkType;
  year: string;
  link: string;
  imgPath: string;
  featured: boolean;
}

export const DEFAULT_POST_PRODUCTION_WORK: PostProductionWork = {
  title: 'Guardians of the Galaxy',
  role: 'Sound Designer',
  type: PostProductionWorkType.Feature,
  year: '2014',
  link: 'https://www.imdb.com/title/tt2015381/',
  imgPath: '/assets/film/web/placeholder.png',
  featured: true,
};
