import createLogger from 'pino';
const isProd = process.env.NODE_ENV === 'production';

const log = createLogger();

const CONSOLE_COLOURS = {
  BLACK: '\x1b[30m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  WHITE: '\x1b[37m',
} as const;

const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  HTTP: 'http',
  DEBUG: 'debug',
} as const;

const LOG_COLOURS = {
  [LOG_LEVELS.ERROR]: CONSOLE_COLOURS.RED,
  [LOG_LEVELS.WARN]: CONSOLE_COLOURS.YELLOW,
  [LOG_LEVELS.INFO]: CONSOLE_COLOURS.GREEN,
  [LOG_LEVELS.HTTP]: CONSOLE_COLOURS.MAGENTA,
  [LOG_LEVELS.DEBUG]: CONSOLE_COLOURS.WHITE,
} as const;

type ValueOf<T> = T[keyof T];

type LogLevel = ValueOf<typeof LOG_LEVELS>;

const withLogColour = (text: string, level: LogLevel) =>
  LOG_COLOURS[level] + text + CONSOLE_COLOURS.WHITE;

const formatTime = (date: Date) =>
  `${date.toLocaleTimeString()}.${date.getMilliseconds()}`;

const getLoggerWithLevel =
  (level: LogLevel) => (logMessage: string, json?: object) => {
    const date = new Date();
    const time = formatTime(date);
    if (!isProd) {
      console.log(
        `[${time}] ` +
          withLogColour(`${level.toUpperCase()}: ${logMessage}`, level),
      );
      if (json) console.dir(json, { depth: null });
    } else
      log[level]({
        logMessage,
        ...json,
      });
  };

type Logger = Record<LogLevel, ReturnType<typeof getLoggerWithLevel>>;

export const logger = Object.values(LOG_LEVELS).reduce(
  (acc, value) => ({ ...acc, [value]: getLoggerWithLevel(value) }),
  {} as Logger,
);
