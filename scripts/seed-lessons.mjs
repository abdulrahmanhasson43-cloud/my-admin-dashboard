// Dev-only seed: units + lessons for the seeded courses, so the course page,
// the player and the playlist have real content to render.
// Runs against the DEV database only (reads DATABASE_URL from .env).
import { readFileSync } from "node:fs";
import pg from "pg";

const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
const url = /DATABASE_URL=['"]?([^'"\n]+)['"]?/.exec(env)?.[1];
if (!url) throw new Error("DATABASE_URL not found in .env");

const pool = new pg.Pool({ connectionString: url });

const PLAN = {
  "prep-1-term-1": {
    units: ["الأعداد النسبية", "الجبر", "الهندسة"],
    lessons: [
      ["مقدمة في الأعداد النسبية", 0, 720, true, "يعني إيه عدد نسبي، وإزاي نمثّله على خط الأعداد."],
      ["الجمع والطرح على الأعداد النسبية", 0, 1080, false, "قواعد الإشارات من غير حفظ — من خط الأعداد."],
      ["الضرب والقسمة", 0, 960, false, null],
      ["المعادلات من الدرجة الأولى", 1, 1260, false, "حل المعادلة يعني إيه بالظبط."],
      ["تطبيقات على المعادلات", 1, 900, false, null],
      ["المثلث: زوايا وأضلاع", 2, 1140, false, null],
      ["التطابق", 2, 1020, false, null],
    ],
  },
  "prep-2-term-1": {
    units: ["الجذور", "التناسب", "المساحات"],
    lessons: [
      ["الجذر التربيعي — الفكرة", 0, 840, true, "الجذر مش عملية عكسية بس — ده معنى هندسي."],
      ["تبسيط الجذور", 0, 1020, false, null],
      ["النسبة والتناسب", 1, 900, false, null],
      ["التناسب الطردي والعكسي", 1, 1080, false, null],
      ["مساحة الدائرة والقطاع", 2, 1200, false, null],
    ],
  },
  "prep-3-term-1": {
    units: ["العلاقات والدوال", "الهندسة التحليلية"],
    lessons: [
      ["العلاقة والدالة — الفرق", 0, 960, true, "كل دالة علاقة، بس مش كل علاقة دالة. ليه؟"],
      ["مجال ومدى الدالة", 0, 1140, false, null],
      ["الدالة الخطية", 0, 1080, false, null],
      ["الإحداثيات والميل", 1, 1020, false, null],
      ["معادلة المستقيم", 1, 1260, false, null],
    ],
  },
  "sec-1-term-1": {
    units: ["الجبر", "حساب المثلثات"],
    lessons: [
      ["الأعداد المركبة — مقدمة", 0, 1080, true, "ليه محتاجين عدد مربعه سالب؟"],
      ["العمليات على الأعداد المركبة", 0, 1200, false, null],
      ["المتطابقات المثلثية", 1, 1320, false, null],
      ["الدوال المثلثية للزوايا", 1, 1140, false, null],
    ],
  },
  "sec-2-term-1": {
    units: ["الدوال", "النهايات", "الهندسة الفراغية"],
    lessons: [
      ["مراجعة الدوال", 0, 900, true, null],
      ["الدالة الأسية واللوغاريتمية", 0, 1380, false, null],
      ["مفهوم النهاية", 1, 1200, false, "النهاية مش قيمة الدالة — ده الفرق اللي بيغيّر كل حاجة."],
      ["نظريات النهايات", 1, 1260, false, null],
      ["المستقيمات والمستويات في الفضاء", 2, 1140, false, null],
    ],
  },
  "sec-3-term-1": {
    units: ["التفاضل", "التكامل", "الاستاتيكا"],
    lessons: [
      ["المشتقة — المعنى الهندسي", 0, 1260, true, "المشتقة هي ميل المماس. من هنا كل حاجة بتتبني."],
      ["قواعد الاشتقاق", 0, 1440, false, null],
      ["تطبيقات المشتقة", 0, 1320, false, null],
      ["التكامل غير المحدود", 1, 1380, false, null],
      ["التكامل المحدود والمساحات", 1, 1500, false, null],
      ["عزم القوة", 2, 1080, false, null],
    ],
  },
  "bacc-math-1": {
    units: ["الجبر", "التحليل"],
    lessons: [
      ["مدخل البكالوريا — مسار الرياضيات", 0, 780, true, "الفرق بين منهج البكالوريا والثانوية العامة."],
      ["المصفوفات", 0, 1260, false, null],
      ["المتتابعات والمتسلسلات", 1, 1320, false, null],
    ],
  },
  "bacc-science-1": {
    units: ["أدوات رياضية"],
    lessons: [
      ["الأدوات الرياضية لمسار العلوم", 0, 900, true, null],
      ["النمذجة والتطبيقات", 0, 1140, false, null],
    ],
  },
};

const VIDEO = "https://www.youtube.com/watch?v=WUvTyaaNkzM";

try {
  const { rows: courses } = await pool.query("select id, slug from courses");
  const bySlug = new Map(courses.map((c) => [c.slug, c.id]));

  for (const [slug, plan] of Object.entries(PLAN)) {
    const courseId = bySlug.get(slug);
    if (!courseId) continue;

    const { rows: existing } = await pool.query("select count(*)::int as n from lessons where course_id = $1", [courseId]);
    if (existing[0].n > 0) {
      console.log(`skip ${slug} (already has lessons)`);
      continue;
    }

    const unitIds = [];
    for (let i = 0; i < plan.units.length; i++) {
      const { rows } = await pool.query(
        "insert into units (course_id, title, sort_order) values ($1,$2,$3) returning id",
        [courseId, plan.units[i], i],
      );
      unitIds.push(rows[0].id);
    }

    for (let i = 0; i < plan.lessons.length; i++) {
      const [title, unitIdx, durationSec, isFree, summary] = plan.lessons[i];
      await pool.query(
        `insert into lessons (course_id, unit_id, title, summary, video_url, duration_sec, is_free, sort_order)
         values ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [courseId, unitIds[unitIdx] ?? null, title, summary, VIDEO, durationSec, isFree, i],
      );
    }
    console.log(`seeded ${slug}: ${plan.units.length} units, ${plan.lessons.length} lessons`);
  }
} finally {
  await pool.end();
}
