'use strict';

import minimist from "minimist";

export default function validate_argv() {
  const argv = minimist(process.argv.slice(2));
  switch(argv.log) {
    case 'ERROR':
    case 'WARN':
    case 'INFO':
    case 'DEBUG':
      process.argv.log = argv.log;
      break;
    default:
      process.argv.log='ERROR';
  }

  process.argv.port = Number.isNaN(Number((argv.port))) ? 8080 : argv.port;
  process.argv.mail = !argv.mail ? 'localhost' : argv.mail;
  process.argv.mongo = !argv.mongo ? 'localhost' : argv.mongo;

  return process.argv;
}
