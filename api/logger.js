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

const logger = createLogger({
  level: argv.log,
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
  },
  format: format.combine(
      format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
      format.printf(x => `${x.timestamp} ${x.level.toUpperCase()}: [${x.label.toUpperCase()}] ${x.message}`)
  ),
  transports: [
    new transports.Console({
      format: format.combine(
          format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
          format.printf(x => `${x.timestamp} ${x.level.toUpperCase()}: [${x.label.toUpperCase()}] ${x.message}`)
      ),
    }),
    daily_rotate_file_transport
  ]
});

export default function logger_child(label){
  return logger.child({label: label});
}



