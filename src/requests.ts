import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'
const Logger = require('@mojaloop/central-services-logger')
import * as SDKStandardComponents from '@mojaloop/sdk-standard-components'
import { Party } from 'types'


// TODO: make this configurable
// Timeout in ms
const timeout = 15 * 1000

export type PostHubAccountRequest = {
  body: {
    type: 'HUB_MULTILATERAL_SETTLEMENT' | 'HUB_RECONCILIATION',
    currency: SDKStandardComponents.TCurrency
  }
}

export type PostSettlementModelRequest = {
  body: {
    name: string,
    settlementGranularity: string,
    settlementInterchange: string,
    settlementDelay: string,
    requireLiquidityCheck: boolean,
    ledgerAccountType: string,
    autoPositionReset: boolean,
    currency: SDKStandardComponents.TCurrency,
    settlementAccountType: string,
  }
}

export type PostHubEndpointRequest = {
  body: {
    type: 'SETTLEMENT_TRANSFER_POSITION_CHANGE_EMAIL' | 'NET_DEBIT_CAP_ADJUSTMENT_EMAIL' | 'NET_DEBIT_CAP_THRESHOLD_BREACH_EMAIL',
    value: string
  }
}

export type PostOraclesRequest = {
  body: {
    oracleIdType: string,
    endpoint: {
      value: string,
      endpointType: string,
    },
    currency: SDKStandardComponents.TCurrency,
    isDefault: true
  }
}

export type PostParticipantsRequest = {
  body: {
    name: string,
    currency: SDKStandardComponents.TCurrency,
  }
}

export type PostParticipantsPositionAndLimitsRequest = {
  participantId: string,
  body: {
    currency: SDKStandardComponents.TCurrency,
    limit: {
      type: string,
      value: number,
    },
    initialPosition: number
  }
}

export type PostAccountRequest = {
  participantId: string,
  accountId: string
  body: {
    transferId: string,
    externalReference: string,
    action: string,
    reason: string,
    amount: {
      amount: string,
      currency: SDKStandardComponents.TCurrency,
    },
  }
}

export type PostEndpointsRequest = {
  participantId: string,
  body: {
    type: string,
    value: string,
  }
}

export type PostSimulatorPartyRequest = {
  body: Party
}

export type PostALSParticipantRequest = {
  headers: {
    'FSPIOP-Source': string,
  },
  idType: string,
  idValueOrSubType: string,
  idValue?: string,
  body: {
    fspId: string,
    currency: SDKStandardComponents.TCurrency
  }
}

export type GetParticipantResponse = {
  name: string,
  created: string,
  isActive: number,
  accounts: Array<PartcipantAccount>
}

export type PartcipantAccount = {
  id: number,
  ledgerAccountType: string,
  currency: SDKStandardComponents.TCurrency,
  isActive: number,
  createdDate: unknown,
  createdBy: unknown,
}


export default class Requests {
  public static async postHubAccount(host: string, request: PostHubAccountRequest): Promise<AxiosResponse<any>> {
    const url = `${host}/participants/Hub/accounts`
    Logger.debug('postHubAccount - ' + url)

    const options: AxiosRequestConfig = {
      method: 'post',
      timeout,
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        ...request.body
      }
    }
    return this.executeRequest(options)
  }

  public static async postSettlementModel(host: string, request: PostSettlementModelRequest): Promise<AxiosResponse<any>> {
    const url = `${host}/settlementModels`
    Logger.debug('postSettlementModel - ' + url)

    const options: AxiosRequestConfig = {
      method: 'post',
      timeout,
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        ...request.body
      }
    }

    return this.executeRequest(options)
  }

  public static async postHubEndpoints(host: string, request: PostHubEndpointRequest): Promise<AxiosResponse<any>> {
    const url = `${host}/participants/Hub/endpoints`
    Logger.debug('postHubEndpoints - ' + url)

    const options: AxiosRequestConfig = {
      method: 'post',
      timeout,
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        ...request.body
      }
    }

    return this.executeRequest(options)
  }

  public static async postOracles(host: string, request: PostOraclesRequest): Promise<AxiosResponse<any>> {
    const url = `${host}/oracles`
    Logger.debug('postOracles - ' + url)

    const options: AxiosRequestConfig = {
      method: 'post',
      timeout,
      url,
      headers: {
        'Content-Type': 'application/json',
        Date: (new Date()).toISOString()
      },
      data: {
        ...request.body
      }
    }

    return this.executeRequest(options)
  }


  public static async postParticipants(host: string, request: PostParticipantsRequest): Promise<AxiosResponse<any>> {
    const url = `${host}/participants`
    Logger.debug('postParticipants - ' + url)

    const options: AxiosRequestConfig = {
      method: 'post',
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
      url,
      data: {
        ...request.body
      }
    }

    return this.executeRequest(options)
  }

  public static async postParticipantsPositionAndLimits(host: string, request: PostParticipantsPositionAndLimitsRequest): Promise<AxiosResponse<any>> {
    const url = `${host}/participants/${request.participantId}/initialPositionAndLimits`
    Logger.debug('postParticipantsPositionAndLimits - ' + url)

    const options: AxiosRequestConfig = {
      method: 'post',
      timeout,
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        ...request.body
      }
    }

    return this.executeRequest(options)
  }

  public static async getParticipant(host: string, participantId: string): Promise<AxiosResponse<GetParticipantResponse>> {
    const url = `${host}/participants/${participantId}`
    Logger.debug('getParticipant - ' + url)

    const options: AxiosRequestConfig = {
      method: 'get',
      timeout,
      url,
    }

    return this.executeRequest(options);
  }

  public static async postAccount(host: string, request: PostAccountRequest): Promise<AxiosResponse<any>> {
    const url = `${host}/participants/${request.participantId}/accounts/${request.accountId}`
    Logger.debug('postAccount - ' + url)

    const options: AxiosRequestConfig = {
      method: 'post',
      timeout,
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        ...request.body
      }
    }

    return this.executeRequest(options)
  }

  public static async postEndpoint(host: string, request: PostEndpointsRequest): Promise<AxiosResponse<any>> {
    const url = `${host}/participants/${request.participantId}/endpoints`
    Logger.debug('postEndpoint - ' + url)

    const options: AxiosRequestConfig = {
      method: 'post',
      timeout,
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        ...request.body
      }
    }

    return this.executeRequest(options)
  }

  public static async postSimulatorParty(host: string, request: PostSimulatorPartyRequest): Promise<AxiosResponse<any>> {
    const url = `${host}/repository/parties`
    Logger.debug('postSimulatorParty - ' + url)

    const options: AxiosRequestConfig = {
      method: 'post',
      timeout,
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        ...request.body
      }
    }

    return this.executeRequest(options)
  }

  public static async postALSParticipant(host: string, request: PostALSParticipantRequest): Promise<AxiosResponse<any>> {
    const url = `${host}/participants/${request.idType}/${request.idValueOrSubType}` + (request.idValue ? `/${request.idValue}` : '')
    Logger.debug('postALSParticipant - ' + url)

    const options: AxiosRequestConfig = {
      method: 'post',
      timeout,
      url,
      headers: {
        'Accept': 'application/vnd.interoperability.participants+json;version=1',
        'Content-Type': 'application/vnd.interoperability.participants+json;version=1.0',
        Date: (new Date()).toISOString(),
        ...request.headers
      },
      data: {
        ...request.body
      }
    }


    return this.executeRequest(options)

  }

  private static async executeRequest(options: AxiosRequestConfig): Promise<AxiosResponse<any>> {
    try {
      Logger.silly('executeRequest')
      Logger.silly(JSON.stringify(options, null, 2))

      const result = await axios(options)
      return result;
    } catch (err) {
      if (err.response) {
        Logger.warn(`executeRequest failed with status: ${err.response.status}`)
        Logger.debug(JSON.stringify(err.response.data, null, 2))

        // TODO: better error handling
        throw new Error(`Status: ${err.response.status} Message: ${JSON.stringify(err.response.data)}`)
      }
      Logger.warn('Generic Error' + err.message);
      throw err
    }
  }
}
