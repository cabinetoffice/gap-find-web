import { Client } from '@elastic/elasticsearch';
import { ElasticSearchService } from './elastic_service';
import {
  elasticSearchResultClosingDate,
  elasticSearchResultMaximumAmount,
  elasticSearchResultMinimumAmount,
  elasticSearchResultWithoutSort,
} from './elastic_service.data';

jest.mock('@elastic/elasticsearch', () => {
  const searchMock = {
    search: jest.fn(),
  };

  return {
    Client: jest.fn().mockImplementation(() => {
      return searchMock;
    }),
  };
});

const elasticService = ElasticSearchService.getInstance();
const client = new Client();

describe('Elastic Search Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest.spyOn(client, 'search').mockImplementation(() => {
      return {
        body: {
          hits: {
            total: {
              value: 1,
            },
            hits: [
              {
                _source: {
                  fields: {
                    grantName: 'test grant',
                  },
                },
              },
            ],
          },
        },
      };
    });
  });
  it('Should search using the elastic client', async () => {
    const result = await elasticService.search('Search Term', [], 10, 1, '');
    expect(result).toStrictEqual({
      parsedElasticResults: [{ grantName: undefined, id: undefined }],
      totalGrants: 1,
    });
    expect(client.search).toHaveBeenNthCalledWith(
      1,
      elasticSearchResultWithoutSort
    );
  });

  it('Should search using the elastic forum', async () => {
    jest.spyOn(client, 'search').mockImplementation(() => {
      return {
        body: {
          hits: {
            total: {
              value: 0,
            },
            hits: [],
          },
        },
      };
    });
    const result = await elasticService.search('Search Term', [], 10, 1, '');
    expect(result).toStrictEqual({
      parsedElasticResults: [],
      totalGrants: 0,
    });
    expect(client.search).toHaveBeenNthCalledWith(
      1,
      elasticSearchResultWithoutSort
    );
  });

  describe('elastic service sortBy tests', () => {
    it('should sort the results in asc order when closingDate is passed into the function', async () => {
      const result = await elasticService.search(
        'Search Term',
        [],
        10,
        1,
        'closingDate'
      );
      expect(result).toStrictEqual({
        parsedElasticResults: [
          {
            grantName: undefined,
            id: undefined,
          },
        ],
        totalGrants: 1,
      });
      expect(client.search).toHaveBeenNthCalledWith(
        1,
        elasticSearchResultClosingDate
      );
    });

    it('should sort the results in desc order when maxValue is passed into the function', async () => {
      const result = await elasticService.search(
        'Search Term',
        [],
        10,
        1,
        'maxValue'
      );
      expect(result).toStrictEqual({
        parsedElasticResults: [
          {
            grantName: undefined,
            id: undefined,
          },
        ],
        totalGrants: 1,
      });
      expect(client.search).toHaveBeenNthCalledWith(
        1,
        elasticSearchResultMaximumAmount
      );
    });

    it('should sort the results in asc order when minValue is passed into the function', async () => {
      const result = await elasticService.search(
        'Search Term',
        [],
        10,
        1,
        'minValue'
      );
      expect(result).toStrictEqual({
        parsedElasticResults: [
          {
            grantName: undefined,
            id: undefined,
          },
        ],
        totalGrants: 1,
      });
      expect(client.search).toHaveBeenNthCalledWith(
        1,
        elasticSearchResultMinimumAmount
      );
    });
  });
});
