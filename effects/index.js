const { createWriteStream } = require('fs');
const { curry, compose } = require('ramda');
const ffmpeg = require('fluent-ffmpeg');

const { mapMessageToStateStr, parseResponseData } = require('../functions');
const { createUDPNode, promisifyUDPNode, store } = require('../utils');

const handleSocketError = curry((socket, err) => {
  console.log('Tello Commander Socket Error:', err);
  socket.close();
});

function attachListeners(socket) {
  socket.on('error', handleSocketError(socket));
  socket.on('close', socket.close);

  return socket;
}

function bindAddress(options, socket) {
  socket.bind(options.port, options.address);

  return socket;
}

function createReceiver(socket) {
  function handleMessage(msg) {
    console.log(mapMessageToStateStr(msg));
  }

  function on() {
    socket.on('message', handleMessage);
  }

  function off() {
    socket.off('message', handleMessage);
  }

  return {
    socket,
    on,
    off,
  };
}

const handleResponse = curry((resolve, reject, response) => {
  if (response.success === false) {
    return reject(new Error(`Tello Error: ${response.error}`));
  } else {
    return resolve(response.value);
  }
});

function logMessage(response) {
  console.log('response from dron :', response.value);
}

async function createChannel(options, socket) {
  socket.on('message', compose(logMessage, parseResponseData));

  return socket
    .connect(options.port, options.address)
    .then(() => async (command, ...params) => new Promise((resolve, reject) => {
      socket
        .send(`${command}${params.length ? ' ' + params.join(' ') : ''}`)
        .catch(err => err && reject(err));

      socket.once('message', compose(handleResponse(resolve, reject), parseResponseData));
    }));
}

function setupFfmpg({ protocol, address, port, lastCapture }) {
  return () => ffmpeg(`${protocol}://${address}:${port}`).addOption('-f');
}

function createVideoController(options, getCommand) {
  const { state, setState } = store({
    file: options.lastCapture,
    sdl: false,
    sdlWindowTitle: 'tello video stream capture',
    isCapturing: false,
    command: getCommand(),
  });

  function kill() {
    state.command.kill();
    setState({ isCapturing: false });
  }

  function capture() {
    if (state.isCapturing) {
      kill();
    }

    state.command.output(state.file);

    if (state.sdl) {
      state.command.addOption('sdl', state.sdlWindowTitle);
    }

    // sample
    // ffmpeg -i `${protocol}://${address}:${port}` -f sdl "tello video stream capture"
    state.command.run();
  }

  return {
    config(_config) {
      setState({ ..._config, command: getCommand() });
      return capture;
    }
  }
}

module.exports = {
  createUDPNode: compose(promisifyUDPNode, createUDPNode),
  createChannel: curry(createChannel),
  createVideoController: curry(createVideoController),
  createReceiver,

  bindAddress: curry(bindAddress),
  setupFfmpg: setupFfmpg,
  attachListeners,
};
