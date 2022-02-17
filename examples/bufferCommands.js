var keypress = require('keypress');
keypress(process.stdin);

const drone = require('../drone');

async function connectDrone(drone) {
  await drone.init();
  await drone.connect();

  const batteryLevel = await drone.read.battery();

  console.log('the battery level is ', batteryLevel);

  // await drone.control.streamOn();

  return drone;
}

const commands = {
  'up': () => drone.control.up(20),
  'down': () => drone.control.down(20),
  'left': () => drone.control.left(20),
  'right': () => drone.control.right(20),
  'space': () => drone.control.takeoff(),
  'w': () => drone.control.forward(20),
  'a': () => drone.control.left(20),
  's': () => drone.control.back(20),
  'd': () => drone.control.right(20),
  'q': () => drone.control.land(),
};

async function mission() {
  await connectDrone(drone)

  // listen for the "keypress" event
  process.stdin.on('keypress', function (ch, key) {
    
    if (commands[key.name]) {
      commands[key.name]();
    }

    if (key && key.ctrl && key.name == 'c') {
      process.stdin.pause();
      process.exit();
    }
  });

  process.stdin.setRawMode(true);
  process.stdin.resume();
}

module.exports = mission;
