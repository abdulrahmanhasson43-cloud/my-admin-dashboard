/** لون احتياطي لكل مادة (من معرّفها) — يظهر خلف الصورة أثناء التحميل أو لو تعذّر تحميلها. */
export const subjectTint = (subjectId: string, light = 22) => {
  let h = 0;
  for (let i = 0; i < subjectId.length; i++) h = (h * 31 + subjectId.charCodeAt(i)) % 360;
  return `hsl(${h} 36% ${light}%)`;
};

/** إخفاء الصورة المكسورة بدل إظهار أيقونة المتصفح. */
export const hideBroken = (e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.visibility = 'hidden'; };
