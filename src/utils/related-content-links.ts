export interface RelatedContentLink {
  title: string;
  href: string;
}

export enum RelatedLinksNames {
  ABOUT_US,
  ACCESSIBILITY,
  TERMS_AND_CONDITIONS,
  PRIVACY_NOTICE,
  COOKIES,
}

export const RelatedContentLinks = new Map<
  RelatedLinksNames,
  RelatedContentLink
>([
  [RelatedLinksNames.ABOUT_US, { title: 'About us', href: '/info/about-us' }],
  [
    RelatedLinksNames.ACCESSIBILITY,
    { title: 'Accessibility statement', href: '/info/accessibility' },
  ],
  [
    RelatedLinksNames.TERMS_AND_CONDITIONS,
    { title: 'Terms and conditions', href: '/info/terms-and-conditions' },
  ],
  [
    RelatedLinksNames.PRIVACY_NOTICE,
    { title: 'Privacy notice', href: '/info/privacy' },
  ],
  [RelatedLinksNames.COOKIES, { title: 'Cookies', href: '/info/cookies' }],
]);
