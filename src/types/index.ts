export { type Maybe } from "@trpc/server";

export * from "./auth.type";
export * from "./errors.type";
export * from "./next.type";

export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};
