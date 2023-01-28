import { isEmpty } from 'lodash';
import { useRouter } from 'next/router';
import { type Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import { PropsWithChildren, ReactNode, useEffect } from 'react';

import C from '@/constants';
import { useAppStore } from '@/store';
import { ComponentAuthI } from '@/types';

interface AuthProps extends ComponentAuthI {
  session?: Session;
}

interface Props extends AuthProps, PropsWithChildren<{}> {
  children: ComponentAuthI & JSX.Element;
}

/**
 * Mock function to check if user has the required role to visit the page.
 * This function should be replaced with a function that checks the user role.
 * Can be integrated with CASL or any other role based authorization library.
 * @param role
 * @param userRole
 * @returns
 */
function checkUserRole(
  role: (typeof C.roles)[number],
  userRole?: (typeof C.roles)[number],
) {
  if (!userRole) return false;
  return true;
}

/**
 * Protected routes must include the `auth` config.
 * Exported protected componentes must include:
 *
 * Component.auth = {
 *   // Name of the page. Only for debugging purposes.
 *   name: 'some page name',
 *   // Auth Role that the user must have to visit this page.
 *   role: 'admin',
 *   // Component to render while loading.
 *   loading: <LoadingComponent/>,
 *   // Component to render when user is logged in but unauthorized.
 *   unauthorized: '<UnauthorizedComponent>',
 *   // Route to redirect if user is not logged in.
 *   redirect: '/login-url',
 *   // If Authenticated user can view this page. Default is false.
 *   // Set to true to hide pages from users that are logged in.
 *   // Example: Login page, etc.
 *   hideIfAuthenticated: false,
 * };
 *
 * 1. Check if user is logged in
 * 1.1 If not, redirect to login page
 * 2. Check user role
 * 2.1 if Unauthorized & UnauthorizedComponent is set, render it
 * 2.2 if Unauthorized & UnauthorizedComponent is not set, redirect to `redirect` page
 * 4. Render `Loading` component if `useSession` is still loading
 * 5. Render `children` if user is logged in and authorized
 * 6. Update `auth` & `user` in store
 */
export default function AuthGuard({ auth, children }: Props) {
  let component: ReactNode;
  const router = useRouter();

  const { data: session, status } = useSession();

  const setUser = useAppStore((state) => state.setUser);
  const clearUser = useAppStore((state) => state.clearUser);

  // There is no auth config, so its a public route
  if (isEmpty(auth)) {
    return children;
  }

  const {
    role: routeRole,
    loading: LoadingComponent,
    unauthorized: UnauthorizedComponent,
    redirect,
    hideIfAuthenticated,
  } = auth;

  if (status === 'loading') {
    // if useSession status is loading, render the loading component
    if (LoadingComponent) component = <LoadingComponent />;
    else component = <div>Some Default Loading Component</div>; // default loading component
  }
  // if useSession status is unauthenticated,
  // render the unauthorized component or redirect to specific route, or login
  else if (status === 'unauthenticated') {
    if (UnauthorizedComponent) component = <UnauthorizedComponent />;
    else if (redirect) router.push(redirect);
    else router.push(C.routes.login);
    clearUser(); // TODO: clear store
  }
  // for pages that should not be displayed if user is authenticated
  else if (status === 'authenticated' && hideIfAuthenticated) {
    router.push(C.routes.home);
  }
  // if useSession status is authenticated, check if user has the correct role
  else if (status === 'authenticated') {
    const { user } = session;

    const userRole = user?.role;
    // if there is no role, render the children
    if (!routeRole) {
      component = children;
    } else {
      const isAuthorized = checkUserRole(routeRole, userRole);
      // if user is not authorized
      // render the unauthorized component or redirect to specific route, or login
      if (!isAuthorized) {
        if (UnauthorizedComponent) component = <UnauthorizedComponent />;
        else if (redirect) router.push(redirect);
        else router.push(C.routes.login);
        // clearUser();
      }
      // if user is authorized, render the children
      component = children;
    }
    // update the store
    // setUser(user);
  }

  return <>{component}</>;
}
