import * as Koa from 'koa'
import * as Router from 'koa-router'
const Body = require('koa-body')

import { getConnection } from '../blockchain/connection'
import { BlockchainService } from '../blockchain/domainService'
import { addRoutes } from '../blockchain/httpApi/router'
import { logErrors } from '../helpers/koaHelper'
import { ExplorerConfiguration } from './configuration'

export async function createServer(options: ExplorerConfiguration): Promise<Koa> {
  const koa = new Koa()
  const router = new Router()
  const service = new BlockchainService()

  await service.start(() => getConnection(options.databaseConnectionParameters))
  await addRoutes(router, service)

  koa.use(Body())
  koa.use(router.allowedMethods())
  koa.use(router.routes())
  koa.use(logErrors)

  return koa
}
