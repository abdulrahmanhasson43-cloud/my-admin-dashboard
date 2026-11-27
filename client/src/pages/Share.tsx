import { useParams, Link } from "wouter";
import { Clock, Link2Off } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty";
import { MadarPlayer } from "@/components/site/madar-player";
import { t } from "@/i18n";

/**
 * Temporary signed video link (feature 11): a staff-made link that expires.
 * No login required — the signed token IS the access. Watching only: no
 * tracking, no notes, no download affordance.
 */
export default function Share() {
  const { token } = useParams<{ token: string }>();
  const data = trpc.share.open.useQuery({ token: token ?? "" }, { enabled: Boolean(token), retry: false });

  return (
    <div className="min-h-dvh bg-black">
      <SiteHeader />
      <div className="page-x mx-auto max-w-4xl pt-24">
        {data.isLoading ? (
          <>
            <Skeleton className="aspect-video w-full rounded-[var(--radius-media)]" />
            <Skeleton className="mt-6 h-7 w-1/2" />
          </>
        ) : data.isError || !data.data ? (
          <div className="pt-24">
            <EmptyState
              icon={<Link2Off className="size-6" strokeWidth={1.5} />}
              title={t("share.expiredTitle")}
              action={
                <Link
                  to="/courses"
                  className="inline-flex h-11 items-center rounded-[var(--radius-btn)] bg-[var(--accent)] px-5 text-[14px] font-medium text-black"
                >
                  {t("home.42")}
                </Link>
              }
            />
          </div>
        ) : (
          <>
            <div className="relative aspect-video w-full overflow-hidden bg-[#050505] sm:rounded-[var(--radius-media)] sm:ring-1 sm:ring-white/10">
              <MadarPlayer videoUrl={data.data.videoUrl} title={data.data.title} />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="t-caption text-white/40">{data.data.courseTitle}</p>
                <h1 className="t-title mt-1 text-white">{data.data.title}</h1>
              </div>
              <span className="tabular inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-1.5 text-[12.5px] text-white/70">
                <Clock className="size-3.5" strokeWidth={1.75} />
                {t("share.expiresIn")} {new Date(data.data.expiresAt).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </div>
          </>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
