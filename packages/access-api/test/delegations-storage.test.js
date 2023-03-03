import { context } from './helpers/context.js'
import {
  createDelegationRowUpdate,
  DbDelegationsStorage,
  delegationsTable,
} from '../src/models/delegations.js'
import { createD1Database } from '../src/utils/d1.js'
import * as assert from 'node:assert'
import { createSampleDelegation } from '../src/utils/ucan.js'
import * as principal from '@ucanto/principal'
import * as Ucanto from '@ucanto/interface'
import * as ucanto from '@ucanto/core'
import { collect } from 'streaming-iterables'

describe('DbDelegationsStorage', () => {
  it('should persist delegations', async () => {
    const { d1 } = await context()
    const storage = new DbDelegationsStorage(createD1Database(d1))
    const count = Math.round(Math.random() * 10)
    const delegations = await Promise.all(
      Array.from({ length: count }).map(() => createSampleDelegation())
    )
    await storage.putMany(...delegations)
    assert.deepEqual(await storage.count(), delegations.length)
  })

  it('can retrieve delegations by audience', async () => {
    const { issuer, d1 } = await context()
    const delegations = new DbDelegationsStorage(createD1Database(d1))

    const alice = await principal.ed25519.generate()
    const delegationsForAlice = await Promise.all(
      Array.from({ length: 1 }).map(() =>
        createDelegation({ issuer, audience: alice })
      )
    )

    const bob = await principal.ed25519.generate()
    const delegationsForBob = await Promise.all(
      Array.from({ length: 2 }).map((e, i) =>
        createDelegation({
          issuer,
          audience: bob,
          capabilities: [
            {
              can: `test/${i}`,
              with: alice.did(),
            },
          ],
        })
      )
    )

    await delegations.putMany(...delegationsForAlice, ...delegationsForBob)

    const aliceDelegations = await collect(
      delegations.find({ audience: alice.did() })
    )
    assert.deepEqual(aliceDelegations.length, delegationsForAlice.length)

    const bobDelegations = await collect(
      delegations.find({ audience: bob.did() })
    )
    assert.deepEqual(bobDelegations.length, delegationsForBob.length)

    const carol = await principal.ed25519.generate()
    const carolDelegations = await collect(
      delegations.find({ audience: carol.did() })
    )
    assert.deepEqual(carolDelegations.length, 0)
  })

  it('find throws UnexpectedDelegation when encountering row with empty bytes', async () => {
    const { d1, issuer } = await context()
    const db = createD1Database(d1)
    const delegations = new DbDelegationsStorage(db)
    const row = createDelegationRowUpdate(
      await ucanto.delegate({
        issuer,
        audience: issuer,
        capabilities: [{ can: '*', with: 'ucan:*' }],
      })
    )
    // insert row with empty bytes
    await db
      .insertInto(delegationsTable)
      .values([
        {
          ...row,
          bytes: Uint8Array.from([]),
        },
      ])
      .onConflict((oc) => oc.column('cid').doNothing())
      .execute()
    // now try to find
    const find = () => collect(delegations.find({ audience: issuer.did() }))
    let findError
    try {
      await find()
    } catch (error) {
      findError = error
    }
    assert.ok(findError && typeof findError === 'object')
    assert.deepEqual(
      'name' in findError && findError?.name,
      'UnexpectedDelegation'
    )
    assert.ok('row' in findError, 'UnexpectedDelegation error contains row')
  })
})

/**
 * @param {object} [opts]
 * @param {Ucanto.Signer<Ucanto.DID>} [opts.issuer]
 * @param {Ucanto.Principal} [opts.audience]
 * @param {Ucanto.Capabilities} [opts.capabilities]
 * @returns {Promise<Ucanto.Delegation>}
 */
async function createDelegation(opts = {}) {
  const {
    issuer = await principal.ed25519.generate(),
    audience = issuer,
    capabilities = [
      {
        can: 'test/*',
        with: issuer.did(),
      },
    ],
  } = opts
  return await ucanto.delegate({
    issuer,
    audience,
    capabilities,
  })
}
