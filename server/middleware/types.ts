export interface SystemsContext {}

declare module "hono" {
  interface Context {
    systems: SystemsContext;
  }
}
