import 'moment-timezone';
import Link from 'next/link';
import Moment from 'react-moment';
import gloss from '../../../utils/glossary.json';
import { adjustDateTimes } from '../../../utils/adjustDateTimes';
import { FavouriteMark } from '../favourite-mark/FavouriteMark';

export function SearchResultCard({
  item,
  canFavourite = false,
  isFavourite = false,
}) {
  const { adjustedOpenDate, adjustedCloseDate, timeSuffixes } = adjustDateTimes(
    item.grantApplicationOpenDate,
    item.grantApplicationCloseDate,
  );
  return (
    <li id={item.grantName}>
      <div className="gap-search-result__heading">
        <h2 className="govuk-heading-m">
          <Link
            href={{
              pathname: '/grants/[pid]',
              query: { pid: item.label },
            }}
            className="govuk-link"
            data-cy="cyGrantNameAndLink"
          >
            {item.grantName}
          </Link>
        </h2>
        {canFavourite && item.id && (
          <FavouriteMark
            grantId={item.id}
            grantName={item.grantName}
            isFavourite={isFavourite}
          />
        )}
      </div>
      <p
        className="govuk-body"
        data-cy={`cyGrantShortDescriptions-${item.label}`}
      >
        {item.grantShortDescription}
      </p>

      <dl className="govuk-summary-list">
        <div className="govuk-summary-list__row govuk-summary-list__row--no-actions">
          <dt className="govuk-summary-list__value">{gloss.browse.location}</dt>
          <dd className="govuk-summary-list__value">
            {item.grantLocation?.join(', ')}
          </dd>
        </div>
        <div className="govuk-summary-list__row govuk-summary-list__row--no-actions">
          <dt className="govuk-summary-list__value">{gloss.browse.funders}</dt>
          <dd className="govuk-summary-list__value">{item.grantFunder}</dd>
        </div>
        <div className="govuk-summary-list__row govuk-summary-list__row--no-actions">
          <dt className="govuk-summary-list__value">
            {gloss.browse.whoCanApply}
          </dt>
          <dd className="govuk-summary-list__value">
            {item.grantApplicantType?.join(', ')}
          </dd>
        </div>
        <div className="govuk-summary-list__row govuk-summary-list__row--no-actions">
          <dt className="govuk-summary-list__value">{gloss.browse.size}</dt>
          <dd className="govuk-summary-list__value">
            {`From ${item.grantMinimumAwardDisplay} to ${item.grantMaximumAwardDisplay}`}
          </dd>
        </div>
        <div className="govuk-summary-list__row govuk-summary-list__row--no-actions">
          <dt className="govuk-summary-list__value">
            {gloss.browse.schemeSize}
          </dt>
          <dd className="govuk-summary-list__value">
            {item.grantTotalAwardDisplay}
          </dd>
        </div>
        <div className="govuk-summary-list__row govuk-summary-list__row--no-actions">
          <dt className="govuk-summary-list__value">{gloss.browse.opens}</dt>
          <dd className="govuk-summary-list__value">
            <Moment format="D MMMM YYYY, h:mma" tz="GMT">
              {adjustedOpenDate}
            </Moment>
            {timeSuffixes.open}
          </dd>
        </div>
        <div className="govuk-summary-list__row govuk-summary-list__row--no-actions">
          <dt className="govuk-summary-list__value">{gloss.browse.closes}</dt>
          <dd className="govuk-summary-list__value">
            <Moment format="D MMMM YYYY, h:mma" tz="GMT">
              {adjustedCloseDate}
            </Moment>
            {timeSuffixes.close}
          </dd>
        </div>
      </dl>
      <div className="govuk-!-margin-bottom-9" />
    </li>
  );
}
