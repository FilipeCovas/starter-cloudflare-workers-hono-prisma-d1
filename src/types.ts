import type { PrismaClient } from "./generated/prisma/client.js";
import { DateTime, Str } from "chanfana";
import type { Context } from "hono";
import { z } from "zod";

export interface IAppContext {
  Bindings: Env;
  Variables: {
    prisma: PrismaClient;
  };
}

export type AppContext = Context<IAppContext>;

export const Task = z.object({
  name: Str({ example: "lorem" }),
  slug: Str(),
  description: Str({ required: false }),
  completed: z.boolean().default(false),
  due_date: DateTime(),
});
