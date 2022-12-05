/* eslint-disable max-depth */
import * as DID from '@ipld/dag-ucan/did'
import * as Client from '@ucanto/client'
// @ts-ignore
// eslint-disable-next-line no-unused-vars
import * as Ucanto from '@ucanto/interface'
import * as CAR from '@ucanto/transport/car'
import * as CBOR from '@ucanto/transport/cbor'
import * as HTTP from '@ucanto/transport/http'
import { URI } from '@ucanto/validator'
import { Peer } from './awake/peer.js'
import * as Space from '@web3-storage/capabilities/space'
import * as Voucher from '@web3-storage/capabilities/voucher'
import { stringToDelegation } from './encoding.js'
import { Websocket, AbortError } from './utils/ws.js'
import { Signer } from '@ucanto/principal/ed25519'
import { Verifier } from '@ucanto/principal'
import { invoke, delegate } from '@ucanto/core'
import {
  isExpired,
  isTooEarly,
  validate,
  canDelegateCapability,
} from './delegations.js'

const HOST = 'https://access.web3.storage'

/**
 * Creates a Ucanto connection for the w3access API
 *
 * Usage:
 *
 * ```js
 * import { connection } from '@web3-storage/access/agent'
 * ```
 *
 * @template {string} T - DID method
 * @param {Ucanto.Principal<T>} principal - w3access API Principal
 * @param {typeof fetch} _fetch - fetch implementation to use
 * @param {URL} url - w3access API URL
 * @param {Ucanto.Transport.Channel<import('./types').Service>} [channel] - Ucanto channel to use
 * @returns {Ucanto.ConnectionView<import('./types').Service>}
 */
export function connection(principal, _fetch, url, channel) {
  const _channel =
    channel ||
    HTTP.open({
      url,
      method: 'POST',
      fetch: _fetch,
    })
  const connection = Client.connect({
    id: principal,
    encoder: CAR,
    decoder: CBOR,
    channel: _channel,
  })

  return connection
}

/**
 * Agent
 *
 * Usage:
 *
 * ```js
 * import { Agent } from '@web3-storage/access/agent'
 * ```
 *
 * @template {Ucanto.Signer} T - Ucanto Signer ie. ed25519, RSA or others
 */
export class Agent {
  /** @type {Ucanto.Principal<"key">|undefined} */
  #service

  /** @type {typeof fetch} */
  #fetch

  /** @type {import('./types').AgentData<T>} */
  #data

  /**
   * @param {import('./types').AgentOptions<T>} opts
   */
  constructor(opts) {
    this.url = opts.url || new URL(HOST)
    this.connection = opts.connection
    this.issuer = opts.data.principal
    this.meta = opts.data.meta
    this.store = opts.store

    // private
    this.#data = opts.data
    this.#fetch = opts.fetch
    this.#service = undefined
  }

  /**
   * @template {Ucanto.Signer} T
   * @param {import('./types').AgentCreateOptions<T>} opts
   */
  static async create(opts) {
    let _fetch = opts.fetch
    const url = opts.url || new URL(HOST)

    // validate fetch implementation
    if (!_fetch) {
      if (typeof globalThis.fetch !== 'undefined') {
        _fetch = globalThis.fetch.bind(globalThis)
      } else {
        throw new TypeError(
          `Agent got undefined \`fetch\`. Try passing in a \`fetch\` implementation explicitly.`
        )
      }
    }

    if (!(await opts.store.exists())) {
      throw new Error('Store is not initialized, run "Store.init()" first.')
    }
    const data = await opts.store.load()
    return new Agent({
      connection: await connection(data.principal, _fetch, url, opts.channel),
      fetch: _fetch,
      url,
      store: opts.store,
      data,
    })
  }

  get spaces() {
    return this.#data.spaces
  }

  async service() {
    if (this.#service) {
      return this.#service
    }
    const rsp = await this.#fetch(this.url + 'version')
    const { did } = await rsp.json()
    this.#service = DID.parse(did)
    return this.#service
  }

  did() {
    return this.#data.principal.did()
  }

  /**
   * Add a proof to the agent store
   *
   * A proof is a delegation with an audience matching agent DID
   *
   * @param {Ucanto.Delegation} delegation
   */
  async addProof(delegation) {
    validate(delegation, {
      checkAudience: this.issuer,
      checkIsExpired: true,
    })

    this.#data.delegations.set(delegation.cid.toString(), {
      delegation,
      meta: { audience: this.meta },
    })

    await this.store.save(this.#data)
  }

  /**
   * Query the delegations store for all the delegations matching the capabilities provided.
   *
   * @param {import('@ucanto/interface').Capability[]} [caps]
   */
  async *#delegations(caps) {
    const _caps = new Set(caps)
    for (const [key, value] of this.#data.delegations) {
      // check expiration
      if (!isExpired(value.delegation)) {
        // check if delegation can be used
        if (!isTooEarly(value.delegation)) {
          // check if we need to filter for caps
          if (Array.isArray(caps) && caps.length > 0) {
            for (const cap of _caps) {
              if (canDelegateCapability(value.delegation, cap)) {
                _caps.delete(cap)
                yield value
              }
            }
          } else {
            yield value
          }
        }
      } else {
        // delete any expired delegation
        this.#data.delegations.delete(key)
      }
    }

    await this.store.save(this.#data)
  }

  /**
   * Get all the proofs matching the capabilities
   *
   * Proofs are delegations with an audience matching agent DID.
   *
   * @param {import('@ucanto/interface').Capability[]} [caps] - Capabilities to filter by. Empty or undefined caps with return all the proofs.
   */
  async proofs(caps) {
    const arr = []

    for await (const value of this.#delegations(caps)) {
      if (value.delegation.audience.did() === this.issuer.did()) {
        arr.push(value.delegation)
      }
    }

    return arr
  }

  /**
   * Get delegations created by the agent for others.
   *
   * @param {import('@ucanto/interface').Capability[]} [caps] - Capabilities to filter by. Empty or undefined caps with return all the delegations.
   */
  async *delegations(caps) {
    for await (const { delegation } of this.delegationsWithMeta(caps)) {
      yield delegation
    }
  }

  /**
   * Get delegations created by the agent for others and their metadata.
   *
   * @param {import('@ucanto/interface').Capability[]} [caps] - Capabilities to filter by. Empty or undefined caps with return all the delegations.
   */
  async *delegationsWithMeta(caps) {
    for await (const value of this.#delegations(caps)) {
      if (value.delegation.audience.did() !== this.issuer.did()) {
        yield value
      }
    }
  }

  /**
   * Creates a space signer and a delegation to the agent
   *
   * @param {string} [name]
   */
  async createSpace(name) {
    const signer = await Signer.generate()
    const proof = await Space.top.delegate({
      issuer: signer,
      audience: this.issuer,
      with: signer.did(),
      expiration: Infinity,
    })

    const meta = {
      name,
      isRegistered: false,
    }
    this.#data.spaces.set(signer.did(), meta)

    await this.addProof(proof)

    return {
      did: signer.did(),
      meta,
      proof,
    }
  }

  /**
   * Import a space from a '*' delegation
   *
   * @param {Ucanto.Delegation} delegation
   */
  async importSpaceFromDelegation(delegation) {
    if (delegation.capabilities[0].can !== '*') {
      throw new Error(
        'Space can only be import with full capabilities delegation.'
      )
    }

    const meta = /** @type {import('./types').SpaceMeta} */ (
      delegation.facts[0].space
    )
    const del = /** @type {Ucanto.Delegation<[import('./types').Top]>} */ (
      delegation
    )
    // @ts-ignore
    const did = Verifier.parse(del.capabilities[0].with).did()

    this.#data.spaces.set(did, meta)

    await this.addProof(del)

    return {
      did,
      meta,
      proof: del,
    }
  }

  /**
   *
   * @param {string} email
   * @param {object} [opts]
   * @param {AbortSignal} [opts.signal]
   */
  async recover(email, opts) {
    const service = await this.service()
    const inv = await this.invokeAndExecute(Space.recoverValidation, {
      with: URI.from(this.did()),
      nb: { identity: URI.from(`mailto:${email}`) },
    })

    if (inv && inv.error) {
      throw new Error('Recover validation failed', { cause: inv })
    }

    const spaceRecover =
      /** @type {Ucanto.Delegation<[import('./types').SpaceRecover]>} */ (
        await this.#waitForDelegation(opts)
      )
    await this.addProof(spaceRecover)

    const recoverInv = await this.invokeAndExecute(Space.recover, {
      with: URI.from(service.did()),
      nb: {
        identity: URI.from(`mailto:${email}`),
      },
    })

    if (recoverInv && recoverInv.error) {
      throw new Error('Spaces recover failed', { cause: recoverInv })
    }

    const dels = []
    for (const del of recoverInv) {
      dels.push(await stringToDelegation(del))
    }

    return dels
  }

  /**
   * Sets the current selected space
   *
   * Other methods will default to use the current space if no resource is defined
   *
   * @param {Ucanto.DID} space
   */
  async setCurrentSpace(space) {
    const proofs = await this.proofs([
      {
        can: 'space/info',
        with: space,
      },
    ])

    if (proofs.length === 0) {
      throw new Error(`Agent has no proofs for ${space}.`)
    }

    this.#data.currentSpace = space
    await this.store.save(this.#data)

    return space
  }

  /**
   * Get current space DID
   */
  currentSpace() {
    return this.#data.currentSpace
  }

  /**
   * Get current space DID, proofs and abilities
   */
  async currentSpaceWithMeta() {
    if (!this.#data.currentSpace) {
      return
    }

    // TODO cache these
    const proofs = await this.proofs([
      {
        can: 'space/info',
        with: this.#data.currentSpace,
      },
    ])

    const caps = new Set()
    for (const p of proofs) {
      for (const cap of p.capabilities) {
        caps.add(cap.can)
      }
    }

    return {
      did: this.#data.currentSpace,
      proofs,
      capabilities: [...caps],
      meta: this.#data.spaces.get(this.#data.currentSpace),
    }
  }

  /**
   * Invokes voucher/redeem for the free tier, wait on the websocket for the voucher/claim and invokes it
   *
   * It also adds a full space delegation to the service in the voucher/claim invocation to allow for recovery
   *
   * @param {string} email
   * @param {object} [opts]
   * @param {AbortSignal} [opts.signal]
   */
  async registerSpace(email, opts) {
    const space = this.currentSpace()
    const service = await this.service()
    const spaceMeta = space ? this.#data.spaces.get(space) : undefined

    if (!space || !spaceMeta) {
      throw new Error('No space selected')
    }

    if (spaceMeta && spaceMeta.isRegistered) {
      throw new Error('Space already registered with web3.storage.')
    }

    const inv = await this.invokeAndExecute(Voucher.claim, {
      nb: {
        identity: URI.from(`mailto:${email}`),
        product: 'product:free',
        service: service.did(),
      },
    })

    if (inv && inv.error) {
      throw new Error('Voucher claim failed', { cause: inv })
    }

    const voucherRedeem =
      /** @type {Ucanto.Delegation<[import('./types').VoucherRedeem]>} */ (
        await this.#waitForDelegation(opts)
      )
    await this.addProof(voucherRedeem)
    const delegationToService = await this.delegate({
      abilities: ['*'],
      audience: service,
      expiration: Infinity,
      audienceMeta: {
        name: 'w3access',
        type: 'service',
      },
    })

    const accInv = await this.invokeAndExecute(Voucher.redeem, {
      with: URI.from(service.did()),
      nb: {
        space,
        identity: voucherRedeem.capabilities[0].nb.identity,
        product: voucherRedeem.capabilities[0].nb.product,
      },
      proofs: [delegationToService],
      facts: [
        {
          space: spaceMeta,
          agent: this.meta,
        },
      ],
    })

    if (accInv && accInv.error) {
      throw new Error('Space registration failed', { cause: accInv })
    }

    spaceMeta.isRegistered = true

    this.#data.spaces.set(space, spaceMeta)
    this.#data.delegations.delete(voucherRedeem.cid.toString())

    this.store.save(this.#data)
  }

  /**
   *
   * @param {object} [opts]
   * @param {AbortSignal} [opts.signal]
   */
  async #waitForDelegation(opts) {
    const ws = new Websocket(this.url, 'validate-ws')
    await ws.open()

    ws.send({
      did: this.did(),
    })

    try {
      const msg = await ws.awaitMsg(opts)

      if (msg.type === 'timeout') {
        await ws.close()
        throw new Error('Email validation timed out.')
      }

      if (msg.type === 'delegation') {
        const delegation = await stringToDelegation(msg.delegation)
        ws.close()
        return delegation
      }
    } catch (error) {
      if (error instanceof AbortError) {
        await ws.close()
        throw new TypeError('Failed to get delegation', { cause: error })
      }
    }
    throw new TypeError('Failed to get delegation')
  }

  /**
   *
   * @param {import('./types').DelegationOptions} options
   */
  async delegate(options) {
    const space = await this.currentSpaceWithMeta()
    if (!space) {
      throw new Error('there no space selected.')
    }

    const caps = /** @type {Ucanto.Capabilities} */ (
      options.abilities.map((a) => {
        return {
          with: space.did,
          can: a,
        }
      })
    )

    const delegation = await delegate({
      issuer: this.issuer,
      capabilities: caps,
      proofs: await this.proofs(caps),
      facts: [{ space: space.meta }],
      ...options,
    })

    this.#data.delegations.set(delegation.cid.toString(), {
      delegation,
      meta: {
        audience: options.audienceMeta,
      },
    })
    await this.store.save(this.#data)
    return delegation
  }

  /**
   * Invoke and execute the given capability on the Access service connection
   *
   * ```js
   *
   * await agent.invokeAndExecute(Space.recover, {
   *   nb: {
   *     identity: 'mailto: email@gmail.com',
   *   },
   * })
   *
   * // sugar for
   * const recoverInvocation = await agent.invoke(Space.recover, {
   *   nb: {
   *     identity: 'mailto: email@gmail.com',
   *   },
   * })
   *
   * await recoverInvocation.execute(agent.connection)
   * ```
   *
   * @template {Ucanto.Ability} A
   * @template {Ucanto.URI} R
   * @template {Ucanto.TheCapabilityParser<Ucanto.CapabilityMatch<A, R, C>>} CAP
   * @template {Ucanto.Caveats} [C={}]
   * @param {CAP} cap
   * @param {import('./types').InvokeOptions<A, R, CAP>} options
   */
  async invokeAndExecute(cap, options) {
    const inv = await this.invoke(cap, options)

    // @ts-ignore
    const out = inv.execute(this.connection)

    return /** @type {Promise<Ucanto.InferServiceInvocationReturn<Ucanto.InferInvokedCapability<CAP>, import('./types').Service>>} */ (
      out
    )
  }

  /**
   * Execute invocations on the agent's connection
   *
   * @example
   * ```js
   * const i1 = await agent.invoke(Space.info, {})
   * const i2 = await agent.invoke(Space.recover, {
   *   nb: {
   *     identity: 'mailto:hello@web3.storage',
   *   },
   * })
   *
   * const results = await agent.execute2(i1, i2)
   *
   * ```
   * @template {Ucanto.Capability} C
   * @template {Ucanto.Tuple<Ucanto.ServiceInvocation<C, import('./types').Service>>} I
   * @param {I} invocations
   */
  execute(...invocations) {
    return this.connection.execute(...invocations)
  }

  /**
   * Creates an invocation for the given capability with Agent's proofs, service, issuer and space.
   *
   * @example
   * ```js
   * const recoverInvocation = await agent.invoke(Space.recover, {
   *   nb: {
   *     identity: 'mailto: email@gmail.com',
   *   },
   * })
   *
   * await recoverInvocation.execute(agent.connection)
   * // or
   * await agent.execute(recoverInvocation)
   * ```
   *
   * @template {Ucanto.Ability} A
   * @template {Ucanto.URI} R
   * @template {Ucanto.TheCapabilityParser<Ucanto.CapabilityMatch<A, R, C>>} CAP
   * @template {Ucanto.Caveats} [C={}]
   * @param {CAP} cap
   * @param {import('./types').InvokeOptions<A, R, CAP>} options
   */
  async invoke(cap, options) {
    const space = options.with || this.currentSpace()
    if (!space) {
      throw new Error('No space selected, you need pass a resource.')
    }

    const proofs = await this.proofs([
      {
        with: space,
        can: cap.can,
      },
    ])

    if (proofs.length === 0 && options.with !== this.did()) {
      throw new Error(
        `no proofs available for resource ${space} and ability ${cap.can}`
      )
    }

    const extraProofs = options.proofs || []
    const inv = invoke({
      ...options,
      audience: options.audience || (await this.service()),
      // @ts-ignore
      capability: cap.create({
        with: space,
        nb: options.nb,
      }),
      issuer: this.issuer,
      proofs: [...proofs, ...extraProofs],
    })

    return /** @type {Ucanto.IssuedInvocationView<Ucanto.InferInvokedCapability<CAP>>} */ (
      inv
    )
  }

  /**
   *
   * @param {import('../src/awake/types').Channel} channel
   */
  peer(channel) {
    return new Peer({ agent: this, channel })
  }

  /**
   * Get Space information from Access service
   *
   * @param {Ucanto.URI<"did:">} [space]
   */
  async getSpaceInfo(space) {
    const _space = space || this.currentSpace()
    if (!_space) {
      throw new Error('No space selected, you need pass a resource.')
    }
    const inv = await this.invokeAndExecute(Space.info, {
      with: _space,
    })

    if (inv.error) {
      throw inv
    }

    return inv
  }
}
