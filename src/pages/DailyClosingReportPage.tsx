import DailyClosingReport from '@/components/DailyClosingReport';

/**
 * الفكرة #25 — صفحة تقرير إقفال اليوم.
 * غلاف بسيط لصفحة يعرض مكوّن DailyClosingReport داخل تخطيط
 * التطبيق الرئيسي (AppLayout). المكوّن نفسه يحتوي على كل
 * الإحصائيات والمخططات والإجراءات (طباعة/PDF/واتساب).
 */
export default function DailyClosingReportPage() {
  return <DailyClosingReport />;
}
