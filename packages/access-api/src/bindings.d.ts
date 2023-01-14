import type { Logging } from '@web3-storage/worker-utils/logging'
import type { SpaceTable } from '@web3-storage/access/types'
import type { Handler as _Handler } from '@web3-storage/worker-utils/router'
import { Email } from './utils/email.js'
import { Spaces } from './models/spaces.js'
import { Validations } from './models/validations.js'
import { loadConfig } from './config.js'
import { Signer as EdSigner } from '@ucanto/principal/ed25519'

export {}

// CF Analytics Engine types not available yet
export interface AnalyticsEngine {
  writeDataPoint: (event: AnalyticsEngineEvent) => void
}

export interface AnalyticsEngineEvent {
  readonly doubles?: number[]
  readonly blobs?: Array<ArrayBuffer | string | null>
}

export interface Env {
  // vars
  ENV: string
  DEBUG: string
  /**
   * publicly advertised decentralized identifier of the running api service
   * * this may be used to filter incoming ucanto invocations
   */
  DID: string
  // URLs to upload-api so we proxy invocations to it
  UPLOAD_API_URL: string
  UPLOAD_API_URL_STAGING: string
  // secrets
  PRIVATE_KEY: string
  SENTRY_DSN: string
  POSTMARK_TOKEN: string
  LOGTAIL_TOKEN: string
  // bindings
  SPACES: KVNamespace
  VALIDATIONS: KVNamespace
  W3ACCESS_METRICS: AnalyticsEngine
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
    spaces: Spaces
    validations: Validations
  }
  uploadApi: {
    production?: URL
    staging?: URL
  }
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

export interface D1Schema {
  spaces: SpaceTable
}
