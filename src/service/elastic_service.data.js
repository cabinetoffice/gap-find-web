import {
  ELASTIC_GRANT_PAGE_FIELDS,
  ELASTIC_INDEX_FIELDS,
} from '../utils/constants';

export const elasticSearchResultMinimumAmount = {
  body: {
    from: 0,
    query: {
      bool: {
        filter: [
          {
            multi_match: {
              fields: [
                ELASTIC_INDEX_FIELDS.grantName,
                ELASTIC_INDEX_FIELDS.summary,
                ELASTIC_INDEX_FIELDS.eligibility,
                ELASTIC_INDEX_FIELDS.shortDescription,
              ],
              fuzziness: 'AUTO',
              operator: 'AND',
              query: 'Search Term',
            },
          },
        ],
        must: [
          { match: { [ELASTIC_INDEX_FIELDS.type]: 'Entry' } },
          { match: { [ELASTIC_INDEX_FIELDS.contentType]: 'grantDetails' } },
          {
            range: {
              [ELASTIC_INDEX_FIELDS.applicationClosingDate]: {
                gte: 'now/d',
              },
            },
          },
        ],
        must_not: [{ match: { [ELASTIC_INDEX_FIELDS.publishedCounter]: 0 } }],
      },
    },
    size: 10,
    sort: [{ [ELASTIC_INDEX_FIELDS.grantMinimumAward]: { order: 'asc' } }],
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
                ELASTIC_INDEX_FIELDS.grantName,
                ELASTIC_INDEX_FIELDS.summary,
                ELASTIC_INDEX_FIELDS.eligibility,
                ELASTIC_INDEX_FIELDS.shortDescription,
              ],
              fuzziness: 'AUTO',
              operator: 'AND',
              query: 'Search Term',
            },
          },
        ],
        must: [
          { match: { [ELASTIC_INDEX_FIELDS.type]: 'Entry' } },
          { match: { [ELASTIC_INDEX_FIELDS.contentType]: 'grantDetails' } },
          {
            range: {
              [ELASTIC_INDEX_FIELDS.applicationClosingDate]: {
                gte: 'now/d',
              },
            },
          },
        ],
        must_not: [{ match: { [ELASTIC_INDEX_FIELDS.publishedCounter]: 0 } }],
      },
    },
    size: 10,
    sort: [{ [ELASTIC_INDEX_FIELDS.grantMaximumAward]: { order: 'desc' } }],
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
                ELASTIC_INDEX_FIELDS.grantName,
                ELASTIC_INDEX_FIELDS.summary,
                ELASTIC_INDEX_FIELDS.eligibility,
                ELASTIC_INDEX_FIELDS.shortDescription,
              ],
              fuzziness: 'AUTO',
              operator: 'AND',
              query: 'Search Term',
            },
          },
        ],
        must: [
          { match: { [ELASTIC_INDEX_FIELDS.type]: 'Entry' } },
          { match: { [ELASTIC_INDEX_FIELDS.contentType]: 'grantDetails' } },
          {
            range: {
              [ELASTIC_INDEX_FIELDS.applicationClosingDate]: {
                gte: 'now/d',
              },
            },
          },
        ],
        must_not: [{ match: { [ELASTIC_INDEX_FIELDS.publishedCounter]: 0 } }],
      },
    },
    size: 10,
    sort: [{ [ELASTIC_INDEX_FIELDS.applicationClosingDate]: { order: 'asc' } }],
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
                ELASTIC_INDEX_FIELDS.grantName,
                ELASTIC_INDEX_FIELDS.summary,
                ELASTIC_INDEX_FIELDS.eligibility,
                ELASTIC_INDEX_FIELDS.shortDescription,
              ],
              fuzziness: 'AUTO',
              operator: 'AND',
              query: 'Search Term',
            },
          },
        ],
        must: [
          { match: { [ELASTIC_INDEX_FIELDS.type]: 'Entry' } },
          { match: { [ELASTIC_INDEX_FIELDS.contentType]: 'grantDetails' } },
          {
            range: {
              [ELASTIC_INDEX_FIELDS.applicationClosingDate]: {
                gte: 'now/d',
              },
            },
          },
        ],
        must_not: [{ match: { [ELASTIC_INDEX_FIELDS.publishedCounter]: 0 } }],
      },
    },
    size: 10,
    sort: [
      { [ELASTIC_INDEX_FIELDS.grantApplicationOpenDate]: { order: 'asc' } },
    ],
  },
  index: process.env.ELASTIC_INDEX,
  _source: ELASTIC_GRANT_PAGE_FIELDS,
};
