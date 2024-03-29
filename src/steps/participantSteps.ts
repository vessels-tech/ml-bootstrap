
import { v4 as uuid} from 'uuid'

import Requests from '../requests';
import { wrapWithRunResult } from '..//utils';
import { DFSPParticipant, DFSPParticipantWithPISPSupport, Participant, ParticipantType, PISPParticipant, SeedStep } from '../types';
import { ConstConfig, GenericSteps } from './genericSteps';
import { GlobalConfig } from 'config';
import { TCurrency } from '@mojaloop/sdk-standard-components';


const makeCommonSteps = (
  _constConfig: ConstConfig, 
  globalConfig: GlobalConfig, 
  participant: Participant, 
  currencies: Array<TCurrency>
  ): Array<SeedStep> => {
  const currencySteps: Array<SeedStep> = []

  currencies.forEach(currency => {
    currencySteps.push({
      name: `Add participant: ${participant.id} and currency: ${currency}`,
      ignoreFailure: true,
      command: wrapWithRunResult(() => Requests.postParticipants(globalConfig.urls.centralLedgerAdmin, {
        body: {
          name: participant.id,
          currency
        }
      }))
    },)
  })

  return [
    ...currencySteps,
    {
      name: 'register endpoint `FSPIOP_CALLBACK_URL_PARTIES_GET`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'FSPIOP_CALLBACK_URL_PARTIES_GET',
          value: `${participant.fspiopCallbackUrl}/parties/{{partyIdType}}/{{partyIdentifier}}`
        }
      }))
    },
    {
      name: 'register endpoint `FSPIOP_CALLBACK_URL_PARTIES_PUT`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'FSPIOP_CALLBACK_URL_PARTIES_PUT',
          value: `${participant.fspiopCallbackUrl}/parties/{{partyIdType}}/{{partyIdentifier}}`
        }
      }))
    },
    {
      name: 'register endpoint `FSPIOP_CALLBACK_URL_PARTIES_PUT_ERROR`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'FSPIOP_CALLBACK_URL_PARTIES_PUT_ERROR',
          value: `${participant.fspiopCallbackUrl}/parties/{{partyIdType}}/{{partyIdentifier}}/error`
        }
      }))
    },
  ]
}

const makeDfspSteps = (
  _constConfig: ConstConfig, 
  globalConfig: GlobalConfig, 
  participant: DFSPParticipant | DFSPParticipantWithPISPSupport, 
  currencies: Array<TCurrency>
  ): Array<SeedStep> => {

  const currencySteps: Array<SeedStep> = []
  currencies.forEach(currency => {
    currencySteps.push({
      name: `add initial position and limits for ${currency}`,
      ignoreFailure: true,
      command: wrapWithRunResult(() => Requests.postParticipantsPositionAndLimits(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          currency,
          limit: {
            type: "NET_DEBIT_CAP",
            value: 1000000
          },
          initialPosition: 0
        }
      }))
    },
      {
        name: `create settlement account for ${currency}`,
        ignoreFailure: false,
        command: wrapWithRunResult(async () => {
          const participantResponse = await Requests.getParticipant(globalConfig.urls.centralLedgerAdmin, participant.id);
          const settlementAccount = participantResponse.data.accounts
            .filter(account => account.ledgerAccountType === 'SETTLEMENT')
            .filter(account => account.currency === currency)
            .pop();

          if (!settlementAccount) {
            throw new Error(`Settlement account not found for: ${participant.id} and currency: ${currency}`)
          }

          Requests.postAccount(globalConfig.urls.centralLedgerAdmin, {
            participantId: participant.id,
            accountId: `${settlementAccount.id}`,
            body: {
              transferId: uuid(),
              externalReference: "none",
              action: "recordFundsIn",
              reason: "Initial settlement amount",
              amount: {
                amount: "1000000",
                currency
              }
            }
          })
        })
      },)
  })


  return [
    ...currencySteps,
    {
      name: 'register endpoint `FSPIOP_CALLBACK_URL_PARTICIPANT_PUT`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'FSPIOP_CALLBACK_URL_PARTICIPANT_PUT',
          value: `${participant.fspiopCallbackUrl}/participants/{{partyIdType}}/{{partyIdentifier}}`
        }
      }))
    },
    {
      name: 'register endpoint `FSPIOP_CALLBACK_URL_PARTICIPANT_PUT_ERROR`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'FSPIOP_CALLBACK_URL_PARTICIPANT_PUT_ERROR',
          value: `${participant.fspiopCallbackUrl}/participants/{{partyIdType}}/{{partyIdentifier}}/error`
        }
      }))
    },

    {
      name: 'register endpoint `FSPIOP_CALLBACK_URL_PARTICIPANT_BATCH_PUT_ERROR`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'FSPIOP_CALLBACK_URL_PARTICIPANT_BATCH_PUT_ERROR',
          value: `${participant.fspiopCallbackUrl}/participants/{{requestId}}/error`
        }
      }))
    },

    {
      name: 'register endpoint `FSPIOP_CALLBACK_URL_QUOTES`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'FSPIOP_CALLBACK_URL_QUOTES',
          value: `${participant.fspiopCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `FSPIOP_CALLBACK_URL_TRANSFER_POST`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'FSPIOP_CALLBACK_URL_TRANSFER_POST',
          value: `${participant.fspiopCallbackUrl}/transfers`
        }
      }))
    },
    {
      name: 'register endpoint `FSPIOP_CALLBACK_URL_TRANSFER_PUT`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'FSPIOP_CALLBACK_URL_TRANSFER_PUT',
          value: `${participant.fspiopCallbackUrl}/transfers/{{transferId}}`
        }
      }))
    },
    {
      name: 'register endpoint `FSPIOP_CALLBACK_URL_TRANSFER_ERROR`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'FSPIOP_CALLBACK_URL_TRANSFER_ERROR',
          value: `${participant.fspiopCallbackUrl}/transfers/{{transferId}}/error`
        }
      }))
    },
    {
      name: 'register endpoint `FSPIOP_CALLBACK_URL_BULK_TRANSFER_POST`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'FSPIOP_CALLBACK_URL_BULK_TRANSFER_POST',
          value: `${participant.fspiopCallbackUrl}/bulkTransfers`
        }
      }))
    },
    {
      name: 'register endpoint `FSPIOP_CALLBACK_URL_BULK_TRANSFER_PUT`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'FSPIOP_CALLBACK_URL_BULK_TRANSFER_PUT',
          value: `${participant.fspiopCallbackUrl}/bulkTransfers/{{id}}`
        }
      }))
    },
    {
      name: 'register endpoint `FSPIOP_CALLBACK_URL_BULK_TRANSFER_ERROR`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'FSPIOP_CALLBACK_URL_BULK_TRANSFER_ERROR',
          value: `${participant.fspiopCallbackUrl}/bulkTransfers/{{id}}/error`
        }
      }))
    },
    {
      name: 'register endpoint `FSPIOP_CALLBACK_URL_PARTICIPANT_BATCH_PUT`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'FSPIOP_CALLBACK_URL_PARTICIPANT_BATCH_PUT',
          value: `${participant.fspiopCallbackUrl}/participants/{{requestId}}`
        }
      }))
    },
    {
      name: 'register endpoint `FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_DELETE`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_DELETE',
          value: `${participant.fspiopCallbackUrl}/participants/{{partyIdType}}/{{partyIdentifier}}/{{partySubIdOrType}}`
        }
      }))
    },
    {
      name: 'register endpoint `FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_PUT`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_PUT',
          value: `${participant.fspiopCallbackUrl}/participants/{{partyIdType}}/{{partyIdentifier}}/{{partySubIdOrType}}`
        }
      }))
    },
    {
      name: 'register endpoint `FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_PUT_ERROR`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_PUT_ERROR',
          value: `${participant.fspiopCallbackUrl}/participants/{{partyIdType}}/{{partyIdentifier}}/{{partySubIdOrType}}/error`
        }
      }))
    },
    {
      name: 'register endpoint `FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_GET`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_GET',
          value: `${participant.fspiopCallbackUrl}/parties/{{partyIdType}}/{{partyIdentifier}}/{{partySubIdOrType}}`
        }
      }))
    },
    {
      name: 'register endpoint `FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_PUT`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_PUT',
          value: `${participant.fspiopCallbackUrl}/parties/{{partyIdType}}/{{partyIdentifier}}/{{partySubIdOrType}}`
        }
      }))
    },
    {
      name: 'register endpoint `FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_PUT_ERROR`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_PUT_ERROR',
          value: `${participant.fspiopCallbackUrl}/parties/{{partyIdType}}/{{partyIdentifier}}/{{partySubIdOrType}}/error`
        }
      }))
    }, 
    {
      name: 'register endpoint `FSPIOP_CALLBACK_URL_TRX_REQ_SERVICE`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'FSPIOP_CALLBACK_URL_TRX_REQ_SERVICE',
          // TODO: this looks wrong to me!
          value: `${participant.fspiopCallbackUrl}`
        }
      }))
    },
  ]
}

const makeDFSPSupportingPISPSteps = (_constConfig: ConstConfig, globalConfig: GlobalConfig, participant: DFSPParticipantWithPISPSupport): Array<SeedStep> => {
  return [
    {
      name: 'register endpoint `TP_CB_URL_ACCOUNTS_GET`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_ACCOUNTS_GET',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `FSPIOP_CALLBACK_URL_AUTHORIZATIONS`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'FSPIOP_CALLBACK_URL_AUTHORIZATIONS',
          value: `${participant.fspiopCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_TRANSACTION_REQUEST_POST`',
      // TODO: fix this - we shouldn't have to ignore failure here
      ignoreFailure: true,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_TRANSACTION_REQUEST_POST',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_TRANSACTION_REQUEST_AUTH_POST`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_TRANSACTION_REQUEST_AUTH_POST',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_CONSENT_REQUEST_POST`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_CONSENT_REQUEST_POST',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_CONSENT_REQUEST_PATCH`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_CONSENT_REQUEST_PATCH',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_CONSENT_PUT`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_CONSENT_PUT',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    // TODO: this is an auth service endpoint, it should be in it's own makeAuthService steps section
    {
      name: 'register endpoint `TP_CB_URL_CONSENT_POST`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_CONSENT_POST',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_CONSENT_PUT_ERROR`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_CONSENT_PUT_ERROR',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_TRANSACTION_REQUEST_POST`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_TRANSACTION_REQUEST_POST',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_TRANSACTION_REQUEST_PUT_ERROR`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_TRANSACTION_REQUEST_PUT_ERROR',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT_ERROR`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT_ERROR',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_TRANSACTION_REQUEST_VERIFY_POST`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_TRANSACTION_REQUEST_VERIFY_POST',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_TRANSACTION_REQUEST_VERIFY_PUT`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_TRANSACTION_REQUEST_VERIFY_PUT',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_TRANSACTION_REQUEST_VERIFY_PUT_ERROR`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_TRANSACTION_REQUEST_VERIFY_PUT_ERROR',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
  ]
}

const makePispSteps = (_constConfig: ConstConfig, globalConfig: GlobalConfig, participant: PISPParticipant): Array<SeedStep> => {
  return [
    {
      name: 'register endpoint `TP_CB_URL_TRANSACTION_REQUEST_PATCH`',
      // TODO: fix this - we shouldn't have to ignore failure here
      ignoreFailure: true,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_TRANSACTION_REQUEST_PATCH',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_TRANSACTION_REQUEST_POST`',
      // TODO: fix this - we shouldn't have to ignore failure here
      ignoreFailure: true,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_TRANSACTION_REQUEST_POST',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_TRANSACTION_REQUEST_AUTH_POST`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_TRANSACTION_REQUEST_AUTH_POST',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    // Note: this should be removed, once we move the authorizations forwarding to the 3p-api-adapter instead of tx-requests-service
    {
      name: 'register endpoint `FSPIOP_CALLBACK_URL_AUTHORIZATIONS`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'FSPIOP_CALLBACK_URL_AUTHORIZATIONS',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_ACCOUNTS_PUT`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_ACCOUNTS_PUT',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_ACCOUNTS_PUT_ERROR`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_ACCOUNTS_PUT_ERROR',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_CONSENT_REQUEST_PUT`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_CONSENT_REQUEST_PUT',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_CONSENT_REQUEST_PUT_ERROR`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_CONSENT_REQUEST_PUT_ERROR',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_CREATE_CREDENTIAL_POST`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_CREATE_CREDENTIAL_POST',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_CONSENT_POST`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_CONSENT_POST',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_CONSENT_GET`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_CONSENT_GET',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_CONSENT_PUT`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_CONSENT_PUT',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_CONSENT_PUT_ERROR`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_CONSENT_PUT_ERROR',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_SERVICES_PUT`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_SERVICES_PUT',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_SERVICES_PUT_ERROR`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_SERVICES_PUT_ERROR',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_CONSENT_PUT`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_CONSENT_PUT',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_CONSENT_PATCH`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_CONSENT_PATCH',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_ACCOUNTS_PUT_ERROR`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_ACCOUNTS_PUT_ERROR',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_TRANSACTION_REQUEST_POST`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_TRANSACTION_REQUEST_POST',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_TRANSACTION_REQUEST_PUT`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_TRANSACTION_REQUEST_PUT',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_TRANSACTION_REQUEST_PUT_ERROR`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_TRANSACTION_REQUEST_PUT_ERROR',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
    {
      name: 'register endpoint `TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT_ERROR`',
      ignoreFailure: false,
      command: wrapWithRunResult(() => Requests.postEndpoint(globalConfig.urls.centralLedgerAdmin, {
        participantId: participant.id,
        body: {
          type: 'TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT_ERROR',
          value: `${participant.thirdpartyCallbackUrl}`
        }
      }))
    },
  ]
}


function makeParticipantSteps(participant: Participant) {
  const constConfig: ConstConfig = {
    id: `participant_${participant.id}`,
    name: `Participant Steps - ${participant.id}`,
    description: `Sets up participant steps for ${participant.id}`,
    ignoreFailure: false,
  }

  const stepGenerator = (config: GlobalConfig) => {
    let steps = makeCommonSteps(constConfig, config, participant, config.currencies)

    switch (participant.type) {
      case ParticipantType.DFSP: {
        return steps.concat(makeDfspSteps(constConfig, config, participant, config.currencies))
      }
      case ParticipantType.DFSP_SUPPORTING_PISP: {
        return steps.concat(
          makeDfspSteps(constConfig, config, participant, config.currencies),
          makeDFSPSupportingPISPSteps(constConfig, config, participant)
        )
      }
      case ParticipantType.PISP: {
        return steps.concat(makePispSteps(constConfig, config, participant))
      }
    }
  }

  return (config: GlobalConfig) => new GenericSteps(constConfig, config, stepGenerator)
}

export default makeParticipantSteps
