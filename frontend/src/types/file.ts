export interface UserFile {
  id: string;
  name: string;
  preview?: string | null;
  url?: string | null;
  format: string;
  size: number;
  isFavorite: boolean;
  createdAt: string;
  lastUpdate: string | null;
  role?: number;
  isPublic?: boolean;
  publicRole?: number | null;
  sharedUsers?: {
    email: string;
    name: string;
    avatarUrl: string | null;
    role: "reader" | "editor";
  }[];
}
