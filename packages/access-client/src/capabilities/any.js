import { capability, URI } from '@ucanto/validator'
import { equalWith } from './utils.js'

/**
 * Represents `{ can: '*', with: 'did:key:zAlice' }` capability, which we often
 * also call account linking.
 */
export const any = capability({
  can: '*',
  with: URI.match({ protocol: 'did:' }),
  derives: equalWith,
})
