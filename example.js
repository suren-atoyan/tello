const drone = require('./drone');

(async _ => {
  console.clear();

  await drone.init();
  await drone.connect();

  const batteryLevel = await drone.read.battery();

  console.log('the battery level is ', batteryLevel);

  await drone.control.takeoff();
  await drone.control.up(50);
  await drone.control.left(35);
  await drone.control.right(35);
  await drone.control.flip('f');
  await drone.control.land();

  console.log('mission is completed');
})();
