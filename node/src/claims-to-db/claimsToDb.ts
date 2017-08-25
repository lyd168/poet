import { Block } from 'poet-js'

import { BlockchainService } from '../blockchain/domainService'
import { Queue } from '../queue'
import { BitcoinBlockMetadata } from '../events'
import { getConnection } from '../blockchain/connection'

export async function startListening() {
  const blockchain = new BlockchainService()
  const queue = new Queue()

  await blockchain.start(() => getConnection({autoSchemaSync: true}))

  console.log('Retrieving last block processed...')
  const latest = await blockchain.getLastProcessedBlock()
  console.log(`Latest block was ${latest}. Initializing scan.`)
  queue.announceBitcoinBlockProcessed(latest)

  queue.blockDownloaded().subscribeOnNext(async (block: Block) => {
    console.log('Storing block', block.id)
    try {
      await blockchain.blockSeen(block)
    } catch (error) {
      console.log(error, error.stack)
      queue.dispatchWork('blockRetry', block)
    }
  })

  queue.blocksToSend().subscribeOnNext(async (block: Block) => {
    console.log('Storing block', block.id)
    try {
      await blockchain.blockSeen(block)
    } catch (error) {
      console.log(error, error.stack)
      queue.dispatchWork('blockRetry', block)
    }
  })

  queue.bitcoinBlock().subscribeOnNext(async (block: BitcoinBlockMetadata) => {
    for (let poetTx of block.poet) {
      try {
        poetTx.bitcoinHash = block.blockHash
        poetTx.bitcoinHeight = block.blockHeight
        poetTx.timestamp = block.timestamp
        const blockInfo = (await blockchain.getBlockInfoByTorrentHash(poetTx.torrentHash))
        if (blockInfo && blockInfo.timestamp) {
          continue
        }
        console.log('Confirming block with torrent hash', poetTx.torrentHash)
        await blockchain.blockConfirmed(poetTx)
      } catch (error) {
        console.log(error, error.stack)
        queue.dispatchWork('confirmRetry', poetTx)
      }
    }

    blockchain.storeBlockProcessed(block)
    queue.announceBitcoinBlockProcessed(block.blockHeight)
  })
}