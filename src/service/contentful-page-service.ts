import { IPageFields } from '../../@types/generated/contentful';
import { client } from '../utils/contentFulPage';

export enum ContentfulPage {
  ABOUT_US,
  ACCESSIBILITY,
  TERMS_AND_CONDITIONS,
  PRIVACY_NOTICE,
  WRITING_GOOD_ADVERTS,
}

export class ContentfulPageService {
  private static instance: ContentfulPageService;
  private static contentfulPageIds = new Map<ContentfulPage, string>([
    [ContentfulPage.ABOUT_US, '4Myqt8FWPOPiS9btNQOZOy'],
    [ContentfulPage.ACCESSIBILITY, '3XBdOrkbhCgCXaicYITa55'],
    [ContentfulPage.TERMS_AND_CONDITIONS, '4LpG03zszchmqjKyM1IcvX'],
    [ContentfulPage.PRIVACY_NOTICE, '7dqCl5jZWdKbcnf8zxbuHZ'],
    [ContentfulPage.WRITING_GOOD_ADVERTS, '70CQ73YlVJuQ2qVMjktpv'],
  ]);

  private constructor() {}

  public static getInstance(): ContentfulPageService {
    if (!ContentfulPageService.instance) {
      ContentfulPageService.instance = new ContentfulPageService();
    }

    return ContentfulPageService.instance;
  }

  async getContentfulPageEntry(page: ContentfulPage) {
    return await client.getEntry<IPageFields>(
      ContentfulPageService.contentfulPageIds.get(page),
    );
  }
}
