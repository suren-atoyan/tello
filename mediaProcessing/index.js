const { curry } = require('ramda');
const ffmpeg = require('fluent-ffmpeg');

const { store } = require('../utils');

/* =========================================================== */

function setupFfmpg({ protocol, address, port }) {
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

/* =========================================================== */

module.exports = {
  createVideoController: curry(createVideoController),
  setupFfmpg: setupFfmpg,
};
