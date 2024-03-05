import { adjustDateTimes } from '../../src/utils/adjustDateTimes';

describe('For removing ambiguity with opening and closing times when they are set to midnight', () => {
  it('should return an object with changed timestamps when input times are set to midnight', () => {
    const inputOpenDate = '2022-02-07 00:00:00.000+00';
    const inputCloseDate = '2022-04-07 00:00:00.000+00';

    const expectedOpenDate = '2022-02-07 00:01:00.000+00';
    const expectedCloseDate = '2022-04-06 23:59:00.000+00';

    const result = adjustDateTimes(inputOpenDate, inputCloseDate);

    expect(result.adjustedOpenDate.isSame(expectedOpenDate)).toBe(true);
    expect(result.adjustedCloseDate.isSame(expectedCloseDate)).toBe(true);
  });

  it('should return an object with unchanged timestamps when input times are not set to midnight', () => {
    const inputOpenDate = '2022-02-07 01:45:00.000+00';
    const inputCloseDate = '2022-04-07 23:27:00.000+00';

    const result = adjustDateTimes(inputOpenDate, inputCloseDate);

    expect(result.adjustedOpenDate.isSame(inputOpenDate)).toBe(true);
    expect(result.adjustedCloseDate.isSame(inputCloseDate)).toBe(true);
  });
});
