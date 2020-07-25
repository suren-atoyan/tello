const { promisify, inspect } = require('util');
const dgram = require('dgram');

const { curry, compose } = require('ramda');

const {
  mapMessageToState,
  parseResponseData,
  getCommandString,
} = require('../functions');
const logger = require('../logging');

/* =========================================================== */

function createUDPNode() {
  return dgram.createSocket('udp4');
}

function createChannel(options, socket) {
  socket.on('message', compose(logger.message, parseResponseData));

  return socket
    .connect(options.port, options.address)
    .then(() => socket)
    .catch(logger.cannotConnect);
}

function createCommander(handleCommand, connect) {
  return connect.then(socket => {
    return function commander(command, ...params) {
      return new Promise((resolve, reject) => {
        const commandStr = getCommandString(command, ...params);

        socket
          .send(commandStr)
          .catch(reject);

        socket.once('message', compose(handleCommand(resolve, reject, commandStr), parseResponseData));
      });
    }
  });
}

function createReceiver(socket, handler) {
  function handleMessage(msg) {
    logger.state(inspect(mapMessageToState(msg), { compact: false }));
  }

  function on() {
    socket.on('message', handler || handleMessage);
  }

  function off() {
    socket.off('message', handler || handleMessage);
  }

  return {
    socket,
    on,
    off,
  };
}

function attachListeners(socket) {
  socket.on('error', handleSocketError(socket));
  socket.on('close', socket.close);

  return socket;
}

function bindAddress(options, socket) {
  socket.bind(options.port, options.address);

  return socket;
}

const handleSocketError = curry((socket, err) => (logger.socketError(err), socket.close()));

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

const handleCommand = curry((resolve, reject, command, response) => {
  if (response.success === false) {
    logger.commandFail(command, response.error);
    return reject(response.error);
  } else {
    return resolve(response.value);
  }
});

/* =========================================================== */

module.exports = {
  createUDPNode: compose(promisifyUDPNode, createUDPNode),
  createChannel: curry(createChannel),
  createCommander: curry(createCommander)(handleCommand),
  createReceiver,

  bindAddress: curry(bindAddress),
  attachListeners,
};
