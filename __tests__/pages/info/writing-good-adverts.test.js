import {
  RelatedContentLinks,
  RelatedLinksNames,
} from '../../../src/utils/related-content-links';
import {
  ContentfulPage,
  ContentfulPageService,
} from '../../../src/service/contentful-page-service';
import { getServerSideProps } from '../../../pages/info/writing-good-adverts';

jest.mock('next/router', () => ({
  useRouter() {
    return jest.fn();
  },
}));
jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {},
}));

describe('Get server side props', () => {
  let ContentfulPageServiceMock;
  const mockEntry = {
    fields: { pageName: 'test page name', body: 'test page body' },
  };
  beforeEach(() => {
    jest.clearAllMocks();

    ContentfulPageServiceMock = jest
      .spyOn(ContentfulPageService.prototype, 'getContentfulPageEntry')
      .mockImplementationOnce(() => {
        return mockEntry;
      });
  });

  it('should return contentful page', async () => {
    const expectedResult = {
      props: {
        title: mockEntry.fields.pageName,
        description: 'Writing good adverts',
        content: mockEntry.fields.body,
        links: [
          RelatedContentLinks.get(RelatedLinksNames.ABOUT_US),
          RelatedContentLinks.get(RelatedLinksNames.TERMS_AND_CONDITIONS),
        ],
      },
    };
    const result = await getServerSideProps();
    expect(ContentfulPageServiceMock).toHaveBeenCalledTimes(1);
    expect(ContentfulPageServiceMock).toHaveBeenCalledWith(
      ContentfulPage.WRITING_GOOD_ADVERTS,
    );
    expect(result).toStrictEqual(expectedResult);
  });
});
