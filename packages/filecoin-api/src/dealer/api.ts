import type { Signer, Link } from '@ucanto/interface'
import { PieceLink } from '@web3-storage/data-segment'
import {
  DealerService,
  DealTrackerService,
} from '@web3-storage/filecoin-client/types'
import {
  UpdatableStore,
  UpdatableAndQueryableStore,
  ServiceConfig,
} from '../types.js'

export type OfferStore<OfferDoc> = UpdatableStore<string, OfferDoc>
export type AggregateStore = UpdatableAndQueryableStore<
  AggregateRecordKey,
  AggregateRecord,
  Pick<AggregateRecord, 'status'>
>

export interface ServiceContext<OfferDoc = OfferDocument> {
  id: Signer
  /**
   * Stores serialized broker specific offer document containing details of the
   * aggregate and it's pieces.
   */
  offerStore: OfferStore<OfferDoc>
  /**
   * Stores aggregates and their deal proofs.
   */
  aggregateStore: AggregateStore
  /**
   * Deal tracker connection to find out available deals for an aggregate.
   */
  dealTrackerService: ServiceConfig<DealTrackerService>
}

export interface AggregateInsertEventContext
  extends Pick<ServiceContext, 'offerStore'> {}

export interface AggregateUpdatedStatusEventContext {
  /**
   * Dealer connection to offer aggregates for deals.
   */
  dealerService: ServiceConfig<DealerService>
}

export interface CronContext
  extends Pick<ServiceContext, 'aggregateStore' | 'dealTrackerService'> {}

export interface AggregateRecord {
  /**
   * Piece CID of an aggregate.
   */
  aggregate: PieceLink
  /**
   * List of pieces in an aggregate.
   */
  pieces: Link
  /**
   * Status of the offered aggregate piece.
   * - offered = acknowledged received for inclusion in filecoin deals.
   * - accepted = accepted and included a filecoin deal(s).
   * - invalid = not valid for storage.
   */
  status: 'offered' | 'accepted' | 'invalid'
  /**
   * Insertion date ISO string.
   */
  insertedAt: string
  /**
   * Update date ISO string.
   */
  updatedAt: string
}

export interface AggregateRecordKey {
  /**
   * Piece CID of an aggregate.
   */
  aggregate: PieceLink
}

export interface OfferDocument {
  /**
   * Key of the offer document
   */
  key: string
  /**
   * Value of the offer document
   */
  value: OfferValue
}

export interface OfferValue {
  /**
   * Issuer of the aggregate offer.
   */
  issuer: `did:${string}:${string}`
  /**
   * Piece CID of an aggregate.
   */
  aggregate: PieceLink
  /**
   * Pieces part of the aggregate
   */
  pieces: PieceLink[]
}
