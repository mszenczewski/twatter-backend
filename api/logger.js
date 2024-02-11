'use strict';

import fs from 'fs';
import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import validate_argv from '../validate_argv.js';

const LOG_DIR = 'log';

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

const DAILY_ROTATE_FILE_TRANSPORT = new transports.DailyRotateFile
({
  filename: `${LOG_DIR}/%DATE%-results.log`,
  datePattern: 'YYYY-MM-DD'
});

const ARGS = validate_argv();

export default createLogger({
  level: ARGS.log,
  levels: { 
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
  },
  format: format.combine(
    format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
      ),
    }),
    DAILY_ROTATE_FILE_TRANSPORT
  ]
});
