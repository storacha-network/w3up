import * as Server from '@ucanto/server'
import { connect } from '@ucanto/client'
import * as CAR from '@ucanto/transport/car'
import * as CBOR from '@ucanto/transport/cbor'

const notImplemented = () => {
  throw new Server.Failure('not implemented')
}

/**
 * @param {Partial<{
 * access: Partial<import('@web3-storage/access/types').Service['access']>
 * provider: Partial<import('@web3-storage/access/types').Service['provider']>
 * store: Partial<import('@web3-storage/upload-client/types').Service['store']>
 * upload: Partial<import('@web3-storage/upload-client/types').Service['upload']>
 * voucher: Partial<import('@web3-storage/access/types').Service['voucher']>
 * space: Partial<import('@web3-storage/access/types').Service['space']>
 * }>} impl
 */
export function mockService(impl) {
  return {
    store: {
      add: withCallCount(impl.store?.add ?? notImplemented),
      list: withCallCount(impl.store?.list ?? notImplemented),
      remove: withCallCount(impl.store?.remove ?? notImplemented),
    },
    upload: {
      add: withCallCount(impl.upload?.add ?? notImplemented),
      list: withCallCount(impl.upload?.list ?? notImplemented),
      remove: withCallCount(impl.upload?.remove ?? notImplemented),
    },
    space: {
      info: withCallCount(impl.space?.info ?? notImplemented),
      'recover-validation': withCallCount(
        impl.space?.['recover-validation'] ?? notImplemented
      ),
    },
    access: {
      claim: withCallCount(impl.access?.claim ?? notImplemented),
      authorize: withCallCount(impl.access?.authorize ?? notImplemented),
      delegate: withCallCount(impl.access?.delegate ?? notImplemented),
    },
    provider: {
      add: withCallCount(impl.provider?.add ?? notImplemented),
    },
  }
}

/**
 * @template {Function} T
 * @param {T} fn
 */
function withCallCount(fn) {
  /** @param {T extends (...args: infer A) => any ? A : never} args */
  const countedFn = (...args) => {
    countedFn.called = true
    countedFn.callCount++
    return fn(...args)
  }
  countedFn.called = false
  countedFn.callCount = 0
  return countedFn
}

/**
 * @template {string} K
 * @template {Record<K, any>} Service - describes methods exposed via ucanto server
 * @param {import('@ucanto/interface').ServerView<Service>} server
 */
export async function mockServiceConf(server) {
  const connection = connect({
    id: server.id,
    encoder: CAR,
    decoder: CBOR,
    channel: server,
  })
  return { access: connection, upload: connection }
}
