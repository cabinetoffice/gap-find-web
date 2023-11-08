export const getAuthenticatedNavItems = (applicantUrl: string) => [
  {
    pageId: 'Search grants',
    link: '/grants',
    as: '/[slug]',
    title: 'Search grants',
  },
  {
    pageId: 'Notifications',
    link: '/notifications/manage-notifications',
    as: '/notifications/manage-notifications',
    title: 'Notifications',
  },
  {
    pageId: 'Manage Applications',
    link: `${applicantUrl}/applications`,
    as: `${applicantUrl}/applications`,
    title: 'Manage Applications',
  },
  {
    pageId: 'Account details',
    link: `${applicantUrl}/dashboard`,
    as: `${applicantUrl}/dashboard`,
    title: 'Account details',
  },
];

export const navItems = [
  {
    pageId: 'home',
    link: '/',
    as: '/',
    title: 'Home',
  },
  {
    pageId: 'browseGrants',
    link: '/grants',
    as: '/[slug]',
    title: 'Browse grants',
  },
  {
    pageId: 'aboutGrants',
    link: '/info/about-us',
    as: '/info/about-us',
    title: 'About us',
  },
];
