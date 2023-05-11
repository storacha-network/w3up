/* eslint-disable unicorn/prefer-number-properties */
import * as Types from '../../src/types.js'
import { ed25519 } from '@ucanto/principal'
import * as Server from '@ucanto/server'
import * as Client from '@ucanto/client'
import * as CAR from '@ucanto/transport/car'
import * as Context from './context.js'
import { Access, Provider } from '@web3-storage/capabilities'
// eslint-disable-next-line unicorn/prefer-export-from
export { Context }

/**
 * Return whether the provided stack trace string appears to be generated
 * by a deployed upload-api.
 * Heuristics:
 * * stack trace files paths will start with `file:///var/task/upload-api` because of how the lambda environment is working
 *
 * @param {string} stack
 */
export function isUploadApiStack(stack) {
  return stack.includes('file:///var/task/upload-api')
}

/**
 * @typedef {import('../../src/utils/email').ValidationEmailSend} ValidationEmailSend
 * @typedef {import('../../src/utils/email').EmailSend} EmailSend
 * @typedef {import('../../src/utils/email').Email} Email
 */

/**
 * create an Email that is useful for testing
 *
 * @param {Pick<Array<ValidationEmailSend | EmailSend>, 'push'>} storage
 * @returns {Email}
 */
export function createEmail(storage) {
  const email = {
    sender: 'noreply@example.com',
    headers: {
      Accept: 'text/json',
      'Content-Type': 'text/json',
      'X-Postmark-Server-Token': 'dummy-postmark-token',
    },
    /**
     * @param {ValidationEmailSend} email
     */
    async sendValidation(email) {
      storage.push(email)
    },
    /**
     * @param {EmailSend} email
     */
    async send(email) {
      storage.push(email)
    },
  }
  return email
}

/** did:key:z6Mkk89bC3JrVqKie71YEcc5M1SMVxuCgNx6zLZ8SYJsxALi */
export const alice = ed25519.parse(
  'MgCZT5vOnYZoVAeyjnzuJIVY9J4LNtJ+f8Js0cTPuKUpFne0BVEDJjEu6quFIU8yp91/TY/+MYK8GvlKoTDnqOCovCVM='
)
/** did:key:z6MkffDZCkCTWreg8868fG1FGFogcJj5X6PY93pPcWDn9bob */
export const bob = ed25519.parse(
  'MgCYbj5AJfVvdrjkjNCxB3iAUwx7RQHVQ7H1sKyHy46Iose0BEevXgL1V73PD9snOCIoONgb+yQ9sycYchQC8kygR4qY='
)
/** did:key:z6MktafZTREjJkvV5mfJxcLpNBoVPwDLhTuMg9ng7dY4zMAL */
export const mallory = ed25519.parse(
  'MgCYtH0AvYxiQwBG6+ZXcwlXywq9tI50G2mCAUJbwrrahkO0B0elFYkl3Ulf3Q3A/EvcVY0utb4etiSE8e6pi4H0FEmU='
)

export const w3 = ed25519
  .parse(
    'MgCYKXoHVy7Vk4/QjcEGi+MCqjntUiasxXJ8uJKY0qh11e+0Bs8WsdqGK7xothgrDzzWD0ME7ynPjz2okXDh8537lId8='
  )
  .withDID('did:web:test.web3.storage')

/**
 * Creates a server for the given service.
 *
 * @template {Record<string, any>} Service
 * @param {object} options
 * @param {Service} options.service
 * @param {Server.API.Signer<Server.API.DID<'web'>>} [options.id]
 * @param {Server.InboundCodec} [options.codec]
 */
export const createServer = ({ id = w3, service, codec = CAR.inbound }) =>
  Server.create({
    id,
    codec,
    service,
  })

/**
 * Creates a connection to the server over given channel.
 *
 * @template {Record<string, any>} Service
 * @param {object} options
 * @param {Types.Principal} options.id
 * @param {Types.Transport.Channel<Service>} options.channel
 * @param {Types.OutboundCodec} [options.codec]
 */
export const connect = ({ id, channel, codec = CAR.outbound }) =>
  Client.connect({
    id,
    channel,
    codec,
  })

/**
 * Creates a server for the given service and an in-process connection to
 * it. You can pass optional parameters to configure identifier or transports
 * used.
 *
 * @template {Record<string, any>} Service
 * @param {object} options
 * @param {Service} options.service
 * @param {Server.API.Signer<Server.API.DID<'web'>>} options.id
 * @param {Types.Transport.Channel<Service>} options.server
 */
export const createChannel = ({ id = w3, service, ...etc }) => {
  const server = createServer({ id, service, ...etc.server })
  const client = connect({ id, channel: server })

  return { server, client }
}

/**
 * Utility function that creates a delegation from account to agent and an
 * attestation from service to proof it. Proofs can be used to invoke any
 * capability on behalf of the account.
 *
 * @param {object} input
 * @param {Types.UCAN.Signer<Types.AccountDID>} input.account
 * @param {Types.Signer<Types.ServiceDID>} input.service
 * @param {Types.Signer} input.agent
 */
export const createAuthorization = async ({ account, agent, service }) => {
  // Issue authorization from account DID to agent DID
  const authorization = await Server.delegate({
    issuer: account,
    audience: agent,
    capabilities: [
      {
        with: 'ucan:*',
        can: '*',
      },
    ],
    expiration: Infinity,
  })

  const attest = await Access.session
    .invoke({
      issuer: service,
      audience: agent,
      with: service.did(),
      nb: {
        proof: authorization.cid,
      },
      expiration: Infinity,
    })
    .delegate()

  return [authorization, attest]
}

/**
 * @param {object} input
 * @param {Types.Signer<Types.ServiceDID>} input.service
 * @param {Types.Principal<Types.SpaceDID>} input.space
 * @param {Types.Signer<Types.DIDKey>} input.agent
 * @param {Types.UCAN.Signer<Types.AccountDID>} input.account
 * @param {Types.ConnectionView<Types.Service>} input.connection
 */
export const provisionProvider = async ({
  service,
  agent,
  space,
  account,
  connection,
}) =>
  Provider.add
    .invoke({
      issuer: agent,
      audience: service,
      with: account.did(),
      nb: {
        provider: service.did(),
        consumer: space.did(),
      },
      proofs: await createAuthorization({ agent, service, account }),
    })
    .execute(connection)

/**
 * @template T
 * @param {T[]} buffer
 * @returns
 */
export const queue = (buffer = []) => {
  /** @type {Array<(input:T) => void>} */
  const reads = []

  /**
   * @param {T} message
   */
  const put = (message) => {
    const read = reads.shift()
    if (read) {
      read(message)
    } else {
      buffer.push(message)
    }
  }

  /**
   * @returns {Promise<T>}
   */
  const take = () => {
    return new Promise((resolve) => {
      const message = buffer.shift()
      if (message) {
        resolve(message)
      } else {
        reads.push(resolve)
      }
    })
  }

  return { put, take }
}
