import assert from 'assert'
import * as Client from '@ucanto/client'
import * as Server from '@ucanto/server'
import * as CAR from '@ucanto/transport/car'
import * as CBOR from '@ucanto/transport/cbor'
import * as Signer from '@ucanto/principal/ed25519'
import * as StoreCapabilities from '@web3-storage/access/capabilities/store'
import * as Store from '../src/store.js'
import { serviceSigner } from './fixtures.js'
import { randomCAR } from './helpers/random.js'
import { mockService } from './helpers/mocks.js'

describe('Store.add', () => {
  it('stores a DAG with the service', async () => {
    const res = {
      status: 'upload',
      headers: { 'x-test': 'true' },
      url: 'http://localhost:9200',
    }

    const account = await Signer.generate()
    const issuer = await Signer.generate()
    const car = await randomCAR(128)

    const proofs = [
      await StoreCapabilities.add.delegate({
        issuer: account,
        audience: serviceSigner,
        with: account.did(),
        expiration: Infinity,
      }),
    ]

    const service = mockService({
      store: {
        add(invocation) {
          assert.equal(invocation.issuer.did(), issuer.did())
          assert.equal(invocation.capabilities.length, 1)
          const invCap = invocation.capabilities[0]
          assert.equal(invCap.can, StoreCapabilities.add.can)
          assert.equal(invCap.with, account.did())
          assert.equal(String(invCap.nb.link), car.cid.toString())
          return res
        },
      },
    })

    const server = Server.create({
      id: serviceSigner,
      service,
      decoder: CAR,
      encoder: CBOR,
    })
    const connection = Client.connect({
      id: serviceSigner,
      encoder: CAR,
      decoder: CBOR,
      channel: server,
    })

    const carCID = await Store.add({ issuer, proofs }, car, { connection })
    assert(carCID)
    assert.equal(carCID.toString(), car.cid.toString())
  })

  it('throws for bucket URL client error 4xx', async () => {
    const res = {
      status: 'upload',
      headers: { 'x-test': 'true' },
      url: 'http://localhost:9400',
    }

    const account = await Signer.generate()
    const issuer = await Signer.generate()
    const car = await randomCAR(128)

    const proofs = [
      await StoreCapabilities.add.delegate({
        issuer: account,
        audience: serviceSigner,
        with: account.did(),
        expiration: Infinity,
      }),
    ]

    const service = mockService({ store: { add: () => res } })

    const server = Server.create({
      id: serviceSigner,
      service,
      decoder: CAR,
      encoder: CBOR,
    })
    const connection = Client.connect({
      id: serviceSigner,
      encoder: CAR,
      decoder: CBOR,
      channel: server,
    })

    assert.rejects(Store.add({ issuer, proofs }, car, { connection }), {
      message: 'upload failed: 400',
    })
  })

  it('throws for bucket URL server error 5xx', async () => {
    const res = {
      status: 'upload',
      headers: { 'x-test': 'true' },
      url: 'http://localhost:9500',
    }

    const account = await Signer.generate()
    const issuer = await Signer.generate()
    const car = await randomCAR(128)

    const proofs = [
      await StoreCapabilities.add.delegate({
        issuer: account,
        audience: serviceSigner,
        with: account.did(),
        expiration: Infinity,
      }),
    ]

    const service = mockService({ store: { add: () => res } })

    const server = Server.create({
      id: serviceSigner,
      service,
      decoder: CAR,
      encoder: CBOR,
    })
    const connection = Client.connect({
      id: serviceSigner,
      encoder: CAR,
      decoder: CBOR,
      channel: server,
    })

    assert.rejects(Store.add({ issuer, proofs }, car, { connection }), {
      message: 'upload failed: 500',
    })
  })

  it('skips sending CAR if status = done', async () => {
    const res = {
      status: 'done',
      headers: { 'x-test': 'true' },
      url: 'http://localhost:9001', // will fail the test if called
    }

    const account = await Signer.generate()
    const issuer = await Signer.generate()
    const car = await randomCAR(128)

    const proofs = [
      await StoreCapabilities.add.delegate({
        issuer: account,
        audience: serviceSigner,
        with: account.did(),
        expiration: Infinity,
      }),
    ]

    const service = mockService({ store: { add: () => res } })

    const server = Server.create({
      id: serviceSigner,
      service,
      decoder: CAR,
      encoder: CBOR,
    })
    const connection = Client.connect({
      id: serviceSigner,
      encoder: CAR,
      decoder: CBOR,
      channel: server,
    })

    const carCID = await Store.add({ issuer, proofs }, car, { connection })
    assert(carCID)
    assert.equal(carCID.toString(), car.cid.toString())
  })

  it('aborts', async () => {
    const res = {
      status: 'upload',
      headers: { 'x-test': 'true' },
      url: 'http://localhost:9001', // will fail the test if called
    }

    const service = mockService({ store: { add: () => res } })

    const server = Server.create({
      id: serviceSigner,
      service,
      decoder: CAR,
      encoder: CBOR,
    })
    const connection = Client.connect({
      id: serviceSigner,
      encoder: CAR,
      decoder: CBOR,
      channel: server,
    })

    const account = await Signer.generate()
    const issuer = await Signer.generate()
    const car = await randomCAR(128)

    const proofs = [
      await StoreCapabilities.add.delegate({
        issuer: account,
        audience: serviceSigner,
        with: account.did(),
        expiration: Infinity,
      }),
    ]

    const controller = new AbortController()
    controller.abort() // already aborted

    await assert.rejects(
      Store.add({ issuer, proofs }, car, {
        connection,
        signal: controller.signal,
      }),
      { name: 'Error', message: 'upload aborted' }
    )
  })
})

describe('Store.list', () => {
  it('lists stored CAR files', async () => {
    const car = await randomCAR(128)
    const res = {
      page: 1,
      pageSize: 1000,
      count: 1,
      results: [
        {
          payloadCID: car.cid,
          size: 123,
          uploadedAt: Date.now(),
        },
      ],
    }

    const account = await Signer.generate()
    const issuer = await Signer.generate()

    const proofs = [
      await StoreCapabilities.list.delegate({
        issuer: account,
        audience: serviceSigner,
        with: account.did(),
        expiration: Infinity,
      }),
    ]

    const service = mockService({
      store: {
        list(invocation) {
          assert.equal(invocation.issuer.did(), issuer.did())
          assert.equal(invocation.capabilities.length, 1)
          const invCap = invocation.capabilities[0]
          assert.equal(invCap.can, StoreCapabilities.list.can)
          assert.equal(invCap.with, account.did())
          return res
        },
      },
    })

    const server = Server.create({
      id: serviceSigner,
      service,
      decoder: CAR,
      encoder: CBOR,
    })
    const connection = Client.connect({
      id: serviceSigner,
      encoder: CAR,
      decoder: CBOR,
      channel: server,
    })

    const list = await Store.list({ issuer, proofs }, { connection })

    assert.equal(list.count, res.count)
    assert.equal(list.page, res.page)
    assert.equal(list.pageSize, res.pageSize)
    assert(list.results)
    assert.equal(list.results.length, res.results.length)
    list.results.forEach((r, i) => {
      assert.equal(
        r.payloadCID.toString(),
        res.results[i].payloadCID.toString()
      )
      assert.equal(r.size, res.results[i].size)
      assert.equal(r.uploadedAt, res.results[i].uploadedAt)
    })
  })

  it('throws on service error', async () => {
    const account = await Signer.generate()
    const issuer = await Signer.generate()

    const proofs = [
      await StoreCapabilities.list.delegate({
        issuer: account,
        audience: serviceSigner,
        with: account.did(),
        expiration: Infinity,
      }),
    ]

    const service = mockService({
      store: {
        list: () => {
          throw new Server.Failure('boom')
        },
      },
    })

    const server = Server.create({
      id: serviceSigner,
      service,
      decoder: CAR,
      encoder: CBOR,
    })
    const connection = Client.connect({
      id: serviceSigner,
      encoder: CAR,
      decoder: CBOR,
      channel: server,
    })

    await assert.rejects(Store.list({ issuer, proofs }, { connection }), {
      message: 'failed store/list invocation',
    })
  })
})

describe('Store.remove', () => {
  it('removes a stored CAR file', async () => {
    const account = await Signer.generate()
    const issuer = await Signer.generate()
    const car = await randomCAR(128)

    const proofs = [
      await StoreCapabilities.remove.delegate({
        issuer: account,
        audience: serviceSigner,
        with: account.did(),
        expiration: Infinity,
      }),
    ]

    const service = mockService({
      store: {
        remove(invocation) {
          assert.equal(invocation.issuer.did(), issuer.did())
          assert.equal(invocation.capabilities.length, 1)
          const invCap = invocation.capabilities[0]
          assert.equal(invCap.can, StoreCapabilities.remove.can)
          assert.equal(invCap.with, account.did())
          assert.equal(String(invCap.nb.link), car.cid.toString())
          return null
        },
      },
    })

    const server = Server.create({
      id: serviceSigner,
      service,
      decoder: CAR,
      encoder: CBOR,
    })
    const connection = Client.connect({
      id: serviceSigner,
      encoder: CAR,
      decoder: CBOR,
      channel: server,
    })

    await Store.remove({ issuer, proofs }, car.cid, { connection })
  })

  it('throws on service error', async () => {
    const account = await Signer.generate()
    const issuer = await Signer.generate()
    const car = await randomCAR(128)

    const proofs = [
      await StoreCapabilities.remove.delegate({
        issuer: account,
        audience: serviceSigner,
        with: account.did(),
        expiration: Infinity,
      }),
    ]

    const service = mockService({
      store: {
        remove: () => {
          throw new Server.Failure('boom')
        },
      },
    })

    const server = Server.create({
      id: serviceSigner,
      service,
      decoder: CAR,
      encoder: CBOR,
    })
    const connection = Client.connect({
      id: serviceSigner,
      encoder: CAR,
      decoder: CBOR,
      channel: server,
    })

    await assert.rejects(
      Store.remove({ issuer, proofs }, car.cid, { connection }),
      { message: 'failed store/remove invocation' }
    )
  })
})
