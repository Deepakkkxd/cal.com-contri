import type { PLATFORM_PERMISSION } from "@calcom/platform-types";

export const hasPermission = (userPermissions: number, permission: PLATFORM_PERMISSION): boolean => {
  // Use bitwise AND to check if each required permission is present
  return (userPermissions & permission) === permission;
};

export const hasPermissions = (userPermissions: number, permissions: PLATFORM_PERMISSION[]): boolean => {
  // Use bitwise AND to check if each required permission is present
  return permissions.every((permission) => hasPermission(userPermissions, permission));
};
