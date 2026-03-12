import { UserRole } from "@/types/user.type";
import { BadgeVariant } from "@/components/ui/badge";

// Default status mapping
export const UserRoleProps: Record<UserRole, { label: string; variant: BadgeVariant }> = {
  [UserRole.SUPERADMIN]: {
    label: "Super Admin",
    variant: "premium",
  },
  [UserRole.ADMIN]: {
    label: "Admin",
    variant: "success",
  },
  [UserRole.STAFF]: {
    label: "Staff",
    variant: "info",
  },
  [UserRole.GUEST]: {
    label: "Guest",
    variant: "warning",
  },
} as const;

// Function to get status properties
export const getUserRoleProps = (role: UserRole): { label: string; variant: BadgeVariant } => {
  return UserRoleProps[role] || { label: "Unknown", variant: "success" };
};

export const roleList: { value: UserRole; label: string; variant: BadgeVariant }[] = [
  {
    value: UserRole.SUPERADMIN,
    label: "Super Admin",
    variant: "premium",
  },
  {
    value: UserRole.ADMIN,
    label: "Admin",
    variant: "success",
  },
  {
    value: UserRole.STAFF,
    label: "Staff",
    variant: "info",
  },
  {
    value: UserRole.GUEST,
    label: "Guest",
    variant: "warning",
  },
] as const;
