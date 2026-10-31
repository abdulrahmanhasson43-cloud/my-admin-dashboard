import type { CategoryKey } from '../../core/entities';

/** لون احتياطي لكل تصنيف — يظهر خلف الصورة أثناء التحميل أو لو تعذّر تحميلها. */
const HUE: Record<CategoryKey, number> = { languages: 24, programming: 212, design: 330, business: 150, science: 190, math: 262, skills: 44 };
export const categoryTint = (key: CategoryKey, light = 22) => `hsl(${HUE[key]} 38% ${light}%)`;

/** إخفاء الصورة المكسورة بدل إظهار أيقونة المتصفح. */
export const hideBroken = (e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.visibility = 'hidden'; };
