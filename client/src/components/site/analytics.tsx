// Analytics UI (features 13–20): student progress panel, parent weekly report,
// teacher video stats, revenue report, CSV exports.
import { useState } from "react";
import { TrendingUp, Download, Copy, Check, Flame, Target, Users } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { t } from "@/i18n";
import { egp } from "@/i18n/domain";
import { cn } from "@/lib/utils";

const card = "border-t border-white/10 pt-5";
const btn =
  "rounded-[var(--radius-btn)] bg-[var(--accent,#3d8bff)] px-4 py-2 text-[14px] font-medium text-black transition-opacity disabled:opacity-40";

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Excel export: a real SpreadsheetML workbook (feature 19). */
function downloadExcel(filename: string, xml: string) {
  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** PDF export: open the print-ready report; the user saves it as PDF (feature 19). */
function printReport(html: string) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
}

// ── 13/14/18/19 · student analytics panel (Account tab) ───────────────────────
export function AnalyticsPanel() {
  const dash = trpc.analytics.dashboard.useQuery();
  const parent = trpc.parent.report.useQuery();
  const exportCsv = trpc.analytics.exportCsv.useQuery({ what: "progress" }, { enabled: false });
  const exportExcel = trpc.analytics.exportExcel.useQuery({ what: "progress" }, { enabled: false });
  const exportReport = trpc.analytics.exportReport.useQuery({ what: "progress" }, { enabled: false });
  const [copied, setCopied] = useState(false);

  const download = async () => {
    const r = await exportCsv.refetch();
    if (r.data) downloadCsv(r.data.filename, r.data.csv);
  };
  const downloadXls = async () => {
    const r = await exportExcel.refetch();
    if (r.data) downloadExcel(r.data.filename, r.data.xml);
  };
  const openPdf = async () => {
    const r = await exportReport.refetch();
    if (r.data) printReport(r.data.html);
  };

  const d = dash.data;
  return (
    <div className="space-y-5" data-testid="analytics-panel">
      {/* weekly minutes + cohort */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={card}>
          <div className="mb-3 flex items-center gap-2">
            <Flame className="size-4 text-[var(--accent,#3d8bff)]" />
            <h3 className="text-[15px] font-bold text-white">{t("analytics.weekMinutes")}</h3>
          </div>
          <div className="flex h-24 items-end gap-1.5" dir="ltr">
            {(d?.weekMinutes ?? []).map((day) => {
              const max = Math.max(1, ...(d?.weekMinutes ?? []).map((x) => x.minutes));
              return (
                <div key={day.day} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] text-white/45 tabular">{day.minutes}</span>
                  <div
                    className="w-full rounded-t bg-[var(--accent,#3d8bff)]/80"
                    style={{ height: `${Math.max(4, (day.minutes / max) * 72)}px` }}
                  />
                  <span className="text-[9px] text-white/35 tabular">{day.day.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={card}>
          <div className="mb-3 flex items-center gap-2">
            <Users className="size-4 text-[var(--accent,#3d8bff)]" />
            <h3 className="text-[15px] font-bold text-white">{t("analytics.cohort")}</h3>
          </div>
          {d && d.cohort.cohortSize > 0 ? (
            <>
              <p className="text-3xl font-bold text-white tabular">{d.cohort.percentile}٪</p>
              <p className="mt-1 text-[13px] leading-6 text-white/55">
                {t("analytics.cohortDesc", { pct: d.cohort.percentile, avg: d.cohort.avg })}
              </p>
            </>
          ) : (
            <p className="text-[13px] text-white/45">{t("analytics.noCohort")}</p>
          )}
        </div>
      </div>

      {/* per-unit progress */}
      <div className={card}>
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="size-4 text-[var(--accent,#3d8bff)]" />
          <h3 className="text-[15px] font-bold text-white">{t("analytics.units")}</h3>
        </div>
        <div className="space-y-3">
          {(d?.units ?? []).map((u) => (
            <div key={u.unitTitle}>
              <div className="mb-1 flex items-center justify-between text-[12.5px]">
                <span className="text-white/75">{u.unitTitle}</span>
                <span className="text-white/45 tabular">{u.done}/{u.total} · {u.pct}٪</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                <div className="h-full rounded-full bg-[var(--accent,#3d8bff)] transition-all" style={{ width: `${u.pct}%` }} />
              </div>
            </div>
          ))}
          {d && d.units.length === 0 && <p className="text-[13px] text-white/40">{t("analytics.noUnits")}</p>}
        </div>
      </div>

      {/* weak topics */}
      {d && d.weak.length > 0 && (
        <div className={card}>
          <div className="mb-3 flex items-center gap-2">
            <Target className="size-4 text-amber-400" />
            <h3 className="text-[15px] font-bold text-white">{t("analytics.weak")}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {d.weak.map((w) => (
              <span key={w.topic} className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[12.5px] text-amber-200">
                {w.topic} · {w.avgPct}٪
              </span>
            ))}
          </div>
        </div>
      )}

      {/* parent weekly report + export */}
      <div className={card}>
        <h3 className="mb-2 text-[15px] font-bold text-white">{t("analytics.parentReport")}</h3>
        <p className="text-[13.5px] leading-7 text-white/70">{parent.data?.text ?? "…"}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className={btn}
            onClick={() => {
              if (!parent.data?.text) return;
              void navigator.clipboard.writeText(parent.data.text);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? <Check className="inline size-4" /> : <Copy className="inline size-4" />} {t("analytics.copyReport")}
          </button>
          <button type="button" className={cn(btn, "bg-white/12 text-white")} onClick={() => void download()}>
            <Download className="inline size-4" /> {t("analytics.exportProgress")}
          </button>
          <button type="button" className={cn(btn, "bg-white/12 text-white")} onClick={() => void downloadXls()}>
            <Download className="inline size-4" /> {t("analytics.exportExcel")}
          </button>
          <button type="button" className={cn(btn, "bg-white/12 text-white")} onClick={() => void openPdf()}>
            <Download className="inline size-4" /> {t("analytics.exportPdf")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 15/16 · teacher video stats (admin studio) ────────────────────────────────
export function TeacherVideoStats() {
  const courses = trpc.catalog.courses.useQuery({});
  const [courseId, setCourseId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const course = trpc.catalog.course.useQuery(
    { slug: (courses.data ?? []).find((c: any) => c.id === courseId)?.slug ?? "" },
    { enabled: Boolean(courseId) },
  );
  const stats = trpc.videoStats.stats.useQuery({ lessonId }, { enabled: Boolean(lessonId) });
  const input =
    "w-full rounded-[var(--radius-btn)] border border-white/15 bg-black/30 px-3 py-2 text-[14px] text-white focus:border-[var(--accent,#3d8bff)] focus:outline-none";

  return (
    <div className="mt-6 border-t border-white/10 pt-5" data-testid="video-stats">
      <h3 className="mb-3 text-[15px] font-bold text-white">{t("analytics.videoStats")}</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        <select className={input} value={courseId} onChange={(e) => { setCourseId(e.target.value); setLessonId(""); }}>
          <option value="">{t("teacher.pickCourse")}</option>
          {(courses.data ?? []).map((c: any) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
        <select className={input} value={lessonId} onChange={(e) => setLessonId(e.target.value)}>
        <option value="">{t("analytics.pickLesson")}</option>
        {(course.data?.lessons ?? []).map((l: any) => (
          <option key={l.id} value={l.id}>{l.title}</option>
        ))}
        </select>
      </div>
      {stats.data && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="border-s border-white/10 ps-3">
              <p className="text-[11.5px] text-white/45">{t("analytics.dropOff")}</p>
              <p className="mt-1 text-xl font-bold text-white tabular">
                {stats.data.dropOff ? `${Math.floor(stats.data.dropOff.second / 60)}:${String(stats.data.dropOff.second % 60).padStart(2, "0")}` : "—"}
              </p>
              {stats.data.dropOff && (
                <p className="text-[11px] text-white/40">{t("analytics.dropOffCount", { count: stats.data.dropOff.count })}</p>
              )}
            </div>
            <div className="border-s border-white/10 ps-3">
              <p className="text-[11.5px] text-white/45">{t("analytics.viewers")}</p>
              <p className="mt-1 text-xl font-bold text-white tabular">{stats.data.viewers}</p>
            </div>
          </div>
          {stats.data.heatmap.length > 0 && (
            <div>
              <p className="mb-2 text-[12.5px] text-white/55">{t("analytics.heatmap")}</p>
              <div className="flex h-16 items-end gap-0.5" dir="ltr">
                {(() => {
                  const data = stats.data!.heatmap;
                  const byBucket = new Map(data.map((b) => [b.bucket, b.starts]));
                  const max = Math.max(...data.map((x) => x.starts));
                  const last = Math.max(...data.map((x) => x.bucket));
                  return Array.from({ length: last + 1 }, (_, bucket) => {
                    const starts = byBucket.get(bucket) ?? 0;
                    return (
                      <div
                        key={bucket}
                        title={`${bucket * 30}s · ${starts}`}
                        className={starts > 0 ? "min-w-2 flex-1 rounded-t bg-amber-400/70" : "min-w-2 flex-1 rounded-t bg-white/8"}
                        style={{ height: `${starts > 0 ? Math.max(10, (starts / max) * 56) : 6}px` }}
                      />
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── 19/20 · revenue report (admin overview) ───────────────────────────────────
export function RevenueReport() {
  const rep = trpc.revenue.report.useQuery();
  const exportCsv = trpc.analytics.exportCsv.useQuery({ what: "revenue" }, { enabled: false });
  const exportExcel = trpc.analytics.exportExcel.useQuery({ what: "revenue" }, { enabled: false });
  const exportReport = trpc.analytics.exportReport.useQuery({ what: "revenue" }, { enabled: false });
  const download = async () => {
    const r = await exportCsv.refetch();
    if (r.data) downloadCsv(r.data.filename, r.data.csv);
  };
  const downloadXls = async () => {
    const r = await exportExcel.refetch();
    if (r.data) downloadExcel(r.data.filename, r.data.xml);
  };
  const openPdf = async () => {
    const r = await exportReport.refetch();
    if (r.data) printReport(r.data.html);
  };
  const d = rep.data;
  if (!d) return null;
  return (
    <div className="mt-6 border-t border-white/10 pt-5" data-testid="revenue-report">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-white">{t("analytics.revenue")}</h3>
        <div className="flex gap-2">
          <button type="button" className={cn(btn, "bg-white/12 text-white")} onClick={() => void download()}>
            <Download className="inline size-4" /> CSV
          </button>
          <button type="button" className={cn(btn, "bg-white/12 text-white")} onClick={() => void downloadXls()}>
            <Download className="inline size-4" /> {t("analytics.exportExcel")}
          </button>
          <button type="button" className={cn(btn, "bg-white/12 text-white")} onClick={() => void openPdf()}>
            <Download className="inline size-4" /> {t("analytics.exportPdf")}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: t("analytics.revTopups"), value: egp(d.topupsEgp) },
          { label: t("analytics.revSales"), value: egp(d.purchasesEgp) },
          { label: t("analytics.revSubs"), value: String(d.activeSubscriptions) },
          { label: t("analytics.revRenewals"), value: String(d.renewals) },
        ].map((x) => (
          <div key={x.label} className="rounded-xl border border-white/8 p-3">
            <p className="text-[11.5px] text-white/45">{x.label}</p>
            <p className="mt-1 text-lg font-bold text-white tabular">{x.value}</p>
          </div>
        ))}
      </div>
      {d.byCourse.length > 0 && (
        <div className="mt-4 space-y-1">
          {d.byCourse.map((c) => (
            <div key={c.title} className="flex items-center justify-between border-b border-white/8 px-1 py-2 text-[13px]">
              <span className="text-white/80">{c.title}</span>
              <span className="text-white/50 tabular">{c.sales} · {egp(c.egp)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
