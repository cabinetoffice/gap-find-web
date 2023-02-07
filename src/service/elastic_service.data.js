import { ELASTIC_GRANT_PAGE_FIELDS } from '../utils/constants';

export const elasticSearchResultMinimumAmount = {
  body: {
    from: 0,
    query: {
      bool: {
        filter: [
          {
            multi_match: {
              fields: [
                'fields.grantName.en-US',
                'fields.grantSummaryTab.en-US.content.content.*',
                'fields.grantEligibilityTab.en-US.content.content.*',
                'fields.grantShortDescription.en-US',
              ],
              fuzziness: 'AUTO',
              operator: 'AND',
              query: 'Search Term',
            },
          },
        ],
        must: [
          { match: { 'sys.type': 'Entry' } },
          { match: { 'sys.contentType.sys.id': 'grantDetails' } },
        ],
        must_not: [{ match: { 'sys.publishedCounter': 0 } }],
      },
    },
    size: 10,
    sort: [{ 'fields.grantMinimumAward.en-US': { order: 'asc' } }],
  },
  index: process.env.ELASTIC_INDEX,
  _source: ELASTIC_GRANT_PAGE_FIELDS,
};

export const elasticSearchResultMaximumAmount = {
  body: {
    from: 0,
    query: {
      bool: {
        filter: [
          {
            multi_match: {
              fields: [
                'fields.grantName.en-US',
                'fields.grantSummaryTab.en-US.content.content.*',
                'fields.grantEligibilityTab.en-US.content.content.*',
                'fields.grantShortDescription.en-US',
              ],
              fuzziness: 'AUTO',
              operator: 'AND',
              query: 'Search Term',
            },
          },
        ],
        must: [
          { match: { 'sys.type': 'Entry' } },
          { match: { 'sys.contentType.sys.id': 'grantDetails' } },
        ],
        must_not: [{ match: { 'sys.publishedCounter': 0 } }],
      },
    },
    size: 10,
    sort: [{ 'fields.grantMaximumAward.en-US': { order: 'desc' } }],
  },
  index: process.env.ELASTIC_INDEX,
  _source: ELASTIC_GRANT_PAGE_FIELDS,
};

export const elasticSearchResultClosingDate = {
  body: {
    from: 0,
    query: {
      bool: {
        filter: [
          {
            multi_match: {
              fields: [
                'fields.grantName.en-US',
                'fields.grantSummaryTab.en-US.content.content.*',
                'fields.grantEligibilityTab.en-US.content.content.*',
                'fields.grantShortDescription.en-US',
              ],
              fuzziness: 'AUTO',
              operator: 'AND',
              query: 'Search Term',
            },
          },
        ],
        must: [
          { match: { 'sys.type': 'Entry' } },
          { match: { 'sys.contentType.sys.id': 'grantDetails' } },
        ],
        must_not: [{ match: { 'sys.publishedCounter': 0 } }],
      },
    },
    size: 10,
    sort: [{ 'fields.grantApplicationCloseDate.en-US': { order: 'asc' } }],
  },
  index: process.env.ELASTIC_INDEX,
  _source: ELASTIC_GRANT_PAGE_FIELDS,
};

export const elasticSearchResultWithoutSort = {
  body: {
    from: 0,
    query: {
      bool: {
        filter: [
          {
            multi_match: {
              fields: [
                'fields.grantName.en-US',
                'fields.grantSummaryTab.en-US.content.content.*',
                'fields.grantEligibilityTab.en-US.content.content.*',
                'fields.grantShortDescription.en-US',
              ],
              fuzziness: 'AUTO',
              operator: 'AND',
              query: 'Search Term',
            },
          },
        ],
        must: [
          { match: { 'sys.type': 'Entry' } },
          { match: { 'sys.contentType.sys.id': 'grantDetails' } },
        ],
        must_not: [{ match: { 'sys.publishedCounter': 0 } }],
      },
    },
    size: 10,
    sort: [{ 'fields.grantApplicationOpenDate.en-US': { order: 'asc' } }],
  },
  index: process.env.ELASTIC_INDEX,
  _source: ELASTIC_GRANT_PAGE_FIELDS,
};
