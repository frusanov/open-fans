import { MiddlewareHandler } from "hono";

/**
 * Cache middleware for static assets
 * @param seconds - Cache duration in seconds
 * @returns Hono middleware handler
 */
export function cache(seconds: number): MiddlewareHandler {
  return async (c, next) => {
    if (!c.req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
      return next();
    }

    await next();

    if (c.res.status === 200) {
      c.res.headers.set("Cache-Control", `public, max-age=${seconds}`);
    }
  };
}
