export function GrantDetailsSidebar({ grantLabel, grantId }) {
  return (
    <div className="govuk-grid-column-one-quarter">
      <hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-2 govuk-border-colour"></hr>
      <h2 className="govuk-heading-m">Get updates about this grant</h2>
      <a
        href={`/subscriptions/signup?id=${grantId}&grantLabel=${grantLabel}`}
        className="govuk-link"
        data-cy="cySignupUpdatesLink"
      >
        Sign up for updates
      </a>
    </div>
  );
}
