import React from "react";

/**
 * Last-resort screen when a component throws while rendering.
 * It sits ABOVE the i18n provider, so it shows both languages at once instead
 * of guessing — nobody should be left with a white page or an English-only
 * stack trace. The technical message stays available, in English, for support.
 */
export class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Uncaught render error:", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div role="alert" className="grid min-h-dvh place-items-center bg-black px-6 py-16 text-white">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-red-500/12 text-2xl text-red-300" aria-hidden="true">
            !
          </div>
          <h1 dir="rtl" lang="ar" className="mt-6 text-[22px] font-semibold">
            حصلت مشكلة وإحنا بنعرض الصفحة
          </h1>
          <p dir="rtl" lang="ar" className="mt-2 text-[14px] leading-relaxed text-white/60">
            ماتقلقش، بياناتك سليمة. جرّب تحدّث الصفحة، ولو المشكلة فضلت كلّم الدعم.
          </p>
          <h2 dir="ltr" lang="en" className="mt-6 text-[17px] font-semibold text-white/90">
            Something went wrong while showing this page
          </h2>
          <p dir="ltr" lang="en" className="mt-1.5 text-[13.5px] leading-relaxed text-white/50">
            Your data is safe. Try reloading the page, and contact support if it keeps happening.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-[15px] font-medium text-black transition-colors hover:bg-white/90"
          >
            تحديث الصفحة · Reload
          </button>
          <details dir="ltr" className="mt-8 text-start">
            <summary className="cursor-pointer text-center text-[12px] text-white/35 hover:text-white/60">
              تفاصيل فنية · Technical details
            </summary>
            <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-[11.5px] leading-relaxed text-white/55">
              {error.message}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}
