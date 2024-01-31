import Head from 'next/head';
import { fetchEntry } from '../../src/utils/contentFulPage';
import gloss from '../../src/utils/glossary.json';

const logger = require('pino')();

export async function getServerSideProps({ params }) {
  let path = params.pid;

  const applicantUrl = process.env.APPLY_FOR_A_GRANT_APPLICANT_URL;
  const newMandatoryQuestionsEnabled =
    process.env.NEW_MANDATORY_QUESTION_JOURNEY_ENABLED;

  const grantDetail = await fetchEntry(path);

  if (grantDetail === undefined) {
    return {
      redirect: {
        permanent: false,
        destination: `${applicantUrl}/api/redirect-from-find?grantWebpageUrl=grant-is-closed`,
      },
    };
  }

  if (grantDetail.fields.label) {
    const child = logger.child({
      action: 'apply',
      label: grantDetail.fields.label,
    });
    child.info('button clicked');
  } else {
    const child = logger.child({ action: 'apply', label: 'unknown' });
    child.info('button clicked');
  }

  const redirectUrl =
    newMandatoryQuestionsEnabled === 'true'
      ? `${applicantUrl}/api/redirect-from-find?slug=${path}&grantWebpageUrl=${grantDetail.fields.grantWebpageUrl}`
      : grantDetail.fields.grantWebpageUrl;

  return {
    props: {
      redirectUrl,
      grantDetail,
    },
  };
}

const ApplyRedirect = ({ grantDetail }) => {
  const grant = grantDetail.fields;

  return (
    <>
      <Head>
        <title>
          {grant.grantName} - {gloss.title}
        </title>
        {/* 
          this meta element triggers a client-side redirect, which is required
          for analytics reporting on this page
        */}
        <meta
          httpEquiv="Refresh"
          content={'0; URL=' + grant.grantWebpageUrl}
        ></meta>
      </Head>
    </>
  );
};

export default ApplyRedirect;
