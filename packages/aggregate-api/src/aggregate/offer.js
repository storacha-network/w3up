import * as Server from '@ucanto/server'
import { CBOR } from '@ucanto/core'
import * as Aggregate from '@web3-storage/capabilities/aggregate'
import * as Offer from '@web3-storage/capabilities/offer'
import * as API from '../types.js'

export const MIN_SIZE = 1 + 127 * (1 << 27)
export const MAX_SIZE = 127 * (1 << 28)

/**
 * @param {API.AggregateServiceContext} context
 */
export const provide = (context) =>
  Server.provideAdvanced({
    capability: Aggregate.offer,
    handler: (input) => claim(input, context)
  })

/**
 * @param {API.Input<Aggregate.offer>} input
 * @param {API.AggregateServiceContext} context
 * @returns {Promise<API.UcantoInterface.Result<API.AggregateOfferSuccess, API.AggregateOfferFailure> | API.UcantoInterface.JoinBuilder<API.AggregateOfferSuccess>>}
 */
export const claim = async ({ capability, invocation, context }, { offerStore }) => {
  // Get offer block
  const offerCid = capability.nb.offer
  const commitmentProof = capability.nb.commitmentProof
  const offers = getOfferBlock(offerCid, invocation)

  if (!offers) {
    return {
      error: new AggregateOfferBlockNotFoundError(
        `inline offer block for offer cid ${offerCid.toString()} was not provided`
      ),
    }
  }

  // Validate offer content
  const size = offers.reduce((accum, offer) => accum + offer.size, 0)
  if (size < MIN_SIZE) {
    return {
      error: new AggregateOfferInvalidSizeError(
        `provided size is not enough to create an offer (${size} < ${MIN_SIZE})`
      ),
    }
  } else if (size > MAX_SIZE) {
    return {
      error: new AggregateOfferInvalidSizeError(
        `provided size is larger than it can be accepted for an offer (${size} > ${MAX_SIZE})`
      ),
    }
  } else if (size !== capability.nb.size) {
    return {
      error: new AggregateOfferInvalidSizeError(
        `provided size ${capability.nb.size} does not match computed size ${size}`
      ),
    }
  }

  // TODO: Validate commP

  // Create effect for receipt
  const fx = await Offer.arrange
  .invoke({
    issuer: context.id,
    audience: context.id,
    with: context.id.did(),
    nb: {
      commitmentProof,
    },
  })
  .delegate()

  // Write offer to store
  await offerStore.queue({ commitmentProof, offers })

  return Server.ok({
    status: 'queued',
  }).join(fx.link())
}

/**
 * @param {Server.API.Link<unknown, number, number, 0 | 1>} offerCid
 * @param {Server.API.Invocation<Server.API.Capability<"aggregate/offer", Server.API.URI<"did:">, Pick<{ offer: Server.API.Link<unknown, number, number, 0 | 1>; commitmentProof: string; size: number & Server.API.Phantom<{ typeof: "integer"; }>; }, "offer" | "commitmentProof" | "size">>>} invocation
 */
function getOfferBlock(offerCid, invocation) {
  for (const block of invocation.iterateIPLDBlocks()) {
    if (block.cid.equals(offerCid)) {
      const decoded =
        /** @type {import('@web3-storage/aggregate-client/types').Offer[]} */ (
          CBOR.decode(block.bytes)
        )
      return decoded
      // TODO: Validate with schema
    }
  }
}

class AggregateOfferInvalidSizeError extends Server.Failure {
  get name() {
    return /** @type {const} */ ('AggregateOfferInvalidSizeFailure')
  }
}

class AggregateOfferBlockNotFoundError extends Server.Failure {
  get name() {
    return /** @type {const} */ ('AggregateOfferBlockNotFoundFailure')
  }
}
