import { useState, useEffect } from 'react';

type DeviceType = 'mobile' | 'tablet' | 'desktop';

function computeDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width >= 1024) return 'desktop';
  if (width >= 768) return 'tablet';
  return 'mobile';
}

// IMPORTANT: this hook used to listen to the raw `resize` event, which
// fires continuously on mobile Chrome while the address bar animates
// in/out during scrolling — that ran this logic dozens of times per
// second on every single page (since AppLayout wraps every route),
// competing with the browser for main-thread time during scroll and
// causing scroll to feel frozen/laggy. matchMedia listeners only fire
// when a breakpoint is actually crossed, not on every pixel of resize.
export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>(computeDeviceType);

  useEffect(() => {
    const tabletQuery = window.matchMedia('(min-width: 768px)');
    const desktopQuery = window.matchMedia('(min-width: 1024px)');

    const update = () => setDeviceType(computeDeviceType());

    tabletQuery.addEventListener('change', update);
    desktopQuery.addEventListener('change', update);

    return () => {
      tabletQuery.removeEventListener('change', update);
      desktopQuery.removeEventListener('change', update);
    };
  }, []);

  return deviceType;
}

export function useIsMobile(): boolean {
  const deviceType = useDeviceType();
  return deviceType === 'mobile';
}
