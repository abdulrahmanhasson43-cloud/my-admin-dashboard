// Dev-only: attach the generated posters (and a 16:9 backdrop derived from
// them) to each seeded course, so the landing page shows real artwork.
import { readFileSync } from "node:fs";
import pg from "pg";

const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
const url = /DATABASE_URL=['"]?([^'"\n]+)['"]?/.exec(env)?.[1];
const pool = new pg.Pool({ connectionString: url });

const MAP = {
  "prep-1-term-1": "/posters/numbers.svg",
  "prep-2-term-1": "/posters/geometry.svg",
  "prep-3-term-1": "/posters/functions.svg",
  "sec-1-term-1": "/posters/algebra.svg",
  "sec-2-term-1": "/posters/analytic.svg",
  "sec-3-term-1": "/posters/calculus.svg",
  "bacc-math-1": "/posters/trig.svg",
  "bacc-science-1": "/posters/stats.svg",
};

// A 16:9 crop of the same artwork is what the hero and the course header need.
const BACKDROP = {
  "prep-1-term-1": "/media/numbers.svg",
  "prep-2-term-1": "/media/geometry.svg",
  "prep-3-term-1": "/media/functions.svg",
  "sec-1-term-1": "/media/algebra.svg",
  "sec-2-term-1": "/media/analytic.svg",
  "sec-3-term-1": "/media/calculus.svg",
  "bacc-math-1": "/media/trig.svg",
  "bacc-science-1": "/media/stats.svg",
};

try {
  for (const [slug, poster] of Object.entries(MAP)) {
    await pool.query("update courses set poster_url = $1, backdrop_url = $2 where slug = $3", [
      poster,
      BACKDROP[slug],
      slug,
    ]);
  }
  const { rows } = await pool.query("select slug, poster_url from courses order by sort_order");
  console.table(rows);
} finally {
  await pool.end();
}
