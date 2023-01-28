/**
 * @file Constants
 * @description Constants for the application. These are passed to the `trpc` context,
 * and can be accessed from any `trpc` query/mutation.
 */
const CONSTANTS = {
  roles: ['superadmin', 'admin', 'user', 'audit'],
  roleLevel: {
    superadmin: 1,
    admin: 2,
    user: 3,
    audit: 4,
  },
  unauthorizedRedirect: ['/auth/login'],
  routes: {
    home: '/',
    login: '/auth/login',
  },
} as const;

export default CONSTANTS;

export type CONSTANTST = typeof CONSTANTS;
