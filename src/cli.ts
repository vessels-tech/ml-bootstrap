import { Command, OptionValues } from 'commander'
import { RunResultType } from './runResult'
import { BootstrapType, SeedCollection } from './types'
import chalk from 'chalk';
import { loadFromFile, PACKAGE } from './config';
import getCollections from './collections';

const runCollection = async (collection: SeedCollection) => {
  const collectionNameFormatted = chalk.blue(collection.name)

  console.log(`\n\n  ${chalk.bold('Running')}: ${collectionNameFormatted}\n  ${chalk.bold('Description')}: ${collection.description}`)
  console.log(`  |`)
  const result = await collection.run()
  console.log(`  |`)
  switch (result.type) {
    case RunResultType.SUCCESS: {
      console.log(`  ${collectionNameFormatted} ${chalk.green(`Passed`)}`)
      if (result.warnings.length > 0) {
        console.log(`  ${chalk.yellow('Passed with warnings:')} \n    - ${result.warnings.join('\n    - ')}`)
      }

      break;
    }
    case RunResultType.FAILURE:
      console.log(`${collectionNameFormatted} ${chalk.red(`Failed`)}`)
      if (result.warnings.length > 0) {
        console.log(`  ${chalk.yellow('Failed with warnings:')} \n    - ${result.warnings.join('\n    - ')}`)
      }
      console.log(`  ${chalk.red('Failed with errors:')} \n    - ${result.errors.join('\n    - ')}`)
      break;
  }
}

function makeBootstrapAction(bootstrapType: BootstrapType, options: OptionValues) {
  return async () => {
    // Load the config file
    const config = loadFromFile(options.config)
    const collections = getCollections(bootstrapType, config)

    for (const collection of collections) {
      await runCollection(collection)
    }
  }
}


const program = new Command();
program.version(PACKAGE.version);

program
  .option('-c, --config <path/to/config>', 'bootstrap config file')

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