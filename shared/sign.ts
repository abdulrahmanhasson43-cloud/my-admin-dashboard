// ─────────────────────────────────────────────────────────────────────────────
// Signed, expiring tokens (feature 11 — temporary video links).
//
// Real HMAC-SHA256, implemented here in pure TypeScript so the SAME code runs
// in the browser demo store and on the server (Node has crypto, the demo does
// not). A token is `base64url(json).base64url(hmac)`; verification recomputes
// the MAC and compares in constant time, then checks the expiry inside the
// signed payload — so neither the lesson id nor the expiry can be edited.
// ─────────────────────────────────────────────────────────────────────────────

// ── SHA-256 (FIPS 180-4) ─────────────────────────────────────────────────────

const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function sha256(data: Uint8Array): Uint8Array {
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  const bitLen = data.length * 8;
  const padded = new Uint8Array((((data.length + 8) >> 6) + 1) << 6);
  padded.set(data);
  padded[data.length] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000));
  dv.setUint32(padded.length - 4, bitLen >>> 0);

  const w = new Uint32Array(64);
  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = (rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3)) >>> 0;
      const s1 = (rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10)) >>> 0;
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) >>> 0;
      const ch = ((e & f) ^ (~e & g)) >>> 0;
      const t1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) >>> 0;
      const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
      const t2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }
  const out = new Uint8Array(32);
  const ov = new DataView(out.buffer);
  [h0, h1, h2, h3, h4, h5, h6, h7].forEach((x, i) => ov.setUint32(i * 4, x));
  return out;
}

function rotr(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

/** RFC 2104 HMAC-SHA256 over UTF-8 strings. */
function hmacSha256(key: Uint8Array, message: Uint8Array): Uint8Array {
  const k = key.length > 64 ? sha256(key) : key;
  const ipad = new Uint8Array(64).fill(0x36);
  const opad = new Uint8Array(64).fill(0x5c);
  for (let i = 0; i < k.length; i++) {
    ipad[i] ^= k[i];
    opad[i] ^= k[i];
  }
  const inner = new Uint8Array(64 + message.length);
  inner.set(ipad);
  inner.set(message, 64);
  const innerHash = sha256(inner);
  const outer = new Uint8Array(64 + 32);
  outer.set(opad);
  outer.set(innerHash, 64);
  return sha256(outer);
}

// ── base64url (dependency-free, works in Node and the browser) ───────────────

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

export function b64urlEncode(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0;
    out += B64[a >> 2] + B64[((a & 3) << 4) | (b >> 4)];
    if (i + 1 < bytes.length) out += B64[((b & 15) << 2) | (c >> 6)];
    if (i + 2 < bytes.length) out += B64[c & 63];
  }
  return out;
}

export function b64urlDecode(s: string): Uint8Array | null {
  if (!/^[A-Za-z0-9\-_]*$/.test(s) || s.length % 4 === 1) return null;
  const rev = new Map([...B64].map((ch, i) => [ch, i]));
  const out: number[] = [];
  for (let i = 0; i < s.length; i += 4) {
    const c0 = rev.get(s[i]);
    const c1 = rev.get(s[i + 1]);
    const c2 = i + 2 < s.length ? rev.get(s[i + 2]) : undefined;
    const c3 = i + 3 < s.length ? rev.get(s[i + 3]) : undefined;
    if (c0 === undefined || c1 === undefined) return null;
    out.push(((c0 << 2) | (c1 >> 4)) & 0xff);
    if (c2 !== undefined) {
      out.push((((c1 & 15) << 4) | (c2 >> 2)) & 0xff);
      if (c3 !== undefined) out.push((((c2 & 3) << 6) | c3) & 0xff);
    }
  }
  return new Uint8Array(out);
}

// ── Tokens ───────────────────────────────────────────────────────────────────

/** The payload every share token carries: lesson id, expiry (epoch ms), unique id. */
export interface ShareTokenPayload {
  lid: string;
  exp: number;
  jti: string;
}

export function signToken(payload: ShareTokenPayload, secret: string): string {
  const enc = new TextEncoder();
  const body = b64urlEncode(enc.encode(JSON.stringify(payload)));
  const mac = hmacSha256(enc.encode(secret), enc.encode(body));
  return `${body}.${b64urlEncode(mac)}`;
}

export type VerifyResult =
  | { ok: true; payload: ShareTokenPayload }
  | { ok: false; reason: "malformed" | "signature" | "expired" };

export function verifyToken(token: string, secret: string, nowMs = Date.now()): VerifyResult {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return { ok: false, reason: "malformed" };
  const body = token.slice(0, dot);
  const macRaw = b64urlDecode(token.slice(dot + 1));
  if (!macRaw || macRaw.length !== 32) return { ok: false, reason: "malformed" };
  const enc = new TextEncoder();
  const expect = hmacSha256(enc.encode(secret), enc.encode(body));
  let diff = 0;
  for (let i = 0; i < 32; i++) diff |= macRaw[i] ^ expect[i];
  if (diff !== 0) return { ok: false, reason: "signature" };
  const raw = b64urlDecode(body);
  if (!raw) return { ok: false, reason: "malformed" };
  try {
    const payload = JSON.parse(new TextDecoder().decode(raw)) as ShareTokenPayload;
    if (typeof payload?.lid !== "string" || typeof payload?.exp !== "number" || typeof payload?.jti !== "string") {
      return { ok: false, reason: "malformed" };
    }
    if (payload.exp <= nowMs) return { ok: false, reason: "expired" };
    return { ok: true, payload };
  } catch {
    return { ok: false, reason: "malformed" };
  }
}

/** Human-facing TTL choices for the teacher studio, in minutes. */
export const SHARE_TTL_OPTIONS = [
  { minutes: 60, key: "teacher.ttl.hour" },
  { minutes: 60 * 24, key: "teacher.ttl.day" },
  { minutes: 60 * 24 * 7, key: "teacher.ttl.week" },
] as const;

export type ShareLinkStatus = "active" | "expired" | "revoked";

export function shareLinkStatus(link: { expiresAt: string; revokedAt: string | null }, nowMs = Date.now()): ShareLinkStatus {
  if (link.revokedAt) return "revoked";
  return new Date(link.expiresAt).getTime() <= nowMs ? "expired" : "active";
}
