import gloss from '../../../utils/glossary.json';

export function GrantDetailsApplyButton({ grant }) {
  return (
    <div className="govuk-grid-row govuk-body">
      <div className="govuk-grid-column-full">
        {grant.grantShowApplyButton ? (
          <a
            type="button"
            target="_blank"
            className="govuk-button"
            data-module="govuk-button"
            aria-disabled="false"
            href={`/apply/${grant.label}`}
            rel="noreferrer"
          >
            {gloss.buttons.newApplication}
          </a>
        ) : (
          <a
            className="govuk-button govuk-button--disabled"
            data-module="govuk-button"
            disabled="disabled"
            aria-disabled="true"
            href="#"
            type="button"
          >
            {gloss.buttons.newApplication}
          </a>
        )}
      </div>
    </div>
  );
}
