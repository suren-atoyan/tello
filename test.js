const drone = require('./drone');

(async _ => {
  console.clear();

  await drone.init();
  await drone.connect();

  const batteryLevel = await drone.read.battery();

  console.log('the battery level is ', batteryLevel);

  await drone.control.streamOn();
  // await drone.control.flip('f');
  // await drone.control.land();

  console.log('mission is completed');
})();

// const fs = require('fs');

// fs.readFile('./video.h264', (err, data) => {
//   if (err) throw err;
//   a = data.toString('ascii').includes('HXVS');
//   console.log(a);
// });


  // setTimeout(_ => {
  //   const wCap = new cv.VideoCapture('udp://@0.0.0.0:11111');

  //   wCap.readAsync((err, frame) => {
  //     if (err) {
  //       console.log('opencv error :', err);
  //     }

  //     console.log('opencv video frame :', frame);
  //   });
  // }, 9000);