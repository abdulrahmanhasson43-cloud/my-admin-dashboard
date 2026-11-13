import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Result } from '../../../core/result';
import type { SiteSettings } from '../domain/entities';
import { siteRepository } from '../infrastructure/container';
import { BrandContext } from '../../../shared/lib/brand';

interface Ctx {
  site: SiteSettings;
  /** يطبّق تعديلاً؛ يرجع نص الخطأ أو null عند النجاح. */
  apply: (next: Result<SiteSettings> | SiteSettings) => string | null;
}

const SiteContext = createContext<Ctx | null>(null);

const rgb = (hex: string) => { const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255] as const; };
const rgba = (hex: string, a: number) => { const [r, g, b] = rgb(hex); return `rgba(${r}, ${g}, ${b}, ${a})`; };
const lift = (hex: string, a: number) => { const [r, g, b] = rgb(hex); const m = (v: number) => Math.round(v + (255 - v) * a); return `rgb(${m(r)}, ${m(g)}, ${m(b)})`; };

/** يترجم الإعدادات إلى متغيرات CSS على عنصر الجذر. */
export const applyTheme = (site: SiteSettings) => {
  const r = document.documentElement.style, c = site.colors, z = site.sizes, bg = site.appearance.background;
  const set = (k: string, v: string | number) => r.setProperty(k, String(v));
  set('--color-accent', site.brand.accent); set('--color-accent-2', site.brand.accent);
  set('--color-ink', bg); set('--color-ink-2', lift(bg, 0.04));
  set('--color-surface', c.surface); set('--color-surface-2', c.surface2);
  set('--color-text', c.text); set('--color-muted', c.muted);
  set('--btn-bg', c.buttonBg); set('--btn-fg', c.buttonText);
  set('--footer-bg', c.footerBg); set('--footer-fg', c.footerText); set('--footer-muted', c.footerMuted);
  set('--cta-from', c.ctaFrom); set('--cta-to', c.ctaTo); set('--cta-fg', c.ctaText);
  set('--card-bg', rgba(c.cardBg, z.cardOpacity / 100)); set('--card-fg', c.cardText);
  const s = z.heroShade / 100;
  set('--hero-grad', `linear-gradient(to top, ${rgba(c.heroOverlay, Math.min(1, s))} 0%, ${rgba(c.heroOverlay, 0.55 * s)} 45%, ${rgba(c.heroOverlay, 0.05 * s)} 100%)`);
  set('--hero-h', z.heroHeight); set('--hero-min', `${z.heroMinHeight}px`);
  set('--hero-title-m', `${z.heroTitle}px`); set('--hero-title-d', `${z.heroTitleWide}px`); set('--hero-desc', `${z.heroDesc}px`);
  set('--radius-card', `${site.appearance.sharpAll ? 0 : z.cardRadius}px`);
  set('--btn-h', `${z.buttonHeight}px`); set('--btn-h-lg', `${z.buttonHeight + 4}px`);
  set('--gutter-m', `${z.gutter}px`); set('--gutter-d', `${z.gutterWide}px`);
  set('--topbar-m', `${z.topbar}px`); set('--topbar-d', `${z.topbarWide}px`);
  set('--section-title', `${z.sectionTitle}px`); set('--footer-heading', `${z.footerHeading}px`); set('--footer-link', `${z.footerLink}px`); set('--social-size', `${z.socialSize}px`);
  const sharp = site.appearance.sharpAll;
  set('--radius-poster', `${sharp ? 0 : site.appearance.posterRadius}px`);
  set('--radius-btn', sharp || site.appearance.buttonShape === 'sharp' ? '0px' : site.appearance.buttonShape === 'pill' ? '9999px' : '12px');
  if (sharp) document.documentElement.setAttribute('data-sharp', '1'); else document.documentElement.removeAttribute('data-sharp');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg);
};

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [site, setSite] = useState<SiteSettings>(() => siteRepository.load());

  const apply = useCallback<Ctx['apply']>((next) => {
    const value = 'ok' in next ? (next.ok ? next.value : null) : next;
    if (!value) return 'ok' in next && !next.ok ? next.error : 'تعذّر الحفظ.';
    setSite(value); siteRepository.save(value); return null;
  }, []);

  // كل ألوان وأحجام المنصة تتبع إعدادات السوبر أدمن فوراً عبر متغيرات CSS.
  useEffect(() => { applyTheme(site); }, [site]);
  useEffect(() => { document.title = site.brand.name; }, [site.brand.name]);

  const value = useMemo(() => ({ site, apply }), [site, apply]);
  const brand = useMemo(() => ({ name: site.brand.name }), [site.brand.name]);
  return <SiteContext.Provider value={value}><BrandContext.Provider value={brand}>{children}</BrandContext.Provider></SiteContext.Provider>;
};

export const useSite = () => {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used within SiteProvider');
  return ctx;
};
