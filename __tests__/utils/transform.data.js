import moment from 'moment';
const arrayQuery = {
  sortBy: 'openingDate',
  'fields.grantType.en-US': ['1', '2'],
  'fields.grantTotalAwardAmount.en-US': ['1', '2', '3'],
};

const nonFieldsArrayQuery = {
  sortBy: 'openingDate',
  'grantType.en-US': ['1', '2'],
  'grantTotalAwardAmount.en-US': ['1', '2', '3'],
};

const incorrectArrayQuery = {
  sortBy: 'openingDate',
  'fields.grantType.en-US': '0',
};

const stringQuery = { sortBy: 'openingDate', 'fields.grantType.en-US': '4' };

const stringArrQuery = {
  sortBy: 'openingDate',
  'fields.grantType.en-US': '1',
  'fields.grantTotalAwardAmount.en-US': ['1', '2', '3'],
};

const dateQuery = {
  sortBy: 'openingDate',
  'fields.grantType.en-US': ['1', '2'],
  'fields.grantTotalAwardAmount.en-US': ['1', '2', '3'],
  'from-day': '9',
  'from-month': '5',
  'from-year': '2022',
  'to-day': '16',
  'to-month': '5',
  'to-year': '2022',
};

const fromDate = new Date(2022, 4, 9);
const toDate = new Date(2022, 4, 16);
const dateFilterObject = {
  dateRange: {
    index_name: 'sys.createdAt',
    type: 'range-filter',
    values: [
      {
        search_parameter: {
          gte: moment(fromDate).startOf('day').toISOString(true),
          lte: moment(toDate).endOf('day').toISOString(true),
        },
        from: { dateStr: '9 May 2022', day: 9, month: 5, year: 2022 },
        to: { dateStr: '16 May 2022', day: 16, month: 5, year: 2022 },
      },
    ],
  },
};

const stringFilterObj = {
  errors: [],
  'fields.grantType.en-US': {
    display: 'Who can apply',
    index_name: 'fields.grantType.en-US',
    type: 'text-filter',
    values: [
      {
        id: '4',
        display: 'Private sector',
        search_parameter: 'private sector',
      },
    ],
  },
};

const stringArrObj = {
  errors: [],
  'fields.grantTotalAwardAmount.en-US': {
    display: 'Amount',
    index_name: 'fields.grantTotalAwardAmount.en-US',
    type: 'range-filter',
    values: [
      {
        display: '£0 to £9999',
        id: '1',
        search_parameter: {
          lte: 9999,
        },
      },
      {
        display: '£10,000 to £24,999',
        id: '2',
        search_parameter: {
          gte: 10000,
          lte: 24999,
        },
      },
      {
        display: '£24,999 to £99,999',
        id: '3',
        search_parameter: {
          gte: 24999,
          lte: 99999,
        },
      },
    ],
  },
  'fields.grantType.en-US': {
    display: 'Who can apply',
    index_name: 'fields.grantType.en-US',
    type: 'text-filter',
    values: [
      {
        display: 'Personal',
        id: '1',
        search_parameter: 'personal',
      },
    ],
  },
};

const filterObj = {
  errors: [],
  'fields.grantType.en-US': {
    display: 'Who can apply',
    index_name: 'fields.grantType.en-US',
    type: 'text-filter',
    values: [
      { id: '1', display: 'Personal', search_parameter: 'personal' },
      { id: '2', display: 'Public sector', search_parameter: 'public sector' },
    ],
  },
  'fields.grantTotalAwardAmount.en-US': {
    display: 'Amount',
    index_name: 'fields.grantTotalAwardAmount.en-US',
    type: 'range-filter',
    values: [
      { id: '1', display: '£0 to £9999', search_parameter: { lte: 9999 } },
      {
        id: '2',
        display: '£10,000 to £24,999',
        search_parameter: { gte: 10000, lte: 24999 },
      },
      {
        id: '3',
        display: '£24,999 to £99,999',
        search_parameter: { gte: 24999, lte: 99999 },
      },
    ],
  },
};

const incorrectTypeFilterObj = {
  errors: [],
  'fields.grantType.en-US': {
    display: 'Who can apply',
    index_name: 'fields.grantType.en-US',
    type: 'wrong-filter',
    values: [
      { id: '1', display: 'Personal', search_parameter: 'personal' },
      { id: '2', display: 'Public sector', search_parameter: 'public sector' },
    ],
  },
  'fields.grantTotalAwardAmount.en-US': {
    display: 'Amount',
    index_name: 'fields.grantTotalAwardAmount.en-US',
    type: 'wrong-filter',
    values: [
      { id: '1', display: '£0 to £9999', search_parameter: { lte: 9999 } },
      {
        id: '2',
        display: '£10,000 to £24,999',
        search_parameter: { gte: 10000, lte: 24999 },
      },
      {
        id: '3',
        display: '£24,999 to £99,999',
        search_parameter: { gte: 24999, lte: 99999 },
      },
    ],
  },
};

const incorrectFilterObj = {
  errors: [],
  'fields.grantType.en-US': {
    display: 'Who can apply',
    index_name: 'fields.grantType.en-US',
    type: 'text-filter',
    values: [],
  },
};

const filters = [
  {
    display: 'Who can apply',
    index_name: 'fields.grantType.en-US',
    type: 'text-filter',
    sublevel: [
      { id: '1', display: 'Personal', search_parameter: 'personal' },
      { id: '2', display: 'Public sector', search_parameter: 'public sector' },
      { id: '3', display: 'Non profit', search_parameter: 'non profit' },
      {
        id: '4',
        display: 'Private sector',
        search_parameter: 'private sector',
      },
    ],
  },
  {
    display: 'Location',
    index_name: 'fields.grantLocation.en-US',
    type: 'location-filter',
    sublevel: [
      { id: '1', display: 'London', search_parameter: 'London' },
      { id: '2', display: 'England', search_parameter: 'England' },
      { id: '3', display: 'Wales', search_parameter: 'Wales' },
      { id: '4', display: 'Scotland', search_parameter: 'Scotland' },
      {
        id: '5',
        display: 'Northern Ireland',
        search_parameter: 'Northern Ireland',
      },
    ],
  },
  {
    display: 'Amount',
    index_name: 'fields.grantTotalAwardAmount.en-US',
    type: 'range-filter',
    sublevel: [
      { id: '1', display: '£0 to £9999', search_parameter: { lte: 9999 } },
      {
        id: '2',
        display: '£10,000 to £24,999',
        search_parameter: { gte: 10000, lte: 24999 },
      },
      {
        id: '3',
        display: '£24,999 to £99,999',
        search_parameter: { gte: 24999, lte: 99999 },
      },
      {
        id: '4',
        display: '£100,000 to £249,999',
        search_parameter: { gte: 100000, lte: 249999 },
      },
      { id: '5', display: '£250000 plus', search_parameter: { gte: 250000 } },
    ],
  },
];

const filterArray = [
  {
    bool: {
      must: [
        {
          bool: {
            should: [
              { match_phrase: { 'fields.grantType.en-US': 'personal' } },
              { match_phrase: { 'fields.grantType.en-US': 'public sector' } },
            ],
          },
        },
        {
          bool: {
            should: [
              {
                range: { 'fields.grantTotalAwardAmount.en-US': { lte: 9999 } },
              },
              {
                range: {
                  'fields.grantTotalAwardAmount.en-US': {
                    gte: 10000,
                    lte: 24999,
                  },
                },
              },
              {
                range: {
                  'fields.grantTotalAwardAmount.en-US': {
                    gte: 24999,
                    lte: 99999,
                  },
                },
              },
            ],
          },
        },
      ],
    },
  },
];

const emptyQuery = [
  {
    bool: {
      must: [],
    },
  },
];

export {
  stringFilterObj,
  stringArrObj,
  filterArray,
  filters,
  filterObj,
  incorrectFilterObj,
  incorrectTypeFilterObj,
  stringQuery,
  stringArrQuery,
  arrayQuery,
  nonFieldsArrayQuery,
  incorrectArrayQuery,
  emptyQuery,
  dateQuery,
  dateFilterObject,
};
