import { env } from './env';

export const siteConfig = {
  name: env.NEXT_PUBLIC_APP_NAME,
  description: 'AI-powered personalized learning platform that adapts to your unique learning style',
  url: env.NEXT_PUBLIC_APP_URL,
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/og.png`,
  
  creator: 'StudySense Team',
  
  links: {
    github: 'https://github.com/studysense',
    twitter: 'https://twitter.com/studysense',
    discord: 'https://discord.gg/studysense',
  },

  keywords: [
    'learning',
    'education',
    'study',
    'AI',
    'personalized learning',
    'study plan',
    'roadmap',
  ],
} as const;

export const navConfig = {
  mainNav: [
    { title: 'Home', href: '/' },
    { title: 'Features', href: '/#features' },
    { title: 'Pricing', href: '/pricing' },
    { title: 'About', href: '/about' },
  ],
  
  dashboardNav: [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: 'LayoutDashboard',
    },
    {
      title: 'Study Plans',
      href: '/study-plans',
      icon: 'BookOpen',
    },
    {
      title: 'Roadmaps',
      href: '/roadmaps',
      icon: 'Map',
    },
    {
      title: 'Sessions',
      href: '/sessions',
      icon: 'Clock',
    },
    {
      title: 'Profile',
      href: '/profile',
      icon: 'User',
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: 'Settings',
    },
  ],

  adminNav: [
    {
      title: 'Overview',
      href: '/admin',
      icon: 'LayoutDashboard',
    },
    {
      title: 'Users',
      href: '/admin/users',
      icon: 'Users',
    },
    {
      title: 'Roadmaps',
      href: '/admin/roadmaps',
      icon: 'Map',
    },
    {
      title: 'Analytics',
      href: '/admin/analytics',
      icon: 'BarChart3',
    },
  ],
} as const;
