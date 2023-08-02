import { Filecoin } from '@web3-storage/capabilities'
import * as Signer from '@ucanto/principal/ed25519'

import * as API from '../../src/types.js'

import { randomCargo } from '../utils.js'
import { createServer, connect } from '../../src/aggregator.js'

/**
 * @type {API.Tests<API.AggregatorServiceContext & {
 *  addQueue: API.TestQueue<API.AggregatorQueueRecord>
 *  pieceStore: API.TestStore<any>
 * }>}
 */
export const test = {
  'piece/add inserts piece into processing queue': async (assert, context) => {
    const { storefront } = await getServiceContext()
    const connection = connect({
      id: context.id,
      channel: createServer(context),
    })

    // Generate piece for test
    const [cargo] = await randomCargo(1, 128)
    const group = storefront.did()

    // storefront invocation
    const pieceAddInv = Filecoin.pieceAdd.invoke({
      issuer: storefront,
      audience: connection.id,
      with: storefront.did(),
      nb: {
        piece: cargo.link.link(),
        group,
      },
    })

    const response = await pieceAddInv.execute(connection)
    if (response.out.error) {
      throw new Error('invocation failed', { cause: response.out.error })
    }
    assert.ok(response.out.ok)
    assert.deepEqual(response.out.ok.status, 'queued')

    // Validate effect in receipt
    const fx = await Filecoin.pieceAdd
      .invoke({
        issuer: context.id,
        audience: context.id,
        with: context.id.did(),
        nb: {
          piece: cargo.link.link(),
          group,
        },
      })
      .delegate()

    assert.ok(response.fx.join)
    assert.ok(fx.link().equals(response.fx.join?.link()))

    const queuedItems = context.addQueue.all()
    assert.equal(queuedItems.length, 1)
    assert.ok(queuedItems.find((item) => item.piece.equals(cargo.link.link())))

    const storedItems = context.pieceStore.all()
    assert.equal(storedItems.length, 0)
  },
  'piece/add from signer inserts piece into store and returns accepted': async (
    assert,
    context
  ) => {
    const { storefront } = await getServiceContext()
    const connection = connect({
      id: context.id,
      channel: createServer(context),
    })

    // Generate piece for test
    const [cargo] = await randomCargo(1, 128)
    const group = storefront.did()

    // aggregator invocation
    const pieceAddInv = Filecoin.pieceAdd.invoke({
      issuer: context.id,
      audience: connection.id,
      with: context.id.did(),
      nb: {
        piece: cargo.link.link(),
        group,
      },
    })

    const response = await pieceAddInv.execute(connection)
    if (response.out.error) {
      throw new Error('invocation failed', { cause: response.out.error })
    }
    assert.ok(response.out.ok)
    assert.deepEqual(response.out.ok.status, 'accepted')

    const queuedItems = context.addQueue.all()
    assert.equal(queuedItems.length, 0)

    const storedItems = context.pieceStore.all()
    assert.equal(storedItems.length, 1)
    assert.ok(storedItems.find((item) => item.piece.equals(cargo.link.link())))
  },
  'skip piece/add from signer inserts piece into store and returns rejected':
    async (assert, context) => {
      const { storefront } = await getServiceContext()
      const connection = connect({
        id: context.id,
        channel: createServer(context),
      })

      // Generate piece for test
      const [cargo] = await randomCargo(1, 128)
      const group = storefront.did()

      // aggregator invocation
      const pieceAddInv = Filecoin.pieceAdd.invoke({
        issuer: context.id,
        audience: connection.id,
        with: context.id.did(),
        nb: {
          piece: cargo.link.link(),
          group,
        },
      })

      const response = await pieceAddInv.execute(connection)
      if (response.out.error) {
        throw new Error('invocation failed', { cause: response.out.error })
      }
      assert.ok(response.out.ok)
      assert.deepEqual(response.out.ok.status, 'rejected')

      const queuedItems = context.addQueue.all()
      assert.equal(queuedItems.length, 0)

      const storedItems = context.pieceStore.all()
      assert.equal(storedItems.length, 0)
    },
}

async function getServiceContext() {
  const storefront = await Signer.generate()

  return { storefront }
}
