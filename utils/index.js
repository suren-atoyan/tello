const { promisify } = require('util');
const dgram = require('dgram');
const ora = require('ora');

const sleep = ms => new Promise(res => setTimeout(res, ms));

const timeout = (ms, message) => new Promise((_, rej) => setTimeout(() => rej(message), ms));

const waiting = (ms, message = '') => {
  const spinner = ora(message).start();

  return sleep(ms)
    .then(() => {
      spinner.stop();
    });
}

function createUDPNode() {
  return dgram.createSocket('udp4');
}

function promisifyUDPNode(node) {
  // unfortunately, there is no way to universally
  // make the instance of the socket promisified.
  // there are different types of functions plus a chain of __proto__s,
  // so to avoid Frankensteins, at this moment
  // it would be better to promisify only those methods that
  // we know we are going to use (and manually)

  // Socket
  node.connect = promisify(node.connect);
  node.disconnect = promisify(node.disconnect);
  node.send = promisify(node.send);
  node.close = promisify(node.close);

  return node;
}

// very simple state managment tool
// for internal (utils) usage

function store(initial = {}) {
  const _ = {
    state: initial,
    setState,
  };

  function setState(change) {
    Object.assign(_.state, change);
  }

  return _;
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

module.exports = {
  sleep,
  timeout,
  waiting,
  store,
  createUDPNode,
  sequentialExec,
  promisifyUDPNode,
};
