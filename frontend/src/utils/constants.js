// Mock data constants - will be replaced with real API calls
export const MOCK_DATA = {
  user: {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    plan: 'Pro Plan',
    avatar: null,
  },
  dashboard: {
    tasksCompleted: 12,
    pendingTasks: 3,
    focusHours: 2,
    focusMinutes: 15,
    lastSession: '2h ago',
    waterIntake: 4,
    waterGoal: 8,
    currentStreak: 7,
    bestStreak: 14,
    todayGoal: {
      sessions: 2,
      tasks: 5,
      waterGlasses: 6,
      progress: 62,
    },
    motivation: {
      quote: 'Success is the sum of small efforts repeated day in and day out.',
      author: 'Robert Collier',
    },
  },
  sidebarNav: [
    { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/tasks', label: 'Tasks', icon: 'CheckSquare' },
    { path: '/focus', label: 'Focus', icon: 'Timer' },
    { path: '/health', label: 'Health', icon: 'Heart' },
    { path: '/motivation', label: 'Motivation', icon: 'Sparkles' },
  ],
};

// Helper function to get icon component
export const getIconComponent = (iconName) => {
  // This will be dynamically imported in components
  return iconName;
};