import type { Logging } from '@web3-storage/worker-utils/logging'
import type { Handler as _Handler } from '@web3-storage/worker-utils/router'
import { Spaces } from './models/spaces.js'
import { Validations } from './models/validations.js'
import { loadConfig } from './config.js'
import { ConnectionView, Signer as EdSigner } from '@ucanto/principal/ed25519'
import { Accounts } from './models/accounts.js'
import { DelegationsStorage as Delegations } from './types/delegations.js'
import { ProvisionsStorage } from './types/provisions.js'
import { R2Bucket } from '@miniflare/r2'

export {}

// CF Analytics Engine types not available yet
export interface AnalyticsEngine {
  writeDataPoint: (event: AnalyticsEngineEvent) => void
}

export interface AnalyticsEngineEvent {
  readonly doubles?: number[]
  readonly blobs?: Array<ArrayBuffer | string | null>
}

export interface Email {
  sendValidation: ({ to: string, url: string }) => Promise<void>
  send: ({ to: string, textBody: string, subject: string }) => Promise<void>
}

export interface Env {
  // vars
  ENV: string
  DEBUG: string
  /**
   * publicly advertised decentralized identifier of the running api service
   * * this may be used to filter incoming ucanto invocations
   */
  DID: `did:web:${string}`
  // URLs to upload-api so we proxy invocations to it
  UPLOAD_API_URL: string
  // secrets
  PRIVATE_KEY: string
  SENTRY_DSN: string
  POSTMARK_TOKEN: string
  POSTMARK_SENDER?: string
  /** CSV DIDs of services that can be used to provision spaces. */
  PROVIDERS?: string
  DEBUG_EMAIL?: string
  LOGTAIL_TOKEN: string
  // bindings
  SPACES: KVNamespace
  VALIDATIONS: KVNamespace
  W3ACCESS_METRICS: AnalyticsEngine
  /**
   * will be used for storing env.models.delegations CARs
   */
  DELEGATIONS_BUCKET: R2Bucket
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __D1_BETA__: D1Database
}

export interface RouteContext {
  log: Logging
  signer: EdSigner.Signer
  config: ReturnType<typeof loadConfig>
  url: URL
  email: Email
  models: {
    accounts: Accounts
    delegations: Delegations
    spaces: Spaces
    provisions: ProvisionsStorage
    validations: Validations
  }
  uploadApi: ConnectionView
}

export type Handler = _Handler<RouteContext>

export type Bindings = Record<
  string,
  | KVNamespace
  | DurableObjectNamespace
  | CryptoKey
  | string
  | D1Database
  | AnalyticsEngine
>
declare namespace ModuleWorker {
  type FetchHandler<Environment extends Bindings = Bindings> = (
    request: Request,
    env: Environment,
    ctx: Pick<FetchEvent, 'waitUntil' | 'passThroughOnException'>
  ) => Promise<Response> | Response

  type CronHandler<Environment extends Bindings = Bindings> = (
    event: Omit<ScheduledEvent, 'waitUntil'>,
    env: Environment,
    ctx: Pick<ScheduledEvent, 'waitUntil'>
  ) => Promise<void> | void
}

export interface ModuleWorker {
  fetch?: ModuleWorker.FetchHandler<Env>
  scheduled?: ModuleWorker.CronHandler<Env>
}

// D1 types

export interface D1ErrorRaw extends Error {
  cause: Error & { code: string }
}
