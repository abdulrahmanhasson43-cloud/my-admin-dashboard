import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react';

export interface Row { id: string; name: string }

/** قائمة قابلة للتحرير: اضغط الاسم لتعديله، أسهم للترتيب، وحذف، وإضافة من الأسفل. */
export const EditableList: React.FC<{
  title: string;
  rows: Row[];
  addPlaceholder: string;
  onAdd: (name: string) => string | null;
  onRename: (id: string, name: string) => string | null;
  onRemove: (id: string) => string | null;
  onMove: (id: string, dir: -1 | 1) => void;
  onError: (msg: string | null) => void;
}> = ({ title, rows, addPlaceholder, onAdd, onRename, onRemove, onMove, onError }) => {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState('');

  const commit = (id: string) => { const err = onRename(id, draft); onError(err); if (!err) setEditing(null); };
  const add = () => { const err = onAdd(adding); onError(err); if (!err) setAdding(''); };

  return (
    <section>
      <h3 className="text-[17px] font-bold text-white">{title}</h3>
      <ul className="mt-2">
        {rows.map((r, i) => (
          <li key={r.id} className="flex items-center gap-1 min-h-[48px] border-b border-white/10">
            {editing === r.id ? (
              <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={() => commit(r.id)}
                onKeyDown={(e) => { if (e.key === 'Enter') commit(r.id); if (e.key === 'Escape') { setEditing(null); onError(null); } }}
                className="field flex-1 !min-h-[44px] !py-2" aria-label="الاسم" />
            ) : (
              <button onClick={() => { setEditing(r.id); setDraft(r.name); onError(null); }} className="flex-1 min-h-[48px] text-start text-[16px] text-white/90 hover:text-white" title="اضغط للتعديل">{r.name}</button>
            )}
            <button className="icon-btn !w-10 text-white/60 disabled:opacity-25" aria-label="تحريك لأعلى" disabled={i === 0} onClick={() => onMove(r.id, -1)}><ArrowUp className="w-[18px] h-[18px]" /></button>
            <button className="icon-btn !w-10 text-white/60 disabled:opacity-25" aria-label="تحريك لأسفل" disabled={i === rows.length - 1} onClick={() => onMove(r.id, 1)}><ArrowDown className="w-[18px] h-[18px]" /></button>
            <button className="icon-btn !w-10 text-white/60 hover:text-[#ff8a8a]" aria-label={`حذف ${r.name}`} onClick={() => onError(onRemove(r.id))}><Trash2 className="w-[18px] h-[18px]" /></button>
          </li>
        ))}
        {rows.length === 0 && <li className="py-4 text-[15px] text-muted">لا يوجد شيء بعد.</li>}
      </ul>
      <div className="flex items-center gap-3 mt-2">
        <input value={adding} onChange={(e) => setAdding(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder={addPlaceholder} className="field flex-1" aria-label={addPlaceholder} />
        <button onClick={add} className="h-[var(--tap)] px-2 text-[15px] font-semibold text-accent shrink-0">إضافة</button>
      </div>
    </section>
  );
};
