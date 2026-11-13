import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useCurriculum, definite } from './CurriculumProvider';
import { EditableList } from './EditableList';
import { addItem, moveItem, removeItem, renameItem, resetLabels, setLabel, setTermsEnabled, type ListKind } from '../application/editConfig';
import { gradesOfStage, subjectsOfStage } from '../domain/rules';
import { LABEL_KEYS, type LabelKey } from '../domain/entities';
import { PageHeader } from '../../../shared/studio/StudioShell';

type Tab = 'structure' | 'labels' | 'settings';
const CONCEPT: Record<LabelKey, string> = { stage: 'المرحلة', grade: 'الصف', subject: 'المادة', term: 'الترم', course: 'الكورس', unit: 'الوحدة', lesson: 'الدرس' };
const HELP: Record<LabelKey, string> = {
  stage: 'مثل: ابتدائي، إعدادي، ثانوي', grade: 'مثل: الصف الأول', subject: 'مثل: الرياضيات، العلوم',
  term: 'مثل: الترم الأول', course: 'ما يقدّمه المدرّس في مادة لصف معيّن', unit: 'مثل: وحدة، باب، فصل', lesson: 'مثل: درس، حصة',
};

/** صفحة السوبر أدمن: تحكم كامل في هيكل المنهج وفي كل المسميات التي يراها المستخدمون. */
const OwnerCurriculumPage: React.FC = () => {
  const { config, labels, apply, usage } = useCurriculum();
  const [tab, setTab] = useState<Tab>('structure');
  const [stageId, setStageId] = useState(config.stages[0]?.id ?? '');
  const [error, setError] = useState<string | null>(null);
  const [newStage, setNewStage] = useState('');

  useEffect(() => { if (!config.stages.some((s) => s.id === stageId)) setStageId(config.stages[0]?.id ?? ''); }, [config.stages, stageId]);

  const list = (kind: ListKind, sid?: string) => ({
    onAdd: (n: string) => apply(addItem(config, kind, n, sid)),
    onRename: (id: string, n: string) => apply(renameItem(config, kind, id, n)),
    onRemove: (id: string) => apply(removeItem(config, kind, id, usage)),
    onMove: (id: string, d: -1 | 1) => apply(moveItem(config, kind, id, d)),
    onError: setError,
  });
  const Tab_ = ({ k, children }: { k: Tab; children: React.ReactNode }) => (
    <button role="tab" aria-selected={tab === k} onClick={() => { setTab(k); setError(null); }} className={`h-[var(--tap)] -mb-px px-1 text-[15px] font-medium border-b-2 transition-colors ${tab === k ? 'text-white border-accent' : 'text-white/55 border-transparent hover:text-white'}`}>{children}</button>
  );

  return (
    <div>
      <PageHeader title="المنهج والمسميات" />
      <main>
        <p className="text-muted max-w-[60ch]">كل ما يراه الطلاب والمدرّسون من أسماء المراحل والصفوف والمواد والمسميات يخرج من هنا. التغييرات تُحفظ فور تنفيذها.</p>
        <div className="mt-4 flex gap-6 border-b border-white/10" role="tablist">
          <Tab_ k="structure">الهيكل</Tab_><Tab_ k="labels">المسميات</Tab_><Tab_ k="settings">الإعدادات</Tab_>
        </div>
        {error && <p role="alert" className="mt-4 text-[14px] text-[#ff8a8a]">{error}</p>}

        {tab === 'structure' && (
          <div className="mt-2">
            <div className="flex items-center gap-5 overflow-x-auto no-scrollbar border-b border-white/10">
              {config.stages.map((s) => (
                <button key={s.id} onClick={() => setStageId(s.id)} className={`h-[var(--tap)] shrink-0 -mb-px text-[15px] font-medium border-b-2 ${stageId === s.id ? 'text-white border-accent' : 'text-white/55 border-transparent hover:text-white'}`}>{s.name}</button>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-x-14 gap-y-8 mt-6">
              <EditableList title={definite(labels.grade.many)} rows={gradesOfStage(config, stageId)} addPlaceholder={`إضافة ${labels.grade.one}`} {...list('grades', stageId)} />
              <EditableList title={definite(labels.subject.many)} rows={subjectsOfStage(config, stageId)} addPlaceholder={`إضافة ${labels.subject.one}`} {...list('subjects', stageId)} />
            </div>
            <div className="grid md:grid-cols-2 gap-x-14 gap-y-8 mt-10 pt-6 border-t border-white/10">
              <EditableList title={definite(labels.stage.many)} rows={config.stages} addPlaceholder={`إضافة ${labels.stage.one}`} {...list('stages')} />
              {config.termsEnabled && <EditableList title={definite(labels.term.many)} rows={config.terms} addPlaceholder={`إضافة ${labels.term.one}`} {...list('terms')} />}
            </div>
          </div>
        )}

        {tab === 'labels' && (
          <div className="mt-2">
            {LABEL_KEYS.map((k) => (
              <div key={k} className="grid md:grid-cols-[1fr_200px_200px] items-center gap-x-6 gap-y-1 py-3 border-b border-white/10">
                <div><p className="text-[16px] text-white font-medium">{CONCEPT[k]}</p><p className="text-[13px] text-muted">{HELP[k]}</p></div>
                {(['one', 'many'] as const).map((f) => (
                  <input key={`${k}-${f}-${labels[k][f]}`} defaultValue={labels[k][f]} aria-label={`${f === 'one' ? 'المفرد' : 'الجمع'}: ${k}`} placeholder={f === 'one' ? 'المفرد' : 'الجمع'} className="field"
                    onBlur={(e) => { if (e.target.value !== labels[k][f]) setError(apply(setLabel(config, k, { ...labels[k], [f]: e.target.value }))); }} />
                ))}
              </div>
            ))}
            <button onClick={() => { apply(resetLabels(config)); setError(null); }} className="h-[var(--tap)] mt-3 text-[15px] font-medium text-accent">استعادة المسميات الافتراضية</button>
          </div>
        )}

        {tab === 'settings' && (
          <div className="mt-4">
            <div className="flex items-center justify-between gap-6 py-3 border-b border-white/10">
              <div><p className="text-[16px] text-white font-medium">تفعيل {definite(labels.term.many)}</p><p className="text-[13px] text-muted max-w-[52ch]">لو مفعّلة تُقسَّم {definite(labels.unit.many)} حسب {labels.term.one} داخل كل {labels.course.one}. لو أُغلقت تظهر متتابعة بدون تقسيم.</p></div>
              <button role="switch" aria-checked={config.termsEnabled} aria-label={`تفعيل ${definite(labels.term.many)}`} onClick={() => apply(setTermsEnabled(config, !config.termsEnabled))}
                className={`relative w-12 h-7 rounded-full shrink-0 transition-colors ${config.termsEnabled ? 'bg-accent' : 'bg-white/20'}`}>
                <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all ${config.termsEnabled ? 'end-0.5' : 'start-0.5'}`} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OwnerCurriculumPage;
