export const VACATION_COLORS: Record<
  VacationType,
  {
    bg: string;
    darkBg: string;
    accent: string;
    iconColor: string;
    badge: string;
    dot: string;
  }
> = {
  GENERAL: {
    bg: 'bg-violet-100',
    darkBg: 'dark:bg-violet-900/30',
    accent: 'bg-violet-500',
    iconColor: '#7C3AED',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
    dot: '#7C3AED',
  },
  COMPENSATORY: {
    bg: 'bg-amber-100',
    darkBg: 'dark:bg-amber-900/30',
    accent: 'bg-amber-500',
    iconColor: '#D97706',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    dot: '#D97706',
  },
  OFFICIAL: {
    bg: 'bg-teal-100',
    darkBg: 'dark:bg-teal-900/30',
    accent: 'bg-teal-500',
    iconColor: '#0D9488',
    badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
    dot: '#0D9488',
  },
};
