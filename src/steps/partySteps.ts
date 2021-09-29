import { TCurrency } from "@mojaloop/sdk-standard-components";
import { GlobalConfig } from "../config";
import Requests from '../requests';
import { DFSPParticipant, SeedStep } from '../types';
import { wrapWithRunResult } from '../utils';
import { ConstConfig, GenericSteps } from './genericSteps';


function makeStepsForParticipantAndParties(config: GlobalConfig, participant: DFSPParticipant, currencies: Array<TCurrency>): Array<SeedStep> {
  const steps: Array<SeedStep> = []

  currencies.forEach(currency => {
    // For Each currency, 

    participant.parties.forEach(party => {
      // For each party
      // 1. Register at the ALS
      // 2. Create an entry in the Simulator

      const participantsEndpoint = config.urls.fspiop || config.urls.alsEndpoint;
      if (!participantsEndpoint) {
        throw new Error('Endpoint for `/participants not defined. You must set either `urls.fspiop` or `urls.alsEndpoint')
      }

      steps.push({
        name: `register with ALS: ${party.idType}/${party.idValue}, currency: ${currency}`,
        ignoreFailure: false,
        command: wrapWithRunResult(() => Requests.postALSParticipant(participantsEndpoint, {
          headers: {
            'FSPIOP-Source': participant.id
          },
          idType: party.idType,
          idValueOrSubType: party.idValue,
          body: {
            fspId: participant.id,
            currency
          }
        }))
      })

      steps.push({
        name: `register with simulator ${party.idType}/${party.idValue}`,
        // Will fail if already exists - this will happen for subsequent requests
        // or if registering more than 1 currency
        ignoreFailure: true,
        command: wrapWithRunResult(() => Requests.postSimulatorParty(participant.simulatorAdminUrl, {
          body: {
            ...party
          }
        }))
      })
    })

  })

  return steps
}

function makePartySteps(participant: DFSPParticipant) {
  const constConfig: ConstConfig =  {
    id: `parties_for_participant_${participant.id}`,
    name: `Parties Steps - ${participant.id}`,
    description: `Sets up parties for ${participant.id}`,
    ignoreFailure: false,
  }
  const stepGenerator = (config: GlobalConfig) => makeStepsForParticipantAndParties(config, participant, config.currencies)

  return (config: GlobalConfig) => new GenericSteps(constConfig, config, stepGenerator)
}


export default makePartySteps
