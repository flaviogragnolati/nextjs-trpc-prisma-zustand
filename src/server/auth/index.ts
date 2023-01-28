import { type Maybe } from '@trpc/server';
import { type GetServerSidePropsContext } from 'next';
import { type Session, unstable_getServerSession } from 'next-auth';

import { prisma } from '@/db';
import { getAuthOptions } from '@/pages/api/auth/[...nextauth]';

/**
 * Wrapper for unstable_getServerSession, used in trpc createContext and the
 * restricted API route
 *
 * Don't worry too much about the "unstable", it's safe to use but the syntax
 * may change in future versions
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */

export const getServerAuthSession = async (ctx: {
  req: GetServerSidePropsContext['req'];
  res: GetServerSidePropsContext['res'];
}) => {
  return await unstable_getServerSession(
    ctx.req,
    ctx.res,
    getAuthOptions(ctx.req as any, ctx.res as any), //TODO: Check types
  );
};

/**
 * Gets the DB user from the session
 * @param { { session: Maybe<Session> }}
 * @returns {Promise<UserSystem | null>}
 */
export async function getUserFromSession({
  session,
}: {
  session: Maybe<Session>;
}) {
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
  });
  return user;
}
