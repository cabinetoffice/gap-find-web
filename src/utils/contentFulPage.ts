const space = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
const environment = process.env.CONTENTFUL_ENVIRONMENT;
import { createClient } from 'contentful';
import { IFiltersFields } from '../../@types/generated/contentful';

export const client = createClient({
  space: space,
  accessToken: accessToken,
  environment,
});

export async function fetchEntries(contentIds, sortBy, paginationObj) {
  let sortByReq;

  switch (sortBy) {
    case 'closingDate':
      sortByReq = 'fields.grantApplicationCloseDate';
      break;
    case 'closingDateDesc':
      sortByReq = '-fields.grantApplicationCloseDate';
      break;
    case 'maxValue':
      sortByReq = '-fields.grantMaximumAward';
      break;
    case 'maxValueDesc':
      sortByReq = 'fields.grantMaximumAward';
      break;
    case 'openingDate':
      sortByReq = 'fields.grantApplicationOpenDate';
      break;
    case 'openingDateDesc':
      sortByReq = '-fields.grantApplicationOpenDate';
      break;
    case 'minValue':
      sortByReq = 'fields.grantMinimumAward';
      break;
    case 'minValueDesc':
      sortByReq = '-fields.grantMinimumAward';
      break;
    default:
      sortByReq = 'fields.grantApplicationOpenDate';
  }

  const { skip, limit } = paginationObj;

  const query = {
    content_type: 'grantDetails',
    select:
      'fields.grantName,fields.label,fields.grantFunder,fields.grantLocation,fields.grantShortDescription,fields.grantTotalAwardAmount,fields.grantTotalAwardDisplay,fields.grantMinimumAward,fields.grantMinimumAwardDisplay,fields.grantMaximumAward,fields.grantMaximumAwardDisplay,fields.grantApplicationOpenDate,fields.grantApplicationCloseDate,fields.grantApplicantType',
    order: sortByReq,
    skip,
    limit,
  };

  if (contentIds) {
    query['sys.id[in]'] = contentIds.join(',');
  }

  const { items, total } = await client.getEntries(query);
  if (items) return { items, total };
}

export async function fetchEntry(path) {
  const entries = await client.getEntries({
    content_type: 'grantDetails',
    'fields.label': path,
  });

  return {
    props: { grantDetail: entries.items[0] },
  };
}

export async function fetchFilters() {
  const entries = await client.getEntries<IFiltersFields>({
    content_type: 'filters',
  });

  if (entries.items) return entries.items[0].fields.filters;
}

export async function fetchByGrantIds(Ids) {
  const query = {
    content_type: 'grantDetails',
    select:
      'fields.grantName,fields.label,fields.grantFunder,fields.grantLocation,fields.grantShortDescription,fields.grantTotalAwardAmount,fields.grantTotalAwardDisplay,fields.grantMinimumAward,fields.grantMinimumAwardDisplay,fields.grantMaximumAward,fields.grantMaximumAwardDisplay,fields.grantApplicationOpenDate,fields.grantApplicationCloseDate',
  };
  query['sys.id[in]'] = Ids.join(',');

  const entries = await client.getEntries(query);

  return entries.items;
}

export async function fetchByGrantId(Id) {
  const entry = await client.getEntry(Id);

  return entry;
}
