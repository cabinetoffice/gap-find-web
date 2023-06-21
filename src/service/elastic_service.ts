import { ApiResponse, Client, ClientOptions } from '@elastic/elasticsearch';
import {
  ELASTIC_GRANT_PAGE_FIELDS,
  ELASTIC_INDEX_FIELDS,
} from '../utils/constants';

export class ElasticSearchService {
  private static instance: ElasticSearchService;
  private static client: Client;

  private constructor() {
    let elastic_config: ClientOptions = {};

    if (process.env.ELASTIC_URL) {
      elastic_config = {
        node: process.env.ELASTIC_URL,
        auth: {
          username: process.env.ELASTIC_USERNAME,
          password: process.env.ELASTIC_PASSWORD,
        },
      };
    } else if (process.env.ELASTIC_ID) {
      elastic_config = {
        cloud: {
          id: process.env.ELASTIC_ID,
        },
        auth: {
          username: process.env.ELASTIC_USERNAME,
          password: process.env.ELASTIC_PASSWORD,
        },
      };
    }

    ElasticSearchService.client = new Client(elastic_config);
  }

  public static getInstance(): ElasticSearchService {
    if (!ElasticSearchService.instance) {
      ElasticSearchService.instance = new ElasticSearchService();
    }

    return ElasticSearchService.instance;
  }

  public async search(
    searchTerm: string,
    filterArray: Array<object>,
    grantsPerPage: number,
    page: number,
    sortBy: string
  ) {
    const sortObj = ElasticSearchService.instance.getSortParams(sortBy);

    if (searchTerm) {
      filterArray = ElasticSearchService.instance.buildFilterArray(
        searchTerm,
        filterArray
      );
    }
    const query = ElasticSearchService.instance.buildElasticSearchQueryObject(
      grantsPerPage,
      page,
      sortObj,
      filterArray
    );

    const result = await ElasticSearchService.client.search(query);

    if (result.body.hits.total.value === 0) {
      return { parsedElasticResults: [], totalGrants: 0 };
    }

    const totalGrants = result.body.hits.total.value;

    const parsedElasticResults =
      ElasticSearchService.instance.parseElasticResults(result);

    return { parsedElasticResults, totalGrants };
  }

  getSortParams(sortBy: string) {
    switch (sortBy) {
      case 'closingDate':
        return {
          field: ELASTIC_INDEX_FIELDS.applicationClosingDate,
          order: 'asc',
        };
      case 'maxValue':
        return { field: ELASTIC_INDEX_FIELDS.grantMaximumAward, order: 'desc' };
      case 'minValue':
        return { field: ELASTIC_INDEX_FIELDS.grantMinimumAward, order: 'asc' };
      default:
        return {
          field: ELASTIC_INDEX_FIELDS.grantApplicationOpenDate,
          order: 'asc',
        };
    }
  }

  parseElasticResults(
    result: ApiResponse<Record<string, any>, Record<string, unknown>>
  ) {
    return result.body.hits.hits.map((hit) => {
      let fields = hit._source.fields;
      for (const field in fields) {
        fields[field] = fields[field]['en-US'];
      }

      return { ...hit._source.fields, id: hit._id };
    });
  }

  buildFilterArray(
    searchTerm: string,
    filterArray: Array<object>
  ): Array<object> {
    filterArray.push({
      multi_match: {
        query: searchTerm,
        operator: 'AND',
        fuzziness: 'AUTO',
        fields: [
          ELASTIC_INDEX_FIELDS.grantName,
          ELASTIC_INDEX_FIELDS.summary,
          ELASTIC_INDEX_FIELDS.eligibility,
          ELASTIC_INDEX_FIELDS.shortDescription,
        ],
      },
    });

    return filterArray;
  }

  buildElasticSearchQueryObject(
    grantsPerPage: number,
    page: number,
    sortObj: any,
    filterArray: Array<object>
  ) {
    return {
      index: process.env.ELASTIC_INDEX,
      _source: ELASTIC_GRANT_PAGE_FIELDS,
      body: {
        from: grantsPerPage * (page - 1),
        size: grantsPerPage,
        sort: [
          {
            [sortObj.field]: {
              order: sortObj.order,
            },
          },
        ],
        query: {
          bool: {
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
            must_not: [
              {
                match: { [ELASTIC_INDEX_FIELDS.publishedCounter]: 0 },
              },
            ],
            filter: filterArray,
          },
        },
      },
    };
  }
}
