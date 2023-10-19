import { render, screen } from '@testing-library/react';
import AboutUs from '../../../pages/info/about-us';
import {
  RelatedContentLinks,
  RelatedLinksNames,
} from '../../../src/utils/related-content-links';
import { mockentry } from './about-us.data';

jest.mock('next/router', () => ({
  useRouter() {
    return jest.fn();
  },
}));

let props, component;
beforeAll(async () => {
  props = {
    title: mockentry.fields.pageName,
    description: 'About us for Find a grant',
    content: mockentry.fields.body,
    links: [
      RelatedContentLinks.get(RelatedLinksNames.TERMS_AND_CONDITIONS),
      RelatedContentLinks.get(RelatedLinksNames.PRIVACY_NOTICE),
    ],
  };
  component = (
    <AboutUs
      title={props.title}
      description={props.description}
      content={props.content}
      links={props.links}
    />
  );
});

describe('Rendering the about us page', () => {
  it('Should render a page header', () => {
    render(component);
    expect(screen.getByRole('heading', { name: 'About us' })).toBeDefined();
  });

  it('Should render a gov-uk body of text', () => {
    render(component);
    const text = screen.getByText(
      'Our goal for this service is to modernise and revolutionise grant-making. The pilot service will be co-created and is ready to test with a small sample of grants now. As we learn and grow, it is our intention to partner with additional grant-making departments to make more schemes available via the service throughout 2022 and beyond.',
    );
    expect(text).toBeDefined();
    expect(text).toHaveAttribute('class', 'govuk-body');
  });

  it('Should render a link', () => {
    render(component);
    expect(
      screen.getByText('Government Grants Management Function'),
    ).toBeDefined();
    expect(
      screen.getByText('Government Grants Management Function'),
    ).toHaveAttribute(
      'href',
      'https://www.gov.uk/government/collections/grants-management-function',
    );
  });
});
