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
import { capability, URI, DID } from '@ucanto/validator'
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
