import React from 'react';
import { Headset } from 'lucide-react';
import { StudioShell, PageHeader } from '../../shared/studio/StudioShell';
import { useAuth } from '../auth/AuthProvider';
import { go } from '../../shared/lib/router';
import { SupportInbox } from '../../modules/support/ui/SupportInbox';

/** بوابة فريق الدعم: صندوق طلبات تعديل السنة والترم فقط. */
const SupportPortal: React.FC = () => {
  const { user } = useAuth();
  if (!user || (user.role !== 'support' && user.role !== 'admin')) {
    return (
      <div className="min-h-[70vh] grid place-items-center gutter">
        <div className="max-w-sm"><h1 className="text-[34px]">هذه الصفحة لفريق الدعم</h1><p className="text-muted mt-2">سجّل دخولك بحساب الدعم للوصول إليها.</p><button onClick={() => go('/login')} className="btn btn-primary mt-5">تسجيل الدخول</button></div>
      </div>
    );
  }
  return (
    <StudioShell portal="لوحة الدعم" root="/support" nav={[{ label: 'طلبات التعديل', href: '/support', icon: Headset }]}>
      <PageHeader title="طلبات التعديل" sub="طلبات الطلاب لتغيير السنة الدراسية أو الترم. الموافقة تنفّذ التعديل مباشرة." />
      <SupportInbox />
    </StudioShell>
  );
};

export default SupportPortal;
