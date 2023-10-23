import type { TupleToUnion } from 'type-fest'
import * as Ucanto from '@ucanto/interface'
import type { Schema } from '@ucanto/core'
import {
  InferInvokedCapability,
  Unit,
  DID,
  DIDKey,
  ToString,
  Link,
  UnknownLink,
} from '@ucanto/interface'
import { CAR } from '@ucanto/transport'
import {
  Phantom,
  PieceLink,
  ProofData,
  uint64,
} from '@web3-storage/data-segment'
import { space, info } from './space.js'
import * as provider from './provider.js'
import { top } from './top.js'
import * as StoreCaps from './store.js'
import * as UploadCaps from './upload.js'
import * as AccessCaps from './access.js'
import * as CustomerCaps from './customer.js'
import * as ConsumerCaps from './consumer.js'
import * as SubscriptionCaps from './subscription.js'
import * as RateLimitCaps from './rate-limit.js'
import * as StorefrontCaps from './filecoin/storefront.js'
import * as AggregatorCaps from './filecoin/aggregator.js'
import * as DealTrackerCaps from './filecoin/deal-tracker.js'
import * as DealerCaps from './filecoin/dealer.js'
import * as AdminCaps from './admin.js'
import * as UCANCaps from './ucan.js'

export type { Unit, PieceLink }

/**
 * An IPLD Link that has the CAR codec code.
 */
export type CARLink = Link<unknown, typeof CAR.codec.code>

export type AccountDID = DID<'mailto'>
export type SpaceDID = DID<'key'>

/**
 * failure due to a resource not having enough storage capacity.
 */
export interface InsufficientStorage {
  name: 'InsufficientStorage'
  message: string
}

export interface UnknownProvider extends Ucanto.Failure {
  name: 'UnknownProvider'
  did: DID
}

/**
 * @see https://github.com/filecoin-project/FIPs/pull/758/files
 */
export type PieceLinkSchema = Schema.Schema<PieceLink>

// Access
export type Access = InferInvokedCapability<typeof AccessCaps.access>
export type AccessAuthorize = InferInvokedCapability<
  typeof AccessCaps.authorize
>

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type AccessAuthorizeSuccess = Unit
export type AccessClaim = InferInvokedCapability<typeof AccessCaps.claim>
export interface AccessClaimSuccess {
  delegations: Record<string, Ucanto.ByteView<Ucanto.Delegation>>
}
export interface AccessClaimFailure extends Ucanto.Failure {
  name: 'AccessClaimFailure'
  message: string
}

export interface AccessConfirmSuccess {
  delegations: Record<string, Ucanto.ByteView<Ucanto.Delegation>>
}
export interface AccessConfirmFailure extends Ucanto.Failure {}

export type AccessDelegate = InferInvokedCapability<typeof AccessCaps.delegate>
export type AccessDelegateSuccess = Unit
export type AccessDelegateFailure = InsufficientStorage | DelegationNotFound

export interface DelegationNotFound extends Ucanto.Failure {
  name: 'DelegationNotFound'
}

export type AccessSession = InferInvokedCapability<typeof AccessCaps.session>
export type AccessConfirm = InferInvokedCapability<typeof AccessCaps.confirm>

// Provider
export type ProviderAdd = InferInvokedCapability<typeof provider.add>
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ProviderAddSuccess {}
export type ProviderAddFailure = InvalidProvider | Ucanto.Failure
export type ProviderDID = DID<'web'>

export interface InvalidProvider extends Ucanto.Failure {
  name: 'InvalidProvider'
}

// Customer
export type CustomerGet = InferInvokedCapability<typeof CustomerCaps.get>
export interface CustomerGetSuccess {
  did: AccountDID
  subscriptions: string[]
}
export interface CustomerNotFound extends Ucanto.Failure {
  name: 'CustomerNotFound'
}
export type CustomerGetFailure = CustomerNotFound | Ucanto.Failure

// Consumer
export type ConsumerHas = InferInvokedCapability<typeof ConsumerCaps.has>
export type ConsumerHasSuccess = boolean
export type ConsumerHasFailure = Ucanto.Failure
export type ConsumerGet = InferInvokedCapability<typeof ConsumerCaps.get>
export interface ConsumerGetSuccess {
  did: DIDKey
  allocated: number
  limit: number
  subscription: string
}
export interface ConsumerNotFound extends Ucanto.Failure {
  name: 'ConsumerNotFound'
}
export type ConsumerGetFailure = ConsumerNotFound | Ucanto.Failure

// Subscription
export type SubscriptionGet = InferInvokedCapability<
  typeof SubscriptionCaps.get
>
export interface SubscriptionGetSuccess {
  customer: AccountDID
  consumer?: DIDKey
}
export interface SubscriptionNotFound extends Ucanto.Failure {
  name: 'SubscriptionNotFound'
}
export type SubscriptionGetFailure =
  | SubscriptionNotFound
  | UnknownProvider
  | Ucanto.Failure

// Rate Limit
export type RateLimitAdd = InferInvokedCapability<typeof RateLimitCaps.add>
export interface RateLimitAddSuccess {
  id: string
}
export type RateLimitAddFailure = Ucanto.Failure

export type RateLimitRemove = InferInvokedCapability<
  typeof RateLimitCaps.remove
>
export type RateLimitRemoveSuccess = Unit

export interface RateLimitsNotFound extends Ucanto.Failure {
  name: 'RateLimitsNotFound'
}
export type RateLimitRemoveFailure = RateLimitsNotFound | Ucanto.Failure

export type RateLimitList = InferInvokedCapability<typeof RateLimitCaps.list>
export interface RateLimitSubject {
  id: string
  rate: number
}
export interface RateLimitListSuccess {
  limits: RateLimitSubject[]
}
export type RateLimitListFailure = Ucanto.Failure

// Space
export type Space = InferInvokedCapability<typeof space>
export type SpaceInfo = InferInvokedCapability<typeof info>

// filecoin
export interface DealMetadata {
  dataType: uint64
  dataSource: SingletonMarketSource
}
/** @see https://github.com/filecoin-project/go-data-segment/blob/e3257b64fa2c84e0df95df35de409cfed7a38438/datasegment/verifier.go#L8-L14 */
export interface DataAggregationProof {
  /**
   * Proof the piece is included in the aggregate.
   */
  inclusion: InclusionProof
  /**
   * Filecoin deal metadata.
   */
  aux: DealMetadata
}
/** @see https://github.com/filecoin-project/go-data-segment/blob/e3257b64fa2c84e0df95df35de409cfed7a38438/datasegment/inclusion.go#L30-L39 */
export interface InclusionProof {
  /**
   * Proof of inclusion of the client's data segment in the data aggregator's
   * Merkle tree (includes position information). i.e. a proof that the root
   * node of the subtree containing all the nodes (leafs) of a data segment is
   * contained in CommDA.
   */
  subtree: ProofData
  /**
   * Proof that an entry for the user's data is contained in the index of the
   * aggregator's deal. i.e. a proof that the data segment index constructed
   * from the root of the user's data segment subtree is contained in the index
   * of the deal tree.
   */
  index: ProofData
}
export interface SingletonMarketSource {
  dealID: uint64
}

export interface FilecoinOfferSuccess {
  /**
   * Commitment proof for piece.
   */
  piece: PieceLink
}
export type FilecoinOfferFailure = ContentNotFound | Ucanto.Failure

export interface ContentNotFound extends Ucanto.Failure {
  name: 'ContentNotFound'
  content: Link
}

export interface FilecoinSubmitSuccess {
  /**
   * Commitment proof for piece.
   */
  piece: PieceLink
}

export type FilecoinSubmitFailure = InvalidPieceCID | Ucanto.Failure

export interface FilecoinAcceptSuccess extends DataAggregationProof {
  aggregate: PieceLink
  piece: PieceLink
}

export type FilecoinAcceptFailure =
  | InvalidContentPiece
  | ProofNotFound
  | Ucanto.Failure

export interface InvalidContentPiece extends Ucanto.Failure {
  name: 'InvalidContentPiece'
  content: PieceLink
}

export interface ProofNotFound extends Ucanto.Failure {
  name: 'ProofNotFound'
}

// filecoin aggregator
export interface PieceOfferSuccess {
  /**
   * Commitment proof for piece.
   */
  piece: PieceLink
}
export type PieceOfferFailure = Ucanto.Failure

export interface PieceAcceptSuccess {
  /**
   * Commitment proof for piece.
   */
  piece: PieceLink
  /**
   * Commitment proof for aggregate.
   */
  aggregate: PieceLink
  /**
   * Proof the piece is included in the aggregate.
   */
  inclusion: InclusionProof
}
export type PieceAcceptFailure = Ucanto.Failure

// filecoin dealer
export interface AggregateOfferSuccess {
  /**
   * Commitment proof for aggregate.
   */
  aggregate: PieceLink
}
export type AggregateOfferFailure = Ucanto.Failure

export interface AggregateAcceptSuccess extends DealMetadata {
  aggregate: PieceLink
}
export type AggregateAcceptFailure = InvalidPiece | Ucanto.Failure

export interface InvalidPiece extends Ucanto.Failure {
  name: 'InvalidPiece'
  /**
   * Commitment proof for aggregate.
   */
  aggregate: PieceLink
  cause: InvalidPieceCID[]
}

export interface InvalidPieceCID extends Ucanto.Failure {
  name: 'InvalidPieceCID'
  piece: PieceLink
}

// filecoin deal tracker
export interface DealInfoSuccess {
  deals: Record<string & Phantom<uint64>, DealDetails>
}

export interface DealDetails {
  provider: FilecoinAddress
  // TODO: start/end epoch? etc.
}

export type FilecoinAddress = string

export type DealInfoFailure = DealNotFound | Ucanto.Failure

export interface DealNotFound extends Ucanto.Failure {
  name: 'DealNotFound'
}

// Upload
export type Upload = InferInvokedCapability<typeof UploadCaps.upload>
export type UploadAdd = InferInvokedCapability<typeof UploadCaps.add>
export type UploadGet = InferInvokedCapability<typeof UploadCaps.get>
export type UploadRemove = InferInvokedCapability<typeof UploadCaps.remove>
export type UploadList = InferInvokedCapability<typeof UploadCaps.list>

export interface UploadNotFound extends Ucanto.Failure {
  name: 'UploadNotFound'
}

export type UploadGetFailure = UploadNotFound | Ucanto.Failure

// Store
export type Store = InferInvokedCapability<typeof StoreCaps.store>
export type StoreAdd = InferInvokedCapability<typeof StoreCaps.add>
export type StoreGet = InferInvokedCapability<typeof StoreCaps.get>
export type StoreRemove = InferInvokedCapability<typeof StoreCaps.remove>
export type StoreList = InferInvokedCapability<typeof StoreCaps.list>

export type StoreAddSuccess = StoreAddSuccessDone | StoreAddSuccessUpload
export interface StoreAddSuccessDone {
  status: 'done'
  with: DID
  link: UnknownLink
  url?: undefined
  headers?: undefined
}

export interface StoreAddSuccessUpload {
  status: 'upload'
  with: DID
  link: UnknownLink
  url: ToString<URL>
  headers: Record<string, string>
}

export interface StoreRemoveSuccess {
  size: number
}

export interface StoreItemNotFound extends Ucanto.Failure {
  name: 'StoreItemNotFound'
}

export type StoreRemoveFailure = StoreItemNotFound | Ucanto.Failure

export type StoreGetSuccess = StoreListItem

export type StoreGetFailure = StoreItemNotFound | Ucanto.Failure

export interface StoreListSuccess extends ListResponse<StoreListItem> {}

export interface ListResponse<R> {
  cursor?: string
  before?: string
  after?: string
  size: number
  results: R[]
}

export interface StoreListItem {
  link: UnknownLink
  size: number
  origin?: UnknownLink
  insertedAt: string
}

export interface UploadListItem {
  root: UnknownLink
  shards?: CARLink[]
  insertedAt: string
  updatedAt: string
}

// TODO: (olizilla) make this an UploadListItem too?
export type UploadAddSuccess = Omit<UploadListItem, 'insertedAt' | 'updatedAt'>

export type UploadGetSuccess = UploadListItem

export type UploadRemoveSuccess = UploadDidRemove | UploadDidNotRemove

export interface UploadDidRemove extends UploadAddSuccess {}

export interface UploadDidNotRemove {
  root?: undefined
  shards?: undefined
}

export interface UploadListSuccess extends ListResponse<UploadListItem> {}

// UCAN core events

export type UCANRevoke = InferInvokedCapability<typeof UCANCaps.revoke>

export interface Timestamp {
  /**
   * Unix timestamp in seconds.
   */
  time: number
}

export type UCANRevokeSuccess = Timestamp

/**
 * Error is raised when `UCAN` being revoked is not supplied or it's proof chain
 * leading to supplied `scope` is not supplied.
 */
export interface UCANNotFound extends Ucanto.Failure {
  name: 'UCANNotFound'
}

/**
 * Error is raised when `UCAN` being revoked does not have provided `scope` in
 * the proof chain.
 */
export interface InvalidRevocationScope extends Ucanto.Failure {
  name: 'InvalidRevocationScope'
}

/**
 * Error is raised when `UCAN` revocation is issued by unauthorized principal,
 * that is `with` field is not an `iss` of the `scope`.
 */
export interface UnauthorizedRevocation extends Ucanto.Failure {
  name: 'UnauthorizedRevocation'
}

/**
 * Error is raised when `UCAN` revocation cannot be stored. This
 * is usually not a client error.
 */
export interface RevocationsStoreFailure extends Ucanto.Failure {
  name: 'RevocationsStoreFailure'
}

export type UCANRevokeFailure =
  | UCANNotFound
  | InvalidRevocationScope
  | UnauthorizedRevocation
  | RevocationsStoreFailure

// Admin
export type Admin = InferInvokedCapability<typeof AdminCaps.admin>
export type AdminUploadInspect = InferInvokedCapability<
  typeof AdminCaps.upload.inspect
>
export type AdminStoreInspect = InferInvokedCapability<
  typeof AdminCaps.store.inspect
>
export interface SpaceAdmin {
  did: DID
  insertedAt: string
}
export interface AdminUploadInspectSuccess {
  spaces: SpaceAdmin[]
}
export type AdminUploadInspectFailure = Ucanto.Failure
export interface AdminStoreInspectSuccess {
  spaces: SpaceAdmin[]
}
export type AdminStoreInspectFailure = Ucanto.Failure
// Filecoin
export type FilecoinOffer = InferInvokedCapability<
  typeof StorefrontCaps.filecoinOffer
>
export type FilecoinSubmit = InferInvokedCapability<
  typeof StorefrontCaps.filecoinSubmit
>
export type FilecoinAccept = InferInvokedCapability<
  typeof StorefrontCaps.filecoinAccept
>
export type PieceOffer = InferInvokedCapability<
  typeof AggregatorCaps.pieceOffer
>
export type PieceAccept = InferInvokedCapability<
  typeof AggregatorCaps.pieceAccept
>
export type AggregateOffer = InferInvokedCapability<
  typeof DealerCaps.aggregateOffer
>
export type AggregateAccept = InferInvokedCapability<
  typeof DealerCaps.aggregateAccept
>
export type DealInfo = InferInvokedCapability<typeof DealTrackerCaps.dealInfo>
// Top
export type Top = InferInvokedCapability<typeof top>

export type Abilities = TupleToUnion<AbilitiesArray>

export type AbilitiesArray = [
  Top['can'],
  ProviderAdd['can'],
  Space['can'],
  SpaceInfo['can'],
  Upload['can'],
  UploadAdd['can'],
  UploadGet['can'],
  UploadRemove['can'],
  UploadList['can'],
  Store['can'],
  StoreAdd['can'],
  StoreGet['can'],
  StoreRemove['can'],
  StoreList['can'],
  Access['can'],
  AccessAuthorize['can'],
  AccessSession['can'],
  CustomerGet['can'],
  ConsumerHas['can'],
  ConsumerGet['can'],
  SubscriptionGet['can'],
  RateLimitAdd['can'],
  RateLimitRemove['can'],
  RateLimitList['can'],
  FilecoinOffer['can'],
  FilecoinSubmit['can'],
  FilecoinAccept['can'],
  PieceOffer['can'],
  PieceAccept['can'],
  AggregateOffer['can'],
  AggregateAccept['can'],
  DealInfo['can'],
  Admin['can'],
  AdminUploadInspect['can'],
  AdminStoreInspect['can']
]
