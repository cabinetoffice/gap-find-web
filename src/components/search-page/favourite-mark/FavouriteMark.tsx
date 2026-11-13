import {
  CSRF_FORM_KEY,
  FAVOURITE_FORM_ID,
  favouriteRoutes,
} from '../../../utils/constants';
import styles from './FavouriteMark.module.css';

/**
 * The form the favourite marks submit. It sits outside the search form so
 * the CSRF token is never added to the search page address.
 */
export const FavouriteForm = ({ csrfToken }: { csrfToken: string }) => (
  <form id={FAVOURITE_FORM_ID} method="post" action={favouriteRoutes.add}>
    <input type="hidden" name={CSRF_FORM_KEY} value={csrfToken} />
  </form>
);

type FavouriteMarkProps = {
  grantId: string;
  grantName: string;
  isFavourite: boolean;
};

const MarkIcon = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 32"
    className={styles.icon}
  >
    <path d="M3 2h18v27l-9-6.5L3 29z" />
  </svg>
);

/**
 * The favourite mark beside a grant in search results. It submits the
 * FavouriteForm (by its id), so it works without JavaScript.
 */
export const FavouriteMark = ({
  grantId,
  grantName,
  isFavourite,
}: FavouriteMarkProps) => {
  if (isFavourite) {
    return (
      <span
        className={`${styles.mark} ${styles.added}`}
        title="In your favourites"
        data-cy="cyFavouriteAdded"
      >
        <MarkIcon />
        <span className="govuk-visually-hidden">
          {grantName} is in your favourites
        </span>
      </span>
    );
  }

  return (
    <button
      type="submit"
      form={FAVOURITE_FORM_ID}
      name="grantId"
      value={grantId}
      className={styles.mark}
      title="Add to favourites"
      data-cy="cyAddToFavourites"
    >
      <MarkIcon />
      <span className="govuk-visually-hidden">
        Add {grantName} to favourites
      </span>
    </button>
  );
};
