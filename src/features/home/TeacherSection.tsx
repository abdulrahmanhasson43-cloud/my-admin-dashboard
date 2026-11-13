import React from 'react';
import { go } from '../../shared/lib/router';
import { Avatar } from '../../shared/ui';
import { useSite } from '../../modules/site/ui/SiteProvider';

/** قسم «تعرّف على المدرّس»: الصورة والاسم واللقب والنبذة، كلها من إعدادات السوبر أدمن. */
export const TeacherSection: React.FC<{ title?: string }> = ({ title = 'تعرّف على المدرّس' }) => {
  const { site } = useSite();
  const t = site.teacher;
  return (
    <section className="gutter mt-12 md:mt-16 max-w-4xl mx-auto">
      <h2 className="text-white font-bold section-title">{title}</h2>
      <div className="mt-5 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
        <Avatar src={t.photo || undefined} name={t.name} size={150} />
        <div className="min-w-0">
          <p className="text-[26px] font-extrabold text-white leading-tight">{t.name}</p>
          <p className="text-[16px] text-accent font-semibold mt-1">{t.title}</p>
          {t.bio && <p className="text-[16px] text-white/75 mt-3 max-w-[58ch]">{t.bio}</p>}
          <button onClick={() => go('/courses')} className="btn btn-ghost mt-4">{site.texts.teacherButton}</button>
        </div>
      </div>
    </section>
  );
};
