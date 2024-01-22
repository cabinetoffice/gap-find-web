import Image from 'next/image';
export default function FundedByGovukBanner({ text }) {
  return (
    <div className="govuk-border govuk-!-margin-top-8">
      <Image
        src="/assets/images/govuk-funding-logo.png"
        alt="govuk funding logo"
        width="350"
        height="70"
      />
      <p className="govuk-body govuk-!-margin-top-8">{text}</p>
    </div>
  );
}
