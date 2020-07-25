const winston = require('winston');
const chalk = require('chalk');

const { combine, timestamp, label, printf } = winston.format;

const custonFormat = printf(({ level, message, label, timestamp }) => {
  return chalk[getColor(level)](`${timestamp} [${label}] ${level}: ${message}`);
});

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    label({ label: 'tello-node' }),
    timestamp(),
    custonFormat,
  ),
  defaultMeta: { service: 'tello-node' },
  transports: [
    new winston.transports.Console(),
  ],
});

if (process.env.NODE_ENV === 'production') {
  //
  // - Write all logs with level `error` and below to `error.log`
  // - Write all logs with level `info` and below to `combined.log`
  //

  logger.add(new winston.transports.File({ filename: 'error.log', level: 'error' }));
  logger.add(new winston.transports.File({ filename: 'combined.log' }));
}

function getColor(level) {
  switch(level) {
    case 'info': return 'green';
    case 'error': return 'red';
    case 'warn': return 'grey';
    default: return 'black';
  }
}

module.exports = logger;
