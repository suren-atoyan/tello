const drone = require('../drone');

async function connectDrone(drone) {
  await drone.init();
  await drone.connect();

  const batteryLevel = await drone.read.battery();

  console.log('the battery level is ', batteryLevel);

  await drone.control.streamOn();

  return drone;
}

async function mission(drone) {
  await waiting(4500, 'waiting for sdl screen');

  console.log('start receiving drone state');
  drone.stateReceiver.on();

  await drone.control.takeoff();
  await drone.control.up(50);
  await drone.control.left(35);

  console.log('stop receiving drone state');
  drone.stateReceiver.off();

  await drone.control.right(35);
  await drone.control.flip('f');
  await drone.control.cw(180);
  await drone.control.land();

  console.log('mission is completed');
}

module.exports = mission;
