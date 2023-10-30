/* eslint-disable @next/next/no-img-element */
import Head from 'next/head';
import Link from 'next/link';
import { HomepageBodyText } from '../src/components/homepage/body-text/HomePageBodyText';
import { HomePageHeader } from '../src/components/homepage/header/HomePageHeader';
import { HomePageHeadingBlurb } from '../src/components/homepage/heading-blurb/HomePageHeadingBlurb';
import { HomepageSidebar } from '../src/components/homepage/sidebar/HomepageSidebar';
import { NewsletterCallToAction } from '../src/components/newsletter/NewsletterCallToAction';
import Layout from '../src/components/partials/Layout';
import { SearchBar } from '../src/components/search-bar/SearchBar';

export function getServerSideProps({ query }) {
  const applicantUrl = process.env.APPLY_FOR_A_GRANT_APPLICANT_URL;
  const oneLoginEnabled = process.env.ONE_LOGIN_ENABLED;
  if (!query || !query.searchTerm) {
    return { props: { searchTerm: '', applicantUrl, oneLoginEnabled } };
  }

  const { searchTerm } = query;
  return {
    props: {
      searchTerm,
      applicantUrl,
      oneLoginEnabled,
    },
  };
}

const Home = ({ searchTerm, applicantUrl, oneLoginEnabled }) => {
  return (
    <>
      <Head>
        <meta
          name="google-site-verification"
          content="hy7DeFLs371VOo-XAyKeJLRsIXAlpVuoM1f3sOovqPk"
        />
        <title>Home - Find a grant</title>
      </Head>

      <Layout description="Find a grant">
        <div className="govuk-width-container ">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full govuk-!-margin-top-5 govuk-!-margin-bottom-5">
              <img
                className="ggmf_logo"
                src="/assets/images/GGMF_COLOUR_WIDE_30H.png"
                alt="Government Management Function logo and the Government crest."
              />
            </div>
          </div>

          <HomePageHeader heading={'Find a grant'} />

          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <HomePageHeadingBlurb />

              <SearchBar term={searchTerm} />

              <HomepageBodyText heading={'Browse all grants'}>
                <p className="govuk-body">
                  See a list of all grants. You can filter the list based on
                  your needs.
                </p>
                <Link href="/grants/">
                  <a
                    className="govuk-link govuk-body"
                    tabIndex="0"
                    data-cy="cyBrowseGrantsHomePageTextLink"
                  >
                    Browse grants
                  </a>
                </Link>
              </HomepageBodyText>

              <HomepageBodyText heading={'The future of Find a grant'}>
                <p className="govuk-body">
                  More grants will be added as we develop our service. We will
                  also add new functionality to make it easier to use.
                </p>
              </HomepageBodyText>
            </div>
            <HomepageSidebar
              header={'Manage notifications'}
              applicantUrl={applicantUrl}
              oneLoginEnabled={oneLoginEnabled}
            />
          </div>

          <div className="govuk-!-margin-top-9">
            <NewsletterCallToAction returnParams={{ href: '/', searchTerm }} />
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Home;
