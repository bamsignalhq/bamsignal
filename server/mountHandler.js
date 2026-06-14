/** Adapts Vercel-style default export handlers for Express. */
export function mountHandler(router, method, path, handler) {
  router[method](path, async (req, res, next) => {
    try {
      await handler(req, res);
      if (!res.headersSent) res.end();
    } catch (error) {
      next(error);
    }
  });
}
