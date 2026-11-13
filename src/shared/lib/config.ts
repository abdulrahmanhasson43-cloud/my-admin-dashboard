/** إعدادات التشغيل (من متغيرات البيئة). القيم الافتراضية للتجربة. */

/** إيميل مالك المنصة: الوحيد الذي يمكن أن يحمل دور السوبر أدمن. */
export const OWNER_EMAIL = ((import.meta.env.VITE_OWNER_EMAIL as string | undefined) ?? 'admin@madar.app').trim().toLowerCase();

/**
 * تبويبات اختيار نوع الحساب في صفحة الدخول — للتجربة فقط.
 * في الوضع النهائي تُقفل (VITE_SHOW_ROLE_PICKER=false) ويتعرّف النظام على الدور من الحساب نفسه.
 */
export const SHOW_ROLE_PICKER = ((import.meta.env.VITE_SHOW_ROLE_PICKER as string | undefined) ?? 'true') !== 'false';
