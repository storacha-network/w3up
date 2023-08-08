import * as Provider from './provider.js'
import * as Space from './space.js'
import * as Top from './top.js'
import * as Store from './store.js'
import * as Upload from './upload.js'
import * as Voucher from './voucher.js'
import * as Access from './access.js'
import * as Utils from './utils.js'
import * as Consumer from './consumer.js'
import * as Customer from './customer.js'
import * as Console from './console.js'
import * as Filecoin from './filecoin.js'

export {
  Access,
  Provider,
  Space,
  Top,
  Store,
  Upload,
  Voucher,
  Consumer,
  Customer,
  Console,
  Utils,
  Filecoin,
}

/** @type {import('./types.js').AbilitiesArray} */
export const abilitiesAsStrings = [
  Top.top.can,
  Provider.add.can,
  Space.space.can,
  Space.info.can,
  Space.recover.can,
  Space.recoverValidation.can,
  Upload.upload.can,
  Upload.add.can,
  Upload.remove.can,
  Upload.list.can,
  Store.store.can,
  Store.add.can,
  Store.remove.can,
  Store.list.can,
  Voucher.claim.can,
  Voucher.redeem.can,
  Access.access.can,
  Access.authorize.can,
  Access.session.can,
  Filecoin.filecoinAdd.can,
  Filecoin.aggregateAdd.can,
  Filecoin.dealAdd.can,
  Filecoin.chainTrackerInfo.can,
]
