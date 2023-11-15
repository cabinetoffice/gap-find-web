function ConfirmationMessage({ heading }) {
  return (
    <div className="govuk-grid-column-two-thirds">
      <div
        className="govuk-notification-banner govuk-notification-banner--success"
        role="alert"
        aria-labelledby="govuk-notification-banner-title"
        data-module="govuk-notification-banner"
      >
        <div className="govuk-notification-banner__header">
          <h2
            className="govuk-notification-banner__title"
            id="govuk-notification-banner-title"
          >
            Success
          </h2>
        </div>
        <div className="govuk-notification-banner__content">
          <h3
            className="govuk-notification-banner__heading"
            data-cy="cySubscribeSuccessMessageContent"
          >
            {heading}
          </h3>
        </div>
      </div>
    </div>
  );
}

export { ConfirmationMessage };
