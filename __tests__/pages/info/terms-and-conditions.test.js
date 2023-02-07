import { render, screen } from '@testing-library/react';
import TermsAndConditions from '../../../pages/info/terms-and-conditions';
import { mockentry } from './terms-and-conditions.data';
import {
  RelatedContentLinks,
  RelatedLinksNames,
} from '../../../src/utils/related-content-links';
import '@testing-library/jest-dom/extend-expect';

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
    <TermsAndConditions
      title={props.title}
      description={props.description}
      content={props.content}
      links={props.links}
    />
  );
});

describe('Rendering the terms and conidtions page', () => {
  it('Should render a page header', () => {
    render(component);
    expect(
      screen.getByRole('heading', { name: 'Terms and conditions' })
    ).toBeDefined();
  });

  it('Should render a gov-uk body of text', () => {
    render(component);
    const text = screen.getByText('We’re not responsible for:');
    expect(text).toBeDefined();
    expect(text).toHaveAttribute('class', 'govuk-body');
  });

  it('Should render a link', () => {
    render(component);
    expect(screen.getByText('Crown copyright protection')).toBeDefined();
    expect(screen.getByText('Crown copyright protection')).toHaveAttribute(
      'href',
      'https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/'
    );
  });

  it('Should render an unordered list', () => {
    render(component);
    expect(
      screen.getByText(
        'the protection of any information you give to these websites'
      )
    ).toBeDefined();
  });
});
