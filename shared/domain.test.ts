import { describe, expect, it } from "vitest";
import {
  daysLeft,
  duration,
  egp,
  gradeLabel,
  isGradeOfStage,
  mathLevelLabel,
  methodLabel,
  pathwayLabel,
  shortDate,
  toEmbedUrl,
  trackLabel,
} from "../shared/domain";

describe("toEmbedUrl", () => {
  it("turns a youtube watch link into a privacy-enhanced embed link", () => {
    const r = toEmbedUrl("https://www.youtube.com/watch?v=WUvTyaaNkzM");
    expect(r.kind).toBe("iframe");
    expect(r.src).toBe("https://www.youtube-nocookie.com/embed/WUvTyaaNkzM?rel=0&modestbranding=1");
  });

  it("turns a youtu.be short link into an embed link", () => {
    const r = toEmbedUrl("https://youtu.be/WUvTyaaNkzM");
    expect(r.kind).toBe("iframe");
    expect(r.src).toContain("/embed/WUvTyaaNkzM");
  });

  it("passes a vimeo link through as an iframe", () => {
    const r = toEmbedUrl("https://vimeo.com/123456789");
    expect(r.kind).toBe("iframe");
    expect(r.src).toBe("https://player.vimeo.com/video/123456789");
  });

  it("plays a direct mp4 in a <video> element", () => {
    const r = toEmbedUrl("https://cdn.example.com/lesson.mp4");
    expect(r.kind).toBe("video");
  });

  it("refuses a javascript: URL instead of embedding it", () => {
    // A poster-supplied URL is untrusted input; an iframe src of javascript:
    // is an XSS vector, so it must fall through to the empty state.
    const r = toEmbedUrl("javascript:alert(1)");
    expect(r.kind).toBe("none");
    expect(r.src).toBe("");
  });

  it("returns the empty state for a missing URL", () => {
    expect(toEmbedUrl(null).kind).toBe("none");
    expect(toEmbedUrl("   ").kind).toBe("none");
  });
});

describe("money", () => {
  it("formats pounds with thousands separators", () => {
    expect(egp(1500)).toBe("1,500 ج.م");
    expect(egp(0)).toBe("0 ج.م");
  });

  it("keeps decimals only when they carry meaning", () => {
    expect(egp(12.5)).toBe("12.5 ج.م");
    expect(egp(12.0)).toBe("12 ج.م");
  });

  it("never turns a non-number into NaN in the UI", () => {
    expect(egp(Number.NaN)).toBe("0 ج.م");
  });
});

describe("daysLeft", () => {
  it("returns 0 for a past date rather than a negative number", () => {
    const past = new Date(Date.now() - 86_400_000 * 3).toISOString();
    expect(daysLeft(past)).toBe(0);
  });

  it("counts whole days ahead", () => {
    const future = new Date(Date.now() + 86_400_000 * 10).toISOString();
    expect(daysLeft(future)).toBeGreaterThanOrEqual(9);
    expect(daysLeft(future)).toBeLessThanOrEqual(10);
  });
});

describe("duration", () => {
  it("renders mm:ss under an hour", () => {
    expect(duration(1080)).toBe("18:00");
  });

  it("renders h:mm:ss past an hour", () => {
    expect(duration(3725)).toBe("1:02:05");
  });

  it("returns a placeholder for zero or unknown length", () => {
    expect(duration(0)).toBe("—");
    expect(duration(-5)).toBe("—");
  });
});

describe("labels", () => {
  it("names every grade the app ships", () => {
    expect(gradeLabel("prep-1")).toBe("أولى إعدادي");
    expect(gradeLabel("sec-3")).toBe("تالتة ثانوي");
  });

  it("falls back to a dash for an unknown grade, never the raw key", () => {
    expect(gradeLabel("nope")).toBe("—");
    expect(gradeLabel(null)).toBe("—");
  });

  it("names tracks, pathways and math levels", () => {
    expect(trackLabel("baccalaureate")).toBe("البكالوريا المصرية");
    expect(trackLabel("general")).toBe("ثانوية عامة");
    expect(pathwayLabel("math")).toBe("مسار الرياضيات");
    expect(mathLevelLabel("advanced")).toBe("رياضيات متقدمة");
    expect(mathLevelLabel("standard")).toBe("رياضيات أساسية");
  });

  it("names payment methods", () => {
    expect(methodLabel("instapay")).toBe("InstaPay");
    expect(methodLabel("card")).toBe("بطاقة بنكية");
  });

  it("only reports a grade as belonging to its own stage", () => {
    expect(isGradeOfStage("prep-2", "prep")).toBe(true);
    expect(isGradeOfStage("prep-2", "secondary")).toBe(false);
    expect(isGradeOfStage("sec-2", "secondary")).toBe(true);
  });
});

describe("shortDate", () => {
  it("formats a date in Arabic with Latin digits, matching the money format", () => {
    const s = shortDate("2026-03-05T10:00:00.000Z");
    // Latin digits, not Arabic-Indic: 5 مارس 2026
    expect(s).toMatch(/[0-9]/);
    expect(s).not.toMatch(/[٠-٩]/);
    expect(s).toContain("2026");
  });

  it("returns a dash for an unusable date", () => {
    expect(shortDate(null)).toBe("—");
    expect(shortDate("not-a-date")).toBe("—");
  });
});
