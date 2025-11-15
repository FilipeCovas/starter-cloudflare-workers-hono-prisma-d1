import { fromHono } from "chanfana";
import { Hono } from "hono";
import { TaskCreate } from "./endpoints/taskCreate";
import { TaskDelete } from "./endpoints/taskDelete";
import { TaskFetch } from "./endpoints/taskFetch";
import { TaskList } from "./endpoints/taskList";
import { PrismaClient } from "./generated/prisma";
import { PrismaD1 } from "@prisma/adapter-d1";
import { IAppContext } from "./types";

// Start a Hono app
const app = new Hono<IAppContext>();

app.use(async (c, next) => {
  if (!c.get("prisma")) {
    const adapter = new PrismaD1({
      CLOUDFLARE_D1_TOKEN: c.env.CLOUDFLARE_D1_TOKEN!,
      CLOUDFLARE_ACCOUNT_ID: c.env.CLOUDFLARE_ACCOUNT_ID!,
      CLOUDFLARE_DATABASE_ID: c.env.CLOUDFLARE_DATABASE_ID!,
    });

    const prisma = new PrismaClient({ adapter });

    /* const prisma = new PrismaClient({ datasourceUrl: databaseUrl })
    .$extends(withAccelerate()); */

    c.set("prisma", prisma);
  }
  return await next();
});

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: "/",
});

// Register OpenAPI endpoints
openapi.get("/api/tasks", TaskList);
openapi.post("/api/tasks", TaskCreate);
openapi.get("/api/tasks/:taskSlug", TaskFetch);
openapi.delete("/api/tasks/:taskSlug", TaskDelete);

// You may also register routes for non OpenAPI directly on Hono
// app.get('/test', (c) => c.text('Hono!'))

// Export the Hono app
export default app;
