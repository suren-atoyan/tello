const { fork } = require('child_process');
const path = require('path');

const childProcessScriptPath = path.resolve(__dirname, '../mediaProcessing/faceDetection.js');

const options = {
  stdio: [0, 1, 'pipe', 'ipc'], // "0, 1, 2" -> mean "process.stdin, process.stdout, process.stderr"
  // And 'ipc' for creating an Inter Process Communication (IPC) channel
  // for passing messages/file descriptors between parent and child.
};

function run() {
  const childProcess = fork(childProcessScriptPath, [], options);

  childProcess.stderr.on('data', errorBuffer => {
    console.log('error', errorBuffer.toString());
  });
}

module.exports = run;
