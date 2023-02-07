import moment from "moment";

export const generateWeeklyNewsletterParams = () => {
  const sevenDaysAgo = moment().subtract(7, 'days')
  const today = moment()

  //Javascript date objects are zero-indexed on the month, so for proper display we +1 the month and -1 when parsing the query params
  return {
    from: {
      day: sevenDaysAgo.date(),
      month: sevenDaysAgo.month() + 1,
      year: sevenDaysAgo.year(),
    },
    to: {
      day: today.date(),
      month: today.month() + 1,
      year: today.year(),
    },
  };
};
