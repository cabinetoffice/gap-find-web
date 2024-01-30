import { fetchEntry } from '../../src/utils/contentFulPage';
import axios from 'axios';
const logger = require('pino')();

export async function getServerSideProps({ params }) {
  let path = params.pid;

  const applicantUrl = process.env.APPLY_FOR_A_GRANT_APPLICANT_URL;
  const newMandatoryQuestionsEnabled =
    process.env.NEW_MANDATORY_QUESTION_JOURNEY_ENABLED;

  const grantDetail = await fetchEntry(path);

  if (grantDetail.props.grantDetail === undefined) {
    return {
      redirect: {
        permanent: false,
        destination: `${applicantUrl}/api/redirect-from-find?grantWebpageUrl=grant-is-closed`,
      },
    };
  }

  if (grantDetail.props.grantDetail.fields.label) {
    const child = logger.child({
      action: 'apply',
      label: grantDetail.props.grantDetail.fields.label,
    });
    child.info('button clicked');
  } else {
    const child = logger.child({ action: 'apply', label: 'unknown' });
    child.info('button clicked');
  }

  const advertSummary = await getAdvertSchemeVersion(
    grantDetail.props.grantDetail.fields.label,
  );

  if (!advertSummary.data || advertSummary.response?.status === 404) {
    return {
      redirect: {
        permanent: false,
        destination: '/404',
      },
    };
  }

  const isV1External =
    advertSummary.data.schemeVersion === 1 &&
    advertSummary.data.internalApplication === false;

  const linkHref =
    newMandatoryQuestionsEnabled === 'true' && !isV1External
      ? `${applicantUrl}/api/redirect-from-find?slug=${path}&grantWebpageUrl=${grantDetail.props.grantDetail.fields.grantWebpageUrl}`
      : grantDetail.props.grantDetail.fields.grantWebpageUrl;

  return {
    redirect: {
      permanent: false,
      destination: linkHref,
    },
  };
}

export const getAdvertSchemeVersion = async (contentfulSlug) => {
  return await axios
    .get(
      `${process.env.APPLICANT_BACKEND_HOST}/grant-adverts/${contentfulSlug}/scheme-version`,
    )
    .catch(function (error) {
      return error;
    });
};
const ApplyRedirect = () => {
  return <></>;
};

export default ApplyRedirect;
