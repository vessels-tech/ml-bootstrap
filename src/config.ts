import { Oracle, Participant, ParticipantType } from './types'
import Convict from 'convict'
import path from 'path'
import json5 from 'json5'
import SDKStandardComponents from '@mojaloop/sdk-standard-components'


export interface GlobalConfig {
  currency: SDKStandardComponents.TCurrency,
  // Urls to talk to services
  urls: {
    fspiop: string,
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

Convict.addParser({ extension: 'json5', parse: json5.parse})


export const ConvictConfig = Convict<GlobalConfig>({
  currency: {
    doc: 'The currency of the switch',
    // TODO: how can we specify the `TCurrency` type here?
    format: String,
    default:'USD',
    env: 'CURRENCY'
  },
  urls: {
    fspiop: {
      doc: 'Switch endpoint for fspiop(Mojaloop) API',
      format: '*',
      env: 'FSPIOP_URL',
      default: '0.0.0.0:4003'
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
        throw new Error('`participants` must be an array')
      }

      //TODO: other validation!
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
    ConvictConfig.loadFile(path.join(__dirname, '..', filePath))
  }

  ConvictConfig.validate({allowed: 'strict'})

  const resolvedConfig: GlobalConfig = {
    currency: ConvictConfig.get('currency'),
    urls: ConvictConfig.get('urls'),
    applicationUrls: ConvictConfig.get('applicationUrls'),
    oracles: ConvictConfig.get('oracles'),
    participants: ConvictConfig.get('participants'),
  }

  return resolvedConfig
}