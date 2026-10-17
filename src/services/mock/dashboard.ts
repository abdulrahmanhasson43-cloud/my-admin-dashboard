// TODO(phase-3): replace with real aggregated data from Firestore/analytics.
export const salesData = [
  { name: 'يناير', sales: 42000 },
  { name: 'فبراير', sales: 38000 },
  { name: 'مارس', sales: 55000 },
  { name: 'أبريل', sales: 47000 },
  { name: 'مايو', sales: 63000 },
  { name: 'يونيو', sales: 58000 },
  { name: 'يوليو', sales: 72000 },
];

export const topProducts = [
  { name: 'سماعة بلوتوث', sales: 245, revenue: 12250 },
  { name: 'شاحن سريع', sales: 189, revenue: 5670 },
  { name: 'كيبل USB-C', sales: 156, revenue: 2340 },
  { name: 'جراب موبايل', sales: 134, revenue: 2680 },
  { name: 'ماوس لاسلكي', sales: 112, revenue: 1980 },
];

// The figures below used to be hard-coded inside DashboardPage / ReportsPage.
// They moved here (unchanged) so pages read them through ReportingService.

/** Dashboard "week" chart — short day names. */
export const weekSales = [
  { name: 'سبت', sales: 8200 }, { name: 'أحد', sales: 9400 }, { name: 'اثنين', sales: 7600 },
  { name: 'ثلاثاء', sales: 10200 }, { name: 'أربعاء', sales: 11500 }, { name: 'خميس', sales: 9800 },
  { name: 'جمعة', sales: 12450 },
];

export const yearSales = [
  { name: '2021', sales: 410000 }, { name: '2022', sales: 520000 }, { name: '2023', sales: 610000 },
  { name: '2024', sales: 705000 }, { name: '2025', sales: 780000 }, { name: '2026', sales: 72450 },
];

/** Dashboard category pie — sales grouped by product category. */
export const categorySales = [
  { name: 'إلكترونيات', value: 28650 },
  { name: 'كمبيوتر', value: 18900 },
  { name: 'إكسسوارات', value: 12400 },
  { name: 'شاشات', value: 8900 },
  { name: 'شبكات', value: 3600 },
];

/** Reports page — revenue per category. */
export const categoryRevenue = [
  { name: 'إلكترونيات', value: 145000 },
  { name: 'إكسسوارات', value: 68000 },
  { name: 'كمبيوتر', value: 92000 },
  { name: 'شاشات', value: 54000 },
  { name: 'شبكات', value: 31000 },
];

/** Reports page — last 7 days (full day names). */
export const lastSevenDaysSales = [
  { name: 'السبت', sales: 8500 },
  { name: 'الأحد', sales: 12000 },
  { name: 'الإثنين', sales: 9800 },
  { name: 'الثلاثاء', sales: 15000 },
  { name: 'الأربعاء', sales: 11200 },
  { name: 'الخميس', sales: 18500 },
  { name: 'الجمعة', sales: 22000 },
];

/** Reports page — share of each payment method, in percent. */
export const paymentMethodShare = [
  { name: 'كاش', value: 45 },
  { name: 'بطاقة', value: 30 },
  { name: 'محفظة', value: 18 },
  { name: 'إنستاباي', value: 7 },
];

export const totalLosses = 1240;
export const todayRevenue = 18500;
