import { Oracle, Participant, ParticipantType } from './types'
import Convict from 'convict'
import path from 'path'
import json5 from 'json5'
import SDKStandardComponents from '@mojaloop/sdk-standard-components'
const Logger = require('@mojaloop/central-services-logger')


export interface LooseGlobalConfig {
  // deprecated - use `currencies` instead
  currency?: SDKStandardComponents.TCurrency,

  // A list of currencies that the hub supports
  currencies: Array<SDKStandardComponents.TCurrency>,

  // Urls to talk to services
  urls: {
    fspiop: string | null,
    alsEndpoint: string | null,
    // Note: no support for other endpoints yet, since ml-boostrap doesn't need them
    // quotesEndpoint
    // bulkQuotesEndpoint
    // transactionRequestsEndpoint
    // transfersEndpoint
    // bulkTransfersEndpoint

    // als: string, //don't think we need this...
    alsAdmin: string,
    centralLedgerAdmin: string
  },
  // // Urls to be passed into internal services
  // // for registering the correct callbacks
  applicationUrls: {
    oracle: string,
  },
  oracles?: Array<Oracle>,
  participants: Array<Participant>
}

export interface GlobalConfig {
  // A list of currencies that the hub supports
  currencies: Array<SDKStandardComponents.TCurrency>,

  // Urls to talk to services
  urls: {
    fspiop: string | null,
    alsEndpoint: string | null,
    // Note: no support for other endpoints yet, since ml-boostrap doesn't need them
    // quotesEndpoint
    // bulkQuotesEndpoint
    // transactionRequestsEndpoint
    // transfersEndpoint
    // bulkTransfersEndpoint
    
    // als: string, //don't think we need this...
    alsAdmin: string,
    centralLedgerAdmin: string
  },
  // // Urls to be passed into internal services
  // // for registering the correct callbacks
  applicationUrls: {
    oracle: string,
  },
  oracles: Array<Oracle>,
  participants: Array<Participant>
}

Convict.addParser({ extension: 'json5', parse: json5.parse})


export const ConvictConfig = Convict<LooseGlobalConfig>({
  currency: {
    doc: 'DEPRECATED. Use currencies instead. The currency of the switch',
    // TODO: how can we specify the `TCurrency` type here?
    format: String,
    default:'USD',
    env: 'CURRENCY'
  },
  currencies: {
    doc: 'A list of currencies to register with the Hub account and DFSP accounts',
    format: (val: any) => {
      if (!Array.isArray(val)) {
        throw new Error('`currencies` must be an array')
      }
    },
    default: [],
  },
  urls: {
    fspiop: {
      doc: 'Switch endpoint for fspiop(Mojaloop) API. '
      + 'Use this if your mojaloop switch is running behind an API Gateway' 
      + 'otherwise use the individual *endpoint definitions below',
      format: '*',
      env: 'FSPIOP_URL',
      default: null
    },
    alsEndpoint: {
      doc: 'Endpoint for the account lookup service (`/parties` and `/participants` resources)',
      format: '*',
      env: 'ALS_URL',
      default: null
    },
    alsAdmin: {
      doc: 'Switch endpoint for ALS Admin API',
      format: '*',
      env: 'ALS_ADMIN_URL',
      default: '0.0.0.0:4004/account-lookup-service-admin'
    },
    centralLedgerAdmin: {
      doc: 'Switch endpoint for the central-ledger admin API',
      format: '*',
      env: 'CENTRAL_LEDGER_ADMIN_URL',
      default: '0.0.0.0:4004/central-ledger'
    },
  },
  applicationUrls: {
    oracle: {
      doc: '[deprecated] Switch endpoint for oracle simulator - used to point the ALS to the oracle sim. Use `oracles` instead',
      format: '*',
      env: 'ORACLE_URL',
      default: '0.0.0.0:4004/oracle-simulator'
    },
  },
  oracles: {
    doc: 'A list of oracles to register',
    format: (val: any) => {
      if (!Array.isArray(val)) {
        throw new Error('`oracles` must be an array')
      }
    },
    default: []
  },
  participants: {
    doc: 'A list of participants (DFSPs, PISPs), with nested parties',
    format: (val: any) => {
      if (!Array.isArray(val)) {
        throw new Error('`participants` must be an array')
      }

      //TODO: other validation!
    },
    default: []
  }
})

export function loadFromFile(filePath: string): GlobalConfig {
  if (path.isAbsolute(filePath)) {
    ConvictConfig.loadFile(filePath)
  } else {
    ConvictConfig.loadFile(path.join('./', filePath))
  }

  ConvictConfig.validate({allowed: 'strict'})

  const resolvedConfig: LooseGlobalConfig = {
    currency: ConvictConfig.get('currency'),
    currencies: ConvictConfig.get('currencies'),
    urls: ConvictConfig.get('urls'),
    applicationUrls: ConvictConfig.get('applicationUrls'),
    oracles: ConvictConfig.get('oracles'),
    participants: ConvictConfig.get('participants'),
  }

  return formatAndValidateConfig(resolvedConfig)
}

export function formatAndValidateConfig(resolvedConfig: LooseGlobalConfig): GlobalConfig {

  let oracles = resolvedConfig.oracles
  

  // Validation errors/warnings
  if (resolvedConfig.currency) {
    Logger.warn('Using deprecated config `currency`. Please use `currencies` instead.')

    // user has specified both options. This is an error
    if (resolvedConfig.currencies.length > 0) {
      throw new Error('Cannot specify both `currency` and `currencies`. Please use updated config')
    }

    // format to be friendly to the new version
    resolvedConfig.currencies = [resolvedConfig.currency]

    // reset so we don't start doing the wrong thing elsewhere
    resolvedConfig.currency = undefined
  }

  // add a default MSISDN oracle if not specified
  if (!oracles || oracles.length === 0) {
    Logger.warn('Please specify `oracles`. For now, defaulting to a MSISDN oracle')

    oracles = [
      {
        oracleIdType: 'MSISDN',
        endpoint: resolvedConfig.applicationUrls.oracle
      }
    ]
  }

  const strictConfig: GlobalConfig = {
    oracles,
    ...resolvedConfig
  }

  return strictConfig

}