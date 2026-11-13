// Feature flags read from environment variables. Each is off unless set to
// 'true'. They are read on each call (not at import) so a restart or test can
// change them. This file has no imports so it is safe to use in middleware.

/** Favourites: the mark on search results and adding a favourite. */
export const isFavouritesEnabled = () =>
  process.env.FAVOURITES_ENABLED === 'true';
