import { Principal, SigningPrincipal } from '@ucanto/principal'
import * as Client from '@ucanto/client'
import * as Service from '@ucanto/server'
import * as CAR from '@ucanto/transport/car'
import * as CBOR from '@ucanto/transport/cbor'
import * as HTTP from '@ucanto/transport/http'
import webfetch from '@web-std/fetch'
import * as API from '../type.js'
import * as Provider from './provider.js'
export * from './capability.js'

/**
 * @param {object} options
 * @param {string} options.keypair
 * @param {API.ConnectionView<{identity: API.Identity.Identity}>} options.identity
 * @param {API.Accounting.Provider} options.accounting
 * @param {API.SignOptions} options.signingOptions
 * @param {API.InboundTransportOptions} [options.transport]
 * @param {API.ValidatorOptions} [options.validator]
 */
export const create = ({
  keypair,
  identity,
  accounting,
  signingOptions,
  transport = { decoder: CAR, encoder: CBOR },
  validator = {},
}) => {
  const id = SigningPrincipal.parse(keypair)
  const provider = Provider.create({
    id,
    identity,
    accounting,
    signingOptions,
  })

  const service = Service.create({
    ...transport,
    ...validator,
    id: id.principal,
    service: provider,
  })

  return Object.assign(service, {
    handleRequest: service.request.bind(service),
    connect: () => {
      Client.connect({
        id: id.principal,
        encoder: CAR,
        decoder: CBOR,
        channel: service,
      })
    },
  })
}

/**
 * @param {object} options
 * @param {API.DID} options.id
 * @param {URL} options.url
 * @param {string} [options.method]
 * @param {HTTP.Fetcher} [options.fetch]
 * @param {API.OutpboundTranpsortOptions} [options.transport]
 * @returns {API.ConnectionView<{store: API.Store.Store, identity: API.Identity.Identity }>}
 */
export const connect = ({
  id,
  url,
  transport = { encoder: CAR, decoder: CBOR },
  fetch = webfetch,
  method,
}) =>
  Client.connect({
    id: Principal.parse(id),
    ...transport,
    channel: HTTP.open({
      url,
      fetch,
      method,
    }),
  })
