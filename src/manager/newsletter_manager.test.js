import { generateWeeklyNewsletterParams } from './newsletter_manager';

describe('generateWeeklyNewsletterParams', () => {

  //Javascript date objects are zero-indexed on the month, so for proper display we +1 the month and -1 when parsing the query params
  const mockParams = {
    from: { day: 9, month: 5, year: 2022 },
    to: { day: 16, month: 5, year: 2022 },
  };

  jest.useFakeTimers('modern');
  jest.setSystemTime(new Date(2022, 4, 16));

  it('Should return object with correct date params for the last 7 days', () => {
    const result = generateWeeklyNewsletterParams();
    expect(result).toStrictEqual(mockParams);
  });
});
