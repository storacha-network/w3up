import {
  assertNotError,
  createTesterFromContext,
  createTesterFromHandler,
  warnOnErrorResult,
} from './helpers/ucanto-test-utils.js'
import * as principal from '@ucanto/principal'
import * as provider from '@web3-storage/capabilities/provider'
import * as assert from 'assert'
import { createProviderAddHandler } from '../src/service/provider-add.js'
import { context } from './helpers/context.js'
import * as ucanto from '@ucanto/core'
import * as Ucanto from '@ucanto/interface'
import { Access, Provider } from '@web3-storage/capabilities'
import * as delegationsResponse from '../src/utils/delegations-response.js'
import { createProvisions } from '../src/models/provisions.js'
import { NON_STANDARD } from '@ipld/dag-ucan/signature'
import { createEmail } from './helpers/utils.js'

for (const providerAddHandlerVariant of /** @type {const} */ ([
  {
    name: 'handled by createProviderAddHandler',
    ...(() => {
      const spaceWithStorageProvider = principal.ed25519.generate()
      const service = {
        did: () => /** @type {const} */ ('did:web:web3.storage'),
      }
      const provisions = createProvisions(service.did())
      return {
        spaceWithStorageProvider,
        provisions,
        ...createTesterFromHandler(() =>
          createProviderAddHandler({
            provisions,
          })
        ),
      }
    })(),
  },
])) {
  describe(`provider/add ${providerAddHandlerVariant.name}`, () => {
    it(`can be invoked by did:key`, async () => {
      const space = await principal.ed25519.generate()
      const issuer = await providerAddHandlerVariant.issuer
      const result = await providerAddHandlerVariant.invoke(
        await provider.add
          .invoke({
            issuer,
            audience: await providerAddHandlerVariant.audience,
            with: `did:mailto:example.com:foo`,
            nb: {
              consumer: space.did(),
              provider: providerAddHandlerVariant.provisions.service,
            },
          })
          .delegate()
      )
      assertNotError(result)
    })
  })
}

for (const accessApiVariant of /** @type {const} */ ([
  {
    name: 'handled by access-api in miniflare',
    ...(() => {
      const spaceWithStorageProvider = principal.ed25519.generate()
      /** @type {{to:string, url:string}[]} */
      const emails = []
      const email = createEmail(emails)
      const features = new Set([
        'provider/add',
        'access/delegate',
        'store/info',
      ])
      return {
        spaceWithStorageProvider,
        emails,
        features,
        ...createTesterFromContext(
          () =>
            context({
              globals: {
                email,
              },
            }),
          {
            registerSpaces: [spaceWithStorageProvider],
            account: { did: () => /** @type {const} */ ('did:mailto:foo') },
          }
        ),
      }
    })(),
  },
])) {
  describe(`provider/add ${accessApiVariant.name}`, () => {
    it(`can invoke as did:mailto after authorize confirmation`, async () => {
      await testAuthorizeClaimProviderAdd({
        deviceA: await principal.ed25519.generate(),
        accountA: {
          did: () => /** @type {const} */ (`did:mailto:example.com:foo`),
        },
        space: await principal.ed25519.generate(),
        invoke: accessApiVariant.invoke,
        service: await accessApiVariant.audience,
        emails: accessApiVariant.emails,
        miniflare: await accessApiVariant.miniflare,
      })
    })
  })

  if (
    ['provider/add', 'access/delegate'].every((f) =>
      accessApiVariant.features.has(f)
    )
  ) {
    it('provider/add allows for access/delegate', async () => {
      const space = await principal.ed25519.generate()
      const agent = await accessApiVariant.issuer
      const service = await accessApiVariant.audience
      const accountDid = /** @type {const} */ ('did:mailto:example.com:foo')

      const accountAuthorizesAgentClaim = await ucanto.delegate({
        issuer: principal.Absentee.from({ id: accountDid }),
        audience: agent,
        capabilities: [
          {
            with: 'ucan:*',
            can: '*',
          },
        ],
      })
      const serviceAttestsThatAccountAuthorizesAgent = await ucanto.delegate({
        issuer: service,
        audience: agent,
        capabilities: [
          {
            with: service.did(),
            can: 'ucan/attest',
            nb: { proof: accountAuthorizesAgentClaim.cid },
          },
        ],
      })
      const sessionProofs = [
        accountAuthorizesAgentClaim,
        serviceAttestsThatAccountAuthorizesAgent,
      ]
      const addStorageProvider = await ucanto
        .invoke({
          issuer: agent,
          audience: service,
          capability: {
            can: 'provider/add',
            with: accountDid,
            nb: {
              provider: service.did(),
              consumer: space.did(),
            },
          },
          proofs: [...sessionProofs],
        })
        .delegate()
      const addStorageProviderResult = await accessApiVariant.invoke(
        addStorageProvider
      )
      assertNotError(addStorageProviderResult)

      // storage provider added. So we should be able to delegate now
      const accessDelegate = await ucanto
        .invoke({
          issuer: agent,
          audience: service,
          capability: {
            can: 'access/delegate',
            with: space.did(),
            nb: {
              delegations: {},
            },
          },
          proofs: [
            // space says agent can access/delegate with space
            await ucanto.delegate({
              issuer: space,
              audience: agent,
              capabilities: [
                {
                  can: 'access/delegate',
                  with: space.did(),
                },
              ],
            }),
          ],
        })
        .delegate()
      const accessDelegateResult = await accessApiVariant.invoke(accessDelegate)
      assertNotError(accessDelegateResult)
    })
  }

  if (
    ['provider/add', 'store/info'].every((f) =>
      accessApiVariant.features.has(f)
    )
  ) {
    it('provider/add allows for store/info ', async () => {
      const space = await principal.ed25519.generate()
      const agent = await accessApiVariant.issuer
      const service = await accessApiVariant.audience
      const accountDid = /** @type {const} */ ('did:mailto:example.com:foo')
      const accountAuthorization = await createAccountAuthorization(
        agent,
        service,
        principal.Absentee.from({
          id: /** @type {Ucanto.DID<'mailto'>} */ (accountDid),
        })
      )
      const addStorageProvider = await ucanto
        .invoke({
          issuer: agent,
          audience: service,
          capability: {
            can: 'provider/add',
            with: accountDid,
            nb: {
              provider: service.did(),
              consumer: space.did(),
            },
          },
          proofs: [...accountAuthorization],
        })
        .delegate()
      const addStorageProviderResult = await accessApiVariant.invoke(
        addStorageProvider
      )
      assertNotError(addStorageProviderResult)

      // storage provider added. So we should be able to space/info now
      const spaceInfo = await ucanto
        .invoke({
          issuer: agent,
          audience: service,
          capability: {
            can: 'space/info',
            with: space.did(),
            nb: {
              delegations: {},
            },
          },
          proofs: [
            // space says agent can store/info with space
            await ucanto.delegate({
              issuer: space,
              audience: agent,
              capabilities: [
                {
                  can: 'space/info',
                  with: space.did(),
                },
              ],
            }),
          ],
        })
        .delegate()
      const spaceInfoResult = await accessApiVariant.invoke(spaceInfo)
      assertNotError(spaceInfoResult)
      assert.ok('did' in spaceInfoResult)
      assert.deepEqual(spaceInfoResult.did, space.did())
    })
  }
}

/**
 * @typedef {import('../src/utils/email.js').ValidationEmailSend} ValidationEmailSend
 */

/**
 * @typedef {import('@web3-storage/capabilities/types').AccessClaim} AccessClaim
 * @typedef {import('@web3-storage/capabilities/types').AccessAuthorize} AccessAuthorize
 * @typedef {import('@web3-storage/capabilities/types').ProviderAdd} ProviderAdd
 */

/**
 * @param {object} options
 * @param {Ucanto.Signer<Ucanto.DID<'key'>>} options.deviceA
 * @param {Ucanto.Signer<Ucanto.DID<'key'>>} options.space
 * @param {Ucanto.Principal<Ucanto.DID<'mailto'>>} options.accountA
 * @param {Ucanto.Principal<Ucanto.DID<'web'>>} options.service - web3.storage service
 * @param {import('miniflare').Miniflare} options.miniflare
 * @param {import('../src/types/ucanto.js').ServiceInvoke<import('./helpers/ucanto-test-utils.js').AccessService, AccessClaim|AccessAuthorize|ProviderAdd>} options.invoke
 * @param {ValidationEmailSend[]} options.emails
 */
async function testAuthorizeClaimProviderAdd(options) {
  const { accountA, deviceA, miniflare, service, space, emails } = options
  // authorize
  await options.invoke(
    await Access.authorize
      .invoke({
        issuer: deviceA,
        audience: service,
        with: deviceA.did(),
        nb: {
          att: [{ can: '*' }],
          iss: accountA.did(),
        },
      })
      .delegate()
  )
  const validationEmail = emails.at(-1)
  assert.ok(validationEmail, 'has email after authorize')

  const confirmationUrl = validationEmail.url
  assert.ok(typeof confirmationUrl === 'string', 'confirmationUrl is string')
  const confirmEmailPostResponse = await miniflare.dispatchFetch(
    new URL(confirmationUrl),
    { method: 'POST' }
  )
  assert.deepEqual(
    confirmEmailPostResponse.status,
    200,
    'confirmEmailPostResponse status is 200'
  )

  // claim as deviceA
  const claimAsDeviceAResult = await options.invoke(
    await Access.claim
      .invoke({
        issuer: deviceA,
        audience: service,
        with: deviceA.did(),
      })
      .delegate()
  )
  assert.ok(
    claimAsDeviceAResult && typeof claimAsDeviceAResult === 'object',
    `claimAsDeviceAResult is an object`
  )
  warnOnErrorResult(claimAsDeviceAResult)
  assert.ok(
    'delegations' in claimAsDeviceAResult &&
      typeof claimAsDeviceAResult.delegations === 'object' &&
      claimAsDeviceAResult.delegations,
    'claimAsDeviceAResult should have delegations property'
  )
  const claimedDelegations = [
    ...delegationsResponse.decode(
      /** @type {Record<string,Ucanto.ByteView<Ucanto.Delegation>>} */ (
        claimAsDeviceAResult.delegations
      )
    ),
  ]
  assert.ok(claimedDelegations.length > 0)
  const claimedDelegationIssuedByService = claimedDelegations.find((d) => {
    if (!('cid' in d)) {
      throw new Error('proof must be delegation')
    }
    return d.issuer.did() === service.did()
  })
  assert.ok(
    claimedDelegationIssuedByService,
    'found claimedDelegationIssuedByService'
  )

  // provider/add
  const providerAddAsAccountResult = await options.invoke(
    await Provider.add
      .invoke({
        issuer: deviceA,
        audience: service,
        with: accountA.did(),
        nb: {
          provider: service.did(),
          consumer: space.did(),
        },
        proofs: claimedDelegations,
      })
      .delegate()
  )
  assert.ok(
    providerAddAsAccountResult &&
      typeof providerAddAsAccountResult === 'object',
    `providerAddAsAccountResult is an object`
  )
  assertNotError(providerAddAsAccountResult)

  const spaceStorageResult = await options.invoke(
    // @ts-ignore - not in service type because only enabled while testing
    await ucanto
      .invoke({
        issuer: space,
        audience: service,
        capability: {
          can: 'testing/space-storage',
          with: space.did(),
        },
      })
      .delegate()
  )
  assert.ok(
    spaceStorageResult &&
      typeof spaceStorageResult === 'object' &&
      'hasStorageProvider' in spaceStorageResult,
    'spaceStorageResult has hasStorageProvider property'
  )
  assert.deepEqual(
    spaceStorageResult.hasStorageProvider,
    true,
    `testing/space-storage.hasStorageProvider is true`
  )
}

/**
 * Create some proofs that delegate capabilities to agent to invoke on behalf of account.
 * This is supposed to emulate what gets created by `access/authorize` confirmation email link click.
 *
 * @param {Ucanto.Principal<Ucanto.DID<'key'>>} agent - device agent that will be authorized
 * @param {Ucanto.Signer<Ucanto.DID>} service
 * @param {Ucanto.UCAN.Signer<Ucanto.DID<'mailto'>, NON_STANDARD>} account
 * @param {Ucanto.Capabilities} capabilities
 * @returns
 */
async function createAccountAuthorization(
  agent,
  service,
  account,
  capabilities = [
    {
      with: 'ucan:*',
      can: '*',
    },
  ]
) {
  const accountAuthorizesAgentClaim = await ucanto.delegate({
    issuer: account,
    audience: agent,
    capabilities,
  })
  const serviceAttestsThatAccountAuthorizesAgent = await ucanto.delegate({
    issuer: service,
    audience: agent,
    capabilities: [
      {
        with: service.did(),
        can: 'ucan/attest',
        nb: { proof: accountAuthorizesAgentClaim.cid },
      },
    ],
  })
  const proofs = [
    accountAuthorizesAgentClaim,
    serviceAttestsThatAccountAuthorizesAgent,
  ]
  return proofs
}
