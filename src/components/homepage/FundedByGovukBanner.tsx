import Image from 'next/image';
export function FundedByGovukBanner({ text }) {
  return (
    <div className="govuk-border govuk-!-margin-top-9">
      <div className="govuk-!-margin-bottom-4">
        <Image
          src="/assets/images/govuk-funded-logo.png"
          alt="Funded by UK Government banner"
          width="350"
          height="61"
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
