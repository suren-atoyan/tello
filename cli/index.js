const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const figlet = require('figlet');
const { flip, path, curry } = require('ramda');

const drone = require('../drone');
const { commands, messages } = require('../config');
const { mapCommandToOption } = require('../functions');
const { timeout, sequentialExec } = require('../utils');

/* =========================================================== */

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

const options = [
  new inquirer.Separator(' = control ='),
  ...Object.entries(commands.control)
           .map(([command, props]) => mapCommandToOption(command, props, 'control')),
  new inquirer.Separator(' = set ='),
  ...Object.entries(commands.set)
           .map(([command, props]) => mapCommandToOption(command, props, 'set')),
  new inquirer.Separator(' = read ='),
  ...Object.entries(commands.read)
           .map(([command, props]) => mapCommandToOption(command, props, 'read')),
];

const filterOptions = curry((options, answers, input = '') => Promise.resolve(
  options.filter(option => !option.value || option.value.split('.')[1].includes(input))
));

const actionsList = {
  type: 'autocomplete',
  message: 'Select a command to control/set/read the dron',
  name: 'action',
  pageSize: 40,
  source: filterOptions(options),
  choices: options,
};

async function getParamValue(param) {
  return inquirer.prompt({
    name: param.name,
    message: `Provide a value for ${param.name} ...`,
    validate: validate(param),
  });
}

async function getParamsValue(params) {
  return await sequentialExec(params, getParamValue);
}

const getCommand = flip(path)(commands);

async function simulator(controlPanel) {
  const { action } = await inquirer.prompt(actionsList);

  const path = action.split('.');
  const [type, command] = path;
  const props = getCommand(path);
  const params = props.params ? await getParamsValue(props.params) : [];

  await controlPanel[type][command](...params.map(param => Object.values(param)[0]));

  simulator(controlPanel);
}

function connect() {
  console.clear();
  console.log(chalk.green.bold(figlet.textSync('Tello Drone CLI')));

  const spinner = ora(messages.cli.connect).start();

  return Promise.race([
    timeout(3000, messages.cli.connectionTimeout),
    drone.connect(),
  ])
  .finally(() => spinner.stop());
}

const simulate = () => drone.init().then(connect)
  .then(() => simulator({
    control: drone.control,
    set: drone.set,
    read: drone.read,
  }))
  .catch(err => !console.error(err) && process.exit());

const validate = curry((param, _input) => {
  // Do type-checking manualy
  // there is a problem with inquirer input type checking

  const input = param.type === 'number' ? Number(_input) : _input;

  if (param.type === 'number' && !Number.isInteger(input)) {
    return 'provide a valid number';
  }

  if (param.range) {
    const [min, max] = param.range;
    if (input < min || input > max) {
      return `it should belong to this range: ${param.range}. Your input was ${input}`;
    }
  }

  if (param.enum) {
    if (!param.enum.includes(input)) {
      return `it should be one of: ${param.enum}. Your input was ${input}`;
    }
  }

  return true;
});

require.main && simulate();

/* =========================================================== */

module.exports = simulate;
