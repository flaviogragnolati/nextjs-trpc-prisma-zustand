import Cookies from 'cookies';
import { randomUUID } from 'crypto';
import { decode, encode } from 'next-auth/jwt';
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import NextAuth, { type SessionOptions, type NextAuthOptions } from 'next-auth';

import { prisma } from '@/db';
import { env } from '@/env/server.mjs';

export const adapter = PrismaAdapter(prisma);

const session: Partial<SessionOptions> = {
  maxAge: 30 * 24 * 60 * 60, // 30 days
  updateAge: 24 * 60 * 60, // 24 hours
};

export const staticAuthOptions: NextAuthOptions = {
  session,
  callbacks: {
    session({ session, user, token }) {
      // Include `id`, `role` & `name` on session
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
        session.user.name = user.name;
      }
      return session;
    },
    jwt({ token, user, account, profile, isNewUser }) {
      // If the user is authenticated, add the user id to the JWT token
      if (user && 'id' in user) {
        token.role = user.role;
      }
      return token;
    },
  },
  adapter,
  providers: [
    CredentialsProvider({
      type: 'credentials',
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'text',
          placeholder: 'jsmith@mail.com',
        },
        password: { label: 'Password', type: 'password' },
      },
      /**
       * @param credentials
       * @param req
       * @returns A user object or null if the credentials are invalid
       */
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        let user;
        try {
          user = await prisma.user.findUnique({
            where: { email: credentials?.email },
          });
        } catch (error) {
          console.log('Error authorizing user', error);
        }
        if (!user) {
          return null;
        }
        const normalizedUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        } as unknown;
        return normalizedUser; // !workaround. @see https://github.com/nextauthjs/next-auth/issues/2701
      },
    }),
  ],
  // cookies: {
  //   sessionToken: {
  //     name: 'next-auth.session-token',
  //     options: {
  //       httpOnly: true,
  //       sameSite: 'lax',
  //       path: '/',
  //       secure: env.NODE_ENV === 'production',
  //     },
  //   },
  // },
  pages: {
    signIn: '/auth/signin',
  },
  debug: env.NODE_ENV === 'development',
};

export const getAuthOptions = (
  req: NextApiRequest,
  res: NextApiResponse,
): NextAuthOptions => {
  return {
    ...(staticAuthOptions || {}),
    callbacks: {
      ...staticAuthOptions.callbacks,
      async signIn({ user, account, profile, email, credentials }) {
        // Check if this sign in callback is being called in the credentials authentication flow.
        // If so, use the next-auth adapter to create a session entry in the database
        // (SignIn is called after authorize so we can safely assume the user
        // is valid and already authenticated).
        if (
          req.query?.nextauth?.includes('callback') &&
          req.query?.nextauth?.includes('credentials') &&
          req.method === 'POST'
        ) {
          if (user && 'id' in user) {
            const sessionToken = randomUUID();
            const sessionExpiry = new Date(Date.now() + session.maxAge! * 1000);
            const forwarded = req.headers?.[
              'x-forwarded-for'
            ] as unknown as string;
            const ip = forwarded
              ? forwarded.split(/, /)[0]
              : req.socket.remoteAddress;

            const sessionData = {
              sessionToken,
              userId: user.id,
              expires: sessionExpiry,
              ip,
            } as any;
            try {
              await adapter.createSession(sessionData);
            } catch (error) {
              console.log('Error creating session', error);
            }

            const cookies = new Cookies(req, res);

            cookies.set('next-auth.session-token', sessionToken, {
              expires: sessionExpiry,
            });
          }
        }
        return true;
      },
    },
    jwt: {
      ...(staticAuthOptions.jwt || {}),
      // Customize the JWT encode and decode functions to overwrite
      // the default behaviour of storing the JWT token in the session cookie
      // when using credentials providers. Instead we will store the session
      // token reference to the session in the database.
      encode: async ({ token, secret, maxAge }) => {
        if (
          req.query?.nextauth?.includes('callback') &&
          req.query?.nextauth?.includes('credentials') &&
          req.method === 'POST'
        ) {
          const cookies = new Cookies(req, res);
          const cookie = cookies.get('next-auth.session-token');
          if (cookie) return cookie;
          else return '';
        }
        // Revert to default behaviour when not in the credentials provider callback flow
        return encode({ token, secret, maxAge });
      },
      decode: async ({ token, secret }) => {
        if (
          req.query?.nextauth?.includes('callback') &&
          req.query?.nextauth?.includes('credentials') &&
          req.method === 'POST'
        ) {
          return null;
        }

        // Revert to default behaviour when not in the credentials provider callback flow
        return decode({ token, secret });
      },
    },
  };
};

export default async function authHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  return await NextAuth(req, res, getAuthOptions(req, res));
}
