import { Signer } from '@ucanto/principal/ed25519'

/**
 * Loads configuration variables from the global environment and returns a JS object
 * keyed by variable names.
 *
 * @param {import("./bindings").Env} env
 */
export function loadConfig(env) {
  /** @type Record<string, string> */
  const vars = {}

  /** @type {Array<keyof env>} */
  const required = [
    'ENV',
    'DEBUG',
    'PRIVATE_KEY',
    'SENTRY_DSN',
    'POSTMARK_TOKEN',
    'LOGTAIL_TOKEN',
  ]

  for (const name of required) {
    const val = env[name]
    if (typeof val === 'string' && val.length > 0) {
      vars[name] = val
    } else {
      throw new Error(
        `Missing required config variables: ${name}. Check your .env, testing globals or cloudflare vars.`
      )
    }
  }

  return {
    DEBUG: boolValue(vars.DEBUG),
    ENV: parseRuntimeEnv(vars.ENV),

    PRIVATE_KEY: vars.PRIVATE_KEY,
    POSTMARK_TOKEN: vars.POSTMARK_TOKEN,
    SENTRY_DSN: vars.SENTRY_DSN,
    LOGTAIL_TOKEN: vars.LOGTAIL_TOKEN,

    // These are injected in esbuild
    // @ts-ignore
    // eslint-disable-next-line no-undef
    BRANCH: ACCOUNT_BRANCH,
    // @ts-ignore
    // eslint-disable-next-line no-undef
    VERSION: ACCOUNT_VERSION,
    // @ts-ignore
    // eslint-disable-next-line no-undef
    COMMITHASH: ACCOUNT_COMMITHASH,

    DID: env.DID,

    // bindings
    METRICS:
      /** @type {import("./bindings").AnalyticsEngine} */ (
        env.W3ACCESS_METRICS
      ) || createAnalyticsEngine(),
    SPACES: env.SPACES,
    VALIDATIONS: env.VALIDATIONS,
    DB: /** @type {D1Database} */ (env.__D1_BETA__),
  }
}

/**
 * Returns `true` if the string `s` is equal to `"true"` (case-insensitive) or `"1", and false for `"false"`, `"0"` or an empty value.
 *
 * @param {string} s
 * @returns {boolean}
 */
function boolValue(s) {
  return Boolean(s && JSON.parse(String(s).toLowerCase()))
}

/**
 * Validates that `s` is a defined runtime environment name and returns it.
 *
 * @param {unknown} s
 */
function parseRuntimeEnv(s) {
  switch (s) {
    case 'test':
    case 'dev':
    case 'staging':
    case 'production': {
      return s
    }
    default: {
      throw new Error('invalid runtime environment name: ' + s)
    }
  }
}

export function createAnalyticsEngine() {
  /** @type {Map<string,import("./bindings").AnalyticsEngineEvent>} */
  const store = new Map()

  return {
    writeDataPoint: (
      /** @type {import("./bindings").AnalyticsEngineEvent} */ event
    ) => {
      store.set(
        `${Date.now()}${(Math.random() + 1).toString(36).slice(7)}`,
        event
      )
    },
    _store: store,
  }
}

/**
 * Given a config, return a ucanto Signer object representing the service
 *
 * @param {object} config
 * @param {string} [config.DID] - public identifier of the running service. e.g. a did:key or a did:web
 * @param {string} config.PRIVATE_KEY - multiformats private key of primary signing key
 */
export function configureSigner(config) {
  const signer = Signer.parse(config.PRIVATE_KEY)
  if (config.DID) {
    if (!isDID(config.DID)) {
      throw new Error(`Invalid DID: ${config.DID}`)
    }
    return signer.withDID(config.DID)
  }
  return signer
}

/**
 * Return whether or not the provided object looks like a decentralized identifier (aka DID)
 *
 * @see https://www.w3.org/TR/did-core/#did-syntax
 * @param {any} object
 * @returns {object is `did:${string}:${string}`}
 */
function isDID(object) {
  if (typeof object !== 'string') return false
  const parts = object.split(':')
  if (parts.length <= 2) return false
  if (parts[0] !== 'did') return false
  return true
}
