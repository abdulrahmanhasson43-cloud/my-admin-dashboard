import type { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { env } from "./env";

// The ONE place the runtime touches the filesystem (DESIGN §5.1). In prod the
// single Hono process serves the built SPA from dist/public + an index.html
// SPA fallback. In dev this is a no-op: Vite owns the client on PORT and proxies
// API calls here. Swapping this shim (e.g. edge Static Assets) is all it takes
// to move off Node — business code never reads fs.
const PUBLIC_DIR = "dist/public";

// index.html names the hashed bundles of ONE build. With no Cache-Control a
// browser may keep it heuristically (serveStatic sends Last-Modified), and after
// a republish it runs the old client against the new API, or asks for bundles
// the new build no longer has. `no-cache` makes every load ask again; serveStatic
// answers no conditional request, so that is a full fetch of the file.
//
// Only a file the build named by its content hash never changes under the same
// name, and only Vite's manifest says which those are: client/public is copied
// as it is, so a logo under client/public/assets lands in assets/ beside the
// bundles and still changes on the next Update.
const REVALIDATE = "no-cache";
const IMMUTABLE = "public, max-age=31536000, immutable";
const MANIFEST = path.join(PUBLIC_DIR, ".vite", "manifest.json");

type ManifestEntry = { file?: string; css?: string[]; assets?: string[] };

export function hashedFiles(manifest: Record<string, ManifestEntry>): Set<string> {
  const files = new Set<string>();
  for (const entry of Object.values(manifest)) {
    for (const f of [entry.file, ...(entry.css ?? []), ...(entry.assets ?? [])]) {
      if (f) files.add(path.join(PUBLIC_DIR, f));
    }
  }
  return files;
}

// null: built without a manifest (vite.config.ts predates it, or was edited),
// so no file is known to be hashed.
function readHashedFiles(): Set<string> | null {
  try {
    return hashedFiles(JSON.parse(readFileSync(MANIFEST, "utf-8")));
  } catch {
    return null;
  }
}

export function cacheControlFor(file: string, hashed: Set<string> | null): string | undefined {
  if (file.endsWith(".html")) return REVALIDATE;
  if (!hashed) return undefined;
  return hashed.has(path.normalize(file)) ? IMMUTABLE : REVALIDATE;
}

export function mountClient(app: Hono): void {
  if (!env.isProd) return;
  // serveStatic builds its Response before it calls onFound and returns that
  // object, so a c.header() inside onFound never reaches the client. onFound
  // only names the file; the header goes on the Response serveStatic returns.
  const hashed = readHashedFiles();
  const found = new WeakMap<object, string>();
  const statics = serveStatic({
    root: `./${PUBLIC_DIR}`,
    onFound: (file, c) => { found.set(c, file); },
  });
  app.use("/*", async (c, next) => {
    const res = await statics(c, next);
    const file = found.get(c);
    const cache = file && cacheControlFor(file, hashed);
    if (res && cache) res.headers.set("Cache-Control", cache);
    return res;
  });
  app.get("*", async (c) => {
    const html = await readFile(path.resolve(PUBLIC_DIR, "index.html"), "utf-8");
    c.header("Cache-Control", REVALIDATE);
    return c.html(html);
  });
}
