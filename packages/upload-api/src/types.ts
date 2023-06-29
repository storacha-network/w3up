import type {
  Failure,
  Invocation,
  ServiceMethod,
  UCANLink,
  HandlerExecutionError,
  Signer,
  DID,
  DIDKey,
  InboundCodec,
  Result,
  Unit,
  CapabilityParser,
  Match,
  ParsedCapability,
  InferInvokedCapability,
} from '@ucanto/interface'
import type { ProviderInput, ConnectionView } from '@ucanto/server'

import { Signer as EdSigner } from '@ucanto/principal/ed25519'
import { ToString, UnknownLink } from 'multiformats'
import { DelegationsStorage as Delegations } from './types/delegations'
import { ProvisionsStorage as Provisions } from './types/provisions'

export type ValidationEmailSend = {
  to: string
  url: string
}

export type SpaceDID = DIDKey
export type AccountDID = DID<'mailto'>
export type ServiceDID = DID<'web'>
export type ServiceSigner = Signer<ServiceDID>
export interface SpaceProviderRegistry {
  hasStorageProvider(space: SpaceDID): Promise<Result<boolean, never>>
}

export interface InsufficientStorage extends Failure {
  name: 'InsufficientStorage'
}

export type AllocationError = InsufficientStorage

export interface Email {
  sendValidation: (input: { to: string; url: string }) => Promise<void>
}

export interface DebugEmail extends Email {
  emails: Array<ValidationEmailSend>
  take: () => Promise<ValidationEmailSend>
}

import {
  StoreAdd,
  StoreRemove,
  StoreList,
  UploadAdd,
  UploadRemove,
  UploadList,
  AccessAuthorize,
  AccessAuthorizeSuccess,
  AccessDelegate,
  AccessDelegateFailure,
  AccessDelegateSuccess,
  AccessClaim,
  AccessClaimSuccess,
  AccessClaimFailure,
  AccessConfirm,
  AccessConfirmSuccess,
  AccessConfirmFailure,
  ProviderAdd,
  ProviderAddSuccess,
  ProviderAddFailure,
  SpaceInfo,
} from '@web3-storage/capabilities/types'
import * as Capabilities from '@web3-storage/capabilities'

export * from '@web3-storage/capabilities/types'
export * from '@ucanto/interface'

export type { ProvisionsStorage, Provision } from './types/provisions'
export type {
  DelegationsStorage,
  Query as DelegationsStorageQuery,
} from './types/delegations'

export interface Service {
  store: {
    add: ServiceMethod<StoreAdd, StoreAddOk, Failure>
    remove: ServiceMethod<StoreRemove, Unit, Failure>
    list: ServiceMethod<StoreList, StoreListOk, Failure>
  }
  upload: {
    add: ServiceMethod<UploadAdd, UploadAddOk, Failure>
    remove: ServiceMethod<UploadRemove, UploadRemoveOk, Failure>
    list: ServiceMethod<UploadList, UploadListOk, Failure>
  }
  console: {
    log: ServiceMethod<
      InferInvokedCapability<typeof Capabilities.Console.log>,
      {},
      never
    >
    error: ServiceMethod<
      InferInvokedCapability<typeof Capabilities.Console.error>,
      never,
      Failure & { cause: unknown }
    >
  }
  access: {
    authorize: ServiceMethod<AccessAuthorize, AccessAuthorizeSuccess, Failure>
    claim: ServiceMethod<AccessClaim, AccessClaimSuccess, AccessClaimFailure>
    confirm: ServiceMethod<
      AccessConfirm,
      AccessConfirmSuccess,
      AccessConfirmFailure
    >
    delegate: ServiceMethod<
      AccessDelegate,
      AccessDelegateSuccess,
      AccessDelegateFailure
    >
  }
  consumer: {
    has: ServiceMethod<
      InferInvokedCapability<typeof Capabilities.Consumer.has>,
      boolean,
      Failure
    >
  }
  customer: {
    get: ServiceMethod<
      InferInvokedCapability<typeof Capabilities.Customer.get>,
      CustomerGetOk,
      CustomerGetError
    >
  }
  provider: {
    add: ServiceMethod<ProviderAdd, ProviderAddSuccess, ProviderAddFailure>
  }
  space: {
    info: ServiceMethod<SpaceInfo, SpaceInfoResult, Failure | SpaceUnknown>
  }
}

export interface StoreServiceContext {
  maxUploadSize: number

  storeTable: StoreTable
  carStoreBucket: CarStoreBucket
  access: AccessVerifier
}

export interface UploadServiceContext {
  uploadTable: UploadTable
  dudewhereBucket: DudewhereBucket
  access: AccessVerifier
}

export interface AccessClaimContext {
  delegationsStorage: Delegations
}

export type AccessServiceContext = AccessClaimContext & {
  signer: EdSigner.Signer
  email: Email
  url: URL
  provisionsStorage: Provisions
}

export interface ConsumerServiceContext {
  signer: EdSigner.Signer
  provisionsStorage: Provisions
}

export interface CustomerServiceContext {
  signer: EdSigner.Signer
  provisionsStorage: Provisions
}

export interface ConsoleServiceContext {}

export interface SpaceServiceContext {
  provisionsStorage: Provisions
  delegationsStorage: Delegations
}

export interface ProviderServiceContext {
  provisionsStorage: Provisions
}

export interface ServiceContext
  extends AccessServiceContext,
    ConsoleServiceContext,
    ConsumerServiceContext,
    CustomerServiceContext,
    ProviderServiceContext,
    SpaceServiceContext,
    StoreServiceContext,
    UploadServiceContext {}

export interface UcantoServerContext extends ServiceContext {
  id: Signer
  codec?: InboundCodec
  errorReporter: ErrorReporter
}

export interface UcantoServerTestContext
  extends UcantoServerContext,
    StoreTestContext,
    UploadTestContext {
  connection: ConnectionView<Service>
  mail: DebugEmail
  service: Signer<ServiceDID>
  fetch: typeof fetch
}

export interface StoreTestContext {
  testStoreTable: TestStoreTable
  testSpaceRegistry: TestSpaceRegistry
}

export interface UploadTestContext {}

export interface ErrorReporter {
  catch: (error: HandlerExecutionError) => void
}

export interface CarStoreBucket {
  has: (link: UnknownLink) => Promise<boolean>
  createUploadUrl: (
    link: UnknownLink,
    size: number
  ) => Promise<{
    url: URL
    headers: {
      'x-amz-checksum-sha256': string
      'content-length': string
    } & Record<string, string>
  }>
}

export interface CarStoreBucketOptions {
  accessKeyId?: string
  secretAccessKey?: string
  region?: string
  bucket?: string
  sessionToken?: string
  expires?: number
}

export interface CarStoreBucketService {
  use(options?: CarStoreBucketOptions): Promise<CarStoreBucket>
}

export interface DudewhereBucket {
  put: (dataCid: string, carCid: string) => Promise<void>
}

export interface StoreTable {
  exists: (space: DID, link: UnknownLink) => Promise<boolean>
  insert: (item: StoreAddInput) => Promise<StoreAddOutput>
  remove: (space: DID, link: UnknownLink) => Promise<void>
  list: (
    space: DID,
    options?: ListOptions
  ) => Promise<ListResponse<StoreListItem>>
}

export interface TestStoreTable {
  get(
    space: DID,
    link: UnknownLink
  ): Promise<(StoreAddInput & StoreListItem) | undefined>
}

export interface UploadTable {
  exists: (space: DID, root: UnknownLink) => Promise<boolean>
  insert: (item: UploadAddInput) => Promise<UploadAddOk>
  remove: (space: DID, root: UnknownLink) => Promise<UploadRemoveOk | null>
  list: (
    space: DID,
    options?: ListOptions
  ) => Promise<ListResponse<UploadListItem>>
}

export type SpaceInfoResult = {
  did: SpaceDID
}

export interface UnknownProvider extends Failure {
  name: 'UnknownProvider'
}

export type CustomerGetError = UnknownProvider

export interface CustomerGetOk {
  customer: null | {
    did: AccountDID
  }
}

export type CustomerGetResult = Result<CustomerGetOk, CustomerGetError>

export interface StoreAddInput {
  space: DID
  link: UnknownLink
  size: number
  origin?: UnknownLink
  issuer: DID
  invocation: UCANLink
}

export interface StoreAddOutput
  extends Omit<StoreAddInput, 'space' | 'issuer' | 'invocation'> {}

export interface StoreListItem extends StoreAddOutput {
  insertedAt: string
}

export interface StoreListOk extends ListResponse<StoreListItem> {}

export type StoreAddOk = StoreAddDone | StoreAddUpload

export interface StoreAddDone {
  status: 'done'
  with: DID
  link: UnknownLink
  url?: undefined
  headers?: undefined
}

export interface StoreAddUpload {
  status: 'upload'
  with: DID
  link: UnknownLink
  url: URL
  headers: Record<string, string>
}

export interface UploadAddInput {
  space: DID
  root: UnknownLink
  shards?: UnknownLink[]
  issuer: DID
  invocation: UCANLink
}

export interface UploadAddOk
  extends Omit<UploadAddInput, 'space' | 'issuer' | 'invocation'> {}
export type UploadRemoveOk = UploadDIDRemove | UploadDidNotRemove

export interface UploadDIDRemove extends UploadAddOk {}
export interface UploadDidNotRemove {
  root?: undefined
  shards?: undefined
}

export interface UploadListItem extends UploadAddOk {
  insertedAt: string
  updatedAt: string
}

export interface UploadListOk extends ListResponse<UploadListItem> {}

export interface ListOptions {
  size?: number
  cursor?: string
  pre?: boolean
}

export interface ListResponse<R> {
  // cursor and after should be identical
  cursor?: string
  before?: string
  after?: string
  size: number
  results: R[]
}

export interface AccessVerifier {
  /**
   * Determines if the issuer of the invocation has received a delegation
   * allowing them to issue the passed invocation.
   */
  allocateSpace: (
    invocation: Invocation
  ) => Promise<Result<AllocateOk, Failure>>
}

interface AllocateOk {}

export interface TestSpaceRegistry {
  /**
   * Registers space with the registry.
   */
  registerSpace: (space: DID) => Promise<void>
}

export interface LinkJSON<T extends UnknownLink = UnknownLink> {
  '/': ToString<T>
}
export interface SpaceUnknown extends Failure {
  name: 'SpaceUnknown'
}

export type Input<C extends CapabilityParser<Match<ParsedCapability>>> =
  ProviderInput<InferInvokedCapability<C> & ParsedCapability>

export interface Assert {
  equal: <Actual, Expected extends Actual>(
    actual: Actual,
    expected: Expected,
    message?: string
  ) => unknown
  deepEqual: <Actual, Expected extends Actual>(
    actual: Actual,
    expected: Expected,
    message?: string
  ) => unknown
  ok: <Actual>(actual: Actual, message?: string) => unknown
}

export type Test = (assert: Assert, context: UcantoServerTestContext) => unknown
export type Tests = Record<string, Test>
