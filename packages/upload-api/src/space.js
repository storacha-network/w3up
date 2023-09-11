import { Space } from '@web3-storage/capabilities'
import { DID } from '@ucanto/validator'
import * as Provider from '@ucanto/server'
import * as API from './types.js'

/**
 * @param {API.Input<Space.info>} input
 * @param {API.SpaceServiceContext} ctx
 * @returns {Promise<API.Result<API.SpaceInfoSuccess, API.SpaceInfoFailure>>}
 */
export const info = async ({ capability }, ctx) => {
  const { provisionsStorage: provisions } = ctx

  const spaceDid = capability.with
  if (!DID.match({ method: 'key' }).is(spaceDid)) {
    /** @type {API.SpaceUnknown} */
    const unexpectedSpaceDidFailure = {
      name: 'SpaceUnknown',
      message: `can only get info for did:key spaces`,
    }
    return {
      error: unexpectedSpaceDidFailure,
    }
  }

  const result = await provisions.getStorageProviders(spaceDid)
  const providers = result.ok
  if (providers && providers.length > 0) {
    return {
      ok: {
        did: spaceDid,
        providers,
      },
    }
  }

  /** @type {import('@web3-storage/access/types').SpaceUnknown} */
  const spaceUnknownFailure = {
    name: 'SpaceUnknown',
    message: `Space not found.`,
  }
  return {
    error: spaceUnknownFailure,
  }
}

/**
 * @param {API.SpaceServiceContext} ctx
 */
export const createService = (ctx) => ({
  info: Provider.provide(Space.info, (input) => info(input, ctx)),
})
