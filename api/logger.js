'use strict';

import fs from 'fs';
import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import validate_argv from '../validate_argv.js';

const log_dir = 'log';

if (!fs.existsSync(log_dir)) {
  fs.mkdirSync(log_dir);
}

const daily_rotate_file_transport = new transports.DailyRotateFile
({
  filename: `${log_dir}/%DATE%-results.log`,
  datePattern: 'YYYY-MM-DD'
});

const argv = validate_argv();

export default createLogger({
  level: argv.log,
  levels: { 
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
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
    daily_rotate_file_transport
  ]
});
