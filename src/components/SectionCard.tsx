/**
 * A page section — NOT a boxed card. No white background, no border, no
 * shadow. Sections sit flush on the page background and are separated by
 * a hairline bottom divider + vertical spacing instead of being wrapped
 * in a white box, matching the rest of the app's "no nested cards" style.
 */
export default function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`py-5 sm:py-6 border-b border-[var(--vuno-border-light)] last:border-0 ${className}`}>
      {children}
    </div>
  );
}
