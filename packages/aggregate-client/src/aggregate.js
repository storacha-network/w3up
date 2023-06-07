import * as AggregateCapabilities from '@web3-storage/capabilities/aggregate'
import { CBOR, parseLink } from '@ucanto/core'

import { servicePrincipal, connection } from './service.js'

export const MIN_SIZE = 1 + 127 * (1 << 27)
export const MAX_SIZE = 127 * (1 << 28)

/**
 * Offer an aggregate to be assembled and stored.
 *
 * @param {import('./types').InvocationConfig} conf - Configuration
 * @param {import('./types').Offer[]} offers
 * @param {import('./types').RequestOptions} [options]
 */
export async function aggregateOffer(
  { issuer, with: resource, proofs, audience },
  offers,
  options = {}
) {
  /* c8 ignore next */
  const conn = options.connection ?? connection

  // TODO: Get commitmentProof
  const commitmentProof = parseLink(
    'baga6ea4seaqm2u43527zehkqqcpyyopgsw2c4mapyy2vbqzqouqtzhxtacueeki'
  )

  // Validate size for offer is valid
  const size = offers.reduce((accum, offer) => accum + offer.size, 0)
  const block = await CBOR.write(offers)
  const invocation = AggregateCapabilities.offer.invoke({
    issuer,
    /* c8 ignore next */
    audience: audience ?? servicePrincipal,
    with: resource,
    nb: {
      offer: block.cid,
      commitmentProof,
      size,
    },
    proofs,
  })
  invocation.attach(block)

  return await invocation.execute(conn)
}

/**
 * Get details of an aggregate.
 *
 * @param {import('./types').InvocationConfig} conf - Configuration
 * @param {import('@ucanto/interface').Link<unknown, number, number, 0 | 1>} commitmentProof
 * @param {import('./types').RequestOptions} [options]
 */
export async function aggregateGet(
  { issuer, with: resource, proofs, audience },
  commitmentProof,
  options = {}
) {
  /* c8 ignore next */
  const conn = options.connection ?? connection

  return await AggregateCapabilities.get
    .invoke({
      issuer,
      /* c8 ignore next */
      audience: audience ?? servicePrincipal,
      with: resource,
      nb: {
        commitmentProof: commitmentProof,
      },
      proofs,
    })
    .execute(conn)
}
