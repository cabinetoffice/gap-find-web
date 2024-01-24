export function FundedByGovukBanner({ text }) {
  return (
    <div className="govuk-border govuk-!-margin-top-9">
      <div className="govuk-!-margin-bottom-4">
        <img
          className="govuk-funded-banner"
          src="/assets/images/govuk-funded-logo.png"
          alt="Funded by UK Government banner"
        />
      </div>
      {text ? (
        <p
          className="govuk-body govuk-!-margin-top-8"
          data-testid="banner-text"
        >
          {text}
        </p>
      ) : (
        <></>
      )}
    </div>
  );
}
