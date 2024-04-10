import * as API from '../../src/types.js'
import { sha256 } from 'multiformats/hashes/sha2'
import { ed25519 } from '@ucanto/principal'
import { Receipt } from '@ucanto/core'
import * as BlobCapabilities from '@web3-storage/capabilities/blob'
import * as HTTPCapabilities from '@web3-storage/capabilities/http'

import { createServer, connect } from '../../src/lib.js'
import { alice, registerSpace } from '../util.js'
import { BlobSizeOutsideOfSupportedRangeName } from '../../src/blob/lib.js'
import { createConcludeInvocation } from '../../src/ucan/conclude.js'
import { parseBlobAddReceiptNext } from '../helpers/blob.js'

/**
 * @type {API.Tests}
 */
export const test = {
  'blob/add schedules allocation and returns effects for allocate (and its receipt), put and accept':
    async (assert, context) => {
      const { proof, spaceDid } = await registerSpace(alice, context)

      // prepare data
      const data = new Uint8Array([11, 22, 34, 44, 55])
      const multihash = await sha256.digest(data)
      const digest = multihash.bytes
      const size = data.byteLength

      // create service connection
      const connection = connect({
        id: context.id,
        channel: createServer(context),
      })

      // invoke `blob/add`
      const invocation = BlobCapabilities.add.invoke({
        issuer: alice,
        audience: context.id,
        with: spaceDid,
        nb: {
          blob: {
            digest,
            size,
          },
        },
        proofs: [proof],
      })
      const blobAdd = await invocation.execute(connection)
      if (!blobAdd.out.ok) {
        throw new Error('invocation failed', { cause: blobAdd })
      }

      // Validate receipt structure
      assert.ok(blobAdd.out.ok.site)
      assert.equal(blobAdd.out.ok.site['ucan/await'][0], '.out.ok.site')
      assert.ok(
        blobAdd.out.ok.site['ucan/await'][1].equals(blobAdd.fx.join?.link())
      )
      assert.ok(blobAdd.fx.join)
      assert.equal(blobAdd.fx.fork.length, 3)

      // validate receipt next
      const next = parseBlobAddReceiptNext(blobAdd)
      assert.ok(next.allocatefx)
      assert.ok(next.putfx)
      assert.ok(next.acceptfx)
      assert.equal(next.concludefxs.length, 1)
      assert.ok(next.allocateReceipt)
      assert.ok(!next.putReceipt)
      assert.ok(!next.acceptReceipt)

      // validate facts exist for `http/put`
      assert.ok(next.putfx.facts.length)
      assert.ok(next.putfx.facts[0]['keys'])

      // Validate `http/put` invocation was stored
      const httpPutGetTask = await context.tasksStorage.get(next.putfx.cid)
      assert.ok(httpPutGetTask.ok)

      // validate that scheduled allocate task executed and has its receipt content
      const receipt = next.allocateReceipt
      assert.ok(receipt.out)
      assert.ok(receipt.out.ok)
      assert.equal(receipt.out.ok?.size, size)
      assert.ok(receipt.out.ok?.address)
    },
  'blob/add schedules allocation only on first blob/add':
    async (assert, context) => {
      const { proof, spaceDid } = await registerSpace(alice, context)

      // prepare data
      const data = new Uint8Array([11, 22, 34, 44, 55])
      const multihash = await sha256.digest(data)
      const digest = multihash.bytes
      const size = data.byteLength

      // create service connection
      const connection = connect({
        id: context.id,
        channel: createServer(context),
      })

      // create `blob/add` invocation
      const invocation = BlobCapabilities.add.invoke({
        issuer: alice,
        audience: context.id,
        with: spaceDid,
        nb: {
          blob: {
            digest,
            size,
          },
        },
        proofs: [proof],
      })
      // Invoke `blob/add` for the first time
      const firstBlobAdd = await invocation.execute(connection)
      if (!firstBlobAdd.out.ok) {
        throw new Error('invocation failed', { cause: firstBlobAdd })
      }

      // parse first receipt next
      const firstNext = parseBlobAddReceiptNext(firstBlobAdd)
      assert.ok(firstNext.allocatefx)
      assert.ok(firstNext.putfx)
      assert.ok(firstNext.acceptfx)
      assert.equal(firstNext.concludefxs.length, 1)
      assert.ok(firstNext.allocateReceipt)
      assert.ok(!firstNext.putReceipt)
      assert.ok(!firstNext.acceptReceipt)

      // Store allocate receipt to not re-schedule
      // @ts-expect-error types unknown for next
      const receiptPutRes = await context.receiptsStorage.put(firstNext.allocateReceipt)
      assert.ok(receiptPutRes.ok)

      // Invoke `blob/add` for the second time (without storing the blob)
      const secondBlobAdd = await invocation.execute(connection)
      if (!secondBlobAdd.out.ok) {
        throw new Error('invocation failed', { cause: secondBlobAdd })
      }

      // parse second receipt next
      const secondNext = parseBlobAddReceiptNext(secondBlobAdd)
      assert.ok(secondNext.allocatefx)
      assert.ok(secondNext.putfx)
      assert.ok(secondNext.acceptfx)
      assert.equal(secondNext.concludefxs.length, 1)
      assert.ok(secondNext.allocateReceipt)
      assert.ok(!secondNext.putReceipt)
      assert.ok(!secondNext.acceptReceipt)
      // allocate receipt is from same invocation CID
      assert.ok(firstNext.concludefxs[0].cid.equals(secondNext.concludefxs[0].cid))
    },
  'blob/add schedules allocation and returns effects for allocate, accept and put together with their receipts (when stored)':
    async (assert, context) => {
      const { proof, spaceDid } = await registerSpace(alice, context)

      // prepare data
      const data = new Uint8Array([11, 22, 34, 44, 55])
      const multihash = await sha256.digest(data)
      const digest = multihash.bytes
      const size = data.byteLength

      // create service connection
      const connection = connect({
        id: context.id,
        channel: createServer(context),
      })

      // create `blob/add` invocation
      const invocation = BlobCapabilities.add.invoke({
        issuer: alice,
        audience: context.id,
        with: spaceDid,
        nb: {
          blob: {
            digest,
            size,
          },
        },
        proofs: [proof],
      })
      // Invoke `blob/add` for the first time
      const firstBlobAdd = await invocation.execute(connection)
      if (!firstBlobAdd.out.ok) {
        throw new Error('invocation failed', { cause: firstBlobAdd })
      }

      // parse first receipt next
      const firstNext = parseBlobAddReceiptNext(firstBlobAdd)
      assert.ok(firstNext.allocatefx)
      assert.ok(firstNext.putfx)
      assert.ok(firstNext.acceptfx)
      assert.equal(firstNext.concludefxs.length, 1)
      assert.ok(firstNext.allocateReceipt)
      assert.ok(!firstNext.putReceipt)
      assert.ok(!firstNext.acceptReceipt)

      // Store allocate receipt to not re-schedule
      // @ts-expect-error types unknown for next
      const receiptPutRes = await context.receiptsStorage.put(firstNext.allocateReceipt)
      assert.ok(receiptPutRes.ok)

      /** @type {import('@web3-storage/capabilities/types').BlobAddress} */
      // @ts-expect-error receipt type is unknown
      const address = firstNext.allocateReceipt.out.ok.address

      // Store the blob to the address
      const goodPut = await fetch(address.url, {
        method: 'PUT',
        mode: 'cors',
        body: data,
        headers: address.headers,
      })
      assert.equal(goodPut.status, 200, await goodPut.text())

      // Invoke `blob/add` for the second time (after storing the blob but not invoking conclude)
      const secondBlobAdd = await invocation.execute(connection)
      if (!secondBlobAdd.out.ok) {
        throw new Error('invocation failed', { cause: secondBlobAdd })
      }

      // parse second receipt next
      const secondNext = parseBlobAddReceiptNext(secondBlobAdd)
      assert.ok(secondNext.allocatefx)
      assert.ok(secondNext.putfx)
      assert.ok(secondNext.acceptfx)
      assert.equal(secondNext.concludefxs.length, 1)
      assert.ok(secondNext.allocateReceipt)
      assert.ok(!secondNext.putReceipt)
      assert.ok(!secondNext.acceptReceipt)

      // Store blob/allocate given conclude needs it to schedule blob/accept
      // Store allocate task to be fetchable from allocate
      await context.tasksStorage.put(secondNext.allocatefx)
 
      // Invoke `conclude` with `http/put` receipt
      const keys = secondNext.putfx.facts[0]['keys']
      // @ts-expect-error Argument of type 'unknown' is not assignable to parameter of type 'SignerArchive<`did:${string}:${string}`, SigAlg>'
      const blobProvider = ed25519.from(keys)
      const httpPut = HTTPCapabilities.put.invoke({
        issuer: blobProvider,
        audience: blobProvider,
        with: blobProvider.toDIDKey(),
        nb: {
          body: {
            digest,
            size,
          },
          url: {
            'ucan/await': ['.out.ok.address.url', secondNext.allocatefx.cid],
          },
          headers: {
            'ucan/await': ['.out.ok.address.headers', secondNext.allocatefx.cid],
          },
        },
        facts: secondNext.putfx.facts,
        expiration: Infinity,
      })

      const httpPutDelegation = await httpPut.delegate()
      const httpPutReceipt = await Receipt.issue({
        issuer: blobProvider,
        ran: httpPutDelegation.cid,
        result: {
          ok: {},
        },
      })
      const httpPutConcludeInvocation = createConcludeInvocation(
        alice,
        context.id,
        httpPutReceipt
      )
      const ucanConclude = await httpPutConcludeInvocation.execute(connection)
      if (!ucanConclude.out.ok) {
        console.log('ucan conclude', ucanConclude.out.error)
        throw new Error('invocation failed', { cause: ucanConclude.out })
      }

      // Invoke `blob/add` for the third time (after invoking conclude)
      const thirdBlobAdd = await invocation.execute(connection)
      if (!thirdBlobAdd.out.ok) {
        throw new Error('invocation failed', { cause: thirdBlobAdd })
      }

      // parse third receipt next
      const thirdNext = parseBlobAddReceiptNext(thirdBlobAdd)
      assert.ok(thirdNext.allocatefx)
      assert.ok(thirdNext.putfx)
      assert.ok(thirdNext.acceptfx)
      assert.equal(thirdNext.concludefxs.length, 3)
      assert.ok(thirdNext.allocateReceipt)
      assert.ok(thirdNext.putReceipt)
      assert.ok(thirdNext.acceptReceipt)

      assert.ok(thirdNext.allocateReceipt.out.ok?.address)
      assert.deepEqual(thirdNext.putReceipt?.out.ok, {})
      assert.ok(thirdNext.acceptReceipt?.out.ok?.site)
    },
  'blob/add fails when a blob with size bigger than maximum size is added':
    async (assert, context) => {
      const { proof, spaceDid } = await registerSpace(alice, context)

      // prepare data
      const data = new Uint8Array([11, 22, 34, 44, 55])
      const multihash = await sha256.digest(data)
      const digest = multihash.bytes

      // create service connection
      const connection = connect({
        id: context.id,
        channel: createServer(context),
      })

      // invoke `blob/add`
      const invocation = BlobCapabilities.add.invoke({
        issuer: alice,
        audience: context.id,
        with: spaceDid,
        nb: {
          blob: {
            digest,
            size: Number.MAX_SAFE_INTEGER,
          },
        },
        proofs: [proof],
      })
      const blobAdd = await invocation.execute(connection)
      if (!blobAdd.out.error) {
        throw new Error('invocation should have failed')
      }
      assert.ok(blobAdd.out.error, 'invocation should have failed')
      assert.equal(blobAdd.out.error.name, BlobSizeOutsideOfSupportedRangeName)
    },
}
