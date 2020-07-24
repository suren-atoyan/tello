const drone = require('./drone');
const { waiting } = require('./utils');

(async _ => {
  console.clear();

  await drone.init();
  await drone.connect();

  const batteryLevel = await drone.read.battery();

  console.log('the battery level is ', batteryLevel);

  await drone.control.streamOn();

  const capture = drone.videoController.config({
    sdl: true,
  });

  capture();

  await waiting(4500, 'waiting for sdl screen');

  console.log('start receiving drone state');
  drone.receiver.on();

  await drone.control.takeoff();
  await drone.control.up(50);
  await drone.control.left(35);

  console.log('stop receiving drone state');
  drone.receiver.off();

  await drone.control.right(35);
  await drone.control.flip('f');
  await drone.control.land();

  console.log('mission is completed');
})();
