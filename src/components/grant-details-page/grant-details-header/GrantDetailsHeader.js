import 'moment-timezone';
import Moment from 'react-moment';
import gloss from '../../../utils/glossary.json';
import moment from 'moment';

export function GrantDetailsHeader({ grant }) {
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
              {moment.utc(grant.grantApplicationOpenDate)}
            </Moment>
          </span>
        </li>
        <li>
          <strong>{gloss.grantDetails.closes}:</strong>{' '}
          <span>
            <Moment format="D MMMM YYYY, h:mma" tz="GMT">
              {moment.utc(grant.grantApplicationCloseDate)}
            </Moment>
          </span>
        </li>
      </ul>
    </div>
  );
}
