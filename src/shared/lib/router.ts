import { useEffect, useState, useCallback } from 'react';

/** راوتر خفيف يعتمد على الهاش — يعمل على أي استضافة ثابتة دون إعداد خادم. */
export function useRoute() {
  const read = () => {
    const raw = window.location.hash.replace(/^#/, '') || '/';
    const [path, query = ''] = raw.split('?');
    return { path: path.replace(/\/+$/, '') || '/', query };
  };

  const [route, setRoute] = useState(read);

  useEffect(() => {
    const onChange = () => {
      setRoute(read());
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((to: string) => {
    const next = to.startsWith('#') ? to.slice(1) : to;
    if (window.location.hash.replace(/^#/, '') === next) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.location.hash = next;
  }, []);

  return { ...route, navigate };
}

export const go = (to: string) => {
  window.location.hash = to;
};
