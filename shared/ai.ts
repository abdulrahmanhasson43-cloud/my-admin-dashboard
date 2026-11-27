// ─────────────────────────────────────────────────────────────────────────────
// مدار AI engine — الذكاء الاصطناعي (features 38–45).
//
// Honest by design: there is no external language model wired into مدار (the
// platform LLM endpoint is not connected), so every "AI" feature here is a
// deterministic local engine that works from the lesson's own content — the
// topic bank, generated questions and transcript. The SAME code runs in the
// demo store and on the real server, and the UI says "مساعد مدار", never
// claiming a general-purpose model.
//
//   38 مساعد جوه الدرس      assistantReply()
//   39 توليد أسئلة تدريب    generatePractice()
//   40 ملخص وبطاقات مراجعة  lessonSummary() / lessonFlashcards()
//   41 خطة مذاكرة شخصية     buildStudyPlan()
//   42 تصحيح مقالي          gradeEssay()
//   43 بحث جوه الفيديو      buildTranscript() / searchTranscript()
//   44 ترشيح الدرس الجاي    recommendNext()
//   45 اختبار تكيّفي        adaptive engine (nextAdaptiveQuestion / scoreAdaptive)
// ─────────────────────────────────────────────────────────────────────────────

export type Difficulty = 1 | 2 | 3;

export interface PracticeQuestion {
  id: string;
  q: string;
  options: string[];
  correct: number;
  explanation: string;
  difficulty: Difficulty;
}

export interface TranscriptSegment {
  atSec: number;
  text: string;
}

export interface TranscriptHit {
  atSec: number;
  text: string;
  score: number;
}

export interface EssayGrade {
  pct: number;
  passed: boolean;
  found: string[];
  missing: string[];
  notes: string[];
}

// ─── Arabic text helpers ─────────────────────────────────────────────────────

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** 42 → "٤٢", -7 → "−٧" (Arabic-Indic digits, matching the bank's style). */
export function toArDigits(n: number): string {
  const neg = n < 0;
  const abs = Math.abs(n);
  const s = String(abs)
    .split("")
    .map((c) => (c >= "0" && c <= "9" ? AR_DIGITS[Number(c)] : c))
    .join("");
  return neg ? `−${s}` : s;
}

/** Loose Arabic normalization for search/matching: strips diacritics and
 *  unifies alef/ya/ta-marbuta forms so "الجذور" matches "الجذر". */
export function normalizeArabic(input: string): string {
  return input
    .replace(/[ً-ْٰـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Deterministic 32-bit PRNG (mulberry32) — same seed, same questions. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const pick = <T>(r: () => number, arr: T[]): T => arr[Math.floor(r() * arr.length) % arr.length];
const int = (r: () => number, min: number, max: number) => min + Math.floor(r() * (max - min + 1));

function shuffle<T>(r: () => number, arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Assemble 4 unique string options around the answer; extra wrongs are generated if needed. */
function stringOptions(
  r: () => number,
  answer: string,
  wrongs: string[],
  makeExtra: (i: number) => string,
): { options: string[]; correct: number } {
  const opts = [answer];
  for (const w of wrongs) if (!opts.includes(w)) opts.push(w);
  let i = 0;
  while (opts.length < 4) {
    const extra = makeExtra(i++);
    if (!opts.includes(extra)) opts.push(extra);
  }
  const options = shuffle(r, opts);
  return { options, correct: options.indexOf(answer) };
}

/** Build a 4-option question around a numeric answer with plausible distractors. */
function numQuestion(
  r: () => number,
  q: string,
  answer: number,
  explanation: string,
  difficulty: Difficulty,
  id: string,
): PracticeQuestion {
  const opts = new Set<number>([answer]);
  let guard = 0;
  while (opts.size < 4 && guard++ < 50) {
    const spread = Math.max(1, Math.round(Math.abs(answer) * 0.3));
    const d = answer + pick(r, [-2, -1, 1, 2, 3]) * int(r, 1, Math.max(1, spread));
    opts.add(d);
  }
  let i = 1;
  while (opts.size < 4) opts.add(answer + i++);
  const options = shuffle(r, [...opts]).map(toArDigits);
  return { id, q, options, correct: options.indexOf(toArDigits(answer)), explanation, difficulty };
}

// ─── Topic knowledge ─────────────────────────────────────────────────────────

interface Topic {
  key: string;
  match: RegExp;
  name: string;
  explain: string[];
  examples: string[];
  flashcards: { front: string; back: string }[];
  essayPrompt: string;
  essayKeywords: string[];
  transcript: string[];
  practice: (r: () => number, d: Difficulty, id: string) => PracticeQuestion;
}

const TOPICS: Topic[] = [
  {
    key: "roots",
    match: /جذر|جذور/,
    name: "الجذور التربيعية",
    explain: [
      "الجذر التربيعي لعدد هو العدد اللي لما تضربه في نفسه يديك العدد الأصلي. يعني √٢٥ = ٥ عشان ٥×٥ = ٢٥.",
      "لما تبسّط جذر زي √٥٠، فكك العدد لعامل مربع كامل: ٥٠ = ٢٥×٢، يبقى √٥٠ = ٥√٢.",
      "قاعدة مهمة: √(أ×ب) = √أ × √ب. بتستخدمها في التبسيط، وممنوع تجمع تحت الجذر: √(أ+ب) ≠ √أ + √ب.",
    ],
    examples: [
      "مثال: √٧٢ = √(٣٦×٢) = ٦√٢.",
      "مثال: (√٣)² = ٣ على طول — التربيع بيلغي الجذر.",
    ],
    flashcards: [
      { front: "√(أ × ب) = ؟", back: "√أ × √ب" },
      { front: "إزاي تبسّط √٥٠؟", back: "٥√٢ (لأن ٥٠ = ٢٥×٢)" },
      { front: "هل √(أ + ب) = √أ + √ب؟", back: "لأ — الجذر مش بيتوزع على الجمع" },
      { front: "(√٧)² = ؟", back: "٧" },
    ],
    essayPrompt: "اشرح لزميلك إزاي يبسّط جذر تربيعي زي √٧٢ خطوة بخطوة.",
    essayKeywords: ["جذر", "مربع", "تبسيط", "عامل", "ضرب"],
    transcript: [
      "الجذر التربيعي هو عكس التربيع بالظبط",
      "عشان تبسط جذر لازم تدور على اكبر مربع كامل جواه",
      "الجذر بيتوزع على الضرب لكن مش على الجمع",
      "التربيع والجذر بيلغوا بعض",
      "خد بالك من الاشاره الجذر الرئيسي دايما موجب",
      "راجع خطوات التبسيط مرة كمان ببطء",
    ],
    practice: (r, d, id) => {
      if (d === 1) {
        const n = int(r, 3, 15);
        return numQuestion(r, `√${toArDigits(n * n)} = ؟`, n, `لأن ${toArDigits(n)}×${toArDigits(n)} = ${toArDigits(n * n)}.`, d, id);
      }
      if (d === 2) {
        const a = int(r, 2, 7);
        let b = pick(r, [2, 3, 5, 7]);
        if (b === a) b = a === 7 ? 2 : a + 1; // a == b would duplicate the answer among the distractors
        const q = `بسّط √${toArDigits(a * a * b)}`;
        const answer = `${toArDigits(a)}√${toArDigits(b)}`;
        const { options, correct } = stringOptions(r, answer, [`${toArDigits(b)}√${toArDigits(a)}`, `${toArDigits(a * b)}√${toArDigits(b)}`, `${toArDigits(a)}√${toArDigits(a * b)}`], (k) => `${toArDigits(a + k + 1)}√${toArDigits(b)}`);
        return { id, q, options, correct, explanation: `√${toArDigits(a * a * b)} = √(${toArDigits(a * a)}×${toArDigits(b)}) = ${toArDigits(a)}√${toArDigits(b)}.`, difficulty: d };
      }
      const a = int(r, 2, 9);
      const b = int(r, 2, 9);
      return numQuestion(r, `(√${toArDigits(a)})² + (√${toArDigits(b)})² = ؟`, a + b, `التربيع بيلغي الجذر: ${toArDigits(a)} + ${toArDigits(b)} = ${toArDigits(a + b)}.`, d, id);
    },
  },
  {
    key: "equations",
    match: /معادل/,
    name: "المعادلات",
    explain: [
      "حل المعادلة يعني تجيب قيمة المجهول اللي تخلي الطرفين متساويين. الفكرة كلها: اللي تعمله في طرف، اعمله في الطرف التاني.",
      "لما تنقل حد من طرف للتاني بتغيّر إشارته: س + ٥ = ١٢ تبقى س = ١٢ − ٥ = ٧.",
      "لو المجهول مضروب في عدد، اقسم الطرفين على العدد ده: ٢س = ١٠ يبقى س = ٥.",
    ],
    examples: ["مثال: ٣س + ٢ = ١١ → ٣س = ٩ → س = ٣.", "مثال: س − ٧ = ٤ → س = ١١."],
    flashcards: [
      { front: "لما تنقل حد للطرف التاني بتعمل إيه؟", back: "بتغيّر إشارته" },
      { front: "حل ٢س = ١٠", back: "س = ٥" },
      { front: "إيه معنى «حل المعادلة»؟", back: "قيمة المجهول اللي تخلي الطرفين متساويين" },
      { front: "٣س + ٢ = ١١، س = ؟", back: "٣" },
    ],
    essayPrompt: "اشرح خطوات حل معادلة من الدرجة الأولى زي ٣س + ٢ = ١١.",
    essayKeywords: ["معادله", "طرف", "اشاره", "اقسم", "مجهول"],
    transcript: [
      "المعادله زي الميزان لازم الطرفين يفضلوا متساويين",
      "اي حاجه تعملها في طرف لازم تعملها في الطرف التاني",
      "النقل من طرف لطرف بيغير الاشاره",
      "لو المجهول مضروب في رقم اقسم على الرقم ده",
      "اتاكد من حلك بالتعويض في المعادله الاصليه",
      "راجع مثال محلول خطوه بخطوه",
    ],
    practice: (r, d, id) => {
      if (d === 1) {
        const a = int(r, 2, 15);
        const x = int(r, 2, 12);
        return numQuestion(r, `س + ${toArDigits(a)} = ${toArDigits(a + x)}، س = ؟`, x, `س = ${toArDigits(a + x)} − ${toArDigits(a)} = ${toArDigits(x)}.`, d, id);
      }
      if (d === 2) {
        const a = int(r, 2, 9);
        const x = int(r, 2, 9);
        const b = int(r, 1, 10);
        return numQuestion(r, `${toArDigits(a)}س + ${toArDigits(b)} = ${toArDigits(a * x + b)}، س = ؟`, x, `${toArDigits(a)}س = ${toArDigits(a * x)} → س = ${toArDigits(x)}.`, d, id);
      }
      const a = int(r, 2, 5);
      const b = int(r, 1, 6);
      const x = int(r, 2, 9);
      return numQuestion(r, `${toArDigits(a)}(س + ${toArDigits(b)}) = ${toArDigits(a * (x + b))}، س = ؟`, x, `س + ${toArDigits(b)} = ${toArDigits(x + b)} → س = ${toArDigits(x)}.`, d, id);
    },
  },
  {
    key: "functions",
    match: /دال|دوال|علاق/,
    name: "الدوال والعلاقات",
    explain: [
      "الدالة هي علاقة بتخلي كل عنصر في المجال ليه صورة واحدة بس في المدى. مش كل علاقة دالة.",
      "د(٢) = ٦ معناها إن لما عوضنا بـ ٢ في الدالة طلعت النتيجة ٦ — ٢ من المجال و٦ من المدى.",
      "الدالة الخطية د(س) = أ س + ب بتترسم خط مستقيم: أ هو الميل وب هو الجزء المقطوع من الصادات.",
    ],
    examples: ["مثال: د(س) = ٢س + ١ → د(٣) = ٧.", "مثال: د(س) = س² → د(٤) = ١٦."],
    flashcards: [
      { front: "شرط العلاقة تبقى دالة؟", back: "كل عنصر في المجال ليه صورة واحدة بس" },
      { front: "المجال هو…", back: "مجموعة القيم اللي بنعوّض بيها" },
      { front: "الدالة الخطية بتترسم…", back: "خط مستقيم" },
      { front: "د(س) = ٢س + ١، د(٣) = ؟", back: "٧" },
    ],
    essayPrompt: "اشرح الفرق بين العلاقة والدالة مع مثال.",
    essayKeywords: ["داله", "علاقه", "مجال", "مدى", "صوره"],
    transcript: [
      "الداله شرطها الاساسي ان كل عنصر في المجال ليه صوره واحده",
      "مش كل علاقه داله وده سؤال بيتكرر في الامتحان",
      "المجال هو القيم اللي بنعوض بيها والمدى هو النواتج",
      "الداله الخطيه رسمتها خط مستقيم",
      "التعويض في الداله بسيط احسب وانت ماشي خطوه خطوه",
      "راجع الفرق بين المجال والمدى تاني",
    ],
    practice: (r, d, id) => {
      if (d === 1) {
        const a = int(r, 2, 6);
        const b = int(r, 1, 9);
        const k = int(r, 1, 6);
        return numQuestion(r, `لو د(س) = ${toArDigits(a)}س + ${toArDigits(b)}، فإن د(${toArDigits(k)}) = ؟`, a * k + b, `د(${toArDigits(k)}) = ${toArDigits(a)}×${toArDigits(k)} + ${toArDigits(b)} = ${toArDigits(a * k + b)}.`, d, id);
      }
      if (d === 2) {
        const a = int(r, 2, 5);
        const k = int(r, 2, 5);
        return numQuestion(r, `لو د(س) = ${toArDigits(a)}س²، فإن د(${toArDigits(k)}) = ؟`, a * k * k, `د(${toArDigits(k)}) = ${toArDigits(a)}×${toArDigits(k * k)} = ${toArDigits(a * k * k)}.`, d, id);
      }
      const a = int(r, 2, 6);
      const b = int(r, 1, 8);
      const m = int(r, 2, 6);
      return numQuestion(r, `لو د(س) = ${toArDigits(a)}س + ${toArDigits(b)} ود(س) = ${toArDigits(a * m + b)}، فإن س = ؟`, m, `${toArDigits(a)}س = ${toArDigits(a * m)} → س = ${toArDigits(m)}.`, d, id);
    },
  },
  {
    key: "derivative",
    match: /مشتقة|تفاضل|اشتقاق/,
    name: "التفاضل",
    explain: [
      "المشتقة الأولى بتمثل ميل المماس للمنحنى عند أي نقطة — يعني معدل التغير اللحظي للدالة.",
      "قاعدة القوة: مشتقة سⁿ = ن س^(ن−١). يعني مشتقة س² = ٢س، ومشتقة س³ = ٣س².",
      "مشتقة العدد الثابت صفر، ومشتقة أ س هي أ. لو الميل صفر يبقى المماس أفقي — ودي نقطة قصوى أو دنيا غالبًا.",
    ],
    examples: ["مثال: مشتقة ٥س² = ١٠س.", "مثال: مشتقة (س³ + ٢س) = ٣س² + ٢."],
    flashcards: [
      { front: "المشتقة الأولى بتمثل إيه؟", back: "ميل المماس للمنحنى" },
      { front: "مشتقة سⁿ = ؟", back: "ن س^(ن−١)" },
      { front: "مشتقة الثابت = ؟", back: "صفر" },
      { front: "مشتقة ٥س² = ؟", back: "١٠س" },
    ],
    essayPrompt: "اشرح معنى المشتقة الأولى وإزاي تحسب مشتقة دالة كثيرة الحدود.",
    essayKeywords: ["مشتقه", "ميل", "مماس", "قوه", "ثابت"],
    transcript: [
      "المشتقه الاولي هي ميل المماس للمنحنى عند النقطه",
      "قاعده القوه انزل الاس واطرح منه واحد",
      "مشتقه الثابت صفر ومشتقه س بواحد",
      "لما المشتقه تساوي صفر يبقى احتمال نقطة قصوى او دنيا",
      "الميل السالب معناه الداله بتقل",
      "راجع قاعده القوه على مثال محلول",
    ],
    practice: (r, d, id) => {
      if (d === 1) {
        const a = int(r, 2, 9);
        const q = `مشتقة ${toArDigits(a)}س = ؟`;
        const options = shuffle(r, [toArDigits(a), `${toArDigits(a)}س`, "س", "صفر"]);
        return { id, q, options, correct: options.indexOf(toArDigits(a)), explanation: `مشتقة ${toArDigits(a)}س هي المعامل ${toArDigits(a)}.`, difficulty: d };
      }
      if (d === 2) {
        const a = int(r, 2, 6);
        const n = int(r, 2, 4);
        const answer = `${toArDigits(a * n)}س${["", "", "²", "³", "⁴"][n - 1]}`;
        const wrong1 = `${toArDigits(a)}س${["", "", "²", "³", "⁴"][n - 1]}`;
        const wrong2 = `${toArDigits(a * n)}س${["", "²", "³", "⁴", "⁵"][n]}`;
        const wrong3 = `${toArDigits(n)}س${["", "", "²", "³", "⁴"][n - 1]}`;
        const q = `مشتقة ${toArDigits(a)}س${["", "²", "³", "⁴"][n - 1]} = ؟`;
        const options = shuffle(r, [answer, wrong1, wrong2, wrong3]);
        return { id, q, options, correct: options.indexOf(answer), explanation: `قاعدة القوة: ${toArDigits(a)}×${toArDigits(n)} = ${toArDigits(a * n)} والأس ينقص واحد.`, difficulty: d };
      }
      const a = int(r, 2, 5);
      const b = int(r, 2, 9);
      const q = `مشتقة (${toArDigits(a)}س² + ${toArDigits(b)}س) = ؟`;
      const answer = `${toArDigits(2 * a)}س + ${toArDigits(b)}`;
      const options = shuffle(r, [answer, `${toArDigits(2 * a)}س`, `${toArDigits(a)}س + ${toArDigits(b)}`, `${toArDigits(2 * a)}س² + ${toArDigits(b)}`]);
      return { id, q, options, correct: options.indexOf(answer), explanation: `مشتقة كل حد لوحده: ${toArDigits(a)}س² → ${toArDigits(2 * a)}س، و${toArDigits(b)}س → ${toArDigits(b)}.`, difficulty: d };
    },
  },
  {
    key: "integral",
    match: /تكامل/,
    name: "التكامل",
    explain: [
      "التكامل هو العملية العكسية للتفاضل: لو اشتقيت الناتج لازم ترجع للدالة الأصلية.",
      "قاعدة القوة في التكامل: ∫ سⁿ دس = س^(ن+١)/(ن+١) + ث. يعني ∫ ٢س دس = س² + ث.",
      "ثابت التكامل «ث» لازم يتحط — لأن مشتقة أي ثابت صفر، ففيه عدد لا نهائي من الدوال نفس مشتقتها.",
    ],
    examples: ["مثال: ∫ ٦س دس = ٣س² + ث.", "مثال: ∫ ٣س² دس = س³ + ث."],
    flashcards: [
      { front: "التكامل عكس إيه؟", back: "التفاضل" },
      { front: "∫ سⁿ دس = ؟", back: "س^(ن+١)/(ن+١) + ث" },
      { front: "ليه بنكتب «ث»؟", back: "لأن مشتقة الثابت صفر" },
      { front: "∫ ٢س دس = ؟", back: "س² + ث" },
    ],
    essayPrompt: "اشرح إزاي تحسب تكامل غير محدود لدالة كثيرة الحدود.",
    essayKeywords: ["تكامل", "تفاضل", "ثابت", "قوه", "عكس"],
    transcript: [
      "التكامل هو العمليه العكسيه للتفاضل",
      "زود الاس واحد واقسم على الاس الجديد",
      "متنساش ثابت التكامل ث",
      "اتاكد من ناتج التكامل باشتقاقه",
      "التكامل المحدود بيحسب المساحه تحت المنحنى",
      "راجع قاعده القوه في التكامل",
    ],
    practice: (r, d, id) => {
      if (d === 1) {
        const a = int(r, 2, 9);
        const q = `∫ ${toArDigits(a)} دس = ؟`;
        const answer = `${toArDigits(a)}س + ث`;
        const options = shuffle(r, [answer, `${toArDigits(a)} + ث`, "س + ث", `${toArDigits(a)}س² + ث`]);
        return { id, q, options, correct: options.indexOf(answer), explanation: `تكامل الثابت ${toArDigits(a)} هو ${toArDigits(a)}س + ث.`, difficulty: d };
      }
      if (d === 2) {
        const a = 2 * int(r, 1, 5);
        const q = `∫ ${toArDigits(a)}س دس = ؟`;
        const answer = `${toArDigits(a / 2)}س² + ث`;
        const options = shuffle(r, [answer, `${toArDigits(a)}س² + ث`, `${toArDigits(a)} + ث`, `${toArDigits(a * 2)}س² + ث`]);
        return { id, q, options, correct: options.indexOf(answer), explanation: `زوّد الأس ١ واقسم عليه: ${toArDigits(a)}/٢ = ${toArDigits(a / 2)}.`, difficulty: d };
      }
      const a = 3 * int(r, 1, 3);
      const b = int(r, 2, 8);
      const q = `∫ (${toArDigits(a)}س² + ${toArDigits(b)}) دس = ؟`;
      const answer = `${toArDigits(a / 3)}س³ + ${toArDigits(b)}س + ث`;
      const options = shuffle(r, [answer, `${toArDigits(a)}س³ + ${toArDigits(b)}س + ث`, `${toArDigits(a / 3)}س³ + ث`, `${toArDigits(a)}س + ث`]);
      return { id, q, options, correct: options.indexOf(answer), explanation: `كل حد لوحده: ${toArDigits(a)}س² → ${toArDigits(a / 3)}س³، و${toArDigits(b)} → ${toArDigits(b)}س.`, difficulty: d };
    },
  },
  {
    key: "geometry",
    match: /مثلث|زوايا|تطابق|هندس/,
    name: "الهندسة والمثلثات",
    explain: [
      "مجموع زوايا أي مثلث ١٨٠° — لو عندك زاويتين اجمعهم واطرح من ١٨٠ تلاقي التالتة.",
      "المثلث المتساوي الساقين زاويتا القاعدة متساويتان، والمتساوي الأضلاع كل زواياه ٦٠°.",
      "الزاوية الخارجة للمثلث بتساوي مجموع الزاويتين الداخليتين البعيدتين — قاعدة بتختصر خطوات كتير.",
    ],
    examples: ["مثال: زاويتان ٥٠° و٦٠° → التالتة ٧٠°.", "مثال: مثلث متساوي الساقين زاوية رأسه ٤٠° → كل زاوية قاعدة ٧٠°."],
    flashcards: [
      { front: "مجموع زوايا المثلث = ؟", back: "١٨٠°" },
      { front: "الزاوية الخارجة بتساوي…", back: "مجموع الزاويتين الداخليتين البعيدتين" },
      { front: "زوايا المثلث متساوي الأضلاع؟", back: "كل واحدة ٦٠°" },
      { front: "شرط تطابق مثلثين؟", back: "الأضلاع والزوايا المتناظرة متساوية" },
    ],
    essayPrompt: "اشرح إزاي تحسب زاوية مجهولة في مثلث.",
    essayKeywords: ["مثلث", "زاويه", "١٨٠", "قاعده", "خارجه"],
    transcript: [
      "مجموع زوايا المثلث ميه وتمانين درجه",
      "المثلث المتساوي الساقين زاويتا القاعده متساويتان",
      "الزاويه الخارجه بتساوي مجموع البعيدتين",
      "التطابق معناه الاضلاع والزوايا المتناظره متساويه",
      "ارسم الشكل وعلم على المعطيات قبل ما تحل",
      "راجع قاعده الزاويه الخارجه على مثال",
    ],
    practice: (r, d, id) => {
      if (d === 1) {
        const a = 10 * int(r, 2, 8);
        const b = 10 * int(r, 2, Math.min(8, (170 - a) / 10));
        return numQuestion(r, `زاويتا مثلث ${toArDigits(a)}° و ${toArDigits(b)}°، الزاوية التالتة = ؟`, 180 - a - b, `١٨٠ − (${toArDigits(a)} + ${toArDigits(b)}) = ${toArDigits(180 - a - b)}°.`, d, id);
      }
      if (d === 2) {
        const v = 2 * int(r, 10, 50);
        const base = (180 - v) / 2;
        return numQuestion(r, `مثلث متساوي الساقين زاوية رأسه ${toArDigits(v)}°، زاوية القاعدة = ؟`, base, `(١٨٠ − ${toArDigits(v)}) ÷ ٢ = ${toArDigits(base)}°.`, d, id);
      }
      const a = 10 * int(r, 3, 7);
      const b = 10 * int(r, 3, 7);
      return numQuestion(r, `الزاوية الخارجة عند رأس مثلث زاويتاه الداخليتان البعيدتان ${toArDigits(a)}° و ${toArDigits(b)}° = ؟`, a + b, `الزاوية الخارجة = مجموع البعيدتين = ${toArDigits(a + b)}°.`, d, id);
    },
  },
  {
    key: "ratio",
    match: /نسبة|تناسب/,
    name: "النسبة والتناسب",
    explain: [
      "النسبة بتتبسط زي الكسر بالظبط: اقسم الطرفين على القاسم المشترك الأكبر. ٦ : ٤ = ٣ : ٢.",
      "في التناسب الطردي الكميتان بتزيد وتقل مع بعض — حاصل القسمة ثابت. في العكسي واحدة تزيد والتانية تقل — حاصل الضرب ثابت.",
      "مثال العمال والأيام تناسب عكسي: عدد العمال × عدد الأيام ثابت.",
    ],
    examples: ["مثال: ٦ عمال يخلصوا شغل في ٤ أيام → ٨ عمال في ٣ أيام (٦×٤ ÷ ٨).", "مثال: ١٢ : ١٨ = ٢ : ٣."],
    flashcards: [
      { front: "التناسب الطردي ثابته إيه؟", back: "حاصل قسمة الكميتين" },
      { front: "التناسب العكسي ثابته إيه؟", back: "حاصل ضرب الكميتين" },
      { front: "١٢ : ١٨ في أبسط صورة", back: "٢ : ٣" },
      { front: "عمال أكتر يعني زمن…", back: "أقل (تناسب عكسي)" },
    ],
    essayPrompt: "اشرح الفرق بين التناسب الطردي والعكسي بمثال من الحياة.",
    essayKeywords: ["نسبه", "طردي", "عكسي", "ثابت", "ضرب"],
    transcript: [
      "النسبه بتتبسط زي الكسر اقسم على القاسم المشترك",
      "الطردي الكميتان بيزيدوا مع بعض",
      "العكسي واحده تزيد والتانيه تقل وحاصل الضرب ثابت",
      "مسال العمال والايام كلها عكسي",
      "حدد نوع التناسب قبل ما تحل",
      "راجع مثال محلول على التناسب العكسي",
    ],
    practice: (r, d, id) => {
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      if (d === 1) {
        const g = int(r, 2, 6);
        const a = int(r, 1, 6);
        const b = int(r, 1, 6);
        if (a === b) return TOPICS[7].practice(r, d, id);
        const q = `أبسط صورة للنسبة ${toArDigits(a * g)} : ${toArDigits(b * g)}`;
        const answer = `${toArDigits(a)} : ${toArDigits(b)}`;
        const options = shuffle(r, [answer, `${toArDigits(b)} : ${toArDigits(a)}`, `${toArDigits(a)} : ${toArDigits(b * g)}`, `${toArDigits(a * g)} : ${toArDigits(b)}`]);
        return { id, q, options, correct: options.indexOf(answer), explanation: `اقسم الطرفين على ${toArDigits(g)}.`, difficulty: d };
      }
      if (d === 2) {
        const w1 = pick(r, [4, 6, 8, 10, 12]);
        const days1 = pick(r, [3, 4, 6, 8]);
        const w2 = pick(r, [2, 3, 4, 6, 8].filter((x) => x !== w1 && (w1 * days1) % x === 0));
        const days2 = (w1 * days1) / w2;
        return numQuestion(r, `${toArDigits(w1)} عمال بيخلصوا شغل في ${toArDigits(days1)} أيام. ${toArDigits(w2)} عمال يخلصوها في كام يوم؟`, days2, `تناسب عكسي: ${toArDigits(w1)}×${toArDigits(days1)} ÷ ${toArDigits(w2)} = ${toArDigits(days2)}.`, d, id);
      }
      const a = int(r, 2, 6);
      let b = int(r, 2, 6);
      const c = int(r, 2, 6);
      if (a === c) b = a === 6 ? 2 : a + 1; // keep distractors distinct when a == c
      const q = `لو أ : ب = ${toArDigits(a)} : ${toArDigits(b)} وب : ج = ${toArDigits(b)} : ${toArDigits(c)}، فإن أ : ج = ؟`;
      const g = gcd(a, c);
      const answer = `${toArDigits(a / g)} : ${toArDigits(c / g)}`;
      const { options, correct } = stringOptions(r, answer, [`${toArDigits(a)} : ${toArDigits(c + b)}`, `${toArDigits(b)} : ${toArDigits(c)}`, `${toArDigits(c / g)} : ${toArDigits(a / g)}`], (k) => `${toArDigits(a + k + 1)} : ${toArDigits(c)}`);
      return { id, q, options, correct, explanation: `ب موجودة في النسبتين بنفس القيمة، يبقى أ : ج = ${answer}.`, difficulty: d };
    },
  },
  {
    key: "numbers",
    match: /أعداد|عدد/,
    name: "الأعداد النسبية",
    explain: [
      "العدد النسبي أي عدد يتكتب في صورة أ/ب حيث ب ≠ صفر — يشمل الصحيحة والكسور والعشرية الدورية.",
      "سالب في سالب = موجب. وسالب في موجب = سالب. دي أهم قاعدة في إشارات الضرب والقسمة.",
      "في الجمع: نفس الإشارة اجمع وخد إشارتهم، إشارات مختلفة اطرح وخد إشارة الأكبر.",
    ],
    examples: ["مثال: (−٢) × (−٤) = ٨.", "مثال: −٧ − ٣ = −١٠."],
    flashcards: [
      { front: "سالب × سالب = ؟", back: "موجب" },
      { front: "−٧ − ٣ = ؟", back: "−١٠" },
      { front: "العدد النسبي يتكتب كإيه؟", back: "أ/ب حيث ب ≠ صفر" },
      { front: "−٣ + ٥ = ؟", back: "٢" },
    ],
    essayPrompt: "اشرح قواعد الإشارات في جمع وضرب الأعداد النسبية.",
    essayKeywords: ["نسبي", "سالب", "موجب", "اشاره", "صفر"],
    transcript: [
      "العدد النسبي هو اي عدد يتكتب صوره كسر",
      "سالب في سالب يديك موجب",
      "في الجمع لو الاشارات مختلفه اطرح وخد اشاره الاكبر",
      "خط الاعداد بيساعدك تتخيل الجمع والطرح",
      "الترتيب مهم الاقواس الاول",
      "راجع قواعد الاشاره قبل الامتحان",
    ],
    practice: (r, d, id) => {
      if (d === 1) {
        const a = int(r, 2, 9);
        const b = int(r, 1, 9);
        return numQuestion(r, `−${toArDigits(a)} + ${toArDigits(b)} = ؟`, b - a, `إشارات مختلفة: اطرح وخد إشارة الأكبر.`, d, id);
      }
      if (d === 2) {
        const a = int(r, 2, 9);
        const b = int(r, 2, 9);
        return numQuestion(r, `(−${toArDigits(a)}) × (−${toArDigits(b)}) = ؟`, a * b, `سالب × سالب = موجب.`, d, id);
      }
      const a = int(r, 2, 6);
      const b = int(r, 2, 6);
      const c = int(r, 2, 9);
      return numQuestion(r, `(−${toArDigits(a)}) × ${toArDigits(b)} + ${toArDigits(c)} = ؟`, c - a * b, `الضرب الأول: −${toArDigits(a * b)}، وبعدين الجمع: ${toArDigits(c - a * b)}.`, d, id);
    },
  },
  {
    key: "limits",
    match: /نهاية|نهايات/,
    name: "النهايات",
    explain: [
      "نهاية الدالة عند نقطة هي القيمة اللي الدالة بتقترب منها — مش لازم تكون قيمتها فعلًا عند النقطة.",
      "لو النهاية من اليمين = من اليسار يبقى النهاية موجودة، لو مختلفين يبقى غير موجودة.",
      "عند ما لا نهاية: كثيرة حدود على كثيرة حدود من نفس الدرجة، النهاية = نسبة معاملي أعلى قوة.",
    ],
    examples: ["مثال: نهاية (٢س + ١)/(٤س − ٣) لما س → ∞ = ٢/٤ = ١/٢.", "مثال: نهاية ٥/س لما س → ∞ = ٠."],
    flashcards: [
      { front: "النهاية موجودة لو…", back: "اليمين = اليسار" },
      { front: "نهاية ١/س لما س → ∞", back: "صفر" },
      { front: "نهاية (أ س + ب)/(ج س + د) عند ∞", back: "أ/ج" },
      { front: "النهاية = قيمة الدالة دايمًا؟", back: "مش لازم" },
    ],
    essayPrompt: "اشرح إزاي تحسب نهاية دالة كسرية لما س تقترب من ما لا نهاية.",
    essayKeywords: ["نهايه", "يمين", "يسار", "معل", "صفر"],
    transcript: [
      "النهايه هي القيمه اللي الداله بتقترب منها",
      "لو اليمين يساوي اليسار يبقى النهايه موجوده",
      "عند مالانهايه بص على اعلى قوه بس",
      "نسبه المعاملين بتحدد النهايه",
      "لو البسط درجته اقل النهايه صفر",
      "راجع امثله النهايات عند مالانهايه",
    ],
    practice: (r, d, id) => {
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      if (d === 1) {
        const a = int(r, 1, 9);
        const q = `نهاية ${toArDigits(a)}/س لما س ← ∞ = ؟`;
        const { options, correct } = stringOptions(r, "صفر", [toArDigits(a), "ما لا نهاية", "١"], (k) => toArDigits(k + 2));
        return { id, q, options, correct, explanation: `المقام بيكبر والبسط ثابت، يبقى الكسر بيقرب من صفر.`, difficulty: d };
      }
      const a = int(r, 2, 9);
      const c = int(r, 2, 9);
      const g = gcd(a, c);
      const frac = g === c ? toArDigits(a / g) : `${toArDigits(a / g)}/${toArDigits(c / g)}`;
      const q = `نهاية (${toArDigits(a)}س + ١)/(${toArDigits(c)}س − ٢) لما س ← ∞ = ؟`;
      const { options, correct } = stringOptions(r, frac, [`${toArDigits(c)}/${toArDigits(a)}`, `${toArDigits(a)}/${toArDigits(c)}`, "صفر", "ما لا نهاية"], (k) => `${toArDigits(a + k + 1)}/${toArDigits(c)}`);
      return { id, q, options, correct, explanation: `نفس الدرجة: النهاية = نسبة المعاملين ${toArDigits(a)}/${toArDigits(c)}${g > 1 ? ` = ${frac}` : ""}.`, difficulty: d };
    },
  },
];

const GENERIC_TOPIC: Topic = {
  key: "generic",
  match: /.*/,
  name: "الدرس",
  explain: [
    "الدرس ده بيبني على فهم الفكرة قبل الحفظ: افهم المعطيات، حدد المطلوب، وبعدين ابدأ الحل خطوة بخطوة.",
    "أحسن طريقة تثبّت الدرس: شوف الشرح، جرّب تحل مثال بنفسك قبل ما تشوف الحل، وبعدين احل تدريبات.",
  ],
  examples: ["مثال: اقرأ المسألة مرتين وحدد المعطيات قبل ما تحل."],
  flashcards: [
    { front: "أهم خطوة قبل الحل؟", back: "تفهم المطلوب وتحدد المعطيات" },
    { front: "أحسن تثبيت للدرس؟", back: "تحل أمثلة بنفسك بعد الشرح" },
  ],
  essayPrompt: "اشرح أهم أفكار الدرس ده لزميلك.",
  essayKeywords: ["فهم", "خطوه", "حل", "مثال"],
  transcript: [
    "فهم الفكره قبل الحفظ",
    "جرب تحل بنفسك قبل ما تشوف الحل",
    "راجع الخطوات ببطء",
    "حل تدريبات على كل فكره",
  ],
  practice: (r, _d, id) => {
    const bank = [
      { q: "أهم خطوة قبل ما تحل أي مسألة؟", options: ["تفهم المطلوب وتحدد المعطيات", "تحفظ القانون من غير فهم", "تكتب الناتج الأول", "تتخطى الرسم"], correct: 0 },
      { q: "أحسن طريقة تثبّت الدرس؟", options: ["تحل أمثلة بنفسك بعد الشرح", "تشوف الفيديو بسرعة مضاعفة", "تحفظ من غير حل", "مذاكرة ليلة الامتحان بس"], correct: 0 },
      { q: "لو لقيت خطوة مش واضحة؟", options: ["ترجع لها وتسأل عنها تحت الدرس", "تتجاهلها", "تقفل الدرس", "تحفظها من غير فهم"], correct: 0 },
      { q: "التعلم الصح بيعتمد على…", options: ["الفهم والتطبيق", "الحفظ بس", "السرعة بس", "التخمين"], correct: 0 },
    ];
    const item = bank[Math.floor(r() * bank.length)];
    const options = shuffle(r, item.options);
    return { id, q: item.q, options, correct: options.indexOf(item.options[item.correct]), explanation: "الفهم قبل الحفظ، والتطبيق بعد الشرح.", difficulty: _d };
  },
};

export function topicFor(title: string): Topic {
  return TOPICS.find((t) => t.match.test(title)) ?? GENERIC_TOPIC;
}

// ─── 38: in-lesson assistant ─────────────────────────────────────────────────

export interface AssistantContext {
  lessonTitle: string;
  durationSec: number;
}

export function assistantReply(message: string, ctx: AssistantContext, salt = 0): string {
  const m = normalizeArabic(message);
  const topic = topicFor(ctx.lessonTitle);
  const h = hash32(m + ctx.lessonTitle) + salt;

  if (m.includes("سلام") || m.includes("اهلا") || m.includes("هاي") || m.includes("ازيك") || m.includes("صباح") || m.includes("مساء") || /^(hi|hello|hey)$/.test(m) || m.length < 3) {
    return `أهلًا! أنا مساعد مدار. اسألني أي حاجة في درس «${ctx.lessonTitle}» — اشرحلي، هات مثال، إيه القانون — وأنا أجاوبك من محتوى الدرس نفسه.`;
  }
  if (/مثال|امثله|زي مثال|مثلا/.test(m)) {
    return `${topic.examples[h % topic.examples.length]}\nلو لسه مش واضح، اطلب شرح الفكرة تاني أو جرّب تاب «تدريب» تحل بنفسك.`;
  }
  if (/قانون|القاعده|قواعد|فورمولا/.test(m)) {
    const card = topic.flashcards[h % topic.flashcards.length];
    return `القاعدة هنا: ${card.back}.\n(${card.front})\nلو عايزها في مثال تطبيقي اطلب «مثال».`;
  }
  if (/مش فاهم|مش عارف|اشرح|وضح|صعب|مش مفهوم|يعني ايه|ايه|ازاي|ليه/.test(m)) {
    const para = topic.explain[h % topic.explain.length];
    return `${para}\nلو النقطة دي بالذات اللي واقفة معاك، قولي «مش فاهم» + الجزء اللي واقف وأنا أوضحه أكتر.`;
  }
  if (/تدريب|اساله|سؤال|كويز|امتحنني|اتدرب/.test(m)) {
    return `تمام — افتح تاب «تدريب» جنب الشات وهتلاقي أسئلة جديدة متولدة من محتوى «${ctx.lessonTitle}» بمستويات، ومع كل إجابة تفسيرها.`;
  }
  if (/ملخص|لخص/.test(m)) {
    return `تلخيص «${ctx.lessonTitle}» في سطر: ${topic.explain[0]}\nولو عايز الملخص كامل مع بطاقات مراجعة، افتح تاب «ملخص وبطاقات».`;
  }
  if (/شكرا|تمام|تسلم|جميل/.test(m)) {
    return `العفو! كمّل على المستوى ده — ولو وقفت معاك أي نقطة في الدرس أنا موجود.`;
  }
  // Fallback: try to answer with the closest explanation, honestly framed.
  return `أنا مساعد بيجاوب من محتوى الدرس نفسه، مش نموذج عام — فمش متأكد إني فاهم سؤالك صح.\nأقرب فكرة ممكن تفيدك: ${topic.explain[h % topic.explain.length]}\nجرّب تسألني: «اشرح» أو «مثال» أو «إيه القانون».`;
}

// ─── 39: practice question generation ───────────────────────────────────────

/** New questions every call: the attempt id salts the generator, so no two sets repeat. */
export function generatePractice(lessonId: string, lessonTitle: string, attempt: number, count = 3): PracticeQuestion[] {
  const topic = topicFor(lessonTitle);
  const r = rng(hash32(`${lessonId}:${attempt}`));
  const out: PracticeQuestion[] = [];
  const diffs: Difficulty[] = count >= 3 ? [1, 2, 3] : [2, 2];
  for (let i = 0; i < count; i++) {
    let q = topic.practice(r, diffs[i % diffs.length], `p${i + 1}`);
    // Guard against duplicate questions inside one set.
    let guard = 0;
    while (out.some((x) => x.q === q.q) && guard++ < 8) q = topic.practice(r, diffs[i % diffs.length], `p${i + 1}`);
    out.push(q);
  }
  return out;
}

export function scorePractice(questions: PracticeQuestion[], answers: (number | null)[]) {
  const perQuestion = questions.map((q, i) => ({
    correct: answers[i] === q.correct,
    rightIndex: q.correct,
    explanation: q.explanation,
  }));
  const correctCount = perQuestion.filter((x) => x.correct).length;
  const total = questions.length;
  return { perQuestion, correctCount, total, pct: total > 0 ? Math.round((correctCount / total) * 100) : 0 };
}

// ─── 40: summary + flashcards ────────────────────────────────────────────────

export function lessonSummary(lessonTitle: string, durationSec: number): string[] {
  const topic = topicFor(lessonTitle);
  const minutes = Math.max(1, Math.round(durationSec / 60));
  return [
    `درس «${lessonTitle}» (${toArDigits(minutes)} دقيقة تقريبًا) — موضوعه الأساسي: ${topic.name}.`,
    ...topic.explain,
    `افتكر: الفهم قبل الحفظ — احل تدريبات الدرس لحد ما تعدي مستوى صعب.`,
  ];
}

export function lessonFlashcards(lessonTitle: string): { front: string; back: string }[] {
  return topicFor(lessonTitle).flashcards;
}

// ─── 43: in-video transcript search ──────────────────────────────────────────

export function buildTranscript(_lessonId: string, lessonTitle: string, durationSec: number): TranscriptSegment[] {
  const topic = topicFor(lessonTitle);
  const d = durationSec > 0 ? durationSec : 600;
  const intro = `اهلا بيكم في درس ${lessonTitle}`;
  const lines = [intro, ...topic.transcript, "وهكذا نكون خلصنا الدرس راجع البطاقات وحل التدريبات"];
  const out: TranscriptSegment[] = [];
  const n = lines.length;
  for (let i = 0; i < n; i++) {
    out.push({ atSec: Math.round((d * i) / n) + (i === 0 ? 0 : 5), text: lines[i] });
  }
  return out;
}

export function searchTranscript(segments: TranscriptSegment[], query: string, limit = 5): TranscriptHit[] {
  const q = normalizeArabic(query);
  if (!q) return [];
  const tokens = q.split(" ").filter((t) => t.length > 1);
  const hits: TranscriptHit[] = [];
  for (const seg of segments) {
    const text = normalizeArabic(seg.text);
    let score = 0;
    if (text.includes(q)) score += 3;
    for (const tok of tokens) if (text.includes(tok)) score += 1;
    if (score > 0) hits.push({ atSec: seg.atSec, text: seg.text, score });
  }
  return hits.sort((a, b) => b.score - a.score || a.atSec - b.atSec).slice(0, limit);
}

// ─── 42: essay grading ───────────────────────────────────────────────────────

export function gradeEssay(text: string, lessonTitle: string): EssayGrade {
  const topic = topicFor(lessonTitle);
  const norm = normalizeArabic(text);
  const words = norm.split(" ").filter(Boolean).length;

  const found = topic.essayKeywords.filter((k) => norm.includes(normalizeArabic(k)));
  const missing = topic.essayKeywords.filter((k) => !norm.includes(normalizeArabic(k)));
  const coverage = topic.essayKeywords.length > 0 ? found.length / topic.essayKeywords.length : 0;
  const lengthScore = Math.min(1, words / 40);
  const structure = /اول|ثاني|بعد كده|يعني|خطوه|مثال|[٠-٩0-9]/.test(norm) ? 1 : 0;

  const pct = Math.round(100 * (0.6 * coverage + 0.2 * lengthScore + 0.2 * structure));
  const notes: string[] = [];
  if (lengthScore < 1) notes.push("إجابتك قصيرة — الشرح الكامل بيحتاج حوالي ٤٠ كلمة أو أكتر.");
  if (structure === 0) notes.push("نظّم الإجابة بخطوات مرقمة أو كلمات زي «أولًا» و«ثانيًا» وذكر مثال رقمي.");
  if (missing.length > 0) notes.push("غطّي الأفكار الناقصة بجملة واضحة لكل واحدة، مش مجرد ذكر الكلمة.");
  if (pct >= 85) notes.push("ممتاز — إجابة شاملة ومنظمة.");
  return { pct, passed: pct >= 60, found, missing, notes };
}

export function essayPromptFor(lessonTitle: string): string {
  return topicFor(lessonTitle).essayPrompt;
}

// ─── 44: next-lesson recommendation ──────────────────────────────────────────

export interface NextLessonInput {
  id: string;
  title: string;
  state: "not-started" | "watching" | "needs-quiz" | "completed";
  quizBestPct: number;
}

export function recommendNext(lessons: NextLessonInput[]): { lessonId: string; reason: string } | null {
  if (lessons.length === 0) return null;
  const inProgress = lessons.find((l) => l.state === "watching" || l.state === "needs-quiz");
  if (inProgress) {
    return {
      lessonId: inProgress.id,
      reason:
        inProgress.state === "needs-quiz"
          ? "خلّصت المشاهدة وباقي الكويز بس — عدّيه وخلّص الدرس."
          : "بدأت الدرس ده ولسه مخلصتوش — كمّل من حيث وقفت.",
    };
  }
  const fresh = lessons.find((l) => l.state === "not-started");
  if (fresh) return { lessonId: fresh.id, reason: "الدرس الجاي في ترتيب الكورس — ابدأه دلوقتي." };
  const weakest = lessons
    .filter((l) => l.quizBestPct < 80)
    .sort((a, b) => a.quizBestPct - b.quizBestPct)[0];
  if (weakest) return { lessonId: weakest.id, reason: `أقل درجة كويز عندك (${toArDigits(weakest.quizBestPct)}٪) — راجع الدرس ده وعدّي كويزه تاني.` };
  const last = lessons[lessons.length - 1];
  return { lessonId: last.id, reason: "خلّصت الكورس كله بدرجات كويسة — مراجعة أخيرة قبل الامتحان." };
}

// ─── 41: personal study plan ─────────────────────────────────────────────────

export interface PlanLesson {
  id: string;
  title: string;
  courseTitle: string;
  state: NextLessonInput["state"];
  quizBestPct: number;
}

export interface PlanTask {
  kind: "watch" | "quiz-retry" | "review" | "adaptive" | "rest";
  lessonId?: string;
  label: string;
}

export interface PlanDay {
  date: string; // ISO yyyy-mm-dd
  tasks: PlanTask[];
}

export function buildStudyPlan(lessons: PlanLesson[], examDateISO: string | null, todayISO: string): PlanDay[] {
  const start = new Date(`${todayISO.slice(0, 10)}T00:00:00Z`);
  let days = 7;
  if (examDateISO) {
    const exam = new Date(`${examDateISO.slice(0, 10)}T00:00:00Z`);
    days = Math.max(1, Math.min(14, Math.round((exam.getTime() - start.getTime()) / 86_400_000) + 1));
  }

  const queue: PlanTask[] = [];
  for (const l of lessons) {
    if (l.state !== "completed") queue.push({ kind: "watch", lessonId: l.id, label: `اتفرج على «${l.title}» وعدّي كويزه` });
  }
  for (const l of lessons) {
    if (l.state === "completed" && l.quizBestPct < 80) queue.push({ kind: "quiz-retry", lessonId: l.id, label: `راجع «${l.title}» وارفع درجة الكويز فوق ٨٠٪` });
  }
  queue.push({ kind: "adaptive", lessonId: lessons[0]?.id, label: "اختبر نفسك في الاختبار التكيّفي" });

  const out: PlanDay[] = [];
  let qi = 0;
  for (let i = 0; i < days; i++) {
    const date = new Date(start.getTime() + i * 86_400_000).toISOString().slice(0, 10);
    const tasks: PlanTask[] = [];
    const isLast = i === days - 1;
    if (isLast && examDateISO) {
      tasks.push({ kind: "review", label: "مراجعة عامة: بطاقات كل الدروس + ملخصاتها" });
      tasks.push({ kind: "rest", label: "نام بدري — يوم الامتحان محتاج تركيز مش سهر" });
    } else {
      for (let k = 0; k < 2 && qi < queue.length; k++) tasks.push(queue[qi++]);
      if (tasks.length === 0) tasks.push({ kind: "review", label: "مراجعة: بطاقات المراجعة لدروسك المكتملة" });
    }
    out.push({ date, tasks });
  }
  return out;
}

// ─── 45: adaptive test ───────────────────────────────────────────────────────

export const ADAPTIVE_LENGTH = 6;

export interface AdaptiveQuestion extends PracticeQuestion {
  index: number;
}

export interface AdaptiveState {
  level: Difficulty;
  asked: { difficulty: Difficulty; correct: boolean }[];
}

/** Pick the next question for the session: difficulty follows performance. */
export function nextAdaptiveQuestion(_lessonId: string, lessonTitle: string, sessionSeed: string, state: AdaptiveState): AdaptiveQuestion | null {
  if (state.asked.length >= ADAPTIVE_LENGTH) return null;
  const topic = topicFor(lessonTitle);
  const r = rng(hash32(`${_lessonId}:${sessionSeed}:${state.asked.length}`));
  const q = topic.practice(r, state.level, `a${state.asked.length + 1}`);
  return { ...q, index: state.asked.length };
}

/** Update the level after an answer: correct climbs, wrong drops (bounded 1..3). */
export function nextAdaptiveLevel(state: AdaptiveState, correct: boolean): AdaptiveState {
  const level = Math.max(1, Math.min(3, state.level + (correct ? 1 : -1))) as Difficulty;
  return { level, asked: [...state.asked, { difficulty: state.level, correct }] };
}

export function adaptiveResult(state: AdaptiveState): { pct: number; level: string; note: string } {
  const correct = state.asked.filter((a) => a.correct).length;
  const total = state.asked.length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const hardCorrect = state.asked.filter((a) => a.correct && a.difficulty === 3).length;
  const level =
    pct >= 80 && hardCorrect > 0 ? "متقدم" : pct >= 60 ? "متوسط" : pct >= 40 ? "مبتدئ" : "محتاج مراجعة";
  const note =
    level === "متقدم"
      ? "مستواك قوي في الدرس ده — جاهز للدرس اللي بعده."
      : level === "متوسط"
        ? "مستوى كويس — حل تدريبات أكتر على المستوى الصعب."
        : level === "مبتدئ"
          ? "الأساسيات محتاجة تثبيت — راجع ملخص الدرس والبطاقات وحل تاني."
          : "ارجع للدرس نفسه، اتفرج عليه تاني براحة، وبعدين اختبر نفسك من جديد.";
  return { pct, level, note };
}
