import { Hono } from "hono";
import { contextMiddleware } from "lib/context";
import { createHonoServer } from "react-router-hono-server/node";
import { serveStatic } from "@hono/node-server/serve-static";
import { systemsMiddleware } from "./middleware/systems";
import { authMiddleware } from "./middleware/auth";

export const server = new Hono();

server.use(contextMiddleware);
server.use(systemsMiddleware);
server.use(authMiddleware);

server.use("/favicon.ico", serveStatic({ path: "./static/favicon.ico" }));
server.use("/static/*", serveStatic({ root: "." }));

export default await createHonoServer({
  app: server,
});
