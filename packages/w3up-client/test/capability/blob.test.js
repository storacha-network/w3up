import { create as createLink } from 'multiformats/link'
import { codec as car } from '@ucanto/transport/car'
import { sha256 } from 'multiformats/hashes/sha2'
import { AgentData } from '@web3-storage/access/agent'
import { randomBytes } from '../helpers/random.js'
import { Client } from '../../src/client.js'
import * as Test from '../test.js'
import { setupGetReceipt } from '../helpers/utils.js'

export const BlobClient = Test.withContext({
  'should store a blob': async (
    assert,
    { connection, provisionsStorage, allocationsStorage }
  ) => {
    const alice = new Client(await AgentData.create(), {
      // @ts-ignore
      serviceConf: {
        access: connection,
        upload: connection,
      },
    })

    const space = await alice.createSpace('test')
    const auth = await space.createAuthorization(alice)
    await alice.addSpace(auth)
    await alice.setCurrentSpace(space.did())

    // Then we setup a billing for this account
    await provisionsStorage.put({
      // @ts-expect-error
      provider: connection.id.did(),
      account: alice.agent.did(),
      consumer: space.did(),
    })

    const bytes = await randomBytes(128)
    const bytesHash = await sha256.digest(bytes)
    const link = createLink(car.code, bytesHash)
    const commitment = await alice.capability.blob.add(new Blob([bytes]), {
      fetch: setupGetReceipt(function* () {
        yield link
      }),
    })

    // TODO we should check blobsStorage as well
    assert.deepEqual(
      await allocationsStorage.exists(
        space.did(),
        // @ts-ignore Element
        commitment.capabilities[0].nb.content.multihash.bytes
      ),
      {
        ok: true,
      }
    )

    assert.deepEqual(
      // @ts-ignore Element
      commitment.capabilities[0].nb.content.bytes.slice(3),
      bytesHash.bytes
    )
  },
  'should list stored blobs': async (
    assert,
    { connection, provisionsStorage }
  ) => {
    const alice = new Client(await AgentData.create(), {
      // @ts-ignore
      serviceConf: {
        access: connection,
        upload: connection,
      },
    })

    const space = await alice.createSpace('test')
    const auth = await space.createAuthorization(alice)
    await alice.addSpace(auth)
    await alice.setCurrentSpace(space.did())

    // Then we setup a billing for this account
    await provisionsStorage.put({
      // @ts-expect-error
      provider: connection.id.did(),
      account: alice.agent.did(),
      consumer: space.did(),
    })

    const bytes = await randomBytes(128)
    const bytesHash = await sha256.digest(bytes)
    const link = createLink(car.code, bytesHash)
    const commitment = await alice.capability.blob.add(new Blob([bytes]), {
      fetch: setupGetReceipt(function* () {
        yield link
      }),
    })
    assert.deepEqual(
      // @ts-ignore Element
      commitment.capabilities[0].nb.content.bytes.slice(3),
      bytesHash.bytes
    )

    const {
      results: [entry],
    } = await alice.capability.blob.list()

    assert.deepEqual(entry.blob.digest, bytesHash.bytes)
    assert.deepEqual(entry.blob.size, bytes.length)
  },
  'should remove a stored blob': async (
    assert,
    { connection, provisionsStorage }
  ) => {
    const alice = new Client(await AgentData.create(), {
      // @ts-ignore
      serviceConf: {
        access: connection,
        upload: connection,
      },
    })

    const space = await alice.createSpace('test')
    const auth = await space.createAuthorization(alice)
    await alice.addSpace(auth)
    await alice.setCurrentSpace(space.did())

    // Then we setup a billing for this account
    await provisionsStorage.put({
      // @ts-expect-error
      provider: connection.id.did(),
      account: alice.agent.did(),
      consumer: space.did(),
    })

    const bytes = await randomBytes(128)
    const bytesHash = await sha256.digest(bytes)
    const link = createLink(car.code, bytesHash)
    const commitment = await alice.capability.blob.add(new Blob([bytes]), {
      fetch: setupGetReceipt(function* () {
        yield link
      }),
    })

    const result = await alice.capability.blob.remove(
      // @ts-ignore Element
      commitment.capabilities[0].nb.content
    )
    assert.ok(result.ok)
  },
})

Test.test({ BlobClient })
