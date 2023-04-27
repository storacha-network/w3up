import * as API from '../api.js'
import * as Authorize from './access-authorize.js'
import * as Delegate from './access-delegate.js'
import * as Claim from './access-claim.js'
import * as Confirm from './access-confirm.js'

/**
 * @param {API.RouteContext} context
 */
export const provide = (context) => ({
  authorize: Authorize.provide(context),
  delegate: Delegate.provide(context),
  claim: Claim.provide(context),
  confirm: Confirm.provide(context),
})
