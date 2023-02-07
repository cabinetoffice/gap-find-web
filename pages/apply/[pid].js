import Head from 'next/head';
import { fetchEntry } from '../../src/utils/contentFulPage';
import gloss from '../../src/utils/glossary.json';

const logger = require('pino')();

export async function getServerSideProps({ params }) {
  let path = params.pid;
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

  return grantDetail;
}

const ApplyRedirect = (props) => {
  const grant = props.grantDetail.fields;

  return (
    <>
      <Head>
        <title>
          {grant.grantName} - {gloss.title}
        </title>
        <meta
          httpEquiv="Refresh"
          content={'0; URL=' + grant.grantWebpageUrl}
        ></meta>
      </Head>
    </>
  );
};

export default ApplyRedirect;
