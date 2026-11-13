import { isFavouritesEnabled } from './featureFlags';

describe('isFavouritesEnabled', () => {
  const original = process.env.FAVOURITES_ENABLED;

  afterAll(() => {
    process.env.FAVOURITES_ENABLED = original;
  });

  it('should be on when FAVOURITES_ENABLED is true', () => {
    process.env.FAVOURITES_ENABLED = 'true';
    expect(isFavouritesEnabled()).toBe(true);
  });

  it.each([undefined, '', 'false', 'TRUE', '1'])(
    'should be off when FAVOURITES_ENABLED is %p',
    (value) => {
      if (value === undefined) delete process.env.FAVOURITES_ENABLED;
      else process.env.FAVOURITES_ENABLED = value;
      expect(isFavouritesEnabled()).toBe(false);
    },
  );
});
