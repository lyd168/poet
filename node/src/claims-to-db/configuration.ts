import * as fs from 'fs'
import { ConnectionConfiguration } from '../blockchain/connection'

export interface ClaimsToDBConfiguration {
  readonly databaseConnectionParameters: ConnectionConfiguration
  readonly apiPort: number
}

export function loadClaimsToDBConfiguration(path: string, defaults?: Partial<ClaimsToDBConfiguration>): ClaimsToDBConfiguration {
  if (!fs.existsSync(path)) {
    console.error(`File "${path}" not found.`)
    process.exit()
  }

  return {
    ...(defaults || {}),
    ...JSON.parse(fs.readFileSync(path, 'utf8'))
  }
}