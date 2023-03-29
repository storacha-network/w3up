import { Base } from '../base.js'
import { claimAccess, authorizeWaitAndClaim } from '@web3-storage/access/agent'

/**
 * Client for interacting with the `access/*` capabilities.
 */
export class AccessClient extends Base {
  /* c8 ignore start - testing websocket code is hard */
  /**
   * Authorize the current agent to use capabilities granted to the passed
   * email account.
   *
   * @param {`${string}@${string}`} email
   * @param {object} [options]
   * @param {AbortSignal} [options.signal]
   * @param {Iterable<{ can: import('../types').Ability }>} [options.capabilities]
   */
  async authorize(email, options) {
    return authorizeWaitAndClaim(this._agent, email, options)
  }
  /* c8 ignore stop */

  /**
   * Claim delegations granted to the account associated with this agent.
   */
  async claim() {
    return claimAccess(this._agent, this._agent.issuer.did(), {
      addProofs: true,
    })
  }
}
