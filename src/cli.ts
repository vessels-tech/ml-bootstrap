import { Command } from 'commander'
import collections from './index'
import { RunResultType } from './runResult'
import { SeedCollection } from './types'
import chalk from 'chalk';
const packageJson = require('../package.json')

const mlBootstrap = new Command();
mlBootstrap.version(packageJson.version);

mlBootstrap
  .option('-c, --config <path/to/config>', 'bootstrap config file')

//TODO: load in and parse a config file

mlBootstrap.parse()

console.log('Options', mlBootstrap.opts())


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

async function main() {
  for (const collection of collections) {
    await runCollection(collection)
  }
}

// main()
//   .catch(err => {
//     console.log('cli.ts, fatal error', err)
//     process.exit(1)
//   })
