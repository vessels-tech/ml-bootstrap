import { GlobalConfig } from "./config";
import { BootstrapType, DFSPParticipant, ParticipantType, SeedCollection } from "./types";

import hubSteps from './steps/hubSteps'
import oracleSteps from './steps/oracleSteps'
import makeParticipantSteps from './steps/participantSteps'
import makePartySteps from './steps/partySteps'

function getCollections(bootstrapType: BootstrapType, config: GlobalConfig): Array<SeedCollection> {

  if (bootstrapType === BootstrapType.ALL) {
    return [
      hubSteps(config),
      oracleSteps(config),
      ...config.participants.map(p => makeParticipantSteps(p)(config)),
      ...config.participants
        .filter(p => p.type === ParticipantType.DFSP)
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
      return [...config.participants.map(p => makeParticipantSteps(p)(config))]
    case BootstrapType.PARTIES:
      return [...config.participants
        .filter(p => p.type === ParticipantType.DFSP)
        // we cast here because TS isn't smart enough to figure out the types after a filter
        .map(p => makePartySteps(p as unknown as DFSPParticipant)(config)),

      ]
  }
}

export default getCollections