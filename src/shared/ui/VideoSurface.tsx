import React, { useState } from 'react';
import { Play } from 'lucide-react';
import type { VideoSource } from '../../core/entities';

/**
 * عارض الفيديو حسب المصدر:
 *  - يوتيوب: «Lite Embed» — صورة وزرّ تشغيل، ولا يُحمَّل الـ iframe إلا عند الضغط (يوفّر حمل الصفحة).
 *  - hosted: ملف/رابط على سيرفر المنصة (mp4 مباشر). البثّ المجزّأ HLS يُضاف عند اختيار الاستضافة.
 */
export const VideoSurface: React.FC<{ video: VideoSource; title: string; poster?: string }> = ({ video, title, poster }) => {
  const [started, setStarted] = useState(false);

  if (video.kind === 'hosted') {
    return <video className="w-full aspect-video bg-black" controls playsInline preload="metadata" poster={poster} src={video.url} aria-label={title} />;
  }
  return (
    <div className="relative aspect-video bg-black">
      {started ? (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.id)}?autoplay=1&rel=0&modestbranding=1`}
          title={title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen
        />
      ) : (
        <button onClick={() => setStarted(true)} className="absolute inset-0 grid place-items-center group" aria-label={`تشغيل: ${title}`}>
          <img src={poster ?? `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" loading="lazy" />
          <span className="relative grid place-items-center w-16 h-16 rounded-full bg-white text-ink transition-transform group-hover:scale-105"><Play className="w-7 h-7 fill-current translate-x-[2px]" strokeWidth={0} /></span>
        </button>
      )}
    </div>
  );
};
