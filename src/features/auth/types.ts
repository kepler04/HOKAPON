import type { UserRole } from "@/types/database.types";

export type { Profile, UserRole } from "@/types/database.types";

/** The authenticated admin session resolved server-side. */
export interface AdminSession {
  userId: string;
  email: string | undefined;
  role: UserRole;
  fullName: string | null;
}
