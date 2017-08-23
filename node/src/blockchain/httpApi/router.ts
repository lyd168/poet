import * as Router from 'koa-router'
import { Repository } from 'typeorm'

import { getConnection } from '../connection'
import { BlockchainService } from '../domainService'
import { Route } from './route'
import { WorkRoute } from './routes/work'
import { BlockRoute } from './routes/blocks'
import { ProfileRoute } from './routes/profile'
import { ClaimRoute } from "./routes/claim"
import { LicenseRoute } from './routes/license'
import { EventRoute } from './routes/events'
import { NotificationsRoute } from './routes/notifications'
import { BitcoinMalleabilityRoute } from './routes/bitcoin'

export class BlockchainRouter {
  private readonly service: BlockchainService

  constructor(service: BlockchainService) {
    this.service = service
  }

  async addRoutes(router: Router) {
    await this.service.start(() => getConnection({autoSchemaSync: true}))

    function route<T>(repository: Repository<T>, resourcePath: string) {
      const route = new Route<T>(repository, resourcePath)
      route.addRoutes(router)
    }

    // Placeholder for /node endpoint
    router.get('/node', async (ctx) => {
      ctx.body = JSON.stringify({ peers: 4, status: "synced" })
    })

    try {
      new WorkRoute(this.service).addRoutes(router)
      new BlockRoute(this.service).addRoutes(router)
      new ProfileRoute(this.service).addRoutes(router)
      new ClaimRoute(this.service).addRoutes(router)
      new LicenseRoute(this.service).addRoutes(router)
      new EventRoute(this.service).addRoutes(router)
      new NotificationsRoute(this.service).addRoutes(router)
      new BitcoinMalleabilityRoute(this.service).addRoutes(router)
    } catch (error) {
      console.log('Unable to setup route', error, error.stack)
    }
  }
}