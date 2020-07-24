function mapMessageToStateStr(message) {
  const state = message
    .toString('utf-8')
    .split(';')
    .reduce((acc, item) => {
      const [key, value] = item.split(':');
      return (acc[key] = value, acc);
    }, {});

  return `{
    pitch = ${state.pitch}
    roll = ${state.roll}
    yaw = ${state.yaw}
    vgx = ${state.vgx}
    vgy = ${state.vgy}
    vgz = ${state.vgz}
    templ = ${state.templ}
    temph = ${state.temph}
    tof = ${state.tof}
    h = ${state.h}
    bat = ${state.bat}
    baro = ${state.baro}
    time = ${state.time}
    agx = ${state.agx}
    agy = ${state.agy}
    agz = ${state.agz}
  }`;
}

function mapCommandToOption(command, { description, disabled }, type) {
  return {
    name: `${command} -- ${description}`,
    short: description,
    value: `${type}.${command}`,
    disabled: disabled,
  };
}

function parseResponseData(responseData) {
  const responseString = responseData.toString('utf-8');

  const response = {
    success: true,
    value: null,
    error: null
  };

  if (responseString.substr(0, 2) === 'ok') {
    return response;
  }

  if (responseString.substr(0, 5) === 'error') {
    response.error = responseString;
    response.success = false;
    return response;
  }

  response.value = responseString.trim();
  return response;
}

function getSeparator(name) {
  return {
    name,
    separator: true,
    disabled: true,
  }
}

module.exports = {
  mapMessageToStateStr,
  mapCommandToOption,
  parseResponseData,
  getSeparator,
};
