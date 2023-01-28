/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API
 *
 * These allow you to access things like the database, the session, etc, when
 * processing a request
 *
 */
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type Session } from "next-auth";

import { getServerAuthSession, getUserFromSession } from "@/server/auth";
import { prisma } from "@/db";
import constants from "@/constants";

interface CreateContextOptions extends Partial<CreateNextContextOptions> {
  session: Session | null;
  user: inferAsyncReturnType<typeof getUserFromSession>;
}

/**
 * This helper generates the "internals" for a tRPC context. If you need to use
 * it, you can export it from here
 *
 * Examples of things you may need it for:
 * - testing, so we dont have to mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
const createInnerTRPCContext = async (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    user: opts.user,
    prisma,
    constants,
  };
};

/**
 * This is the actual context you'll use in your router. It will be used to
 * process every request that goes through your tRPC endpoint
 * @link https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  // Get the session from the server using the unstable_getServerSession wrapper function
  const session = await getServerAuthSession({ req, res });
  // Get the user from the session
  const user = await getUserFromSession({ session });
  // Create the inner context
  const innerTRPCContext = await createInnerTRPCContext({ session, user });

  return {
    ...innerTRPCContext,
    req: opts.req,
    res: opts.res,
  };
};

export type TRPCContextT = inferAsyncReturnType<typeof createTRPCContext>;

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
import superjson from "superjson";
import { inferAsyncReturnType, initTRPC, TRPCError } from "@trpc/server";

const t = initTRPC.context<TRPCContextT>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

/**
 * 3. ROUTERS AND SUBROUTERS
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 *
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

import { logger } from "@/utils/logger";
import { isDev } from "@/utils/helpers";
/**
 * 4. MIDDLEWARE
 *
 * This is where you define reusable middleware that can be used
 * in your procedures.
 * They can be used directly in the `local` procedure, or in the
 * exported procedures
 * @see https://trpc.io/docs/middlewares
 */

/**
 * Middleware that normalizes the request.
 */
const normalizeRequest = t.middleware(({ ctx, next }) => {
  if (!ctx.req || !ctx.res) {
    throw new Error("You are missing `req` or `res` in your call.");
  }

  return next({
    ctx: {
      ...ctx,
      // We overwrite the context with the truthy `req` & `res`,
      // which will also overwrite the types used in your procedure.
      req: ctx.req,
      res: ctx.res,
    },
  });
});

/**
 * Middleware to measure performance
 */
const perfMiddleware = t.middleware(async ({ path, type, next }) => {
  performance.mark("Start");
  const result = await next();
  performance.mark("End");
  performance.measure(
    `[${result.ok ? "OK" : "ERROR"}][$1] ${type} '${path}'`,
    "Start",
    "End"
  );
  return result;
});

/**
 * Middleware to log requests
 */
const loggerMiddleware = t.middleware(async ({ path, type, next }) => {
  if (!isDev) return next();

  const result = await next();
  const msg = `[${result.ok ? "OK" : "ERROR"}][$1] ${type} '${path}'`;
  if (result.ok) {
    logger.log("info", msg);
  } else {
    logger.log("error", msg);
  }
  return result;
});

/**
 * Middleware that enforces users are logged in before running the procedure
 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
      // infers the `user` as non-nullable
      user: ctx.user,
    },
  });
});

/**
 * 5. PROCEDURES
 *
 * This is where you define your procedures. You should import these
 * a lot in the /src/server/api/routers folder.
 * Each exported procedure has it's own middleware stack.
 * @see https://trpc.io/docs/procedures
 */

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure
  .use(normalizeRequest)
  .use(perfMiddleware);

/**
 * Protected (authed) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use
 * this. It verifies the session is valid and guarantees ctx.session.user is not
 * null
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(normalizeRequest)
  .use(perfMiddleware)
  .use(enforceUserIsAuthed);
