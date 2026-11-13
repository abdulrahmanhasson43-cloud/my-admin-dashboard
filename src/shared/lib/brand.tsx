import { createContext, useContext } from 'react';

/** اسم المنصة الحالي. يضبطه السوبر أدمن؛ القيمة الافتراضية للتجربة. */
export const BrandContext = createContext<{ name: string }>({ name: 'مدار' });
export const useBrand = () => useContext(BrandContext);
