import { GlobalConfig } from "./config";
import { BootstrapType, DFSPParticipant, ParticipantType, SeedCollection } from "./types";

import hubSteps from './steps/hubSteps'
import oracleSteps from './steps/oracleSteps'
import makeParticipantSteps from './steps/participantSteps'
import makePartySteps from './steps/partySteps'

function getCollections(bootstrapType: BootstrapType, config: GlobalConfig, fspid?: string): Array<SeedCollection> {

  let participants = config.participants
  if (fspid) {
    participants = config.participants.filter(p => p.id === fspid)
    if (participants.length === 0) {
      throw new Error(`getCollections: found no participants for fspid: ${fspid}`)
    }
  }

  if (bootstrapType === BootstrapType.ALL) {
    return [
      hubSteps(config),
      oracleSteps(config),
      ...participants.map(p => makeParticipantSteps(p)(config)),
      ...participants
        .filter(p => p.type === ParticipantType.DFSP || p.type === ParticipantType.DFSP_SUPPORTING_PISP)
        // we cast here because TS isn't smart enough to figure out the types after a filter
        .map(p => makePartySteps(p as unknown as DFSPParticipant)(config)),
    ]
  }

  switch (bootstrapType) {
    case BootstrapType.HUB: 
      return [
        hubSteps(config),
        oracleSteps(config),
      ]
    case BootstrapType.PARTICIPANTS:
      return [...participants.map(p => makeParticipantSteps(p)(config))]
    case BootstrapType.PARTIES:
      return [...participants
        .filter(p => p.type === ParticipantType.DFSP || p.type === ParticipantType.DFSP_SUPPORTING_PISP)
        // we cast here because TS isn't smart enough to figure out the types after a filter
        .map(p => makePartySteps(p as unknown as DFSPParticipant)(config)),

      ]
  }
}

export default getCollections