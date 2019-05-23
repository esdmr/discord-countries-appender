const chalk = require('chalk');

exports.log = (...messages) =>
  console.error(chalk.gray('Log  '), ...messages);

exports.info = (...messages) =>
  console.error(chalk.blue('Info '), ...messages);

exports.warn = (...messages) =>
  console.error(chalk.yellow('Warn '), ...messages);

exports.error = (...messages) =>
  console.error(chalk.red('Err  '), ...messages);

exports.fatal = err => {
  console.error(chalk.bold.red('Fatal'), err);
  process.exit();
};

exports.logNull = () => console.log('');

// TODO: input

exports.init = () => Promise.resolve();
exports.destroy = () => Promise.resolve();
