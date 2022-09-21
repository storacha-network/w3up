import type { Logging } from '@web3-storage/worker-utils/logging'
import type { SigningAuthority } from '@ucanto/interface'
import type { config } from './config'
import { Email } from './utils/email.js'
import { Accounts } from './kvs/accounts.js'
import { Validations } from './kvs/validations.js'

export {}

// CF Analytics Engine types not available yet
export interface AnalyticsEngine {
  writeDataPoint: (event: AnalyticsEngineEvent) => void
}

export interface AnalyticsEngineEvent {
  readonly doubles?: number[]
  readonly blobs?: Array<ArrayBuffer | string | null>
}

declare global {
  const ACCOUNTS: KVNamespace
  const VALIDATIONS: KVNamespace
  const W3ACCESS_METRICS: AnalyticsEngine
}

export interface RouteContext {
  rooms: DurableObjectNamespace
  params: Record<string, string>
  log: Logging
  keypair: SigningAuthority
  config: typeof config
  url: URL
  event: FetchEvent
  email: Email
  kvs: {
    accounts: Accounts
    validations: Validations
  }
}

export type Handler = (
  event: FetchEvent,
  ctx: RouteContext
) => Promise<Response> | Response

declare namespace ModuleWorker {
  type Bindings = Record<
    string,
    KVNamespace | DurableObjectNamespace | CryptoKey | string
  >

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

export interface ModuleWorker<
  Environment extends ModuleWorker.Bindings = ModuleWorker.Bindings
> {
  fetch?: ModuleWorker.FetchHandler<Environment>
  scheduled?: ModuleWorker.CronHandler<Environment>
}
