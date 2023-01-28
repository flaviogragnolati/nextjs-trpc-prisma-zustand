import { FC } from "react";

import C from "@/constants";

export const roles = ["superadmin", "admin", "user", "audit"] as const;
export type UserSystemRole = (typeof roles)[number];

export interface ComponentAuthI {
  auth?: {
    name?: string;
    role?: (typeof C.roles)[number];
    loading?: FC;
    unauthorized?: FC;
    redirect?: (typeof C.unauthorizedRedirect)[number];
    hideIfAuthenticated?: boolean;
  };
}
