import React from 'react';
import { Phone, MessageCircle, Mail, Facebook, Instagram, Youtube, Music2, Send, X as XIcon, type LucideIcon } from 'lucide-react';
import { Logo } from '../ui';
import { go } from '../lib/router';
import { fill } from '../lib/template';
import { useBrand } from '../lib/brand';
import { useAuth } from '../../features/auth/AuthProvider';
import { useSite } from '../../modules/site/ui/SiteProvider';
import type { Audience, SocialKind } from '../../modules/site/domain/entities';

const ICONS: Record<SocialKind, { Icon: LucideIcon; label: string }> = {
  facebook: { Icon: Facebook, label: 'فيسبوك' }, instagram: { Icon: Instagram, label: 'إنستجرام' }, whatsapp: { Icon: MessageCircle, label: 'واتساب' },
  tiktok: { Icon: Music2, label: 'تيك توك' }, youtube: { Icon: Youtube, label: 'يوتيوب' }, telegram: { Icon: Send, label: 'تيليجرام' }, x: { Icon: XIcon, label: 'إكس' },
};
const external = (href: string) => /^(https?:|tel:|mailto:)/.test(href);
const muted = { color: 'var(--footer-muted)' } as const;

/**
 * فوتر بأسلوب Yango Play: أعمدة روابط بعناوين، ثم أيقونات التواصل، سطر الحقوق، زرّ دعوة كبير بتدرّج،
 * سطر فرعي، وشعارات طرق الدفع. كل شيء (النصوص، الروابط، الأعمدة، الألوان، الأحجام) من إعدادات السوبر أدمن.
 */
export const Footer: React.FC = () => {
  const { name } = useBrand();
  const { site } = useSite();
  const { user } = useAuth();
  const f = site.features, ft = site.footer;
  const { contactPhone, contactWhatsapp, contactEmail, footerNote } = site.texts;
  if (!f.footer) return null;

  const wa = contactWhatsapp.replace(/[^\d]/g, '');
  const hasContact = f.footerContact && !!(contactPhone || contactWhatsapp || contactEmail);
  const seen = (who: Audience) => who === 'all' || (who === 'guest' && !user) || (who === 'student' && user?.role === 'student');
  const columns = f.footerColumns ? ft.columns
    .filter((c) => c.on)
    .map((c) => ({ ...c, links: c.links.filter((l) => l.on && l.label && seen(l.who) && !(l.href === '/redeem' && !f.codes) && !(l.href === '/#faq' && !f.faq) && !(l.href === '/support-request' && !f.requestEdit) && !(l.href.startsWith('/page/') && !site.pages.some((p) => p.on && p.slug === l.href.slice(6).split(/[?#]/)[0]))) }))
    .filter((c) => c.links.length > 0) : [];
  const socials = f.footerSocial ? ft.socials.filter((s) => s.on && (s.url || (s.kind === 'whatsapp' && wa))).map((s) => ({ ...s, url: s.url || `https://wa.me/${wa}` })) : [];
  const pay = f.footerPayments ? site.payments.methods.filter((m) => m.enabled && m.showInFooter && m.kind !== 'demo') : [];
  const cta = f.footerCta && ft.cta.label && seen(ft.cta.who) ? ft.cta : null;
  const vars = { name, year: new Date().getFullYear().toLocaleString('en-US', { useGrouping: false }) };

  const open = (href: string) => (external(href) ? window.open(href, '_blank', 'noopener,noreferrer') : go(href));
  const gridCols = 1 + columns.length + (hasContact ? 1 : 0);

  return (
    <footer className="mt-20" style={{ background: 'var(--footer-bg)', color: 'var(--footer-fg)' }}>
      <div className="gutter max-w-7xl mx-auto pt-10 pb-8">
        <div className="grid gap-9 md:gap-12" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${gridCols > 3 ? 160 : 200}px, 1fr))` }}>
          {f.footerBrand && (
            <div className="flex flex-col items-start" style={{ gridColumn: 'auto' }}>
              <Logo onClick={() => go('/')} size={24} color="var(--footer-fg)" />
              <p className="mt-1 max-w-[40ch] text-[14px]" style={muted}>{site.brand.tagline}</p>
              <p className="mt-3 text-[14px]">{site.teacher.name}<span style={muted}>، {site.teacher.title}</span></p>
            </div>
          )}
          {columns.map((c) => (
            <div key={c.id}>
              <h3 className="font-bold" style={{ fontSize: 'var(--footer-heading)', color: 'var(--footer-fg)' }}>{c.title}</h3>
              <ul className="mt-1.5">
                {c.links.map((l) => (
                  <li key={l.id}><button onClick={() => open(l.href)} className="min-h-[var(--tap)] text-start hover:opacity-80" style={{ fontSize: 'var(--footer-link)', ...muted }}>{l.label}</button></li>
                ))}
              </ul>
            </div>
          ))}
          {hasContact && (
            <div>
              <h3 className="font-bold" style={{ fontSize: 'var(--footer-heading)', color: 'var(--footer-fg)' }}>تواصل معنا</h3>
              <ul className="mt-1.5">
                {contactPhone && <li><a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="min-h-[var(--tap)] inline-flex items-center gap-2 hover:opacity-80" style={{ fontSize: 'var(--footer-link)', ...muted }} dir="ltr"><Phone className="w-4 h-4" />{contactPhone}</a></li>}
                {contactWhatsapp && <li><a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="min-h-[var(--tap)] inline-flex items-center gap-2 hover:opacity-80" style={{ fontSize: 'var(--footer-link)', ...muted }} dir="ltr"><MessageCircle className="w-4 h-4" />{contactWhatsapp}</a></li>}
                {contactEmail && <li><a href={`mailto:${contactEmail}`} className="min-h-[var(--tap)] inline-flex items-center gap-2 hover:opacity-80" style={{ fontSize: 'var(--footer-link)', ...muted }} dir="ltr"><Mail className="w-4 h-4" />{contactEmail}</a></li>}
              </ul>
            </div>
          )}
        </div>

        {socials.length > 0 && (
          <ul className="mt-8 flex items-center gap-5" aria-label="تواصل اجتماعي">
            {socials.map((s) => {
              const { Icon, label } = ICONS[s.kind];
              return (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className="grid place-items-center hover:opacity-80" style={{ width: 'var(--social-size)', height: 'var(--social-size)', ...muted }}>
                    <Icon style={{ width: '100%', height: '100%' }} strokeWidth={1.7} />
                  </a>
                </li>
              );
            })}
          </ul>
        )}

        {f.footerLegal && (
          <div className="mt-8 text-[13px] space-y-1" style={muted}>
            {ft.legal && <p>{fill(ft.legal, vars)}</p>}
            {footerNote && <p>{footerNote}</p>}
          </div>
        )}

        {cta && (
          <div className="mt-6 max-w-xl mx-auto md:mx-0">
            <button onClick={() => open(cta.href)} className="btn btn-cta btn-lg w-full">{fill(cta.label, vars)}</button>
            {cta.sub && <p className="mt-3 text-center text-[13px]" style={muted}>{fill(cta.sub, vars)}</p>}
          </div>
        )}

        {pay.length > 0 && (
          <ul className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3" aria-label="طرق الدفع">
            {pay.map((m) => (
              <li key={m.id} title={m.name}>
                {m.logo ? <img src={m.logo} alt={m.name} className="h-8 w-auto object-contain" loading="lazy" />
                  : <span className="inline-flex items-center h-8 px-3 rounded-md text-[12px] font-semibold" style={{ color: 'var(--footer-fg)', background: 'rgba(128,128,128,.16)' }}>{m.name}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </footer>
  );
};
