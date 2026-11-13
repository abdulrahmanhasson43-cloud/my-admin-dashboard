import React, { useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { COURSES, findCourse } from '../../data/catalog';
import { go, useRoute } from '../../shared/lib/router';
import { Avatar } from '../../shared/ui';
import { useAuth } from '../auth/AuthProvider';
import { useCurriculum, definite } from '../../modules/curriculum/ui/CurriculumProvider';
import { gradesOfStage, stageOfGrade, subjectsOfStage } from '../../modules/curriculum/domain/rules';
import { useWallet, egp } from '../../modules/wallet/ui/WalletProvider';
import { ALL_TERMS } from '../../modules/wallet/domain/entities';

/** مجموعة اختيارات على شكل أقراص (Chips): اختيار واحد، ويمرّر أفقياً على الجوال. */
const ChipGroup: React.FC<{ label: string; options: { id: string; name: string }[]; value?: string; onChange: (id: string) => void }> = ({ label, options, value, onChange }) => (
  <div className="mt-7">
    <p className="text-[14px] font-semibold text-muted mb-2.5">{label}</p>
    <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-[var(--gutter)] px-[var(--gutter)] pb-1" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} role="radio" aria-checked={value === o.id} onClick={() => onChange(o.id)}
          className={`h-11 px-5 shrink-0 rounded-full text-[15px] font-semibold transition-colors ${value === o.id ? 'bg-white text-ink' : 'bg-white/10 text-white hover:bg-white/15'}`}>
          {o.name}
        </button>
      ))}
    </div>
  </div>
);

const EnrollPage: React.FC = () => {
  const { query } = useRoute();
  const { user } = useAuth();
  const { config, labels, gradeName, subjectName } = useCurriculum();
  const { wallet, purchase, priceOf, hasAccess } = useWallet();
  const params = useMemo(() => new URLSearchParams(query), [query]);
  const preset = findCourse(params.get('course') ?? '');

  const [gradeId, setGradeId] = useState(preset?.gradeId ?? (user?.role === 'student' ? user.gradeId : undefined) ?? config.grades[0]?.id);
  const [termId, setTermId] = useState(params.get('term') ?? (config.termsEnabled ? (user?.termId ?? config.terms[0]?.id) : ALL_TERMS) ?? ALL_TERMS);
  const [subjectId, setSubjectId] = useState<string | undefined>(preset?.subjectId);
  const [courseId, setCourseId] = useState<string | undefined>(preset?.id);
  const [error, setError] = useState<string | null>(null);

  const stage = stageOfGrade(config, gradeId);
  const subjects = stage ? subjectsOfStage(config, stage.id) : [];
  useEffect(() => { if (!subjects.some((s) => s.id === subjectId)) setSubjectId(subjects[0]?.id); }, [gradeId]);
  const options = COURSES.filter((c) => c.gradeId === gradeId && c.subjectId === subjectId);
  useEffect(() => { if (!options.some((c) => c.id === courseId)) setCourseId(options[0]?.id); }, [gradeId, subjectId]);
  const course = options.find((c) => c.id === courseId);

  const top = { paddingTop: 'calc(var(--topbar-h) + env(safe-area-inset-top, 0px) + 20px)' };
  if (!user || user.role !== 'student') {
    return (
      <div className="gutter min-h-[70vh]" style={top}>
        <div className="max-w-md pt-10">
          <h1 className="text-[32px] md:text-[40px]">الاشتراك</h1>
          <p className="text-muted mt-3">سجّل دخولك بحساب طالب لتختار {labels.course.one}ك وتشترك من محفظتك.</p>
          <button onClick={() => go('/login')} className="btn btn-primary btn-lg mt-6">تسجيل الدخول</button>
        </div>
      </div>
    );
  }

  const price = course ? priceOf(course, termId) : 0;
  const entitled = !!course && hasAccess(course, termId === ALL_TERMS ? undefined : termId);
  const enough = wallet.balance >= price;
  const termLabel = termId === ALL_TERMS ? 'كل الترمات' : config.terms.find((t) => t.id === termId)?.name ?? '';
  const days = course ? course.accessDays * (termId === ALL_TERMS ? Math.max(1, config.terms.length) : 1) : 0;

  const act = () => {
    if (!course) return;
    if (entitled) return go(`/course/${course.id}`);
    if (!enough) return go(`/wallet?need=${price}`);
    const err = purchase(course, termId);
    if (err) return setError(err);
    go(`/course/${course.id}`);
  };

  return (
    <div className="gutter pb-12 max-w-2xl mx-auto" style={top}>
      <h1 className="text-[30px] md:text-[38px]">اشترك في {labels.course.one}</h1>
      <p className="text-muted mt-2">اختر ما تحتاجه، ويُخصم السعر من محفظتك. <button onClick={() => go('/redeem')} className="text-accent font-semibold h-[var(--tap)] px-1">عندي كود</button></p>

      <ChipGroup label="السنة الدراسية" options={stage ? gradesOfStage(config, stage.id) : []} value={gradeId} onChange={setGradeId} />
      {config.termsEnabled && <ChipGroup label={definite(labels.term.one)} options={config.terms} value={termId} onChange={setTermId} />}
      <ChipGroup label={definite(labels.subject.one)} options={subjects} value={subjectId} onChange={setSubjectId} />

      <div className="mt-7">
        <p className="text-[14px] font-semibold text-muted">الباقة</p>
        {options.length === 0 && <p className="text-muted py-4">لا توجد {labels.course.many} لهذه الاختيارات بعد.</p>}
        <ul role="radiogroup" aria-label="الباقة">
          {options.map((c) => (
            <li key={c.id}>
              <button role="radio" aria-checked={courseId === c.id} onClick={() => setCourseId(c.id)} className="w-full min-h-[68px] flex items-center gap-3 py-3 text-start border-b border-white/10">
                <Avatar src={c.instructorAvatar} name={c.instructor} size={44} />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-white truncate">{c.offering}</span>
                  <span className="block text-[13px] text-muted">{c.rating.toLocaleString('ar-EG', { minimumFractionDigits: 1 })} تقييم، {c.students.toLocaleString('ar-EG')} طالب</span>
                </span>
                <span className="text-[15px] font-bold text-white tabular-nums">{egp(priceOf(c, termId))}</span>
                <span className={`grid place-items-center w-6 h-6 rounded-full shrink-0 ${courseId === c.id ? 'bg-accent text-white' : 'border border-white/25'}`}>{courseId === c.id && <Check className="w-4 h-4" strokeWidth={3} />}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {course && (
        <section className="mt-8" aria-label="ملخص الاشتراك">
          <h2 className="text-white">الملخّص</h2>
          <dl className="mt-3 text-[15px]">
            {[
              ['الكورس', `${subjectName(course.subjectId)} — ${gradeName(course.gradeId)}`],
              ...(termId !== ALL_TERMS ? [[definite(labels.term.one), termLabel]] : []),
              ['مدة الوصول', `${days.toLocaleString('ar-EG')} يوماً`],
              ['السعر', egp(price)],
              ['رصيدك', egp(wallet.balance)],
              [enough ? 'المتبقي بعد الاشتراك' : 'الناقص', egp(Math.abs(wallet.balance - price))],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5 border-b border-white/10"><dt className="text-muted">{k}</dt><dd className={`text-white font-medium ${k === 'الناقص' ? '!text-gold' : ''}`}>{v}</dd></div>
            ))}
          </dl>
          {error && <p role="alert" className="mt-3 text-[14px] text-[#ff8a8a]">{error}</p>}
          <button onClick={act} className="btn btn-primary btn-lg w-full mt-5">
            {entitled ? 'لديك اشتراك فعّال — ادخل الكورس' : enough ? `اشترك بـ ${egp(price)}` : `اشحن ${egp(price - wallet.balance)} لتكمل`}
          </button>
          {!enough && !entitled && <button onClick={() => go('/wallet')} className="btn btn-ghost btn-lg w-full mt-2.5">فتح المحفظة</button>}
        </section>
      )}
    </div>
  );
};

export default EnrollPage;
