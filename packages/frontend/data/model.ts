/* eslint-disable @typescript-eslint/no-unused-vars, no-console */
import { BigNumber } from '@ethersproject/bignumber'
import exp from 'constants'
import Moralis from 'moralis'
import { IBounty } from '../web3/contractService'

export interface IEtherEvent {
  transaction_index: number
  transaction_hash: string
  block_hash: string
  address: string
  //block_timestamp: string
  confirmed: boolean
  log_index: number
}

export interface IBountyFulfilled extends IEtherEvent {
  data: string
  approver: string
  fulfillmentId: string
  fulfillers: string[]
  bountyId: string
  transaction_hash: string
}

export interface IBountyIssued extends IEtherEvent {
  data: string
  bountyId: string
  creator: string
  approvers: string[]
  deadline: string
  token: string
  issuers: string[]
  tokenVersion: number //0 ETH , 20 ERC20
}

export interface IAccountMetadata {
  id: string,
  imageUrl: string,
  website: string,
  twitter: string,
  gnosis: string | null | undefined,
  email: string | null | undefined,
  urlname: string | null | undefined,
  discord: string,
  themeColor: string,
  description: string
  name : string
  account: string | null
  hideDrafts: boolean | null | undefined
}

export interface IFulfillmentAccepted extends IEtherEvent {
  tokenAmounts: string[]
  approver: string
  bountyId: string
  data: string
  fulfillmentId: string
}

export interface IBountyDrained extends IEtherEvent {
  amounts: BigNumber[]
  issuer: string
  bountyId: string
}

export interface IBountyApplication {
  objectId: string;
  bountyId: string;
  ipfsHash: string;
  email: string | null | undefined;
  applicant: string;
  date: string;
}

export interface IAcceptedApplication {
  applicationId: string;
  applicant: string;
}

class BountyApplication extends Moralis.Object {
  constructor() {
    super('BountyApplication')
  }
  public bountyId: string;
  public ipfsHash: string;
  email: string | null | undefined;
  public applicant: string;

  setKeyValue = (key, value) => {
    this[key] = value
    this.set(key, value)
  }

}
Moralis.Object.registerSubclass('BountyApplication', BountyApplication)

class BoardSubscription extends Moralis.Object {
  constructor() {
    super('BoardSubscription')
  }
  public boardId: string;
  public user: string;

  setKeyValue = (key, value) => {
    this[key] = value
    this.set(key, value)
  }

}

Moralis.Object.registerSubclass('BoardSubscription', BoardSubscription)

class BoardCollaborators extends Moralis.Object {
  constructor() {
    super('BoardCollaborators')
  }
  public board: string;
  public address: string;
  public isNFT: boolean;

  setKeyValue = (key, value) => {
    this[key] = value
    this.set(key, value)
  }
}

Moralis.Object.registerSubclass('BoardCollaborators', BoardCollaborators)

class SubmissionVote extends Moralis.Object {
  constructor() {
    super('SubmissionVote')
  }
  public bountyId: string;
  public submissionId: string;
  public user: string;

  setKeyValue = (key, value) => {
    this[key] = value
    this.set(key, value)
  }

}

Moralis.Object.registerSubclass('SubmissionVote', SubmissionVote)

class Bounty extends Moralis.Object  {
  public name: string
  public url: string
  public requiresApproval: boolean
  public requiresApplication: boolean
  public voting: boolean
  public publicSubmissions: boolean
  public acceptedApplications: IAcceptedApplication[]
  public externalFunding: boolean
  public showContributors: boolean
  public forAddresses: string[]
  public extId: string | null
  public fulfillTxId: string | null
  public drainTxId: string | null
  public issueTxId: string | null
  public data: string | null

  // public creator: Moralis.User;
  // public approver : Moralis.User;
  public deadline: number | undefined
  public applicationsDeadline: number | undefined
  public votingStart: number | undefined
  public votingEnd: number | undefined
  public votingNFT: string | undefined | null
  public numRewards: number | undefined

  // public fullfiller: Moralis.User | null;
  // public submitters : Moralis.User[];
  public description: string
  public bountyId: number | string
  public tokenSymbol: string
  public tokenVersion: number | undefined
  public creatorAddress: string
  public bountyCreatorAddress: string
  public workingUsers: number
  public tokenAddress: string
  public tokenAmount: number
  public tokenDecimals: number | undefined
  public gnosis: string | undefined
  public email: string | undefined
  public metadataUrl: string
  public tags: string[]
  public attachments: Moralis.File[]

  constructor() {
    super('Bounty')
  }
  setKeyValue = (key, value) => {
    this[key] = value
    this.set(key, value)
  }

  setProperties = (props) => {
    const keys = Object.keys(props)
    keys.forEach((key) => {
      this.set(key, props[key])
    })
  }
}

Moralis.Object.registerSubclass('Bounty', Bounty)


class AccountMetadata extends Moralis.Object  {
  imageUrl: string
  description: string
  name : string
  gnosis: string | null | undefined
  email: string | null | undefined
  urlname: string | null | undefined
  website: string
  twitter: string
  discord: string
  themeColor: string
  hideDrafts: boolean | null | undefined

  constructor() {
    super('AccountMetadata')
  }
  setKeyValue = (key, value) => {
    this[key] = value
    this.set(key, value)
  }

  setProperties = (props) => {
    const keys = Object.keys(props)
    keys.forEach((key) => {
      this.set(key, props[key])
    })
  }
}

Moralis.Object.registerSubclass('AccountMetadata', AccountMetadata)


class EtherEvent extends Moralis.Object implements IEtherEvent {
  public transaction_index: number
  public transaction_hash: string
  public block_hash: string
  public address: string
  public block_timestamp: Date
  public confirmed: boolean
  public log_index: number
}

class BountyIssued extends EtherEvent implements IBountyIssued {
  public data: string
  public bountyId: string
  public creator: string
  public approvers: string[]
  public deadline: string
  public token: string
  public issuers: string[]
  public tokenVersion: number //0 ETH , 20 ERC20
}



class BountyDrained extends EtherEvent implements IBountyDrained {
  public bountyId: string
  public issuer: string
  public amounts: BigNumber[] 
}

class BountyFulfilled extends Moralis.Object {
  constructor() {
    super('BountyFulfilled')
    this.transaction_index = 0
    this.transaction_hash = null
  }
  public transaction_index: number
  public transaction_hash: string
  public block_hash: string
  public address: string
  public block_timestamp: Date
  public confirmed: boolean
  public log_index: number
  public data: string
  public approver: string
  public fulfillmentId: string
  public fulfillers: string[]
  public bountyId: string
}
Moralis.Object.registerSubclass('BountyFulfilled', BountyFulfilled)

export interface IBountyMetaFulfilled {
  _id: string
  bountyId: string
  ipfsHash: string
  fulfiller: string
  email: string | null | undefined
  rejected: boolean
}

class BountyMetaFulfilled extends Moralis.Object {
  constructor() {
    super('BountyMetaFulfilled')
  }
  public _id: string;
  public bountyId: string;
  public ipfsHash: string;
  public fulfiller: string;
  public email: string | null | undefined;
  public rejected: boolean;

  setKeyValue = (key, value) => {
    this[key] = value
    this.set(key, value)
  }

}
Moralis.Object.registerSubclass('BountyMetaFulfilled', BountyMetaFulfilled)

export class FulfillmentAccepted extends EtherEvent implements IFulfillmentAccepted {
  public tokenAmounts: string[]
  public approver: string
  public bountyId: string
  public data: string
  public fulfillmentId: string
}


/**
 * Actions performed on submission
 */

class MeedUser extends Moralis.User {
  constructor(attributes) {
    super(attributes)
  }
}
Moralis.Object.registerSubclass('_User', MeedUser)

class ActionPerformed extends EtherEvent {
  public fulfiller: string
  public bountyId: string
  public data: string
  public fulfillmentId: string
}

class ExtendedBounty extends Bounty {
  public bountyIssued: BountyIssued[]
  public submissions: BountyFulfilled[]
  public fulfillments: FulfillmentAccepted[]
  public chainFullfillments: any[] | undefined
  public acceptedFullfillments: any[] | undefined
  public metasubmissions: BountyMetaFulfilled[]; 
  public actions: ActionPerformed[]
  public bountyDrained: BountyDrained[]
  public accountMetadata: any
  public objectId: string
  public approvers: string[]
  public isCompleted: boolean
  public constructor() {
    super()
    this.bountyIssued = []
    this.submissions = []
    this.metasubmissions = []
    this.actions = []
    this.fulfillments = []
    this.objectId = ''
  }
}


export { Bounty, BountyFulfilled, ExtendedBounty, BoardCollaborators, BountyMetaFulfilled, BountyApplication, BoardSubscription, AccountMetadata, SubmissionVote }
