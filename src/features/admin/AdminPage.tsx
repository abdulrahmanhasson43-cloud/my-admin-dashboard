import React, { useMemo, useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  BarChart3,
  Settings,
  Search,
  Plus,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Star,
  Check,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  Wallet,
  UserCheck,
} from 'lucide-react';
import { COURSES, CATEGORIES, INSTRUCTORS, categoryLabel, totalLessons } from '../../data/catalog';
import { Logo, Pill, Stars, Avatar, Progress } from '../../shared/ui';
import { useAuth } from '../auth/AuthProvider';
import { go } from '../../shared/lib/router';

type Section = 'overview' | 'courses' | 'students' | 'instructors' | 'reports' | 'settings';

const NAV: { key: Section; label: string; icon: React.ElementType; adminOnly?: boolean }[] = [
  { key: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
  { key: 'courses', label: 'الدورات', icon: BookOpen },
  { key: 'students', label: 'المتعلّمون', icon: Users },
  { key: 'instructors', label: 'المدرّبون', icon: GraduationCap },
  { key: 'reports', label: 'التقارير', icon: BarChart3, adminOnly: true },
  { key: 'settings', label: 'الإعدادات', icon: Settings, adminOnly: true },
];

const DEMO_STUDENTS = [
  { name: 'مريم حسن', email: 'maryam@example.com', courses: 3, progress: 68, joined: '12 مارس 2026', status: 'نشط' },
  { name: 'عبدالله ناصر', email: 'abdullah@example.com', courses: 2, progress: 91, joined: '04 مارس 2026', status: 'نشط' },
  { name: 'يوسف كريم', email: 'youssef@example.com', courses: 4, progress: 35, joined: '28 فبراير 2026', status: 'نشط' },
  { name: 'سلمى فؤاد', email: 'salma@example.com', courses: 1, progress: 100, joined: '21 فبراير 2026', status: 'مكتمل' },
  { name: 'كريم عادل', email: 'karim@example.com', courses: 2, progress: 12, joined: '18 فبراير 2026', status: 'خامل' },
  { name: 'نور الهدى', email: 'nour@example.com', courses: 3, progress: 54, joined: '10 فبراير 2026', status: 'نشط' },
];

const Admin: React.FC = () => {
  const { user, logout } = useAuth();
  const [section, setSection] = useState<Section>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [q, setQ] = useState('');

  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';

  /* ---------- حماية الوصول ---------- */
  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="text-center max-w-sm">
          <span className="grid place-items-center w-16 h-16 rounded-2xl bg-white/5 mx-auto mb-5">
            <ShieldCheck className="w-7 h-7 text-accent" />
          </span>
          <h1 className="text-2xl font-extrabold text-white">مساحة محمية</h1>
          <p className="text-[13px] text-muted mt-2.5 leading-relaxed">
            هذه المساحة مخصّصة للمدرّسين والمشرفين فقط. يرجى تسجيل الدخول للمتابعة.
          </p>
          <button onClick={() => go('/login')} className="btn btn-primary mt-6">تسجيل الدخول</button>
        </div>
      </div>
    );
  }

  if (user.role === 'student') {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="text-center max-w-sm">
          <span className="grid place-items-center w-16 h-16 rounded-2xl bg-accent-2/10 mx-auto mb-5">
            <AlertTriangle className="w-7 h-7 text-accent-2" />
          </span>
          <h1 className="text-2xl font-extrabold text-white">لا تملك صلاحية الوصول</h1>
          <p className="text-[13px] text-muted mt-2.5 leading-relaxed">
            هذه الصفحة مخصّصة لإدارة المنصة. حسابك حساب طالب، ويمكنك متابعة تعلّمك من مساحة «مساراتي».
          </p>
          <div className="flex items-center justify-center gap-2.5 mt-6">
            <button onClick={() => go('/my-learning')} className="btn btn-primary">الذهاب إلى مساراتي</button>
            <button onClick={() => go('/')} className="btn btn-ghost">الرئيسية</button>
          </div>
        </div>
      </div>
    );
  }

  const visibleNav = NAV.filter((n) => !n.adminOnly || isAdmin);
  const activeLabel = NAV.find((n) => n.key === section)?.label ?? '';

  const filteredCourses = useMemo(
    () =>
      COURSES.filter(
        (c) =>
          !q.trim() ||
          c.title.toLowerCase().includes(q.toLowerCase()) ||
          c.instructor.toLowerCase().includes(q.toLowerCase())
      ),
    [q]
  );

  const filteredStudents = useMemo(
    () =>
      DEMO_STUDENTS.filter(
        (s) => !q.trim() || s.name.includes(q) || s.email.toLowerCase().includes(q.toLowerCase())
      ),
    [q]
  );

  return (
    <div className="min-h-screen bg-ink flex" dir="rtl">
      {/* ===================== الشريط الجانبي ===================== */}
      <aside
        className={`fixed lg:sticky top-0 right-0 z-40 h-screen w-[260px] shrink-0 bg-ink-2 border-l border-white/8 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/8">
          <Logo onClick={() => go('/')} />
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted hover:text-white" aria-label="إغلاق">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-3 py-4">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-white/[0.03] border border-white/8">
            <Avatar name={user.name} size={32} />
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-accent">{isAdmin ? 'مشرف المنصة' : 'مساحة المدرّس'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {visibleNav.map(({ key, label, icon: Icon }) => {
            const active = section === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setSection(key);
                  setSidebarOpen(false);
                  setQ('');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-colors ${
                  active ? 'bg-accent/12 text-white border border-accent/25' : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-accent' : ''}`} />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/8 space-y-1">
          <button
            onClick={() => go('/')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12.5px] text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> العودة للموقع
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12.5px] text-white/60 hover:text-accent-2 hover:bg-accent-2/5 transition-colors"
          >
            <LogOut className="w-4 h-4" /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ===================== المحتوى ===================== */}
      <main className="flex-1 min-w-0">
        {/* الشريط العلوي */}
        <header className="sticky top-0 z-20 h-16 bg-ink/85 backdrop-blur border-b border-white/8 flex items-center gap-3 px-4 sm:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white" aria-label="القائمة">
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-[15px] font-extrabold text-white">{activeLabel}</h1>
            <p className="text-[10.5px] text-muted">{isAdmin ? 'لوحة إدارة المنصة' : 'مساحة عمل المدرّس'}</p>
          </div>

          <div className="mr-auto flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="بحث…"
                className="field !py-2 !pr-9 !text-[12.5px] w-48"
                aria-label="بحث"
              />
            </div>
            <span className="hidden md:flex items-center gap-1.5 text-[10.5px] text-mint bg-mint/10 border border-mint/25 rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-mint live-dot" /> النظام يعمل
            </span>
          </div>
        </header>

        <div className="p-4 sm:p-6 max-w-[1300px]">
          {section === 'overview' && <Overview isAdmin={isAdmin} />}
          {section === 'courses' && <CoursesTable courses={filteredCourses} />}
          {section === 'students' && <StudentsTable students={filteredStudents} />}
          {section === 'instructors' && <InstructorsGrid />}
          {section === 'reports' && isAdmin && <Reports />}
          {section === 'settings' && isAdmin && <SettingsPanel />}
        </div>
      </main>
    </div>
  );
};

/* ============================ نظرة عامة ============================ */
const Overview: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
  const stats = [
    { label: 'إجمالي المتعلّمين', value: '4,280', change: '+12.4%', up: true, icon: Users },
    { label: 'الدورات النشطة', value: String(COURSES.length), change: '+2', up: true, icon: BookOpen },
    { label: 'معدّل الإتمام', value: '76%', change: '+5.1%', up: true, icon: UserCheck },
    { label: isAdmin ? 'الإيرادات (الشهر)' : 'دروس هذا الشهر', value: isAdmin ? '٤٨٬٦٠٠ ج.م' : '312', change: '+8.7%', up: true, icon: isAdmin ? Wallet : BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, change, up, icon: Icon }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center justify-between">
              <span className="grid place-items-center w-9 h-9 rounded-lg bg-white/5 text-accent">
                <Icon className="w-4.5 h-4.5" />
              </span>
              <span className={`flex items-center gap-0.5 text-[10.5px] font-bold ${up ? 'text-mint' : 'text-accent-2'}`}>
                {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {change}
              </span>
            </div>
            <div className="text-2xl font-extrabold text-white mt-3 leading-none">{value}</div>
            <div className="text-[11px] text-muted mt-1.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* أكثر الدورات نشاطاً */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-extrabold text-white">أكثر الدورات نشاطاً</h2>
            <span className="text-[10.5px] text-muted">هذا الشهر</span>
          </div>
          <div className="space-y-3.5">
            {[...COURSES].sort((a, b) => b.students - a.students).slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <img src={c.image} alt="" className="w-12 h-8 rounded object-cover shrink-0" loading="lazy" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[12.5px] font-semibold text-white truncate">{c.title}</p>
                    <span className="text-[10.5px] text-muted shrink-0">{c.students.toLocaleString('ar-EG')}</span>
                  </div>
                  <div className="mt-1.5">
                    <Progress value={Math.min(100, Math.round((c.students / 6000) * 100))} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* آخر النشاطات */}
        <div className="card p-5">
          <h2 className="text-[14px] font-extrabold text-white mb-4">آخر النشاطات</h2>
          <ul className="space-y-3.5">
            {[
              { name: 'سلمى فؤاد', action: 'أكملت دورة تصميم الواجهات', time: 'قبل 12 دقيقة', tone: 'text-mint' },
              { name: 'عبدالله ناصر', action: 'سجّل في دورة بايثون', time: 'قبل 40 دقيقة', tone: 'text-accent' },
              { name: 'مريم حسن', action: 'أتمّت 5 دروس اليوم', time: 'قبل ساعة', tone: 'text-gold' },
              { name: 'كريم عادل', action: 'حصل على شهادة', time: 'قبل ساعتين', tone: 'text-violet' },
            ].map((a, i) => (
              <li key={i} className="flex gap-2.5">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${a.tone.replace('text-', 'bg-')}`} />
                <div className="min-w-0">
                  <p className="text-[11.5px] text-white/80 leading-snug">
                    <span className="font-bold text-white">{a.name}</span> {a.action}
                  </p>
                  <p className="text-[10px] text-muted mt-0.5">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {isAdmin && (
        <div className="card p-5">
          <h2 className="text-[14px] font-extrabold text-white mb-4">توزيع المتعلّمين حسب المجال</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {CATEGORIES.slice(0, 4).map((c, i) => {
              const pct = [34, 26, 22, 18][i];
              return (
                <div key={c.key} className="bg-white/[0.03] border border-white/8 rounded-xl p-3.5">
                  <div className="flex items-center justify-between text-[11.5px]">
                    <span className="text-white/80 font-semibold">{c.label}</span>
                    <span className="text-muted">{pct}%</span>
                  </div>
                  <div className="mt-2"><Progress value={pct} /></div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================ جدول الدورات ============================ */
const CoursesTable: React.FC<{ courses: typeof COURSES }> = ({ courses }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between gap-3">
      <p className="text-[12.5px] text-muted"><span className="text-white font-bold">{courses.length}</span> دورة</p>
      <button className="btn btn-primary !py-2 !px-4 text-[12.5px]">
        <Plus className="w-4 h-4" /> إضافة دورة
      </button>
    </div>

    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-white/8 bg-white/[0.02]">
              {['الدورة', 'المجال', 'المدرّب', 'الدروس', 'التقييم', 'الحالة', ''].map((h) => (
                <th key={h} className="text-[10.5px] font-bold text-muted px-4 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {courses.map((c) => (
              <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5 min-w-[200px]">
                    <img src={c.image} alt="" className="w-10 h-7 rounded object-cover shrink-0" loading="lazy" />
                    <span className="text-[12.5px] font-semibold text-white line-clamp-1">{c.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[11.5px] text-muted whitespace-nowrap">{categoryLabel(c.category)}</td>
                <td className="px-4 py-3 text-[11.5px] text-white/70 whitespace-nowrap">{c.instructor}</td>
                <td className="px-4 py-3 text-[11.5px] text-muted">{totalLessons(c)}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-[11.5px] text-gold">
                    <Star className="w-3 h-3 fill-gold" strokeWidth={0} /> {c.rating.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {c.isNew ? <Pill tone="new">جديد</Pill> : <Pill tone="free"><Check className="w-3 h-3" /> منشور</Pill>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button className="grid place-items-center w-7 h-7 rounded-md hover:bg-white/10 text-muted hover:text-white" aria-label="عرض"><Eye className="w-3.5 h-3.5" /></button>
                    <button className="grid place-items-center w-7 h-7 rounded-md hover:bg-white/10 text-muted hover:text-white" aria-label="تعديل"><Pencil className="w-3.5 h-3.5" /></button>
                    <button className="grid place-items-center w-7 h-7 rounded-md hover:bg-accent-2/10 text-muted hover:text-accent-2" aria-label="حذف"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

/* ============================ جدول المتعلّمين ============================ */
const StudentsTable: React.FC<{ students: typeof DEMO_STUDENTS }> = ({ students }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between gap-3">
      <p className="text-[12.5px] text-muted"><span className="text-white font-bold">{students.length}</span> متعلّم</p>
      <button className="btn btn-ghost !py-2 !px-4 text-[12.5px]">تصدير CSV</button>
    </div>

    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-white/8 bg-white/[0.02]">
              {['المتعلّم', 'الدورات', 'التقدّم', 'تاريخ الانضمام', 'الحالة', ''].map((h) => (
                <th key={h} className="text-[10.5px] font-bold text-muted px-4 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {students.map((s) => (
              <tr key={s.email} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5 min-w-[170px]">
                    <Avatar name={s.name} size={30} />
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-semibold text-white truncate">{s.name}</p>
                      <p className="text-[10px] text-muted truncate" dir="ltr">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[11.5px] text-muted">{s.courses}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 min-w-[110px]">
                    <Progress value={s.progress} />
                    <span className="text-[10.5px] text-white/70 shrink-0">{s.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[11.5px] text-muted whitespace-nowrap">{s.joined}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${
                    s.status === 'نشط' ? 'text-mint bg-mint/10 border-mint/25'
                    : s.status === 'مكتمل' ? 'text-violet bg-violet/10 border-violet/25'
                    : 'text-muted bg-white/5 border-white/10'
                  }`}>{s.status}</span>
                </td>
                <td className="px-4 py-3 text-left">
                  <button className="grid place-items-center w-7 h-7 rounded-md hover:bg-white/10 text-muted hover:text-white" aria-label="خيارات"><MoreHorizontal className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

/* ============================ المدرّبون ============================ */
const InstructorsGrid: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between gap-3">
      <p className="text-[12.5px] text-muted"><span className="text-white font-bold">{INSTRUCTORS.length}</span> مدرّب</p>
      <button className="btn btn-primary !py-2 !px-4 text-[12.5px]"><Plus className="w-4 h-4" /> إضافة مدرّب</button>
    </div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {INSTRUCTORS.map((ins) => (
        <div key={ins.name} className="card p-4">
          <div className="flex items-center gap-3">
            <Avatar src={ins.avatar} name={ins.name} size={44} />
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-white truncate">{ins.name}</p>
              <p className="text-[11px] text-muted truncate">{ins.title}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
              <div className="text-[15px] font-extrabold text-white">{ins.courses}</div>
              <div className="text-[10px] text-muted">دورات</div>
            </div>
            <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
              <div className="text-[15px] font-extrabold text-white">{ins.students}</div>
              <div className="text-[10px] text-muted">متعلّم</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            <button className="btn btn-quiet flex-1 !py-1.5 text-[11.5px]">الملف</button>
            <button className="btn btn-quiet flex-1 !py-1.5 text-[11.5px]">الدورات</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ============================ التقارير ============================ */
const Reports: React.FC = () => {
  const bars = [42, 58, 51, 73, 66, 82, 78, 91, 84, 96, 88, 100];
  const months = ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس'];
  return (
    <div className="space-y-5">
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[14px] font-extrabold text-white">نمو التسجيلات</h2>
          <span className="text-[10.5px] text-muted">آخر 12 شهراً</span>
        </div>
        <div className="flex items-end gap-1.5 h-48">
          {bars.map((b, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="w-full rounded-t-md brand-gradient opacity-70 group-hover:opacity-100 transition-opacity" style={{ height: `${b}%` }} />
              <span className="text-[9px] text-muted">{months[i]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { label: 'متوسط مدة الجلسة', value: '24 دقيقة' },
          { label: 'معدّل العودة', value: '68%' },
          { label: 'دورات مكتملة', value: '1,204' },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div className="text-xl font-extrabold text-white">{s.value}</div>
            <div className="text-[11px] text-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============================ الإعدادات ============================ */
const SettingsPanel: React.FC = () => {
  const [name, setName] = useState('مدار');
  const [support, setSupport] = useState('support@madar.app');
  const [savedMsg, setSavedMsg] = useState(false);

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="card p-5">
        <h2 className="text-[14px] font-extrabold text-white mb-4">إعدادات عامة</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-[11.5px] font-semibold text-white/70 mb-1.5">اسم المنصة</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="field" />
          </div>
          <div>
            <label className="block text-[11.5px] font-semibold text-white/70 mb-1.5">بريد الدعم</label>
            <input value={support} onChange={(e) => setSupport(e.target.value)} className="field" dir="ltr" />
          </div>
          <div className="flex items-center justify-between py-2 border-t border-white/8">
            <div>
              <p className="text-[12.5px] font-semibold text-white">السماح بالتسجيل الجديد</p>
              <p className="text-[10.5px] text-muted mt-0.5">تمكين إنشاء حسابات جديدة للطلاب</p>
            </div>
            <Toggle defaultOn />
          </div>
          <div className="flex items-center justify-between py-2 border-t border-white/8">
            <div>
              <p className="text-[12.5px] font-semibold text-white">إشعارات البريد</p>
              <p className="text-[10.5px] text-muted mt-0.5">إرسال ملخّص أسبوعي للمدرّسين</p>
            </div>
            <Toggle />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={() => {
              setSavedMsg(true);
              setTimeout(() => setSavedMsg(false), 2000);
            }}
            className="btn btn-primary !py-2 !px-5 text-[12.5px]"
          >
            حفظ التغييرات
          </button>
          {savedMsg && <span className="text-[11.5px] text-mint flex items-center gap-1"><Check className="w-3.5 h-3.5" /> تم الحفظ</span>}
        </div>
      </div>

      <div className="card p-5 border-accent-2/20">
        <h2 className="text-[14px] font-extrabold text-white mb-1">منطقة الخطر</h2>
        <p className="text-[11.5px] text-muted mb-4">إجراءات لا يمكن التراجع عنها. تعامل معها بحذر.</p>
        <button className="btn !bg-accent-2/10 !text-accent-2 !border !border-accent-2/30 !py-2 !px-4 text-[12px] hover:!bg-accent-2/20">
          <Trash2 className="w-3.5 h-3.5" /> حذف بيانات التجربة
        </button>
      </div>
    </div>
  );
};

const Toggle: React.FC<{ defaultOn?: boolean }> = ({ defaultOn }) => {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <button
      onClick={() => setOn((v) => !v)}
      role="switch"
      aria-checked={on}
      className={`relative w-10 h-5.5 rounded-full transition-colors ${on ? 'brand-gradient' : 'bg-white/15'}`}
      style={{ height: 22 }}
    >
      <span
        className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white transition-all ${on ? 'right-0.5' : 'right-[calc(100%-1.25rem)]'}`}
        style={{ width: 18, height: 18, right: on ? 2 : 'calc(100% - 20px)' }}
      />
    </button>
  );
};

export default Admin;
