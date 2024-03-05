import moment from 'moment';

// Adjusts opening and closing date times to be 12:01am and 11:59pm respectively to avoid ambiguity around 'midnight' times

export function adjustDateTimes(openDate, closeDate) {
  const adjustedOpenDate = moment.utc(openDate).startOf('day');
  const adjustedCloseDate = moment.utc(closeDate).startOf('day');

  return {
    adjustedOpenDate: adjustedOpenDate.isSame(moment.utc(openDate))
      ? adjustedOpenDate.add(1, 'minute')
      : moment.utc(openDate),
    adjustedCloseDate: adjustedCloseDate.isSame(moment.utc(closeDate))
      ? adjustedCloseDate.subtract(1, 'minute')
      : moment.utc(closeDate),
  };
}
