import 'moment-timezone';
import Moment from 'react-moment';
import gloss from '../../../utils/glossary.json';
import moment from 'moment';
import { adjustDateTimes } from '../../../utils/adjustDateTimes';

export function GrantDetailsHeader({ grant }) {
  const { adjustedOpenDate, adjustedCloseDate, timeSuffixes } = adjustDateTimes(
    grant.grantApplicationOpenDate,
    grant.grantApplicationCloseDate,
  );

  return (
    <div className="govuk-grid-column-three-quarters">
      <h1
        className="govuk-heading-l"
        data-cy="cyGrantDetailName"
        id="main-content-focus"
        tabIndex={-1}
      >
        {grant.grantName}
      </h1>
      <p className="govuk-body">{grant.grantShortDescription}</p>
      <ul className="govuk-list">
        <li>
          <strong>{gloss.grantDetails.opens}:</strong>{' '}
          <span>
            <Moment format="D MMMM YYYY, h:mma" tz="GMT">
              {moment.utc(adjustedOpenDate)}
            </Moment>
            {timeSuffixes.open}
          </span>
        </li>
        <li>
          <strong>{gloss.grantDetails.closes}:</strong>{' '}
          <span>
            <Moment format="D MMMM YYYY, h:mma" tz="GMT">
              {moment.utc(adjustedCloseDate)}
            </Moment>
            {timeSuffixes.close}
          </span>
        </li>
      </ul>
    </div>
  );
}
