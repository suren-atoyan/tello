const { curry, compose } = require('ramda');
const ffmpeg = require('fluent-ffmpeg');
const cv = require('opencv4nodejs');

const { store } = require('../utils');

/* =========================================================== */

function getVideoStreamUrl({ protocol, address, port }) {
  return `${protocol}://${address}:${port}`;
}

function setupFfmpg(videoStreamUrl) {
  return () => ffmpeg(videoStreamUrl).addOption('-f');
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

  function captureCV() {
    return new cv.VideoCapture('udp://0.0.0.0:11111');
  }

  return {
    config(_config) {
      setState({ ..._config, command: getCommand() });
      return capture;
    },

    captureCV,
  }
}

/* =========================================================== */

module.exports = {
  createVideoController: curry(createVideoController),
  setupFfmpg: compose(setupFfmpg, getVideoStreamUrl),
};
