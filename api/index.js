import { Hono } from "hono";
import { serveStatic } from "hono/serve-static.module";
import leaderboard from "../db/leaderboard.json";

const app = new Hono();

app.get("/", (ctx) => {
  return ctx.json([
    { endpoint: "/leaderboard", description: "return the leaderboard" },
    { endpoint: "/static/logos/{name}", description: "return the team logo" },
  ]);
});

app.get("/leaderboard", (ctx) => {
  return ctx.json(leaderboard);
});

app.get("/static/*", serveStatic({ root: "./" }));

export default app;
