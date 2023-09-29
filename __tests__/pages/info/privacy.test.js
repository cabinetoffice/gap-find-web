import { render, screen } from '@testing-library/react';
import Privacy from '../../../pages/info/privacy';
import {
  govUkBody,
  govUkGapHeadingBlack,
  govUkUL,
  mockentry,
} from './privacy.data';
import {
  RelatedContentLinks,
  RelatedLinksNames,
} from '../../../src/utils/related-content-links';

jest.mock('next/router', () => ({
  useRouter() {
    return jest.fn();
  },
}));

let props, component;
beforeAll(async () => {
  props = {
    title: mockentry.fields.pageName,
    description: 'Privacy for Find a grant',
    content: mockentry.fields.body,
    links: [
      RelatedContentLinks.get(RelatedLinksNames.ABOUT_US),
      RelatedContentLinks.get(RelatedLinksNames.TERMS_AND_CONDITIONS),
    ],
  };
  component = (
    <Privacy
      title={props.title}
      description={props.description}
      content={props.content}
      links={props.links}
    />
  );
});

describe('Rendering the privacy notice', () => {
  it('Should render a page header', () => {
    render(component);
    expect(screen.getAllByText('Privacy notice')[0]).toBeDefined();
  });

  it('Should render a gov-uk body of text', () => {
    render(component);
    expect(screen.getByText(govUkBody)).toBeDefined();
  });

  it('Should render a govuk-list govuk-list--bullet list of text', () => {
    render(component);
    expect(screen.getByText(govUkUL)).toBeDefined();
  });

  it('Should render a gap-heading-caption-black body of text', () => {
    render(component);
    expect(screen.getByText(govUkGapHeadingBlack)).toBeDefined();
  });

  it('Should render a govuk hyperlink', () => {
    render(component);
    expect(screen.getByText('cookie preferences').closest('a')).toHaveAttribute(
      'href',
      '/info/cookies',
    );
  });
});
