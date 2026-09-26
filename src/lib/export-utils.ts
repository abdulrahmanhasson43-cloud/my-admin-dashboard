import * as XLSX from 'xlsx';

/**
 * تصدير مجموعة بيانات إلى ملف جدول (xlsx).
 *
 * يعمل على الديسكتوب والجوال — يبني Blob من مصفوفة ArrayBuffer
 * ويستخدم URL.createObjectUrl + عنصر <a download> بدلاً من أي
 * آلية تعتمد على نظام التشغيل. على الجوال (Chrome/Safari) يدعم
 * هذا التحميل المباشر إلى ملفات الجهاز.
 *
 * الواجهة مستقلة عن Excel — لا تذكر "Excel" في أي مكان مرئي
 * للمستخدم؛ نستخدم "تصدير" فقط.
 *
 * @param rows    صفوف البيانات (مصفوفة كائنات بنفس الأعمدة)
 * @param fileName اسم الملف بدون امتداد
 * @param sheetName  اسم الورقة داخل الملف
 */
export function exportToExcel(
  rows: Record<string, string | number>[],
  fileName: string,
  sheetName: string = 'بيانات',
): void {
  // بناء ورقة عمل من JSON — XLSX.utils.json_to_sheet يحوّل
  // مصفوفة الكائنات إلى ورقة تلقائياً، مع أخذ أسماء الأعمدة
  // من مفاتيح أول كائن.
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // ضبط عرض الأعمدة تقريبياً بناءً على أطول قيمة في كل عمود
  const colWidths = Object.keys(rows[0] ?? {}).map(key => {
    const maxLen = Math.max(
      key.length,
      ...rows.map(r => String(r[key] ?? '').length),
    );
    return { wch: Math.min(Math.max(maxLen + 2, 10), 40) };
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // كتابة إلى ArrayBuffer بدلاً من ملف على القرص — هذا هو
  // المفتاح لعمل التحميل على الجوال حيث قد لا يكون هناك
  // وصول مباشر لنظام الملفات من المتصفح.
  const arrayBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  }) as ArrayBuffer;

  // تحويل ArrayBuffer إلى Blob ثم تنزيل
  const blob = new Blob([arrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  downloadBlob(blob, `${fileName}.xlsx`);
}

/**
 * تنزيل Blob كملف — يعمل على كل المنصّات (ديسكتوب + جوال).
 * يستخدم URL.createObjectUrl مؤقتاً ثم يطلقه.
 */
function downloadBlob(blob: Blob, fullFileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fullFileName;
  link.rel = 'noopener';
  // يجب إضافة العنصر للـ DOM ليعمل التحميل في Firefox
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // تأخير قصير قبل إلغاء URL لضمان بدء التحميل
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
