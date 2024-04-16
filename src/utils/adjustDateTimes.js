import moment from 'moment';

// Adjusts opening and closing date times to be 12:01am and 11:59pm respectively to avoid ambiguity around 'midnight' times

export function adjustDateTimes(openDate, closeDate) {
  const timeSuffixes = {
    open: getTimeSuffix(openDate),
    close: getTimeSuffix(closeDate),
  };

  const adjustedOpenDate = moment.utc(openDate).startOf('day');
  const adjustedCloseDate = moment.utc(closeDate).startOf('day');

  return {
    adjustedOpenDate: adjustedOpenDate.isSame(moment.utc(openDate))
      ? adjustedOpenDate.add(1, 'minute')
      : moment.utc(openDate),
    adjustedCloseDate: adjustedCloseDate.isSame(moment.utc(closeDate))
      ? adjustedCloseDate.subtract(1, 'minute')
      : moment.utc(closeDate),
    timeSuffixes,
  };
}

function getTimeSuffix(date) {
  switch (moment.utc(date).format('HH:mm')) {
    case '23:59':
    case '00:00':
    case '00:01':
      return ' (Midnight)';
    case '12:00':
      return ' (Midday)';
    default:
      return '';
  }
}
