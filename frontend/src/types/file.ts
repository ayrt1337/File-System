export interface UserFile {
  id: string;
  name: string;
  preview?: string | null;
  format: string;
  size: number;
  isFavorite?: boolean;
  createdAt: string;
  lastUpdate: string | null;
}
