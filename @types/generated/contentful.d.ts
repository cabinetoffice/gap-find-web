// THIS FILE IS AUTOMATICALLY GENERATED. DO NOT MODIFY IT.

import { Asset, Entry } from 'contentful';
import { Document } from '@contentful/rich-text-types';

export interface ICategoryFields {
  /** Title */
  title: string;

  /** Slug */
  slug: string;
}

/** Categories can be applied to Courses and Lessons. Assigning Multiple categories is also possible. */

export interface ICategory extends Entry<ICategoryFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: 'category';
        linkType: 'ContentType';
        type: 'Link';
      };
    };
  };
}

export interface ICourseFields {
  /** Title */
  title: string;

  /** Slug */
  slug: string;

  /** Image */
  image: Asset;

  /** Short Description */
  shortDescription: string;

  /** Description */
  description: string;

  /** Duration */
  duration?: number | undefined;

  /** Skill Level */
  skillLevel: 'beginner' | 'intermediate' | 'advanced';

  /** Lessons */
  lessons: ILesson[];

  /** Categories */
  categories: ICategory[];
}

/** A series of lessons designed to teach sets of concepts that enable students to master Contentful. */

export interface ICourse extends Entry<ICourseFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: 'course';
        linkType: 'ContentType';
        type: 'Link';
      };
    };
  };
}

export interface IFiltersFields {
  /** filters */
  filters?: Record<string, any> | undefined;
}

/** GAP Filters */

export interface IFilters extends Entry<IFiltersFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: 'filters';
        linkType: 'ContentType';
        type: 'Link';
      };
    };
  };
}

export interface IGrantFields {
  /** Title */
  title?: string | undefined;

  /** Label */
  label: string;

  /** Description */
  description?: Document | undefined;

  /** Send notification? */
  sendNotification?: boolean | undefined;

  /** test json field */
  testJsonField?: Record<string, any> | undefined;
}

export interface IGrant extends Entry<IGrantFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: 'grant';
        linkType: 'ContentType';
        type: 'Link';
      };
    };
  };
}

export interface IGrantDetailsFields {
  /** Grant Name */
  grantName?: string | undefined;

  /** Label */
  label: string;

  /** Grant Short Description */
  grantShortDescription?: string | undefined;

  /** Grant Location */
  grantLocation?:
    | (
        | 'National'
        | 'England'
        | 'Wales'
        | 'Scotland'
        | 'Northern Ireland'
        | 'Virtual/Online'
        | 'North East'
        | 'North West'
        | 'Yorkshire and the Humber'
        | 'East Midlands'
        | 'West Midlands'
        | 'East of England'
        | 'London'
        | 'South East'
        | 'South West'
      )[]
    | undefined;

  /** Grant Total Award Amount */
  grantTotalAwardAmount?: number | undefined;

  /** Grant Total Award Display */
  grantTotalAwardDisplay?: string | undefined;

  /** Grant Minimum Award */
  grantMinimumAward?: number | undefined;

  /** Grant Minimum Award Display */
  grantMinimumAwardDisplay?: string | undefined;

  /** Grant Maximum Award */
  grantMaximumAward?: number | undefined;

  /** Grant Maximum Award Display */
  grantMaximumAwardDisplay?: string | undefined;

  /** Grant Funder */
  grantFunder?: string | undefined;

  /** Grant Application Open Date */
  grantApplicationOpenDate?: string | undefined;

  /** Grant Application Close Date */
  grantApplicationCloseDate?: string | undefined;

  /** Grant Strap Line */
  grantStrapLine?: Document | undefined;

  /** Grant Show Apply Button */
  grantShowApplyButton: boolean;

  /** Grant Webpage URL */
  grantWebpageUrl?: string | undefined;

  /** Grant Summary Tab */
  grantSummaryTab?: Document | undefined;

  /** Grant Eligibility Tab */
  grantEligibilityTab?: Document | undefined;

  /** Grant Objectives Tab */
  grantObjectivesTab?: Document | undefined;

  /** Grant Dates Tab */
  grantDatesTab?: Document | undefined;

  /** Grant Apply Tab */
  grantApplyTab?: Document | undefined;

  /** Grant Supporting Info Tab */
  grantSupportingInfoTab?: Document | undefined;

  /** Grant FAQ Tab */
  grantFaqTab?: Document | undefined;

  /** Grant Awarded Grants */
  grantAwardedGrants?: Document | undefined;

  /** Grant Supporting Documents */
  grantSupportingDocuments?: Asset[] | undefined;

  /** Grant Edits */
  grantEdits?: Document | undefined;

  /** Grant Type */
  grantType?:
    | ('Competed Grant' | 'Emergency Grant' | 'COVID Grant' | 'Formula Grant')[]
    | undefined;

  /** Grant Applicant Type */
  grantApplicantType?:
    | (
        | 'Personal / Individual'
        | 'Public Sector'
        | 'Non-profit'
        | 'Private Sector'
      )[]
    | undefined;

  /** Grant Updated */
  grantUpdated?: boolean | undefined;
}

export interface IGrantDetails extends Entry<IGrantDetailsFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: 'grantDetails';
        linkType: 'ContentType';
        type: 'Link';
      };
    };
  };
}

export interface IGrantsFields {
  /** code */
  code?: string | undefined;

  /** name */
  name?: string | undefined;

  /** title */
  title?: string | undefined;

  /** body */
  body?: Document | undefined;
}

/** Quick & Dirty Content For Testing GRANTS, GAPGUI & GAPAPI Connection */

export interface IGrants extends Entry<IGrantsFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: 'grants';
        linkType: 'ContentType';
        type: 'Link';
      };
    };
  };
}

export interface ILayoutFields {
  /** Title */
  title: string;

  /** Slug */
  slug: string;

  /** Content Modules */
  contentModules: (ILayoutCopy | ILayoutHeroImage | ILayoutHighlightedCourse)[];
}

/** A page consisting of freely configurable and rearrangeable content modules. */

export interface ILayout extends Entry<ILayoutFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: 'layout';
        linkType: 'ContentType';
        type: 'Link';
      };
    };
  };
}

export interface ILayoutCopyFields {
  /** Title */
  title: string;

  /** Headline */
  headline?: string | undefined;

  /** Copy */
  copy?: string | undefined;

  /** CTA Title */
  ctaTitle?: string | undefined;

  /** CTA Link */
  ctaLink?: string | undefined;

  /** Visual Style */
  visualStyle?: 'Default' | 'Emphasized' | undefined;
}

/** A block of text with a headline and a call to action to be shown on the landing page. */

export interface ILayoutCopy extends Entry<ILayoutCopyFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: 'layoutCopy';
        linkType: 'ContentType';
        type: 'Link';
      };
    };
  };
}

export interface ILayoutHeroImageFields {
  /** Title */
  title: string;

  /** Headline */
  headline?: string | undefined;

  /** Background Image */
  backgroundImage?: Asset | undefined;
}

/** A hero image and header text. */

export interface ILayoutHeroImage extends Entry<ILayoutHeroImageFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: 'layoutHeroImage';
        linkType: 'ContentType';
        type: 'Link';
      };
    };
  };
}

export interface ILayoutHighlightedCourseFields {
  /** Title */
  title: string;

  /** Course */
  course: ICourse;
}

/** A curated selection of highlighted courses. */

export interface ILayoutHighlightedCourse
  extends Entry<ILayoutHighlightedCourseFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: 'layoutHighlightedCourse';
        linkType: 'ContentType';
        type: 'Link';
      };
    };
  };
}

export interface ILayoutThreeColumnEntryFields {
  /** Title */
  title?: string | undefined;

  /** Label */
  label?: string | undefined;

  /** Middle Column */
  middleColumn?: Document | undefined;

  /** Last Column */
  lastColumn?: Document | undefined;
}

export interface ILayoutThreeColumnEntry
  extends Entry<ILayoutThreeColumnEntryFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: 'layoutThreeColumnEntry';
        linkType: 'ContentType';
        type: 'Link';
      };
    };
  };
}

export interface ILayoutTwoColumnEntryFields {
  /** Title */
  title?: string | undefined;

  /** Label */
  label?: string | undefined;

  /** Content */
  content?: Document | undefined;
}

export interface ILayoutTwoColumnEntry
  extends Entry<ILayoutTwoColumnEntryFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: 'layoutTwoColumnEntry';
        linkType: 'ContentType';
        type: 'Link';
      };
    };
  };
}

export interface ILessonFields {
  /** Title */
  title: string;

  /** Slug */
  slug: string;

  /** Modules */
  modules: (ILessonCodeSnippets | ILessonCopy | ILessonImage)[];
}

/** An educational lesson, representing one section of a course. */

export interface ILesson extends Entry<ILessonFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: 'lesson';
        linkType: 'ContentType';
        type: 'Link';
      };
    };
  };
}

export interface ILessonCodeSnippetsFields {
  /** Title */
  title: string;

  /** cURL */
  curl?: string | undefined;

  /** DotNet */
  dotNet?: string | undefined;

  /** Javascript */
  javascript?: string | undefined;

  /** Java */
  java?: string | undefined;

  /** Java-android */
  javaAndroid?: string | undefined;

  /** Php */
  php?: string | undefined;

  /** Python */
  python?: string | undefined;

  /** Ruby */
  ruby?: string | undefined;

  /** Swift */
  swift?: string | undefined;
}

/** A code snippet module supporting all platforms to be used in a lesson. */

export interface ILessonCodeSnippets extends Entry<ILessonCodeSnippetsFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: 'lessonCodeSnippets';
        linkType: 'ContentType';
        type: 'Link';
      };
    };
  };
}

export interface ILessonCopyFields {
  /** Title */
  title: string;

  /** Copy */
  copy: string;
}

/** A markdown module to be used in a lesson. */

export interface ILessonCopy extends Entry<ILessonCopyFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: 'lessonCopy';
        linkType: 'ContentType';
        type: 'Link';
      };
    };
  };
}

export interface ILessonImageFields {
  /** Title */
  title: string;

  /** Image */
  image: Asset;

  /** Caption */
  caption?: string | undefined;
}

/** An image to be used as a module in a lesson. */

export interface ILessonImage extends Entry<ILessonImageFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: 'lessonImage';
        linkType: 'ContentType';
        type: 'Link';
      };
    };
  };
}

export interface IPageFields {
  /** Page Name */
  pageName?: string | undefined;

  /** body */
  body?: Document | undefined;
}

export interface IPage extends Entry<IPageFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: 'page';
        linkType: 'ContentType';
        type: 'Link';
      };
    };
  };
}

export interface IPrivacyNoticeFields {
  /** Privacy Policy */
  privacyPolicy?: Document | undefined;
}

export interface IPrivacyNotice extends Entry<IPrivacyNoticeFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: 'privacyNotice';
        linkType: 'ContentType';
        type: 'Link';
      };
    };
  };
}

export type CONTENT_TYPE =
  | 'category'
  | 'course'
  | 'filters'
  | 'grant'
  | 'grantDetails'
  | 'grants'
  | 'layout'
  | 'layoutCopy'
  | 'layoutHeroImage'
  | 'layoutHighlightedCourse'
  | 'layoutThreeColumnEntry'
  | 'layoutTwoColumnEntry'
  | 'lesson'
  | 'lessonCodeSnippets'
  | 'lessonCopy'
  | 'lessonImage'
  | 'page'
  | 'privacyNotice';

export type LOCALE_CODE = 'en-US';

export type CONTENTFUL_DEFAULT_LOCALE_CODE = 'en-US';
