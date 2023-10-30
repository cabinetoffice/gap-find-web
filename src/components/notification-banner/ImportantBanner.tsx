import React from 'react';
/**
 * Generic component to be used when adding a GDS important notification banner.
 */
const ImportantBanner = ({
  heading,
  content,
  isSuccess = false,
}: ImportantBannerProps) => (
  <div
    className={`govuk-notification-banner ${
      isSuccess ? 'govuk-notification-banner--success' : ''
    }`}
    role={isSuccess ? 'alert' : 'region'}
    aria-labelledby="govuk-notification-banner-title"
    data-module="govuk-notification-banner"
  >
    <div className="govuk-notification-banner__header">
      <h2
        className="govuk-notification-banner__title"
        id="govuk-notification-banner-title"
        data-cy="cyImportantBannerTitle"
      >
        {isSuccess ? 'Success' : 'Important'}
      </h2>
    </div>
    <div className="govuk-notification-banner__content">
      <p
        className="govuk-notification-banner__heading"
        data-cy="cyImportantBannerBody"
      >
        {heading}
      </p>

      {content &&
        (typeof content === 'string' ? (
          <p className="govuk-body">{content}</p>
        ) : (
          content
        ))}
    </div>
  </div>
);

export type ImportantBannerProps = {
  heading: string;
  content?: JSX.Element | string;
  isSuccess?: boolean;
};

export { ImportantBanner };
