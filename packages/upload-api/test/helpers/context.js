import * as Signer from '@ucanto/principal/ed25519'
import {
  getStoreImplementations,
  getQueueImplementations,
} from '@web3-storage/filecoin-api/test/context/service'
import { CarStoreBucket } from '../storage/car-store-bucket.js'
import { StoreTable } from '../storage/store-table.js'
import { UploadTable } from '../storage/upload-table.js'
import { DudewhereBucket } from '../storage/dude-where-bucket.js'
import { ProvisionsStorage } from '../storage/provisions-storage.js'
import { DelegationsStorage } from '../storage/delegations-storage.js'
import { RateLimitsStorage } from '../storage/rate-limits-storage.js'
import { RevocationsStorage } from '../storage/revocations-storage.js'
import * as Email from '../../src/utils/email.js'
import { create as createRevocationChecker } from '../../src/utils/revocation.js'
import { createServer, connect } from '../../src/lib.js'
import * as Types from '../../src/types.js'
import * as TestTypes from '../types.js'
import { confirmConfirmationUrl } from './utils.js'
import { PlansStorage } from '../storage/plans-storage.js'
import { UsageStorage } from '../storage/usage-storage.js'

/**
 * @param {object} options
 * @param {string[]} [options.providers]
 * @param {boolean} [options.requirePaymentPlan]
 * @param {import('http')} [options.http]
 * @param {{fail(error:unknown): unknown}} [options.assert]
 * @returns {Promise<Types.UcantoServerTestContext>}
 */
export const createContext = async (
  options = { requirePaymentPlan: false }
) => {
  const requirePaymentPlan = options.requirePaymentPlan
  const storeTable = new StoreTable()
  const uploadTable = new UploadTable()
  const carStoreBucket = await CarStoreBucket.activate(options)
  const dudewhereBucket = new DudewhereBucket()
  const revocationsStorage = new RevocationsStorage()
  const plansStorage = new PlansStorage()
  const usageStorage = new UsageStorage(storeTable)
  const signer = await Signer.generate()
  const aggregatorSigner = await Signer.generate()
  const id = signer.withDID('did:web:test.web3.storage')

  /** @type {Map<string, unknown[]>} */
  const queuedMessages = new Map()
  const {
    storefront: { filecoinSubmitQueue, pieceOfferQueue },
  } = getQueueImplementations(queuedMessages)
  const {
    storefront: { pieceStore, receiptStore, taskStore },
  } = getStoreImplementations()
  const email = Email.debug()

  /** @type { import('../../src/types.js').UcantoServerContext } */
  const serviceContext = {
    id,
    aggregatorId: aggregatorSigner,
    signer: id,
    email,
    url: new URL('http://localhost:8787'),
    provisionsStorage: new ProvisionsStorage(options.providers),
    delegationsStorage: new DelegationsStorage(),
    rateLimitsStorage: new RateLimitsStorage(),
    plansStorage,
    usageStorage,
    revocationsStorage,
    errorReporter: {
      catch(error) {
        if (options.assert) {
          options.assert.fail(error)
        } else {
          throw error
        }
      },
    },
    maxUploadSize: 5_000_000_000,
    storeTable,
    uploadTable,
    carStoreBucket,
    dudewhereBucket,
    filecoinSubmitQueue,
    pieceOfferQueue,
    pieceStore,
    receiptStore,
    taskStore,
    requirePaymentPlan,
    ...createRevocationChecker({ revocationsStorage }),
  }

  const connection = connect({
    id: serviceContext.id,
    channel: createServer(serviceContext),
  })

  return {
    ...serviceContext,
    mail: /** @type {TestTypes.DebugEmail} */ (serviceContext.email),
    service: /** @type {TestTypes.ServiceSigner} */ (serviceContext.id),
    connection,
    grantAccess: (mail) => confirmConfirmationUrl(connection, mail),
    fetch,
  }
}

/**
 *
 * @param {Types.UcantoServerTestContext} context
 */
export const cleanupContext = async (context) => {
  /** @type {CarStoreBucket & {  deactivate: () => Promise<void> }}} */
  // @ts-ignore type misses S3 bucket properties like accessKey
  const store = context.carStoreBucket

  await store.deactivate()
}
