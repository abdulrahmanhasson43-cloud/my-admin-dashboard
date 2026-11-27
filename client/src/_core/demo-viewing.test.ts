import { beforeAll, describe, expect, it } from "vitest";
import { demoCall, resetDemo } from "./demo-api";

/**
 * Viewing leftovers (features 21, 22, 26, 27) against the demo store — the
 * same handlers the UI calls. Timestamped notes, PDF sheet attachment,
 * teacher publishing with any video link + sheet/subtitle links.
 */

const call = (path: string, input?: unknown) => demoCall(path, input ?? {});

let lesson1: string;
let courseId: string;

beforeAll(async () => {
  resetDemo();
  await call("auth.login", { email: "student@madar.test", password: "Student2026!" });
  const detail: any = await call("catalog.course", { slug: "sec-3-term-1" });
  lesson1 = detail.lessons[0].id;
  courseId = detail.course.id;
});

describe("timestamped notes (feature 22)", () => {
  it("add, list sorted by second, and delete — private to the student", async () => {
    expect(await call("notes.list", { lessonId: lesson1 })).toEqual([]);
    await call("notes.add", { lessonId: lesson1, second: 300, text: "ميل المماس = المشتقة" });
    await call("notes.add", { lessonId: lesson1, second: 45, text: "تعريف النهاية" });
    const list: any = await call("notes.list", { lessonId: lesson1 });
    expect(list.map((n: any) => n.second)).toEqual([45, 300]);
    await call("notes.delete", { id: list[0].id });
    const after: any = await call("notes.list", { lessonId: lesson1 });
    expect(after.length).toBe(1);
    expect(after[0].text).toContain("المشتقة");
  });

  it("rejects empty notes and notes on locked lessons", async () => {
    await expect(call("notes.add", { lessonId: lesson1, second: 10, text: "  " })).rejects.toThrow();
    const detail: any = await call("catalog.course", { slug: "sec-3-term-1" });
    const paidLesson = detail.lessons.find((l: any) => !l.isFree);
    await expect(call("notes.list", { lessonId: paidLesson.id })).rejects.toThrow(); // not enrolled yet
  });

  it("a second student never sees the first one's notes", async () => {
    await call("auth.signup", { name: "طالبة تانية", email: "s2@madar.test", password: "Passw0rd!x", stage: "secondary", gradeKey: "sec-3", track: "general" });
    const list: any = await call("notes.list", { lessonId: lesson1 });
    expect(list).toEqual([]);
    await call("auth.login", { email: "student@madar.test", password: "Student2026!" });
  });
});

describe("lesson attachments (features 26, 27) and any-link publishing", () => {
  it("the seeded first lesson ships its PDF sheet", async () => {
    const r: any = await call("learning.lesson", { lessonId: lesson1 });
    expect(r.lesson.pdfUrl).toBe("/milzama-mushtaqa.pdf");
  });

  it("teacher publishes a lesson with a direct mp4 link + sheet + subtitles", async () => {
    await call("auth.login", { email: "owner@madar.test", password: "MadarOwner2026!" });
    const r: any = await call("teacher.addLesson", {
      courseId,
      title: "درس بملف مباشر",
      videoUrl: "https://cdn.example.com/lessons/intro.mp4",
      durationSec: 600,
      isFree: true,
      pdfUrl: "https://cdn.example.com/sheets/intro.pdf",
      vttUrl: "https://cdn.example.com/subs/intro.vtt",
      quiz: [],
    });
    expect(r.lesson.pdfUrl).toContain("intro.pdf");
    expect(r.lesson.vttUrl).toContain("intro.vtt");
  });

  it("teacher publishes a lesson with a YouTube link, and bad sheet links are rejected", async () => {
    const ok: any = await call("teacher.addLesson", {
      courseId,
      title: "درس يوتيوب",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      durationSec: 300,
      isFree: false,
      quiz: [],
    });
    expect(ok.lesson.videoUrl).toContain("youtube");
    await expect(
      call("teacher.addLesson", {
        courseId,
        title: "درس برابط ملزمة بايظ",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        durationSec: 300,
        isFree: false,
        pdfUrl: "javascript:alert(1)",
        quiz: [],
      }),
    ).rejects.toThrow();
  });
});
