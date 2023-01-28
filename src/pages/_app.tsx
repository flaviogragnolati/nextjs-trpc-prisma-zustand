import type { NextComponentType } from 'next';
import { type AppType, type AppProps } from 'next/app';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import '@/styles/globals.css';

import { api } from '@/utils/api';
import AppLayout from '@/client/layouts/AppLayout';
import AuthGuard from '@/client/components/AuthGuard';
import HydratedLayout from '@/client/layouts/HydratedLayout';

import type { ComponentAuthI } from '@/types';

type CustomAppProps = AppProps & {
  Component: NextComponentType & ComponentAuthI;
};

const refetchInterval = 1000 * 60 * 60 * 24 * 7; // 7 days

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}: CustomAppProps) => {
  return (
    <SessionProvider
      session={session}
      refetchOnWindowFocus={false}
      refetchInterval={0}
      refetchWhenOffline={false}
    >
      <HydratedLayout>
        <AppLayout>
          {Component.auth ? (
            <AuthGuard auth={Component.auth}>
              <Component {...pageProps} />
            </AuthGuard>
          ) : (
            <Component {...pageProps} />
          )}
        </AppLayout>
      </HydratedLayout>
      <ReactQueryDevtools initialIsOpen={false} />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
