import { Queue } from './queue.js'

/**
 * @param {Map<string, unknown[]>} queuedMessages 
 */
export const getQueueImplementations = (
  queuedMessages,
  QueueImplementation = Queue
) => {
  queuedMessages.set('filecoinSubmitQueue', [])
  queuedMessages.set('pieceOfferQueue', [])
  const filecoinSubmitQueue = new QueueImplementation({
    onMessage: (message) => {
      const messages = queuedMessages.get('filecoinSubmitQueue') || []
      messages.push(message)
      queuedMessages.set('filecoinSubmitQueue', messages)
    },
  })
  const pieceOfferQueue = new QueueImplementation({
    onMessage: (message) => {
      const messages = queuedMessages.get('pieceOfferQueue') || []
      messages.push(message)
      queuedMessages.set('pieceOfferQueue', messages)
    },
  })
  return {
    storefront: {
      filecoinSubmitQueue,
      pieceOfferQueue
    }
  }
}
