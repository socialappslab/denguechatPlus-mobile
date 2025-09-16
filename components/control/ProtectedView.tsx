/* eslint-disable @typescript-eslint/no-unused-vars */
import { PropsWithChildren } from "react";

import { IUser } from "@/schema/auth";
import { useStore } from "@/hooks/useStore";

export interface ProtectedViewProps extends PropsWithChildren {
  hasPermission?: string | string[];
  hasSomePermission?: string | string[];
  hasSomeResource?: string | string[];
}

const chekcHasPermission = (
  user: IUser,
  requiredPermission: string | string[],
): boolean => {
  if (Array.isArray(requiredPermission)) {
    return requiredPermission.every((permission) =>
      user.permissions?.includes(permission),
    );
  }
  return !!user.permissions?.includes(requiredPermission);
};

const checkHasSomePermission = (
  user: IUser,
  requiredPermission: string | string[],
): boolean => {
  if (Array.isArray(requiredPermission)) {
    return requiredPermission.some((permission) =>
      user.permissions?.includes(permission),
    );
  }
  return !!user.permissions?.includes(requiredPermission);
};

const checkHasSomeResource = (
  user: IUser,
  requiredResource: string | string[],
): boolean => {
  if (Array.isArray(requiredResource)) {
    return requiredResource.some((resource) =>
      user.permissions?.some((element) => {
        const resourceOfPermission = element.split("-")[0];
        return resourceOfPermission === resource;
      }),
    );
  }
  return !!user.permissions?.some((element) => {
    const resourceOfPermission = element.split("-")[0];
    return resourceOfPermission === requiredResource;
  });
};

export default function ProtectedView({
  children,
  hasPermission,
  hasSomePermission,
  hasSomeResource,
}: ProtectedViewProps) {
  const userProfile = useStore((state) => state.userProfile);

  if (!userProfile) return null;

  if (hasPermission && chekcHasPermission(userProfile, hasPermission)) {
    return <>{children}</>;
  }

  if (
    hasSomePermission &&
    checkHasSomePermission(userProfile, hasSomePermission)
  ) {
    return <>{children}</>;
  }

  if (hasSomeResource && checkHasSomeResource(userProfile, hasSomeResource)) {
    return <>{children}</>;
  }
}
