/* =========================================================== */

function mapMessageToState(message) {
  return message
    .toString('utf-8')
    .split(';')
    .slice(0, -1)
    .reduce((acc, item) => {
      const [key, value] = item.split(':');
      return (acc[key] = value, acc);
    }, {});
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

function getCommandString(command, ...params) {
  return `${command}${params.length ? ' ' + params.join(' ') : ''}`;
}

/* =========================================================== */

module.exports = {
  mapMessageToState,
  mapCommandToOption,
  parseResponseData,
  getCommandString,
};
