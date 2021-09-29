const Logger = require('@mojaloop/central-services-logger')

import { GlobalConfig } from '../config';
import Requests from '../requests';
import { SeedStep } from '../types';
import { wrapWithRunResult } from '../utils';
import { ConstConfig, GenericSteps } from './genericSteps';


// Step Constant config
// This won't change dynamically
const constConfig: ConstConfig =  {
  id: 'oraclesteps',
  name: 'Oracle Steps',
  description: 'Seeds the initial oracle config',
  ignoreFailure: true,
}

// Define steps here
const stepGenerator = (config: GlobalConfig): Array<SeedStep> => {
  const steps: Array<SeedStep> = []
  config.currencies.forEach(currency => {
    config.oracles.forEach(oracleConfig => {
      steps.push({
        name: `create a ${oracleConfig.oracleIdType} oracle for currency: ${currency}`,
        // This command is not idempotent
        ignoreFailure: true,
        command: wrapWithRunResult(() => Requests.postOracles(config.urls.alsAdmin, {
          body: {
            oracleIdType: oracleConfig.oracleIdType,
            endpoint: {
              value: `${oracleConfig.endpoint}`,
              endpointType: "URL"
            },
            currency,
            // Hmm this might be a probalem...
            isDefault: true
          }
        }))
      })
    })
  }) 
  
  return steps;
}

const steps = (config: any) => new GenericSteps(constConfig, config, stepGenerator)
export default steps
