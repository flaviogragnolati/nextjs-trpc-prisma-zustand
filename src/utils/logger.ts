import { createLogger, format, transports } from 'winston';

export enum LoggerMethodsEnum {
  error = 'error',
  warn = 'warn',
  info = 'info',
  http = 'http',
  verbose = 'verbose',
  debug = 'debug',
  silly = 'silly',
}

const customFormat = format.printf(
  ({ level, message, timestamp, label, ...metadata }) => {
    let msg = `[${timestamp}] - ${
      label ? label : ''
    } [${level.toUpperCase()}]: ${message} `;
    if (metadata) {
      msg += JSON.stringify(metadata);
    }
    return msg;
  },
);
const winstonDefaultConfig = {
  level: LoggerMethodsEnum.debug,
  silent: false,
  format: format.combine(
    format.colorize(),
    format.splat(),
    format.timestamp(),
    customFormat,
  ),
  transports: [new transports.Console()],
};

export const logger = createLogger(winstonDefaultConfig);
