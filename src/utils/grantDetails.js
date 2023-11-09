import { fetchEntry } from './contentFulPage';
import { getValidationErrorsFromQuery } from './request';

export async function fetchGrantDetail(query) {
  const label = query.grantLabel;

  if (label === undefined) {
    return {
      redirect: {
        permanent: false,
        destination: '/static/page-not-found',
      },
    };
  }

  const grantDetail = await fetchEntry(label);

  if (grantDetail.props.grantDetail) {
    grantDetail.props.grantDetail.previousFormValues = query;
    grantDetail.props.grantDetail.errors = query['errors[]']
      ? getValidationErrorsFromQuery(query['errors[]'])
      : [];
  }

  return grantDetail;
}
