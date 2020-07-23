const { createWriteStream } = require('fs');
const { curry, compose } = require('ramda');
const cv = require('opencv4nodejs');

const { mapMessageToStateStr, parseResponseData } = require('../functions');
const { createUDPNode, promisifyUDPNode } = require('../utils');

const handleSocketError = curry((socket, err) => {
  console.log('Tello Commander Socket Error:', err);
  socket.close();
});

function handleVideoStream(options, socket) {
  const file = createWriteStream(options.filePath);
  socket.on('message', buffer => file.write(buffer));
}

function captureVideoFrames(options, socket) {
  // TBD
}

function bindListeners(options, socket) {
  socket.on('error', handleSocketError(socket));
  socket.on('close', socket.close);
  socket.bind(options.port, options.address);

  return socket;
}

function listenToMessages(socket) {
  // TODO: make it optional
  // socket.on('message', msg => {
  //   mapMessageToStateStr(msg.toString('utf-8'));
  // });

  return socket;
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

module.exports = {
  createUDPNode: compose(promisifyUDPNode, createUDPNode),
  bindListeners: curry(bindListeners),
  createChannel: curry(createChannel),
  handleVideoStream: curry(handleVideoStream),
  captureVideoFrames: curry(captureVideoFrames),
  listenToMessages,
};
