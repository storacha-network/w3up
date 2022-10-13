/**
 * @typedef {{account: string, proof: string}} AccountValue
 */

/**
 * Accounts
 */
export class Accounts {
  /**
   *
   * @param {KVNamespace} kv
   */
  constructor(kv) {
    this.kv = kv
  }

  /**
   *
   * @param {string} issuerDID
   * @param {string} resourceDID
   * @param {import('@ucanto/interface').Link} proof
   */
  async register(issuerDID, resourceDID, proof) {
    const did = await this.get(issuerDID)
    if (did) {
      throw new Error(`did: ${issuerDID} already registered.`)
    }
    const account = `did:ipld:${proof}`
    await this.kv.put(
      issuerDID,
      JSON.stringify({ account, proof: proof.toString() })
    )
    await this.kv.put(
      resourceDID,
      JSON.stringify({ account, proof: proof.toString() })
    )
  }

  /**
   * @param {string} did
   */
  async get(did) {
    const value = /** @type {AccountValue} */ (
      await this.kv.get(did, {
        type: 'json',
      })
    )

    if (value) {
      return value
    }
  }
}
