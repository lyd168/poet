import { Block } from 'poet-js'

import { BlockchainService } from '../blockchain/domainService'
import { Queue } from '../queue'
import { BlockMetadata } from '../events'
import { getConnection } from '../blockchain/connection'

async function startListening() {
  const blockchain = new BlockchainService()
  const queue = new Queue()

  await blockchain.start(() => getConnection())

  const setupWorker = (name: string, action: any) => {
    process.nextTick(() => {
      queue.workThread(name, action).catch(error => {
        console.log(error, error.stack)
      })
    })
  }

  queue.normalizedTransaction().subscribeOnNext(async (normalizedData) => {
    console.log('Processing', normalizedData)
    try {
      const result = await blockchain.normalizedRepository.persist(blockchain.normalizedRepository.create({
        ...normalizedData,
        confirmed: true
      }))
    } catch (e) {
      console.log('Could not process', normalizedData, e)
    }
  })

  setupWorker('blockRetry', async (block: Block) => {
    return await blockchain.blockSeen(block)
  })
  setupWorker('confirmRetry', async (block: BlockMetadata) => {
    return await blockchain.blockConfirmed(block)
  })
}

if (!module.parent) {
  startListening().catch(error => {
    console.log(error, error.stack)
  })
}