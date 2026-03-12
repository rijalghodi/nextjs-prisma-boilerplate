import { FileResponse } from "./file.type";

// Enums
export enum UserRole {
  ADMIN = "ADMIN",
  SUPERADMIN = "SUPERADMIN",
  STAFF = "STAFF",
  GUEST = "GUEST",
}

// Models
export type User = {
  id: string;
  email: string;
  emailVerifiedAt?: Date | null;
  name?: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
  avatarFile?: FileResponse | null;
  avatarFileId?: string | null;
};
