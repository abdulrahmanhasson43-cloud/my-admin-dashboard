import { useState } from "react";
import { Download, FileText, NotebookPen, Smartphone, Trash2 } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { t } from "@/i18n";
import { cn } from "@/lib/utils";
import { Tip } from "@/components/ui/tip";

/**
 * Viewing extras (features 22, 25, 26):
 * 22 — timestamped notes: private per student, click a note to jump back.
 * 25 — offline download: direct-file lessons download from the browser;
 *      YouTube lessons point to the app (YouTube downloads are theirs alone).
 * 26 — PDF sheet attached by the teacher.
 */

const CARD = "border-t border-white/8 pt-6";
const INPUT = "rounded-lg border border-white/12 bg-white/4 px-3 py-2 text-[13.5px] text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none";

function fmt(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function LessonNotes({ lessonId, currentTime, onSeek }: { lessonId: string; currentTime: () => number; onSeek: (sec: number) => void }) {

  const utils = trpc.useUtils();
  const notes = trpc.notes.list.useQuery({ lessonId });
  const [text, setText] = useState("");
  const invalidate = () => void utils.notes.list.invalidate();
  const add = trpc.notes.add.useMutation({ onSuccess: () => { setText(""); invalidate(); } });
  const del = trpc.notes.delete.useMutation({ onSuccess: invalidate });
  const atSec = Math.floor(currentTime());

  return (
    <div className={CARD}>
      <p className="mb-3 flex items-center gap-2 text-[14px] font-semibold text-white/85">
        <NotebookPen className="size-4 text-[var(--accent)]" strokeWidth={2} />
        {t("notes.title")}
      </p>
      <div className="flex items-center gap-2">
        <span className="shrink-0 rounded-md bg-white/6 px-2 py-2 text-[12px] tabular text-white/55" title={t("notes.atHint")}>
          {fmt(atSec)}
        </span>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && text.trim()) add.mutate({ lessonId, second: atSec, text });
          }}
          placeholder={t("notes.placeholder")}
          className={cn(INPUT, "h-9 flex-1")}
          maxLength={500}
        />
        <button
          type="button"
          disabled={!text.trim() || add.isPending}
          onClick={() => add.mutate({ lessonId, second: atSec, text })}
          className="h-9 shrink-0 rounded-lg bg-white px-4 text-[13px] font-semibold text-black transition hover:bg-white/90 disabled:opacity-40"
        >
          {t("notes.add")}
        </button>
      </div>
      <div className="mt-3 space-y-1.5">
        {(notes.data ?? []).map((n) => (
          <div key={n.id} className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-white/4">
            <button
              type="button"
              onClick={() => onSeek(n.second)}
              className="shrink-0 rounded-md bg-[var(--accent)]/12 px-2 py-0.5 text-[12px] font-semibold tabular text-[var(--accent)] transition hover:bg-[var(--accent)]/22"
              title={t("notes.jump")}
            >
              {fmt(n.second)}
            </button>
            <p className="min-w-0 flex-1 truncate text-[13px] text-white/75">{n.text}</p>
            <Tip label={t("notes.delete")}>
              <button
                type="button"
                onClick={() => del.mutate({ id: n.id })}
                className="grid size-8 shrink-0 place-items-center text-white/25 transition hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
                aria-label={t("notes.delete")}
              >
                <Trash2 className="size-3.5" />
              </button>
            </Tip>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LessonAttachments({ pdfUrl, videoUrl, videoKind }: { pdfUrl: string | null | undefined; videoUrl: string | null | undefined; videoKind: "youtube" | "file" | "embed" }) {

  if (!pdfUrl && !videoUrl) return null;
  const ICON_BTN =
    "inline-flex size-10 items-center justify-center rounded-full border border-white/12 text-white/70 transition hover:border-white/30 hover:text-white";
  return (
    <>
      {pdfUrl && (
        <Tip label={t("watch.sheet")}>
          <a href={pdfUrl} target="_blank" rel="noreferrer" aria-label={t("watch.sheet")} className={ICON_BTN}>
            <FileText className="size-4" strokeWidth={1.75} />
          </a>
        </Tip>
      )}
      {videoKind === "file" && videoUrl ? (
        <Tip label={t("watch.offline.file")}>
          <a href={videoUrl} download aria-label={t("watch.offline.file")} className={ICON_BTN}>
            <Download className="size-4" strokeWidth={1.75} />
          </a>
        </Tip>
      ) : videoKind === "youtube" ? (
        <Tip label={t("watch.offline.app")}>
          <span
            role="img"
            aria-label={t("watch.offline.app")}
            className="inline-flex size-10 items-center justify-center rounded-full border border-white/8 text-white/35"
            title={t("watch.offline.youtubeHint")}
          >
            <Smartphone className="size-4" strokeWidth={1.75} />
          </span>
        </Tip>
      ) : null}
    </>
  );
}
