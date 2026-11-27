import { beforeEach, describe, expect, it } from "vitest";
import { demoCall } from "./demo-api";

// Minimal localStorage shim for the node test environment.
const mem = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
};

describe("v14 parent accounts + integrations (demo)", () => {
  beforeEach(() => mem.clear());

  it("parent links with a student's code and sees only that child", async () => {
    await demoCall("auth.login", { email: "student@madar.test", password: "password123" }).catch(() => null);
    const stu = await demoCall("auth.signup", { email: "kid@x.com", password: "password123", name: "كيرلس" }) as any;
    const { code } = await demoCall("parent.myCode", {}) as any;
    expect(code).toHaveLength(8);
    expect((await demoCall("parent.myCode", {}) as any).code).toBe(code);
    await expect(demoCall("parent.children", {})).rejects.toThrow();

    await demoCall("auth.logout", {});
    await demoCall("auth.signup", { email: "mom@x.com", password: "password123", name: "ماما", accountType: "parent" });
    await expect(demoCall("parent.link", { code: "ZZZZZZZZ" })).rejects.toThrow();
    await demoCall("parent.link", { code: code.toLowerCase() });
    await expect(demoCall("parent.link", { code })).rejects.toThrow(/مربوط/);
    const kids = await demoCall("parent.children", {}) as any[];
    expect(kids).toHaveLength(1);
    expect(kids[0].childId).toBe(stu.id);
    expect(kids[0].studentName).toBe("كيرلس");
    // read-only: a parent cannot reach staff or student-only data
    await expect(demoCall("activity.list", {})).rejects.toThrow();
    await expect(demoCall("integrations.list", {})).rejects.toThrow();
    const r = await demoCall("parent.sendReport", { childId: stu.id, phone: "01012345678" }) as any;
    expect(r.link).toContain("https://wa.me/201012345678");
    await expect(demoCall("parent.sendReport", { childId: "other", phone: "01012345678" })).rejects.toThrow();

    await demoCall("parent.unlink", { childId: stu.id });
    expect(await demoCall("parent.children", {})).toHaveLength(0);
  });

  it("rotating the code invalidates the old one", async () => {
    await demoCall("auth.signup", { email: "kid2@x.com", password: "password123" });
    const { code } = await demoCall("parent.myCode", {}) as any;
    const n = await demoCall("parent.rotateCode", {}) as any;
    expect(n.code).not.toBe(code);
    await demoCall("auth.logout", {});
    await demoCall("auth.signup", { email: "dad@x.com", password: "password123", accountType: "parent" });
    await expect(demoCall("parent.link", { code })).rejects.toThrow();
    await demoCall("parent.link", { code: n.code });
  });

  it("a student account cannot link as a parent", async () => {
    await demoCall("auth.signup", { email: "kid3@x.com", password: "password123" });
    await expect(demoCall("parent.link", { code: "ABCDEFGH" })).rejects.toThrow();
  });

  it("mock checkout credits the wallet exactly once", async () => {
    await demoCall("auth.signup", { email: "pay@x.com", password: "password123" });
    await expect(demoCall("checkout.create", { amountEgp: 3 })).rejects.toThrow();
    const c = await demoCall("checkout.create", { amountEgp: 250 }) as any;
    const a = await demoCall("checkout.pay", { id: c.id }) as any;
    expect(a.balanceEgp).toBe(250);
    await expect(demoCall("checkout.pay", { id: c.id })).rejects.toThrow();
    const w = await demoCall("wallet.summary", {}) as any;
    expect(w.balanceEgp).toBe(250);
  });

  it("translate is available to signed-in users; outbox is staff-only", async () => {
    await demoCall("auth.logout", {});
    await expect(demoCall("integrations.translate", { text: "درس", target: "en" })).rejects.toThrow();
    await demoCall("auth.signup", { email: "tr@x.com", password: "password123" });
    expect((await demoCall("integrations.translate", { text: "درس", target: "en" }) as any).text).toBe("lesson");
    await expect(demoCall("integrations.test", { kind: "push", to: "a", body: "b" })).rejects.toThrow();
  });
});
