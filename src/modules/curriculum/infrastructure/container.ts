import { LocalStorageCurriculumRepository } from './localStorageRepository';

/** نقطة التجميع الوحيدة: هنا نختار التنفيذ الفعلي لكل منفذ. */
export const curriculumRepository = new LocalStorageCurriculumRepository();
