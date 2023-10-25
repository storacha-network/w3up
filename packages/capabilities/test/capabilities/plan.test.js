import assert from 'assert'
import { access } from '@ucanto/validator'
import { Verifier } from '@ucanto/principal/ed25519'
import * as Plan from '../../src/plan.js'
import { service, alice, bob } from '../helpers/fixtures.js'
import { createAuthorization, validateAuthorization } from '../helpers/utils.js'

describe('plan/get', function () {
  const agent = alice
  const account = 'did:mailto:mallory.com:mallory'
  it('can invoke as an account', async function () {
    const auth = Plan.get.invoke({
      issuer: agent,
      audience: service,
      with: account,
      proofs: await createAuthorization({ agent, service, account }),
    })
    const result = await access(await auth.delegate(), {
      capability: Plan.get,
      principal: Verifier,
      authority: service,
      validateAuthorization,
    })
    if (result.error) {
      assert.fail(`error in self issue: ${result.error.message}`)
    } else {
      assert.deepEqual(result.ok.audience.did(), service.did())
      assert.equal(result.ok.capability.can, 'plan/get')
      assert.deepEqual(result.ok.capability.with, account)
    }
  })

  it('fails without account delegation', async function () {
    const agent = alice
    const auth = Plan.get.invoke({
      issuer: agent,
      audience: service,
      with: account,
    })

    const result = await access(await auth.delegate(), {
      capability: Plan.get,
      principal: Verifier,
      authority: service,
      validateAuthorization,
    })

    assert.equal(result.error?.message.includes('not authorized'), true)
  })

  it('fails when invoked by a different agent', async function () {
    const auth = Plan.get.invoke({
      issuer: bob,
      audience: service,
      with: account,
      proofs: await createAuthorization({ agent, service, account }),
    })

    const result = await access(await auth.delegate(), {
      capability: Plan.get,
      principal: Verifier,
      authority: service,
      validateAuthorization,
    })
    assert.equal(result.error?.message.includes('not authorized'), true)
  })

  it('can delegate plan/get', async function () {
    const invocation = Plan.get.invoke({
      issuer: bob,
      audience: service,
      with: account,
      proofs: [
        await Plan.get.delegate({
          issuer: agent,
          audience: bob,
          with: account,
          proofs: await createAuthorization({ agent, service, account }),
        }),
      ],
    })
    const result = await access(await invocation.delegate(), {
      capability: Plan.get,
      principal: Verifier,
      authority: service,
      validateAuthorization,
    })
    if (result.error) {
      assert.fail(`error in self issue: ${result.error.message}`)
    } else {
      assert.deepEqual(result.ok.audience.did(), service.did())
      assert.equal(result.ok.capability.can, 'plan/get')
      assert.deepEqual(result.ok.capability.with, account)
    }
  })
})
