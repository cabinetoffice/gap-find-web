import Head from 'next/head';

const ServiceErrorPage = () => {
  return (
    <>
      <Head>
        <title>Service error</title>
      </Head>
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper govuk-main-wrapper--l" role="main">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <h1 className="govuk-heading-l">
                Sorry, there is a problem with the service
              </h1>
              <p className="govuk-body">Try again later.</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ServiceErrorPage;
