const { compose } = require('ramda');

const {
  createUDPNode,
  createReceiver,
  createChannel,
  createCommander,
  attachListeners,
  bindAddress,
} = require('../communication');

const {
  setupFfmpg,
  createVideoController,
} = require('../mediaProcessing');

const { store } = require('../utils');
const { messages } = require('../config');

const {
  options,
  commands,
} = require('../config');

/* =========================================================== */

const { state, setState } = store({
  options,
  isConnected: false,
  commander: () => console.error(messages.init.notInitialized),
});

// according to the official documentation of Tello
// https://dl-cdn.ryzerobotics.com/downloads/Tello/Tello%20SDK%202.0%20User%20Guide.pdf
// There are some steps that should be done to be able
// to send commands or receive messages from Tello
// The required steps from Tello docs are quoted below

/* quoted from docs

=================================
Setup commander

Step 1 - Set up a UDP client on the PC, Mac, or mobile device to send and
receive messages from the Tello via the same port
=================================

=================================
Send "command"

Step 2 - Before sending any other commands, send “command” to the Tello
via UDP PORT 8889 to initiate SDK mode
=================================

=================================
Setup state receiver

Step 3 - Set up a UDP server on the PC, Mac, or mobile device and check
the message from IP 0.0.0.0 via UDP PORT 8890. Steps 1 and 2 must be completed
before attempting step 3. For more details, refer to the Tello State section.
=================================

=================================
Setup video stream receiver

Step 4 - Set up a UDP server on the PC, Mac, or mobile device
and check the message from IP 0.0.0.0 via UDP PORT 11111
=================================

=================================
streamOn/streamOff

Step 5 - Send “streamon” to the Tello via UDP PORT 8889 to start streaming.
Steps 1 and 2 must be completed before attempting step 5
=================================
*/

async function connect() {
  return await state.commander('command').then(() => setState({ isConnected: true }));
}

function config(options) {
  setState({ options });
}

function commander(...args) {
  if (state.isConnected) {
    return state.commander(...args);
  } else {
    console.error(messages.connection.notConnected);
  }
}

// const videoStream = compose(
//   bindAddress(options.videoStream),
//   attachListeners,
//   createUDPNode,
// )();

const stateReceiver = compose(
  createReceiver,
  bindAddress(options.receiver),
  attachListeners,
  createUDPNode,
)();

async function init() {
  const commander = await compose(
    createCommander,
    createChannel(options.drone),
    bindAddress(options.local),
    attachListeners,
    createUDPNode,
  )();

  setState({ commander });
}

/* =========================================================== */

module.exports = {
  config,
  init,
  connect,
  // videoStream,
  stateReceiver,
  // Control Commands
  control: {
    /**
     * Auto takeoff
     */
    takeoff: () => commander(commands.control.takeoff.command),
    /**
     * Auto landing
     */
    land: () => commander(commands.control.land.command),
    /**
     * Enable video stream
     */
    streamOn: () => commander(commands.control.streamOn.command),
    /**
     * Disable video stream
     */
    streamOff: () => commander(commands.control.streamOff.command),
    /**
     * Stop motors immediately
     */
    emergency: () => commander(commands.control.emergency.command),
    /**
     * Ascend to "x" cm
     * @param {number} x - x = 20-500
     */
    up: (x) => commander(commands.control.up.command, x),
    /**
     * Down "x" Descend to "x" cm
     * @param {number} x - x = 20-500
     */
    down: (x) => commander(commands.control.down.command, x),
    /**
     * Fly left for "x" cm
     * @param {number} x - x = 20-500
     */
    left: (x) => commander(commands.control.left.command, x),
    /**
     * Fly right for "x" cm
     * @param {number} x - x = 20-500
     */
    right: (x) => commander(commands.control.right.command, x),
    /**
     * Fly forward for "x" cm
     * @param {number} x - x = 20-500
     */
    forward: (x) => commander(commands.control.forward.command, x),
    /**
     * Fly backward for "x" cm
     * @param {number} x - x = 20-500
     */
    back: (x) => commander(commands.control.back.command, x),
    /**
     * Rotate "x" degrees clockwise
     * @param {number} x - x = 1-360
     */
    cw: (x) => commander(commands.control.cw.command, x),
    /**
     * Rotate "x" degrees counterclockwise
     * @param {number} x - x = 1-360
     */
    ccw: (x) => commander(commands.control.ccw.command, x),
    /**
     * Flip in "x" direction
     * @param {("l"|"r"|"f"|"b")} x
     * "l" = left
     * "r" = right
     * "f" = forward
     * "b" = back
     */
    flip: (x) => commander(commands.control.flip.command, x),
    /**
     * Fly to "x" "y" "z" at "speed" (cm/s)
     * @param {number} x - x = -500-500
     * @param {number} y - y = -500-500
     * @param {number} z - z = -500-500
     * @param {number} speed - speed = -10-100 (cm/s)
     * Note: "x", "y", and "z" values can’t be set between -20 – 20 simultaneously
     */
    go: (x, y, z, speed) => commander(commands.control.go.command, x, y, z, speed),
    /**
     * Hovers in the air
     * Note: works at any time
     */
    stop: () => commander(commands.control.stop.command),
    /**
     * Fly at a curve according to the two given coordinates at "speed" (cm/s)
     * If the arc radius is not within a range of 0.5-10 meters, it will respond with an error
     * @param {number} x1 - x1 = -500-500
     * @param {number} y1 - y1 = -500-500
     * @param {number} z1 - z1 = -500-500
     * @param {number} x2 - x2 = -500-500
     * @param {number} y2 - y2 = -500-500
     * @param {number} z2 - z2 = -500-500
     * @param {number} speed - speed = -10-60 (cm/s)
     * Note: "x", "y", and "z" values can’t be set between -20 – 20 simultaneously
     */
    curve: (x1, y1, z1, x2, y2, z2, speed) =>
      commander(commands.control.curve.command, x1, y1, z1, x2, y2, z2, speed),
    /**
     * Fly to coordinates "x", "y", and "z" of Mission Pad 1, and recognize
     * coordinates 0, 0, "z" of Mission Pad 2 and rotate to the yaw value
     * @param {number} x - x = -500-500
     * @param {number} y - y = -500-500
     * @param {number} z - z = -500-500
     * @param {number} speed - speed = -10-100 (cm/s)
     * @param {number} yaw - yaw = 1-360
     * @param {("m1"|"m2"|"m3"|"m4"|"m5"|"m6"|"m7"|"m8")} mid1
     * @param {("m1"|"m2"|"m3"|"m4"|"m5"|"m6"|"m7"|"m8")} mid2
     * Note: "x", "y", and "z" values can’t be set between -20 – 20 simultaneously
     */
    jump: (x, y, z, speed, yaw, mid1, mid2) =>
      commander(commands.control.jump.command, x, y, z, speed, yaw, mid1, mid2),
  },
  set: {
    /**
     * Set speed to “x” cm/s
     * @param {number} x - x = 10-100
     */
    speed: (x) => commander(commands.set.speed.command, x),
    /**
     * Set remote controller control via four channels
     * @param {number} a - left/right -> -100-100
     * @param {number} b - forward/backward -> -100-100
     * @param {number} c - up/down -> -100-100
     * @param {number} d - yaw -> -100-100
     */
    rc: (a, b, c, d) => commander(commands.set.rc.command, a, b, c, d),
    /**
     * Set Wi-Fi password
     * @param {string} ssid - updated Wi-Fi name
     * @param {string} password - updated Wi-Fi password
     */
    wifi: (ssid, pass) => commander(commands.set.wifi.command, ssid, pass),
    /**
     * Enable mission pad detection (both forward and downward detection)
     */
    mon: () => commander(commands.set.mon.command),
    /**
     * Disable mission pad detection
     */
    moff: () => commander(commands.set.moff.command),
    /**
     * @param {(0|1|2)} x
     * 0 = Enable downward detection only
     * 1 = Enable forward detection only
     * 2 = Enable both forward and downward detection
     * Notes: Perform "mon" command before performing this command
     * The detection frequency is 20 Hz if only the forward or
     * downward detection is enabled.
     * If both the forward and downward detection are enabled,
     * the detection frequency is 10 Hz
     */
    mdirection: (x) => commander(commands.set.mdirection.command, x),
    /**
     * Set the Tello to station mode, and connect to a new access point
     * with the access point’s ssid and password
     * @param {string} ssid - updated Wi-Fi name
     * @param {string} password - updated Wi-Fi password
     */
    ap: (ssid, pass) => commander(commands.set.ap.command, ssid, pass),
  },
  read: {
    /**
     * Obtain current speed (cm/s)
     */
    speed: () => commander(commands.read.speed.command),
    /**
     * Obtain current battery percentage
     */
    battery: () => commander(commands.read.battery.command),
    /**
     * Obtain current flight time
     */
    time: () => commander(commands.read.time.command),
    /**
     * Obtain Wi-Fi SNR
     */
    wifi: () => commander(commands.read.wifi.command),
    /**
     * Obtain the Tello SDK version
     */
    sdk: () => commander(commands.read.sdk.command),
    /**
     * Obtain the Tello serial number
     */
    sn: () => commander(commands.read.sn.command),
  },
}
