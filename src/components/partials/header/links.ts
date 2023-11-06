import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

export const authenticatedNavItems = [
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
    link: `${publicRuntimeConfig.APPLY_FOR_A_GRANT_APPLICANT_URL}/applications`,
    as: `${publicRuntimeConfig.APPLY_FOR_A_GRANT_APPLICANT_URL}/applications`,
    title: 'Manage Applications',
  },
  {
    pageId: 'Account details',
    link: `${publicRuntimeConfig.APPLY_FOR_A_GRANT_APPLICANT_URL}/dashboard`,
    as: `${publicRuntimeConfig.APPLY_FOR_A_GRANT_APPLICANT_URL}/dashboard`,
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
