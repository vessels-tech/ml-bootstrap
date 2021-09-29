#!/usr/bin/env node

const Logger = require('@mojaloop/central-services-logger')

import { Command, option, OptionValues } from 'commander'
import { RunResultType } from './runResult'
import { BootstrapType, SeedCollection } from './types'
import chalk from 'chalk';
import { loadFromFile } from './config';
import getCollections from './collections';

const runCollection = async (collection: SeedCollection) => {
  const collectionNameFormatted = chalk.blue(collection.name)

  Logger.info(`  ${chalk.bold('Running')}: ${collectionNameFormatted}`)
  Logger.info(`  ${chalk.bold('Description')}: ${collection.description}`)
  Logger.info(`  |`)
  const result = await collection.run()
  Logger.info(`  |`)
  switch (result.type) {
    case RunResultType.SUCCESS: {
      Logger.info(`  ${collectionNameFormatted} ${chalk.green(`Passed`)}`)
      if (result.warnings.length > 0) {
        Logger.info(`  ${chalk.yellow('Passed with warnings:')} \n    - ${result.warnings.join('\n    - ')}`)
      }

      break;
    }
    case RunResultType.FAILURE:
      Logger.info(`${collectionNameFormatted} ${chalk.red(`Failed`)}`)
      if (result.warnings.length > 0) {
        Logger.info(`  ${chalk.yellow('Failed with warnings:')} \n    - ${result.warnings.join('\n    - ')}`)
      }
      Logger.info(`  ${chalk.red('Failed with errors:')} \n    - ${result.errors.join('\n    - ')}`)
      break;
  }
}

function makeBootstrapAction(bootstrapType: BootstrapType, options: OptionValues) {
  return async () => {
    if (options.fspid) {
      // User has specified an fspId to run
      if (bootstrapType === BootstrapType.HUB) {
        throw new Error('invalid input. Cannot specify fspId AND hub options')
      }
    }

    // Load the config file
    const config = loadFromFile(options.config)
    const collections = getCollections(bootstrapType, config, options.fspid)

    for (const collection of collections) {
      await runCollection(collection)
    }
  }
}


const program = new Command();

program
  .option('-c, --config <path/to/config>', 'bootstrap config file')
  .option(
    '-f, --fspid <fspid>', 
    'fspid of a participant specifed in the config file. \n\t\t\t\t Use this option to bootstrap only 1 participant at a time',
    undefined
  )

program.description('bootstrap all, Hub, DFSPs, PISPs, Parties')
  .action(makeBootstrapAction(BootstrapType.ALL, program.opts()))

program.command('all')
  .description('bootstrap all, Hub, DFSPs, PISPs, Parties')
  .action(makeBootstrapAction(BootstrapType.ALL, program.opts()))

program.command('hub')
  .description('set up the Mojaloop hub')
  .action(makeBootstrapAction(BootstrapType.HUB, program.opts()))

program.command('participants')
  .description('onboard only the participants')
  .action(makeBootstrapAction(BootstrapType.PARTICIPANTS, program.opts()))

program.command('parties')
  .description('onboard only the parties')
  .action(makeBootstrapAction(BootstrapType.PARTIES, program.opts()))


program.parseAsync(process.argv)