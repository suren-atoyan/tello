const ora = require('ora');

/* =========================================================== */

const sleep = ms => new Promise(res => setTimeout(res, ms));

const timeout = (ms, message) => new Promise((_, rej) => setTimeout(() => rej(message), ms));

const waiting = (ms, message = '') => {
  const spinner = ora(message).start();

  return sleep(ms)
    .then(() => {
      spinner.stop();
    });
}

function store(initial, handlers = {}) {
  if (!initial) {
    throw new Error('initial state is required');
  }

  const _ = {
    state: initial,
    setState,
  };

  function setState(changes) {
    // check only in development
    validateChanges(initial, changes);
    Object.assign(_.state, changes);
    Object.keys(changes).forEach(field => handlers[field] && handlers[field](changes[field]));
  }

  return _;
}

function validateChanges(initial, changes) {
  if (typeof changes !== 'object') {
    throw new Error('provided value of changes should be an object');
  }

  if (Object.keys(changes).some(field => !Object.prototype.hasOwnProperty.call(initial, field))) {
    throw new Error('It seams you want to change a field in the state that is not specified in the "initial" state');
  }
}

async function sequentialExec(list, asyncFn) {
  // yes, it's terrible
  // to achieve sequential execution of async functions
  // we have to do such kind of sin
  // it's not possible to "stop" the iteration in case of .forEach, .map, etc.
  const values = [];
  for (const item of list) values.push(await asyncFn(item));
  return values;
}

const removeTabs = str => str.trim().replace(/^ {4}/gm, '');

/* =========================================================== */

module.exports = {
  sleep,
  timeout,
  waiting,
  store,
  sequentialExec,
  removeTabs,
};
