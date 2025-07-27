import type { MiddlewareHandler } from "hono";

declare module "./types" {
  interface SystemsContext {
    auth: {
      user: { id: string };
    };
  }
}

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const user = { id: "123" };

  c.systems.auth = {
    user,
  };

  await next();
};
