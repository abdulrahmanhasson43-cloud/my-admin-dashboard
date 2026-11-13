import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { AcademicPicker, type Academic } from '../../modules/curriculum/ui/AcademicPicker';
import { useCurriculum } from '../../modules/curriculum/ui/CurriculumProvider';
import { useAuth } from './AuthProvider';
import { go } from '../../shared/lib/router';

/**
 * يظهر للطالب الذي لا سنة له (أو سنته المحفوظة لم تعد موجودة) ليختار مرة واحدة.
 * أما من لديه سنة صالحة فيرى أنها مقفولة ويُحوَّل لطلب تعديل عبر الدعم.
 */
const GradePage: React.FC<{ embedded?: boolean }> = ({ embedded }) => {
  const { user, setGrade } = useAuth();
  const { config, labels, gradeName } = useCurriculum();
  const [value, setValue] = useState<Academic>({});
  const [error, setError] = useState('');
  const top = { paddingTop: embedded ? 'calc(var(--topbar-h) + 28px)' : 'calc(var(--topbar-h) + env(safe-area-inset-top, 0px) + 28px)', paddingBottom: 40 };

  if (!user || user.role !== 'student') return <div className="gutter pt-28 min-h-[60vh]"><p className="text-muted">اختيار السنة للطلاب فقط.</p></div>;

  const locked = config.grades.some((g) => g.id === user.gradeId);
  if (locked) {
    return (
      <div className="gutter max-w-xl mx-auto" style={top}>
        <span className="grid place-items-center w-12 h-12 rounded-full bg-white/10"><Lock className="w-6 h-6" /></span>
        <h1 className="text-[28px] md:text-[34px] mt-4">سنتك الدراسية مثبّتة</h1>
        <p className="text-muted mt-2">أنت مسجّل في <b className="text-white">{gradeName(user.gradeId)}</b>. لا يمكن تغييرها بنفسك. لو سجّلت بالخطأ أرسل طلباً لفريق الدعم.</p>
        <div className="btn-pair mt-6">
          <button onClick={() => go('/support-request')} className="btn btn-primary btn-lg">طلب تعديل</button>
          <button onClick={() => go('/')} className="btn btn-ghost btn-lg">رجوع</button>
        </div>
      </div>
    );
  }

  const save = () => {
    if (!value.gradeId) return setError(`اختر ${labels.grade.one} أولاً.`);
    if (config.termsEnabled && !value.termId) return setError('اختر الترم.');
    const err = setGrade(value.gradeId, value.termId);
    if (err) return setError(err);
    go('/');
  };

  return (
    <div className="gutter max-w-xl mx-auto" style={top}>
      <h1 className="text-[30px] md:text-[38px]">أين أنت في دراستك؟</h1>
      <p className="text-muted mt-2">اختر سنتك والترم، وسنعرض لك المحتوى المناسب. <b className="text-white">لا يمكن تغييرهما لاحقاً إلا عبر فريق الدعم.</b></p>
      <div className="mt-6"><AcademicPicker value={value} onChange={setValue} /></div>
      {error && <p role="alert" className="text-[14px] text-[#ff8a8a] mt-2">{error}</p>}
      <button onClick={save} className="btn btn-primary btn-lg w-full mt-5">حفظ ومتابعة</button>
    </div>
  );
};

export default GradePage;
