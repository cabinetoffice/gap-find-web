import { render, screen } from '@testing-library/react';
import Accessibility from '../../../pages/info/accessibility';
import {
  RelatedContentLinks,
  RelatedLinksNames,
} from '../../../src/utils/related-content-links';
import { mockentry } from './accessibility.data';

jest.mock('next/router', () => ({
  useRouter() {
    return jest.fn();
  },
}));
jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {},
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
    <Accessibility
      title={props.title}
      description={props.description}
      content={props.content}
      links={props.links}
    />
  );
});
describe('Rendering the accessibility page', () => {
  it('Should render a page header', () => {
    render(component);
    expect(
      screen.getByRole('heading', { name: 'Accessibility' }),
    ).toBeDefined();
  });

  it('Should render a gov-uk body of text', () => {
    render(component);
    const text = screen.getByText(
      'We’ve also made the website text as simple as possible to understand.',
    );
    expect(text).toBeDefined();
    expect(text).toHaveAttribute('class', 'govuk-body');
  });

  it('Should render a link', () => {
    render(component);
    expect(
      screen.getByText(
        'Web Content Accessibility Guidelines version 2.1 AA standard',
      ),
    ).toBeDefined();
    expect(
      screen.getByText(
        'Web Content Accessibility Guidelines version 2.1 AA standard',
      ),
    ).toHaveAttribute('href', 'https://www.w3.org/TR/WCAG21/');
  });

  it('Should render an unordered list', () => {
    render(component);
    expect(
      screen.getByText('change colours, contrast levels and fonts'),
    ).toBeDefined();
  });
});
