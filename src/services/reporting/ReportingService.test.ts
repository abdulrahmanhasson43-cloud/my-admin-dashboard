import { describe, expect, it } from 'vitest';
import { MockReportingRepository } from './MockReportingRepository';
import { ReportingService } from './ReportingService';

describe('ReportingService (over the mock repository)', () => {
  const service = new ReportingService(new MockReportingRepository());

  it('serves the week and year series the dashboard used to hard-code', () => {
    expect(service.getWeekSales()).toHaveLength(7);
    expect(service.getYearSales().at(-1)).toEqual({ name: '2026', sales: 72450 });
  });

  it('serves category and payment-method shares without any colour (presentation stays in the UI)', () => {
    for (const slice of [...service.getCategorySales(), ...service.getCategoryRevenue(), ...service.getPaymentMethodShare()]) {
      expect(Object.keys(slice).sort()).toEqual(['name', 'value']);
    }
  });

  it('payment-method shares add up to 100 percent', () => {
    const total = service.getPaymentMethodShare().reduce((sum, m) => sum + m.value, 0);
    expect(total).toBe(100);
  });

  it('returns copies, so a caller cannot corrupt the repository data', () => {
    const first = service.getWeekSales();
    first[0].sales = -1;
    expect(service.getWeekSales()[0].sales).toBe(8200);
  });

  it('exposes the scalar figures', () => {
    expect(service.getTotalLosses()).toBe(1240);
    expect(service.getTodayRevenue()).toBe(18500);
  });
});
