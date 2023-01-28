import type { DefaultSession, DefaultUser } from "next-auth";
import { type UserSystemRole } from "./auth.type";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user?: {
      id?: string;
      role?: UserSystemRole;
    } & DefaultSession["user"];
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User extends DefaultUser {
    id?: string;
    role?: UserSystemRole;
    name?: string;
  }
}
