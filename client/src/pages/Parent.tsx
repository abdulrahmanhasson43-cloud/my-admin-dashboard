import { Link } from "wouter";
import { Users } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty";
import { PageShell } from "@/components/site/page";
import { ChildCard, LinkChildForm } from "@/components/site/v14";
import { useAccent } from "@/lib/theme";
import { t } from "@/i18n";

export default function Parent() {
  const settings = trpc.catalog.settings.useQuery();
  useAccent(settings.data?.accent_color);
  const session = trpc.auth.session.useQuery();
  const isParent = session.data?.profile?.role === "parent";
  const kids = trpc.parent.children.useQuery(undefined, { enabled: isParent, retry: false });

  return (
    <div className="min-h-dvh bg-black">
      <SiteHeader />
      <PageShell width="narrow">
        <header className="border-b border-white/8 pb-8">
          <p className="t-overline mb-3 text-white/32">{t("v14.parent.overline")}</p>
          <h1 className="t-display text-white">{t("v14.parent.title")}</h1>
        </header>
        <div className="mt-8 space-y-6">
          {session.isLoading ? (
            <Skeleton className="h-32 rounded-xl" />
          ) : !isParent ? (
            <EmptyState
              icon={<Users className="size-6" strokeWidth={1.5} />}
              title={t("v14.parent.notParentTitle")}
              action={<Link to="/account" className="inline-flex h-11 items-center rounded-[var(--radius-btn)] bg-[var(--accent)] px-5 text-[14px] font-medium text-black">{t("v14.parent.toAccount")}</Link>}
            />
          ) : (
            <>
              <LinkChildForm />
              {kids.isLoading ? (
                <Skeleton className="h-48 rounded-xl" />
              ) : (kids.data ?? []).length === 0 ? (
                <p className="text-[13.5px] text-white/45">{t("v14.parent.none")}</p>
              ) : (
                kids.data!.map((c) => <ChildCard key={c.childId} c={c} />)
              )}
            </>
          )}
        </div>
      </PageShell>
      <SiteFooter />
    </div>
  );
}
