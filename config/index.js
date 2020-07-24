const local = {
  address: '0.0.0.0',
  port: 8889,
};

const receiver = {
  address: '0.0.0.0',
  port: 8890,
};

const drone = {
  address: '192.168.10.1',
  port: 8889,
};

const videoStream = {
  protocol: 'udp',
  address: '0.0.0.0',
  port: 11111,
  lastCapture: './last_capture.mp4',
};

const commands = {
  control: {
    takeoff: {
      command: 'takeoff',
      description: 'Auto takeoff',
    },
    land: {
      command: 'land',
      description: 'Auto landing',
    },
    streamOn: {
      command: 'streamon',
      description: 'Enable video stream',
      disabled: false,
    },
    streamOff: {
      command: 'streamoff',
      description: 'Disable video stream',
      disabled: false,
    },
    emergency: {
      command: 'emergency',
      description: 'Stop motors immediately',
    },
    up: {
      command: 'up',
      description: 'Ascend to "x" cm',
      params: [
        {
          type: 'number',
          range: [20, 500],
          name: 'x',
        },
      ],
    },
    down: {
      command: 'down',
      description: 'Down "x" Descend to "x" cm',
      params: [
        {
          type: 'number',
          range: [20, 500],
          name: 'x',
        },
      ],
    },
    left: {
      command: 'left',
      description: 'Fly left for "x" cm',
      params: [
        {
          type: 'number',
          range: [20, 500],
          name: 'x',
        },
      ],
    },
    right: {
      command: 'right',
      description: 'Fly right for "x" cm',
      params: [
        {
          type: 'number',
          range: [20, 500],
          name: 'x',
        },
      ],
    },
    forward: {
      command: 'forward',
      description: 'Fly forward for "x" cm',
      params: [
        {
          type: 'number',
          range: [20, 500],
          name: 'x',
        },
      ],
    },
    back: {
      command: 'back',
      description: 'Fly backward for "x" cm',
      params: [
        {
          type: 'number',
          range: [20, 500],
          name: 'x',
        },
      ],
    },
    cw: {
      command: 'cw',
      description: 'Rotate "x" degrees clockwise',
      params: [
        {
          type: 'number',
          range: [1, 360],
          name: 'x',
        },
      ],
    },
    ccw: {
      command: 'ccw',
      description: 'Rotate "x" degrees counterclockwise',
      params: [
        {
          type: 'number',
          range: [1, 360],
          name: 'x',
        },
      ],
    },
    flip: {
      command: 'flip',
      description: 'Flip in "x" direction',
      params: [
        {
          type: 'string',
          enum: ['l', 'r', 'f', 'b'],
          name: 'x',
        },
      ],
    },
    go: {
      command: 'go',
      description: 'Fly to "x" "y" "z" at "speed" (cm/s)',
      params: [
        {
          type: 'number',
          range: [-500, 500],
          name: 'x',
        },
        {
          type: 'number',
          range: [-500, 500],
          name: 'y',
        },
        {
          type: 'number',
          range: [-500, 500],
          name: 'z',
        },
        {
          type: 'number',
          range: [-10, 100],
          name: 'speed',
        },
      ],
    },
    stop: {
      command: 'stop',
      description: 'Hovers in the air',
    },
    curve: {
      command: 'curve',
      description: 'Fly at a curve according to the two given coordinates at "speed" (cm/s). If the arc radius is not within a range of 0.5-10 meters, it will respond with an error',
      params: [
        {
          type: 'number',
          range: [-500, 500],
          name: 'x1',
        },
        {
          type: 'number',
          range: [-500, 500],
          name: 'y1',
        },
        {
          type: 'number',
          range: [-500, 500],
          name: 'z1',
        },
        {
          type: 'number',
          range: [-500, 500],
          name: 'x2',
        },
        {
          type: 'number',
          range: [-500, 500],
          name: 'y2',
        },
        {
          type: 'number',
          range: [-500, 500],
          name: 'z2',
        },
        {
          type: 'number',
          range: [-10, 100],
          name: 'speed',
        },
      ],
    },
    jump: {
      command: 'jump',
      description: 'Fly to coordinates "x", "y", and "z" of Mission Pad 1, and recognize coordinates 0, 0, "z" of Mission Pad 2 and rotate to the yaw value',
      params: [
        {
          type: 'number',
          range: [-500, 500],
          name: 'x',
        },
        {
          type: 'number',
          range: [-500, 500],
          name: 'y',
        },
        {
          type: 'number',
          range: [-500, 500],
          name: 'z',
        },
        {
          type: 'number',
          range: [-10, 100],
          name: 'speed',
        },
        {
          type: 'number',
          range: [1, 360],
          name: 'yaw',
        },
        {
          type: 'string',
          enum: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'],
          name: 'mid1',
        },
        {
          type: 'string',
          enum: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'],
          name: 'mid2',
        },
      ],
    },
  },
  set: {
    speed: {
      command: 'speed',
      description: 'Set speed to “x” cm/s',
      params: [
        {
          type: 'number',
          range: [10, 100],
          name: 'x',
        },
      ],
    },
    rc: {
      command: 'rc',
      description: 'Set remote controller control via four channels',
      params: [
        {
          type: 'number',
          range: [-100, 100],
          name: 'a',
        },
        {
          type: 'number',
          range: [-100, 100],
          name: 'b',
        },
        {
          type: 'number',
          range: [-100, 100],
          name: 'c',
        },
        {
          type: 'number',
          range: [-100, 100],
          name: 'd',
        },
      ],
    },
    wifi: {
      command: 'wifi',
      description: 'Set Wi-Fi password',
      params: [
        {
          type: 'string',
          name: 'ssid',
        },
        {
          type: 'string',
          name: 'pass',
        },
      ],
    },
    mon: {
      command: 'mon',
      description: 'Enable mission pad detection (both forward and downward detection)',
    },
    moff: {
      command: 'moff',
      description: 'Disable mission pad detection',
    },
    mdirection: {
      command: 'mdirection',
      description: '0 = Enable downward detection only, 1 = Enable forward detection only, 2 = Enable both forward and downward detection',
      params: [
        {
          type: 'number',
          enum: [0, 1, 2],
          name: 'x',
        },
      ],
    },
    ap: {
      command: 'ap',
      description: 'Set the Tello to station mode, and connect to a new access point with the access point’s ssid and password',
      params: [
        {
          type: 'string',
          name: 'ssid',
        },
        {
          type: 'string',
          name: 'pass',
        },
      ],
    },
  },
  read: {
    speed: {
      command: 'speed?',
      description: 'Obtain current speed (cm/s)',
    },
    battery: {
      command: 'battery?',
      description: 'Obtain current battery percentage',
    },
    time: {
      command: 'time?',
      description: 'Obtain current flight time',
    },
    wifi: {
      command: 'wifi?',
      description: 'Obtain Wi-Fi SNR',
    },
    sdk: {
      command: 'sdk?',
      description: 'Obtain the Tello SDK version',
    },
    sn: {
      command: 'sn?',
      description: 'Obtain the Tello serial number',
    },
  },
};

const messages = {
  cli: {
    connect: 'connect with Tello drone...',
    connectionTimeout: 'Timeout of connection: please check you network, and be sure that your device is in the network of the drone',
  },
  init: {
    notInitialized: 'dron is not initialized yet; run `drone.init()`',
  },
  connection: {
    notConnected: 'drone is not connected; run `dron.connect()`',
  },
};

module.exports = {
  options: {
    local,
    receiver,
    drone,
    videoStream,
  },
  commands,
  messages,
};
