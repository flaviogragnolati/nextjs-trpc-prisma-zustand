import cors from "nextjs-cors";
import type { NextApiRequest, NextApiResponse } from "next";
import { createNextApiHandler } from "@trpc/server/adapters/next";

import { env } from "@/env/server.mjs";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

// export API handler
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Enable cors
  await cors(req, res);

  // Create and call the tRPC handler
  return createNextApiHandler({
    router: appRouter,
    createContext: createTRPCContext,
    onError({ error, type, path, input, ctx, req }) {
      if (env.NODE_ENV === "development") {
        console.error(
          `❌ tRPC procedure (${type}) failed on ${path}: ${error}`
        );
      }
    },
  })(req, res);
};
export default handler;
