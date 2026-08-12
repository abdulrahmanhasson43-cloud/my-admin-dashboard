import { useState, useCallback, useMemo, type ReactNode } from 'react';
import { SalesGoalContext } from '@/context/sales-goal-context-value';
import type { SalesGoal } from '@/types';
import { useNotifications } from '@/context/notifications-context-value';

const STORAGE_KEY = 'vuno_sales_goal';

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

function loadGoal(): SalesGoal {
  const month = getCurrentMonth();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SalesGoal;
      if (parsed.month === month) return parsed;
    }
  } catch {
    // ignore corrupted storage
  }
  // Default goal: 100,000 EGP/month, 0 achieved
  return { month, target: 100000, achieved: 0 };
}

export function SalesGoalProvider({ children }: { children: ReactNode }) {
  const [goal, setGoal] = useState<SalesGoal>(loadGoal);
  const { addNotification } = useNotifications();
  const goalReachedRef = useMemo(() => ({ value: false }), []);

  const persist = useCallback((g: SalesGoal) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(g));
    } catch {
      // storage might be full or unavailable
    }
  }, []);

  const setTarget = useCallback((target: number) => {
    setGoal(prev => {
      const next = { ...prev, target: Math.max(0, target) };
      persist(next);
      return next;
    });
  }, [persist]);

  const addAchieved = useCallback((amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0) return;
    setGoal(prev => {
      const next = { ...prev, achieved: prev.achieved + amount };
      persist(next);
      // Fire a notification once when the goal is reached
      if (!goalReachedRef.value && next.target > 0 && next.achieved >= next.target) {
        goalReachedRef.value = true;
        addNotification({
          type: 'goal',
          title: '🎉 تم تحقيق هدف الشهر!',
          message: `مبروك! تجاوزت هدف المبيعات الشهري (${next.target.toLocaleString()} EGP). حققت ${next.achieved.toLocaleString()} EGP حتى الآن.`,
          link: '/dashboard',
        });
      }
      return next;
    });
  }, [persist, addNotification, goalReachedRef]);

  const progressPercent = useMemo(() => {
    if (goal.target <= 0) return 0;
    return Math.min(100, Math.round((goal.achieved / goal.target) * 100));
  }, [goal.target, goal.achieved]);

  const isGoalReached = goal.target > 0 && goal.achieved >= goal.target;

  const value = useMemo(() => ({
    currentGoal: goal,
    setTarget,
    addAchieved,
    progressPercent,
    isGoalReached,
  }), [goal, setTarget, addAchieved, progressPercent, isGoalReached]);

  return (
    <SalesGoalContext.Provider value={value}>
      {children}
    </SalesGoalContext.Provider>
  );
}
