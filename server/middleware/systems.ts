import type { MiddlewareHandler } from "hono";
import { db } from "lib/db";
import type { SystemsContext } from "./types";

declare module "./types" {
  interface SystemsContext {
    db: typeof db;
  }
}

export const systemsMiddleware: MiddlewareHandler = async (c, next) => {
  if (!c.systems) {
    c.systems = {} as unknown as SystemsContext;
  }

  c.systems.db = db;

  await next();
};
