export type PostProductionWorkType = 'Feature' | 'Short' | 'Vertical';

export interface AdminEntry {
  id: string;
  title: string;
  role: string;
  type: PostProductionWorkType;
  year: string;
  link: string;
  imgPath: string;
  featured: boolean;
  updatedAt: number;
}
