import React from 'react';
import type { Course } from '../../core/entities';
import { go } from '../lib/router';
import { Progress } from './primitives';
import { categoryTint, hideBroken } from './hue';

type Size = 'md' | 'lg';
const WIDTH: Record<Size, string> = {
  md: 'w-[132px] sm:w-[160px] lg:w-[188px]',
  lg: 'w-[190px] sm:w-[230px] lg:w-[270px]',
};

/** ملصق الدورة بنسبة 2:3 بزوايا شبه حادّة، والعنوان تحته سطراً واحداً — كما في Yango Play. */
export const Poster: React.FC<{ course: Course; progress?: number; eager?: boolean; fluid?: boolean; size?: Size }> = ({ course, progress, eager, fluid, size = 'md' }) => {
  const open = () => go(`/course/${course.id}`);
  return (
    <article className={`${fluid ? 'w-full' : WIDTH[size]} group cursor-pointer select-none`} onClick={open} role="link" tabIndex={0} aria-label={`${course.title} — ${course.instructor}`} onKeyDown={(e) => e.key === 'Enter' && open()}>
      <div className="relative aspect-[2/3] overflow-hidden" style={{ borderRadius: 'var(--radius-poster)', background: categoryTint(course.category) }}>
        <img src={course.image} alt="" width={376} height={564} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={hideBroken} className="absolute inset-0 w-full h-full object-cover transition-[filter] duration-300 group-hover:brightness-110" />
        {typeof progress === 'number' && <Progress value={progress} className="absolute bottom-0 inset-x-0" />}
      </div>
      <h3 className="mt-2.5 text-[15px] sm:text-[16px] font-normal leading-snug text-white line-clamp-1">{course.title}</h3>
    </article>
  );
};

/** اسم قديم يستخدمه باقي الصفحات — يعرض نفس الملصق. */
export const CourseCard: React.FC<{ course: Course; progress?: number; width?: string; eager?: boolean }> = ({ course, progress, width, eager }) => (
  <Poster course={course} progress={progress} eager={eager} fluid={width === 'w-full'} />
);
