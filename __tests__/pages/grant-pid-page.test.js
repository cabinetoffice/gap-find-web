import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import Grant, { getServerSideProps } from '../../pages/grants/[pid]';
import { fetchEntry } from '../../src/utils/contentFulPage';

jest.mock('next/router', () => {
  return {
    useRouter: jest.fn(),
  };
});

jest.mock('../../src/utils/contentFulPage');

const grantDetail = {
  props: {
    grantDetail: {
      fields: {
        grantSummaryTab: {
          content: [
            {
              data: {},
              marks: [],
              nodeType: 'text',
              value: 'Some text that should be rendered',
            },
          ],
          nodeType: 'paragraph',
          data: {},
        },
      },
      sys: { id: '' },
    },
  },
};

const component = <Grant grantDetail={grantDetail} />;

global.window = Object.create(window);
Object.defineProperty(window, 'GOVUKFrontend', {
  value: {
    initAll: jest.fn(),
  },
});

describe('grants-pid page', () => {
  const mockBack = jest.fn();
  beforeAll(() => {
    useRouter.mockReturnValue({
      route: '/',
      prefetch: jest.fn(() => Promise.resolve()),
      back: mockBack,
      push: jest.fn(),
      query: { pid: '' },
    });
  });

  describe('Rendering the browse grants page', () => {
    it('Should call router back when back button is clicked', () => {
      render(component);
      expect(screen.getByText('Back')).toBeDefined();
      userEvent.click(screen.getByText('Back'));
      expect(mockBack).toBeCalledTimes(1);
    });
    it('Should render a Get Updates heading.', () => {
      render(component);
      expect(
        screen.getByRole('heading', { name: 'Get updates about this grant' }),
      ).toBeDefined();
    });

    it('Should render grant tabs', () => {
      render(component);
      expect(screen.getByRole('link', { name: 'Summary' })).toBeDefined();
      expect(screen.getByRole('link', { name: 'Eligibility' })).toBeDefined();
      expect(screen.getByRole('link', { name: 'Objectives' })).toBeDefined();
      expect(screen.getByRole('link', { name: 'Dates' })).toBeDefined();
      expect(screen.getByRole('link', { name: 'How to apply' })).toBeDefined();
      expect(
        screen.getByRole('link', { name: 'Supporting information' }),
      ).toBeDefined();
      expect(screen.getByRole('link', { name: 'FAQs' })).toBeDefined();
      expect(
        screen.getByRole('link', { name: 'Awarded grants' }),
      ).toBeDefined();
    });

    it('Should filter out certain tabs', () => {
      render(component);
      expect(
        screen
          .queryAllByRole('link')
          .some((link) => link.getAttribute('href') === '#fileType'),
      ).toBe(false);
      expect(
        screen
          .queryAllByRole('link')
          .some((link) => link.getAttribute('href') === '#emptyTab'),
      ).toBe(false);
      expect(
        screen
          .queryAllByRole('link')
          .some((link) => link.getAttribute('href') === '#test_pipeline'),
      ).toBe(false);
    });

    it('Should show FAQs tab when enableFAQTab is true', () => {
      render(
        <Grant
          grantDetail={grantDetail}
          enableFAQTab="true"
          enableAwardsTab="false"
        />,
      );
      expect(screen.getByRole('link', { name: 'FAQs' })).toBeDefined();
    });

    it('Should hide FAQs tab when enableFAQTab is false', () => {
      render(
        <Grant
          grantDetail={grantDetail}
          enableFAQTab="false"
          enableAwardsTab="false"
        />,
      );
      expect(
        screen
          .queryAllByRole('link')
          .some((link) => link.getAttribute('href') === '#faqs'),
      ).toBe(false);
    });

    it('Should show Awarded Grants tab when enableAwardsTab is true', () => {
      render(
        <Grant
          grantDetail={grantDetail}
          enableFAQTab="false"
          enableAwardsTab="true"
        />,
      );
      expect(
        screen.getByRole('link', { name: 'Awarded grants' }),
      ).toBeDefined();
    });

    it('Should hide Awarded Grants tab when enableAwardsTab is false', () => {
      render(
        <Grant
          grantDetail={grantDetail}
          enableFAQTab="false"
          enableAwardsTab="false"
        />,
      );
      expect(
        screen
          .queryAllByRole('link')
          .some((link) => link.getAttribute('href') === '#awarded'),
      ).toBe(false);
    });

    it('Should render summary tab content by default', () => {
      render(component);
      expect(
        screen.getByText('Some text that should be rendered'),
      ).toBeDefined();
    });
  });

  describe('getServerSideProps', () => {
    const env = process.env;

    const props = {
      props: {
        grantDetail: 'test-grant',
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    afterEach(() => {
      process.env = env;
      jest.resetModules();
    });

    it('should redirect to 404 if the pid does not match a grant ', async () => {
      fetchEntry.mockResolvedValue({
        props: {
          grantDetail: null,
        },
      });

      const result = await getServerSideProps({ params: { pid: '12345678' } });
      expect(fetchEntry).toBeCalledTimes(1);
      expect(result).toStrictEqual({
        redirect: {
          permanent: false,
          destination: '/static/page-not-found',
        },
      });
    });

    it('should return the correct props with true when both ENABLE TABS envs are set to true', async () => {
      process.env.ENABLE_AWARDS_TAB = true;
      process.env.ENABLE_FAQ_TAB = true;
      fetchEntry.mockResolvedValue({
        props: {
          grantDetail: 'test-grant',
        },
      });

      const result = await getServerSideProps({ params: { pid: '12345678' } });
      expect(fetchEntry).toBeCalledTimes(1);
      expect(result).toStrictEqual({
        props: {
          enableAwardsTab: 'true',
          enableFAQTab: 'true',
          grantDetail: {
            props: { grantDetail: 'test-grant' },
          },
        },
      });
    });

    it('should return the correct props with false when both ENABLE TABS envs are set to false', async () => {
      process.env.ENABLE_AWARDS_TAB = false;
      process.env.ENABLE_FAQ_TAB = false;

      fetchEntry.mockResolvedValue(props);

      const result = await getServerSideProps({ params: { pid: '12345678' } });
      expect(fetchEntry).toBeCalledTimes(1);
      expect(result).toStrictEqual({
        props: {
          enableAwardsTab: 'false',
          enableFAQTab: 'false',
          grantDetail: { props: { grantDetail: 'test-grant' } },
        },
      });
    });

    it('should return the correct props when Awards is set to false in the env and faq is set to true respectively', async () => {
      process.env.ENABLE_AWARDS_TAB = false;
      process.env.ENABLE_FAQ_TAB = true;
      fetchEntry.mockResolvedValue(props);

      const result = await getServerSideProps({ params: { pid: '12345678' } });
      expect(fetchEntry).toBeCalledTimes(1);
      expect(result).toStrictEqual({
        props: {
          enableAwardsTab: 'false',
          enableFAQTab: 'true',
          grantDetail: { props: { grantDetail: 'test-grant' } },
        },
      });
    });

    it('should return the correct props when faq is set to false in the env and awards is set to true respectively', async () => {
      process.env.ENABLE_AWARDS_TAB = true;
      process.env.ENABLE_FAQ_TAB = false;
      fetchEntry.mockResolvedValue(props);

      const result = await getServerSideProps({ params: { pid: '12345678' } });
      expect(fetchEntry).toBeCalledTimes(1);
      expect(result).toStrictEqual({
        props: {
          enableAwardsTab: 'true',
          enableFAQTab: 'false',
          grantDetail: { props: { grantDetail: 'test-grant' } },
        },
      });
    });
  });
});
