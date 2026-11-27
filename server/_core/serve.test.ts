import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { Hono } from "hono";

// A cached index.html outlived a republish: the old client ran against the new
// API and the owner saw errors nobody could reproduce on a fresh load.
// serve.ts imports env.ts, which requires the platform variables at load time,
// and mountClient serves dist/public relative to the working directory.
type Serve = typeof import("./serve");
let serve: Serve;
let HonoCtor: typeof import("hono").Hono;
let dir: string;
const cwd = process.cwd();

const BUNDLE = "assets/index-Bx1a2c3d.js";
const STYLES = "assets/index-Dq9z8y7x.css";
const IMAGE = "assets/hero-Kp4m2n1q.png";
const MANIFEST = {
  "index.html": { file: BUNDLE, css: [STYLES], assets: [IMAGE], isEntry: true },
};

function write(rel: string, body: string) {
  mkdirSync(path.dirname(path.join(dir, "dist/public", rel)), { recursive: true });
  writeFileSync(path.join(dir, "dist/public", rel), body);
}

function appNow(): Hono {
  const app = new HonoCtor();
  serve.mountClient(app);   // reads the manifest here, once
  return app;
}

beforeAll(async () => {
  Object.assign(process.env, {
    DATABASE_URL: "postgresql://u:p@h/db",
    JWT_SECRET: "j",
    APP_SLUG: "demo",
    NODE_ENV: "production",
  });
  dir = mkdtempSync(path.join(tmpdir(), "serve-test-"));
  write("index.html", "<!doctype html><title>app</title>");
  for (const f of [BUNDLE, STYLES, IMAGE]) write(f, "x");
  // From client/public: copied as it is, so its name carries no hash.
  write("assets/logo.svg", "<svg/>");
  write("favicon.svg", "<svg/>");
  write(".vite/manifest.json", JSON.stringify(MANIFEST));
  process.chdir(dir);
  ({ Hono: HonoCtor } = await import("hono"));
  serve = await import("./serve");
});

afterAll(() => {
  process.chdir(cwd);
  rmSync(dir, { recursive: true, force: true });
});

describe("which files the build hashed", () => {
  it("are the chunks, their css and their assets the manifest names", () => {
    expect(serve.hashedFiles(MANIFEST)).toEqual(new Set([
      path.join("dist/public", BUNDLE),
      path.join("dist/public", STYLES),
      path.join("dist/public", IMAGE),
    ]));
  });

  it("decide the header, not the folder", () => {
    const hashed = serve.hashedFiles(MANIFEST);
    expect(serve.cacheControlFor(`dist/public/${BUNDLE}`, hashed)).toBe("public, max-age=31536000, immutable");
    expect(serve.cacheControlFor("dist/public/assets/logo.svg", hashed)).toBe("no-cache");
    expect(serve.cacheControlFor("dist/public/index.html", hashed)).toBe("no-cache");
    expect(serve.cacheControlFor("dist/public/admin/index.html", null)).toBe("no-cache");
    expect(serve.cacheControlFor(`dist/public/${BUNDLE}`, null)).toBeUndefined();
  });
});

// serveStatic builds its Response before onFound runs, so a header set there
// never reached the client. These read the response a browser gets.
describe("responses the browser gets", () => {
  it.each(["/", "/index.html"])("%s is revalidated", async (url) => {
    const res = await appNow().request(url);
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-cache");
  });

  it("a client route falls back to index.html, revalidated", async () => {
    const res = await appNow().request("/dashboard");
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("<title>app</title>");
    expect(res.headers.get("Cache-Control")).toBe("no-cache");
  });

  it.each([BUNDLE, STYLES, IMAGE])("hashed %s is kept for a year", async (f) => {
    const res = await appNow().request(`/${f}`);
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=31536000, immutable");
  });

  it.each(["/assets/logo.svg", "/favicon.svg"])(
    "%s, copied from client/public, is revalidated", async (url) => {
      const res = await appNow().request(url);
      expect(res.status).toBe(200);
      expect(res.headers.get("Cache-Control")).toBe("no-cache");
    });

  it("a build without a manifest keeps nothing for good", async () => {
    rmSync(path.join(dir, "dist/public/.vite"), { recursive: true });
    try {
      const app = appNow();
      expect((await app.request(`/${BUNDLE}`)).headers.get("Cache-Control")).toBeNull();
      expect((await app.request("/")).headers.get("Cache-Control")).toBe("no-cache");
    } finally {
      write(".vite/manifest.json", JSON.stringify(MANIFEST));
    }
  });
});
