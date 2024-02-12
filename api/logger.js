'use strict';

import fs from 'fs';
import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import get_config from '../get_config.js';

const log_dir = 'log';

if (!fs.existsSync(log_dir)) fs.mkdirSync(log_dir);

const daily_rotate_file = new transports.DailyRotateFile({
  filename: `${log_dir}/%DATE%-results.log`,
  datePattern: 'YYYY-MM-DD'
});

const cfg = get_config();
const timestamp_format = {format: 'YYYY-MM-DD HH:mm:ss'};

const logger = createLogger({
  level: cfg.log_level,
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
  },
  format: format.combine(
      format.timestamp(timestamp_format),
      format.printf(msg => format_msg(msg))
  ),
  transports: [
    new transports.Console({
      format: format.combine(
          format.timestamp(timestamp_format),
          format.printf(msg => format_msg(msg))
      ),
    }),
    daily_rotate_file
  ]
});

function format_msg(x) {
  return `${x.timestamp} ${x.level.toUpperCase()}: [${x.label.toUpperCase()}] ${x.message}`;
}

export default function logger_child(label){
  return logger.child({label: label});
}