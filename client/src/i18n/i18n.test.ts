import { describe, expect, it } from "vitest";
import { ar } from "./ar";
import { en } from "./en";
import { errorText } from "./errors";
import { t } from "./index";

const AR = /[\u0600-\u06FF]/;
const params = (s: string) => [...new Set([...s.matchAll(/\{(\w+)(?::[^}]*)?\}/g)].map((m) => m[1]))].sort();

describe("translations", () => {
  const keys = Object.keys(ar);

  it("English has exactly the same keys as Arabic", () => {
    expect(Object.keys(en).sort()).toEqual([...keys].sort());
  });

  it("every line uses the same {placeholders} in both languages", () => {
    for (const k of keys) {
      expect(params(en[k as keyof typeof en]), k).toEqual(params(ar[k as keyof typeof ar]));
    }
  });

  it("English copy contains no Arabic and no empty lines", () => {
    for (const k of keys) {
      const v = en[k as keyof typeof en];
      expect(v.trim().length, k).toBeGreaterThan(0);
      expect(AR.test(v), k).toBe(false);
    }
  });
});

describe("errorText (default language: Arabic)", () => {
  it("maps known server messages", () => {
    expect(errorText(new Error("Invalid email or password"))).toBe(ar["srv.badLogin"]);
    expect(errorText({ message: "الكورس مش موجود." })).toBe(ar["srv.courseMissing"]);
  });

  it("explains an insufficient balance with Latin digits", () => {
    const msg = errorText({ message: "الرصيد مش كافي. محتاج ١٬٢٠٠ ج.م ورصيدك ٣٠٠ ج.م — اشحن الفرق وارجع." });
    expect(msg).toContain("1,200");
    expect(msg).toContain("300");
  });

  it("never shows a raw zod JSON blob", () => {
    const blob = JSON.stringify([{ code: "invalid_string", message: "Invalid email", path: ["email"] }]);
    expect(errorText({ message: blob })).toBe(ar["err.validation"]);
  });

  it("turns network failures into a readable line", () => {
    expect(errorText(new TypeError("Failed to fetch"))).toBe(ar["err.network"]);
  });

  it("falls back by error code, then to a generic line", () => {
    expect(errorText({ message: "x", data: { code: "UNAUTHORIZED" } })).toBe(ar["err.unauthorized"]);
    expect(errorText(undefined)).toBe(ar["err.generic"]);
  });
});

describe("t()", () => {
  it("fills params", () => {
    expect(t("srv.balance", { need: 1200, have: 300 })).toContain("1200");
  });
});
