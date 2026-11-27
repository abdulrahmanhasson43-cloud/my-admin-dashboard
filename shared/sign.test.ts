import { describe, expect, it } from "vitest";
import { b64urlDecode, b64urlEncode, shareLinkStatus, signToken, verifyToken } from "./sign";

const SECRET = "test-secret";
const P = { lid: "lesson-1", exp: 1_800_000_000_000, jti: "abc-123" };

describe("b64url", () => {
  it("round-trips arbitrary bytes, including non-ASCII text", () => {
    const text = new TextEncoder().encode("مدار — رابط مؤقت ٠١٢٣");
    const enc = b64urlEncode(text);
    expect(enc).not.toMatch(/[+/=]/);
    expect(new TextDecoder().decode(b64urlDecode(enc)!)).toBe("مدار — رابط مؤقت ٠١٢٣");
  });

  it("round-trips every byte length 0..64", () => {
    for (let n = 0; n <= 64; n++) {
      const bytes = new Uint8Array(Array.from({ length: n }, (_, i) => (i * 37 + 11) & 0xff));
      expect([...(b64urlDecode(b64urlEncode(bytes)) ?? [])]).toEqual([...bytes]);
    }
  });

  it("rejects malformed input instead of throwing", () => {
    expect(b64urlDecode("not valid!")).toBeNull();
    expect(b64urlDecode("abc")).not.toBeNull(); // unpadded is fine
  });
});

describe("signToken / verifyToken (feature 11)", () => {
  it("accepts a fresh token and returns its payload", () => {
    const token = signToken(P, SECRET);
    const r = verifyToken(token, SECRET, P.exp - 1000);
    expect(r).toEqual({ ok: true, payload: P });
  });

  it("rejects an expired token", () => {
    const token = signToken(P, SECRET);
    expect(verifyToken(token, SECRET, P.exp)).toEqual({ ok: false, reason: "expired" });
    expect(verifyToken(token, SECRET, P.exp + 60_000)).toEqual({ ok: false, reason: "expired" });
  });

  it("rejects a token signed with a different secret", () => {
    const token = signToken(P, SECRET);
    expect(verifyToken(token, "other-secret", P.exp - 1000)).toEqual({ ok: false, reason: "signature" });
  });

  it("rejects a token whose payload was edited (lesson id or expiry)", () => {
    const token = signToken(P, SECRET);
    const [body, mac] = token.split(".");
    const edited = b64urlEncode(new TextEncoder().encode(JSON.stringify({ ...P, lid: "lesson-2" })));
    expect(verifyToken(`${edited}.${mac}`, SECRET, P.exp - 1000)).toEqual({ ok: false, reason: "signature" });
    const editedExp = b64urlEncode(new TextEncoder().encode(JSON.stringify({ ...P, exp: P.exp + 10_000_000 })));
    expect(verifyToken(`${editedExp}.${mac}`, SECRET, P.exp - 1000)).toEqual({ ok: false, reason: "signature" });
    expect(verifyToken(`${body}.AAAA`, SECRET, P.exp - 1000).ok).toBe(false);
  });

  it("rejects malformed tokens cleanly", () => {
    expect(verifyToken("", SECRET)).toEqual({ ok: false, reason: "malformed" });
    expect(verifyToken("no-dot-here", SECRET)).toEqual({ ok: false, reason: "malformed" });
    expect(verifyToken("a.b", SECRET)).toEqual({ ok: false, reason: "malformed" });
    expect(verifyToken(`${b64urlEncode(new TextEncoder().encode("not json"))}.${"A".repeat(43)}`, SECRET).ok).toBe(false);
  });
});

describe("shareLinkStatus", () => {
  it("reports active, expired and revoked", () => {
    const future = { expiresAt: new Date(Date.now() + 60_000).toISOString(), revokedAt: null };
    const past = { expiresAt: new Date(Date.now() - 60_000).toISOString(), revokedAt: null };
    expect(shareLinkStatus(future)).toBe("active");
    expect(shareLinkStatus(past)).toBe("expired");
    expect(shareLinkStatus({ ...future, revokedAt: new Date().toISOString() })).toBe("revoked");
  });
});
