import { fetchEntry } from '../../src/utils/contentFulPage';

const logger = require('pino')();

export async function getServerSideProps({ params }) {
  let path = params.pid;

  const applicantUrl = process.env.APPLY_FOR_A_GRANT_APPLICANT_URL;
  const newMandatoryQuestionsEnabled =
    process.env.NEW_MANDATORY_QUESTION_JOURNEY_ENABLED;

  const grantDetail = await fetchEntry(path);

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

  const linkHref =
    newMandatoryQuestionsEnabled === 'true'
      ? `${applicantUrl}/api/redirect-from-find?slug=test-grant-1-2&grantWebpageUrl=${grantDetail.props.grantDetail.fields.grantWebpageUrl}`
      : grantDetail.props.grantDetail.fields.grantWebpageUrl;

  return {
    redirect: {
      permanent: false,
      destination: linkHref,
    },
  };
}

const ApplyRedirect = () => {
  return <></>;
};

export default ApplyRedirect;
