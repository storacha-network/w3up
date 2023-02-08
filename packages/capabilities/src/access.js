/**
 * Access Capabilities
 *
 * These can be imported directly with:
 * ```js
 * import * as Access from '@web3-storage/capabilities/access'
 * ```
 *
 * @module
 */
import { capability, URI, DID, Schema, Failure } from '@ucanto/validator'
// @ts-ignore
// eslint-disable-next-line no-unused-vars
import * as Types from '@ucanto/interface'
import { equalWith, fail, equal } from './utils.js'
import { top } from './top.js'

export { top }

/**
 * Account identifier.
 */
export const As = DID.match({ method: 'mailto' })

/**
 * Capability can only be delegated (but not invoked) allowing audience to
 * derived any `access/` prefixed capability for the agent identified
 * by did:key in the `with` field.
 */
export const access = top.derive({
  to: capability({
    can: 'access/*',
    with: URI.match({ protocol: 'did:' }),
  }),
  derives: equalWith,
})

const base = top.or(access)

/**
 * Capability can be invoked by an agent to request a `./update` for an account.
 *
 * `with` field identifies requesting agent, which MAY be different from iss field identifying issuing agent.
 */
export const authorize = base.derive({
  to: capability({
    can: 'access/authorize',
    with: DID.match({ method: 'key' }),
    nb: {
      /**
       * Value MUST be a did:mailto identifier of the account
       * that the agent wishes to represent via did:key in the `with` field.
       * It MUST be a valid did:mailto identifier.
       */
      as: As,
    },
    derives: (child, parent) => {
      return (
        fail(equalWith(child, parent)) ||
        fail(equal(child.nb.as, parent.nb.as, 'as')) ||
        true
      )
    },
  }),
  /**
   * `access/authorize` can be derived from the `access/*` & `*` capability
   * as long as the `with` fields match.
   */
  derives: equalWith,
})

/**
 * Issued by trusted authority (usually the one handling invocation that contains this proof) 
 * to the account (aud) to update invocation local state of the document.
 *
 * @see https://github.com/web3-storage/specs/blob/main/w3-account.md#update
 * 
 * @example
 * ```js
 * {
    iss: "did:web:web3.storage",
    aud: "did:mailto:alice@web.mail",
    att: [{
      with: "did:web:web3.storage",
      can: "./update",
      nb: { key: "did:key:zAgent" }
    }],
    exp: null
    sig: "..."
  }
 * ```
 */
export const session = capability({
  can: './update',
  // Should be web3.storage DID
  with: URI.match({ protocol: 'did:' }),
  nb: {
    // Agent DID so it can sign UCANs as did:mailto if it matches this delegation `aud`
    key: DID.match({ method: 'key' }),
  },
})

export const claim = base.derive({
  to: capability({
    can: 'access/claim',
    with: DID.match({ method: 'key' }).or(DID.match({ method: 'mailto' })),
    derives: equalWith,
  }),
  derives: equalWith,
})

// https://github.com/web3-storage/specs/blob/main/w3-access.md#accessdelegate
export const delegate = base.derive({
  to: capability({
    can: 'access/delegate',
    /**
     * Field MUST be a space DID with a storage provider. Delegation will be stored just like any other DAG stored using store/add capability.
     *
     * @see https://github.com/web3-storage/specs/blob/main/w3-access.md#delegate-with
     */
    with: DID.match({ method: 'key' }),
    nb: {
      // keys SHOULD be CIDs, but we won't require it in the schema
      /**
       * @type {Schema.Schema<AccessDelegateDelegations>}
       */
      delegations: Schema.dictionary({
        value: Schema.Link.match(),
      }),
    },
    derives: (claim, proof) => {
      return (
        fail(equalWith(claim, proof)) ||
        fail(subsetsNbDelegations(claim, proof)) ||
        true
      )
    },
  }),
  derives: (claim, proof) => {
    // no need to check claim.nb.delegations is subset of proof
    // because the proofs types here never include constraints on the nb.delegations set
    return fail(equalWith(claim, proof)) || true
  },
})

/**
 * @typedef {Schema.Dictionary<string, Types.Link<unknown, number, number, 0 | 1>>} AccessDelegateDelegations
 */

/**
 * Parsed Capability for access/delegate
 *
 * @typedef {object} ParsedAccessDelegate
 * @property {string} can
 * @property {object} nb
 * @property {AccessDelegateDelegations} [nb.delegations]
 */

/**
 * returns whether the claimed ucan is proves by the proof ucan.
 * both are access/delegate, or at least have same semantics for `nb.delegations`, which is a set of delegations.
 * checks that the claimed delegation set is equal to or less than the proven delegation set.
 * usable with {import('@ucanto/interface').Derives}.
 *
 * @param {ParsedAccessDelegate} claim
 * @param {ParsedAccessDelegate} proof
 */
function subsetsNbDelegations(claim, proof) {
  const missingProofs = setDifference(
    delegatedCids(claim),
    new Set(delegatedCids(proof))
  )
  if (missingProofs.size > 0) {
    return new Failure(
      `unauthorized nb.delegations ${[...missingProofs].join(', ')}`
    )
  }
  return true
}

/**
 * iterate delegated UCAN CIDs from an access/delegate capability.nb.delegations value.
 *
 * @param {ParsedAccessDelegate} delegate
 * @returns {Iterable<string>}
 */
function* delegatedCids(delegate) {
  for (const d of Object.values(delegate.nb.delegations || {})) {
    yield d.toString()
  }
}

/**
 * @template S
 * @param {Iterable<S>} minuend - set to subtract from
 * @param {Set<S>} subtrahend - subtracted from minuend
 */
function setDifference(minuend, subtrahend) {
  /** @type {Set<S>} */
  const difference = new Set()
  for (const e of minuend) {
    if (!subtrahend.has(e)) {
      difference.add(e)
    }
  }
  return difference
}
