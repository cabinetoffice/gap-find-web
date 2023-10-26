import Head from 'next/head';
import { useRouter } from 'next/router';
import { GrantDetailsApplyButton } from '../../src/components/grant-details-page/grant-details-apply-button/GrantDetailsApplyButton';
import { GrantDetailsHeader } from '../../src/components/grant-details-page/grant-details-header/GrantDetailsHeader';
import { GrantDetailsSidebar } from '../../src/components/grant-details-page/grant-details-sidebar/GrantDetailsSidebar';
import { GrantDetailsTabs } from '../../src/components/grant-details-page/grant-details-tabs/GrantDetailsTabs';
import Layout from '../../src/components/partials/Layout';
import { fetchEntry } from '../../src/utils/contentFulPage';
import gloss from '../../src/utils/glossary.json';

export async function getServerSideProps({ params }) {
  let path = params.pid;

  const grantDetail = await fetchEntry(path);
  if (
    grantDetail.props.grantDetail === null ||
    grantDetail.props.grantDetail === undefined
  ) {
    return {
      redirect: {
        permanent: false,
        destination: '/static/page-not-found',
      },
    };
  }
  const grantId = grantDetail.props.grantDetail.sys.id;

  return {
    props: {
      grantDetail,
      enableFAQTab: process.env.ENABLE_FAQ_TAB
        ? process.env.ENABLE_FAQ_TAB
        : true,
      enableAwardsTab: process.env.ENABLE_AWARDS_TAB
        ? process.env.ENABLE_AWARDS_TAB
        : true,
      grantId,
    },
  };
}

const Grants = ({ grantDetail, enableFAQTab, enableAwardsTab, grantId }) => {
  console.log(grantId);
  const router = useRouter();
  const grant = grantDetail.props.grantDetail.fields;

  const filteredOutTabs = ['fileType', 'emptyTab', 'test_pipeline'];
  if (enableFAQTab === 'false') {
    filteredOutTabs.push('faqs');
  }
  if (enableAwardsTab === 'false') {
    filteredOutTabs.push('awarded');
  }

  return (
    <>
      <Head>
        <title>{grant.grantName} - GOV-UK Find a grant</title>
      </Head>
      <Layout description="Grants Application Programme">
        <div className="govuk-width-container">
          <div className="govuk-!-margin-top-3 govuk-!-margin-bottom-0 padding-bottom40">
            <a
              className="govuk-back-link"
              data-cy="cyGrantDetailsBackButton"
              onClick={() => router.back()}
            >
              {gloss.buttons.back}
            </a>
          </div>

          <div className="govuk-grid-row govuk-body">
            <GrantDetailsHeader grant={grant} />
            <GrantDetailsSidebar grantLabel={grant.label} grantId={grantId} />
          </div>

          <GrantDetailsApplyButton grant={grant} />

          <GrantDetailsTabs grant={grant} filteredOutTabs={filteredOutTabs} />
        </div>
      </Layout>
    </>
  );
};

export default Grants;
