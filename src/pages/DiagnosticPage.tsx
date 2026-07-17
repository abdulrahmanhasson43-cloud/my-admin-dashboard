export default function DiagnosticPage() {
  const items = Array.from({ length: 80 }, (_, i) => i + 1);

  return (
    <div>
      <h1 className="text-lg font-bold text-[var(--vuno-text)] mb-2">
        صفحة اختبار داخل التطبيق
      </h1>
      <p className="text-sm text-[var(--vuno-text-secondary)] mb-4">
        نفس الهيكل العام (القائمة، الشريط السفلي) بس من غير أي حركات أو رسوم أو ضباب.
      </p>
      {items.map((n) => (
        <div key={n} className="p-4 border-b border-[var(--vuno-border-light)] text-sm">
          عنصر رقم {n}
        </div>
      ))}
      <div className="p-4 text-sm font-bold text-[var(--vuno-primary)]">
        وصلت لآخر عنصر — لو السكرول كان سلس هنا، المشكلة في الحركات/التأثيرات مش في الهيكل العام.
      </div>
    </div>
  );
}
