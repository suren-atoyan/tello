const logger = require('./winston');
const { removeTabs } = require('../utils');

/* =========================================================== */

function cannotConnect(error) {
  logger.error(removeTabs(`
    Can't connect to the drone.
    Be sure that you are in the same network.
    You should be connected to the network shared by the drone.

    The error message is:

    ${error}
  `));
}

function state(state) {
  logger.info(removeTabs(`
    The drone current state:

    ${state}
  `));
}

function message(message) {
  logger.info(removeTabs(`
    The message has been received from the drone:

    ${message.value}
  `));
}

function commandFail(command, error) {
  logger.error(removeTabs(`
    This command -> ${command}
    has been sent to the drone,
    but it failed.

    The error massage is:

    ${error}
  `));
}

function socketError(error) {
  logger.error(removeTabs(`
    This error has occurred in the UDP server.

    The error message is:

    ${error}
  `));
}

/* =========================================================== */

module.exports = {
  cannotConnect,
  state,
  message,
  commandFail,
  socketError,
};
