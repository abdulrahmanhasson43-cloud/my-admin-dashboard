import { describe, expect, it } from "vitest";
import { mockSend, mockTranslate, normalizeEgPhone, validCheckoutAmount, whatsappLink, normalizeParentCode } from "./integrations";

describe("integrations", () => {
  it("mockSend records and validates", () => {
    const r = mockSend("push", "u1", "  hi  ", "t", "i");
    expect(r.ok && r.item.status).toBe("mock_delivered");
    expect(r.ok && r.item.body).toBe("hi");
    expect(mockSend("push", " ", "x", "t", "i")).toEqual({ ok: false, reason: "no_recipient" });
    expect(mockSend("whatsapp", "a", "  ", "t", "i")).toEqual({ ok: false, reason: "empty_body" });
    expect(mockSend("sms" as never, "a", "b", "t", "i")).toEqual({ ok: false, reason: "bad_kind" });
  });
  it("normalizes Egyptian phones", () => {
    expect(normalizeEgPhone("010 1234 5678")).toBe("201012345678");
    expect(normalizeEgPhone("+20 112 345 6789")).toBe("201123456789");
    expect(normalizeEgPhone("123")).toBeNull();
  });
  it("builds wa.me link", () => {
    expect(whatsappLink("01012345678", "تقرير")).toBe("https://wa.me/201012345678?text=%D8%AA%D9%82%D8%B1%D9%8A%D8%B1");
    expect(whatsappLink("x", "a")).toBeNull();
  });
  it("mock translate swaps glossary words only", () => {
    const r = mockTranslate("شرح درس الرياضيات", "en");
    expect(r.text).toBe("explanation lesson الرياضيات");
    expect(r.translatedWords).toBe(2);
    expect(mockTranslate("quiz", "ar").text).toBe("كويز");
  });
  it("checkout amount bounds", () => {
    expect(validCheckoutAmount(200)).toBe(true);
    expect(validCheckoutAmount(5)).toBe(false);
    expect(validCheckoutAmount(10.5)).toBe(false);
    expect(validCheckoutAmount(6000)).toBe(false);
  });
  it("parent code normalizes", () => { expect(normalizeParentCode("ab-12 cd")).toBe("AB12CD"); });
});
