const cv = require('opencv4nodejs');
const { curry, compose } = require('ramda');

const { waiting, store } = require('../utils');

const drawRect = (image, rect, color, opts = { thickness: 2 }) =>
  image.drawRectangle(
    rect,
    color,
    opts.thickness,
    cv.LINE_8
  );

const drawBlueRect = (image, rect, opts = { thickness: 2 }) =>
  drawRect(image, rect, new cv.Vec(255, 0, 0), opts);

async function connectDrone(drone) {
  await drone.init();
  await drone.connect();

  const batteryLevel = await drone.read.battery();

  console.log('the battery level is ', batteryLevel);

  await drone.control.streamOn();

  return drone;
}

function getDroneVCap() {
  return new cv.VideoCapture('udp://0.0.0.0:11111?overrun_nonfatal=1&fifo_size=50000000');
}

function getWebCamVCap() {
  return new cv.VideoCapture(0);
}

function videoFile(vCap) {
  const w = vCap.get(3);
  const h = vCap.get(4);

  return new cv.VideoWriter(
    './video.avi',
    cv.VideoWriter.fourcc('MJPG'),
    30,
    new cv.Size(parseInt(w), parseInt(h))
  );
}

function getFrame(vCap, fn) {
  function getFrame() {
    return vCap.read();
  }

  function sendCurrentFrame() {
    fn(getFrame());
  }

  setInterval(sendCurrentFrame, 10);

  // while(true) {
  //   sendCurrentFrame();
  // }
}

function resizeByScale(scale, frame) {
  const [width, height] = frame.sizes;
  return frame.resize(parseInt(width/scale), parseInt(height/scale));
}

function detection(classifier, frame) {
  // console.time('classifier');
  const { objects, numDetections } = classifier.detectMultiScale(frame.bgrToGray(), { scaleFactor: 1.2, minSize: new cv.Size(50, 50) });
  // console.timeEnd('classifier');

  // draw detection
  // console.time('check fn');
  const numDetectionsTh = 10;
  objects.forEach((rect, i) => {
    const thickness = numDetections[i] < numDetectionsTh ? 1 : 2;
    drawBlueRect(frame, rect, { thickness });
  });
  // console.timeEnd('check fn');

  return frame;
}

function show(frame) {
  // console.time('check show');
  cv.waitKey(1);
  cv.imshow('webcam example', frame);
  // console.timeEnd('check show');
}

const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
const faceDetection = curry(detection)(classifier);

const scale = 3;
const resize = curry(resizeByScale)(scale);

async function capture(device = 'wc') {
  if (device === 'drone') {
    const drone = require('../drone');
    await connectDrone(drone);
  }

  const vCap = device === 'wc'
    ? getWebCamVCap()
    : getDroneVCap();

  getFrame(vCap, compose(show, faceDetection, resize));
}

require.main && capture('drone');

module.exports = capture;
