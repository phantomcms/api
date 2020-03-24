import * as chalk from 'chalk';

const colors = {
  PRIMARY: chalk.blue,
  SECONDARY: chalk.yellow,
  SUCCESS: chalk.green,
  ERROR: chalk.red
}

///////////////////////
// Startup
///////////////////////

export const STARTING = () => {
  console.log(colors.PRIMARY('Starting Thrustr...'));
}

export const INJECTABLE_HYDRATED = (token: string) => {
  console.log(colors.PRIMARY('[Injectable Hydrated]: '), colors.SECONDARY(token))
}

export const DATASOURCE_CONNECTED = (source: string) => {
  console.log(colors.PRIMARY('[Datasource Connection Established]: '), colors.SECONDARY(source))
}

export const INTERFACE_AVAILABLE = (identifier: string, port?: string) => {
  console.log(colors.PRIMARY(`${identifier} Interface available` + (port ? ` on port ${port}`: '')));
}

export const READY = () => {
  console.log(colors.SUCCESS('Ready for blast-off, Captain'));
}