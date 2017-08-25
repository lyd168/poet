import * as Koa from 'koa'
import { Fields, ClaimTypes, Claim, Block, ClaimBuilder } from 'poet-js'
const { promisify } = require('util')
const bitcore = require('bitcore-lib')
const explorers = require('bitcore-explorers')
import * as KoaBody from 'koa-body'
import * as KoaRoute from 'koa-route'

import { getHash } from '../helpers/torrentHash' // TODO: use poet-js
import { Queue } from '../queue'
import { getConfiguration } from '../trusted-publisher/configuration'
import { getConfigurationPath } from '../helpers/CommandLineArgumentsHelper'

const insightInstance = new explorers.Insight(bitcore.Networks.testnet)
const broadcastTx = promisify(insightInstance.broadcast.bind(insightInstance))
const getUtxo = promisify(insightInstance.getUnspentUtxos.bind(insightInstance))

const queue = new Queue()

const configurationPath = getConfigurationPath()
const configuration = getConfiguration(configurationPath)

const bitcoinAddressPrivateKey = new bitcore.PrivateKey(configuration.bitcoinAddressPrivateKey)

async function start() {
  try {
    const server = await createServer()
    await server.listen(configuration.port)
    console.log('Trusted Publisher started successfully.')
  } catch (error) {
    console.log('Trusted Publisher failed to start. Error was: ', error)
  }
}

async function createServer() {
  const koa = new Koa()

  koa.use(handleErrors)
  koa.use(KoaBody({ textLimit: 1000000 }))
  koa.use(KoaRoute.post('/titles', async (ctx: any) => postTitles(ctx)))
  koa.use(KoaRoute.post('/licenses', async (ctx: any) => postLicenses(ctx)))
  koa.use(KoaRoute.post('/claims', async (ctx: any) => postClaims(ctx)))
  koa.use(KoaRoute.post('/v2/claims', async (ctx: any) => postClaimsV2(ctx)))

  return koa
}

async function handleErrors(ctx: any, next: Function) {
  try {
    await next()
  } catch (error) {
    console.log(`Error processing ${ctx.method} ${ctx.path}`, error, error.stack)
    ctx.status = 503
    ctx.body = 'An error occurred while processing the transaction, please try again later.'
  }
}

async function postTitles(ctx: any) {
  const body = JSON.parse(ctx.request.body)
  const claims = [ClaimBuilder.createSignedClaim({
    type: ClaimTypes.TITLE,
    attributes: {
      [Fields.REFERENCE]: body.reference,
      [Fields.REFERENCE_OFFERING]: body.referenceOffering,
      [Fields.PROOF_TYPE]: "Bitcoin Transaction",
      [Fields.PROOF_VALUE]: JSON.stringify({
        txId: body.txId,
        ntxId: body.ntxId,
        outputIndex: body.outputIndex
      }),
      [Fields.REFERENCE_OWNER]: body.referenceOwner,
      [Fields.OWNER]: body.owner
    }
  }, configuration.notaryPrivateKey)]

  const blockClaims = await createBlock(claims)
  ctx.body = JSON.stringify({
    createdClaims: blockClaims
  })
}

async function postLicenses(ctx: any) {
  const body = JSON.parse(ctx.request.body)
  const claims = [ClaimBuilder.createSignedClaim({
    type: ClaimTypes.LICENSE,
    attributes: {
      [Fields.REFERENCE]: body.reference,
      [Fields.REFERENCE_OFFERING]: body.referenceOffering,
      [Fields.PROOF_TYPE]: "Bitcoin Transaction",
      [Fields.PROOF_VALUE]: JSON.stringify({
        txId: body.txId,
        ntxId: body.ntxId,
        outputIndex: body.outputIndex
      }),
      [Fields.REFERENCE_OWNER]: body.referenceOwner,
      [Fields.LICENSE_HOLDER]: body.owner
    }
  }, configuration.notaryPrivateKey)]
  const blockClaims = await createBlock(claims)
  ctx.body = JSON.stringify({
    createdClaims: blockClaims
  })
}

async function postClaims(ctx: any) {
  const signs = JSON.parse(ctx.request.body).signatures

  const claims: ReadonlyArray<Claim> = signs.map((sig: any) => {
    const claim = ClaimBuilder.serializedToClaim(
      new Buffer(new Buffer(sig.message, 'hex').toString(), 'hex')
    )
    claim.signature = sig.signature
    claim.id = new Buffer(ClaimBuilder.getId(claim)).toString('hex')
    return claim
  })

  const workClaims: ReadonlyArray<Claim> = claims.filter(_ => _.type === ClaimTypes.WORK)

  console.log('POST /claims', claims)

  // Hack to use the Work's signature for the Offering
  for (const claim of claims.filter(_ => _.type === ClaimTypes.OFFERING)) {
    const workClaim = workClaims && workClaims.length && workClaims[0]

    if (!workClaim)
      throw new Error(`Unsupported: an OFFERING claim was POSTed without any WORK claim`)

    claim.attributes = {
      ...claim.attributes,
      [Fields.REFERENCE]: workClaim.id
    }
  }

  const titleClaims: ReadonlyArray<Claim> = workClaims.map(claim =>
    ClaimBuilder.createSignedClaim({
      type: ClaimTypes.TITLE,
      attributes: {
        reference: claim.id,
        owner: claim.publicKey,
      }
    }, configuration.notaryPrivateKey)
  )

  const editWorkClaims = workClaims.filter(_ => _.attributes.supersedes)

  for (const claim of editWorkClaims) {
    // TODO: ideally, assert that claim.owner === claim.supersedes.owner
    // certification/work.ts has the final say on this
  }

  const blockClaims = await createBlock([
    ...claims,
    ...titleClaims
  ])

  ctx.body = JSON.stringify({
    createdClaims: blockClaims
  })
}

async function postClaimsV2(ctx: any) {
  const signs = JSON.parse(ctx.request.body).claims

  const claims: ReadonlyArray<Claim> = signs.map((sig: any) => {
    const claim = ClaimBuilder.serializedToClaim(
      new Buffer(sig.claim, 'hex')
    )
    claim.signature = sig.signature
    claim.id = new Buffer(ClaimBuilder.getId(claim)).toString('hex')
    return claim
  })

  const workClaims: ReadonlyArray<Claim> = claims.filter(_ => _.type === ClaimTypes.WORK)

  console.log('POST /claims', claims)
  const titleClaims: ReadonlyArray<Claim> = workClaims.map(claim =>
    ClaimBuilder.createSignedClaim({
      type: ClaimTypes.TITLE,
      attributes: {
        reference: claim.id,
        owner: claim.publicKey,
      }
    }, configuration.notaryPrivateKey)
  )

  const blockClaims = await createBlock([
    ...claims,
    ...titleClaims
  ])

  ctx.body = JSON.stringify({
    createdClaims: blockClaims
  })
}

async function createBlock(claims: ReadonlyArray<Claim>) {
  const certificates: ReadonlyArray<Claim> = claims.map(claim => ClaimBuilder.createSignedClaim({
    type: ClaimTypes.CERTIFICATE,
    attributes: {
      [Fields.REFERENCE]: claim.id,
      [Fields.CERTIFICATION_TIME]: '' + Date.now()
    }
  }, configuration.notaryPrivateKey))

  const block: Block = ClaimBuilder.createBlock([...claims, ...certificates])

  await timestampClaimBlock(block)

  try {
    await queue.announceBlockToSend(block)
  } catch (error) {
    console.log('Could not announce block', error, error.stack)
  }

  return block.claims
}

async function timestampClaimBlock(block: Block): Promise<void> {
  const id = await getHash(ClaimBuilder.serializeBlockForSave(block), block.id)

  // We're retrieving UTXO using bitcore's insight client rather than our own., but both work fine.
  // const utxo = await InsightClient.Address.Utxos.get(poetAddress)
  const utxoBitcore = await getUtxo(configuration.bitcoinAddress)
  console.log('\n\nutxoBitcore', JSON.stringify(utxoBitcore, null, 2))

  const tx = await ClaimBuilder.createTransaction(id, utxoBitcore, configuration.bitcoinAddress, bitcoinAddressPrivateKey)

  console.log('\nBitcoin transaction hash is', tx.hash)
  console.log('Normalized transaction hash is', tx.nid)
  console.log('Torrent hash is', id)

  console.log('\nBroadcasting Tx...', JSON.stringify(tx, null, 2))

  // We're using bitcore's insight client to broadcast transactions rather than our own, since bitcore handles serialization well
  const txPostResponse = await broadcastTx(tx)

  console.log('\nBroadcasted Tx:', txPostResponse)
}

start()