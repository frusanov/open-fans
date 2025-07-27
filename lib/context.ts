import { nanoid } from "nanoid";
import { type MiddlewareHandler, type Context } from "hono";

const contexts: Record<string, Context> = {};

export const getHonoContext = (request: Request) => {
  const requestId = request.headers.get("X-Request-Id") as string;
  return contexts[requestId];
};

export const contextMiddleware: MiddlewareHandler = async (c, next) => {
  const id = nanoid();

  c.req.raw.headers.set("X-Request-Id", id);

  contexts[id] = c;

  await next();

  delete contexts[id];
};
