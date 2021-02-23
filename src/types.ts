import SDKStandardComponents from '@mojaloop/sdk-standard-components';
import { RunResult } from './runResult';

export interface SeedStep {
  name: string,
  ignoreFailure: boolean,
  command: () => Promise<RunResult>
}

export interface SeedCollection {
  id: string,
  name: string,
  description?: string,
  steps: Array<SeedStep>
  ignoreFailure: boolean
  run: () => Promise<RunResult>
}

export enum ParticipantType {
  DFSP = 'DFSP',
  DFSP_SUPPORTING_PISP = 'DFSP_SUPPORTING_PISP',
  PISP = 'PISP'
}

export interface PartyAccount {
  currency: SDKStandardComponents.TCurrency,
  description: string,
  address: string,
}
export interface Party {
  idType: string,
  idValue: string,
  displayName: string,
  firstName: string,
  middleName?: string,
  lastName: string,
  dateOfBirth: string,
  accounts?: Array<PartyAccount>
}

export interface Oracle {
  oracleIdType: string,
  endpoint: string,
}

export type Participant = DFSPParticipant | DFSPParticipantWithPISPSupport | PISPParticipant
export interface DFSPParticipant {
  id: string,
  type: ParticipantType.DFSP
  settlementAccountId: string
  simulatorAdminUrl: string,
  fspiopCallbackUrl: string,
  parties: Array<Party>
}
export interface DFSPParticipantWithPISPSupport {
  id: string,
  type: ParticipantType.DFSP_SUPPORTING_PISP
  settlementAccountId: string
  simulatorAdminUrl: string,
  fspiopCallbackUrl: string,
  thirdpartyCallbackUrl: string,
  parties: Array<Party>
}

export interface PISPParticipant {
  id: string,
  type: ParticipantType.PISP
  fspiopCallbackUrl: string,
  thirdpartyCallbackUrl: string
}

export enum BootstrapType {
  ALL = 'ALL',
  HUB = 'HUB',
  PARTICIPANTS = 'PARTICIPANTS',
  PARTIES = 'PARTIES',
}