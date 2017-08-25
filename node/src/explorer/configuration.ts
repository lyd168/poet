import * as fs from 'fs'
import { ConnectionConfiguration } from '../blockchain/connection'

export interface ExplorerConfiguration {
  readonly databaseConnectionParameters: ConnectionConfiguration
  readonly apiPort: number
}

export function loadExplorerConfiguration(path: string, defaults?: Partial<ExplorerConfiguration>): ExplorerConfiguration {
  if (!fs.existsSync(path)) {
    console.error(`File "${path}" not found.`)
    process.exit()
  }

  return {
    ...(defaults || {}),
    ...JSON.parse(fs.readFileSync(path, 'utf8'))
  }
}