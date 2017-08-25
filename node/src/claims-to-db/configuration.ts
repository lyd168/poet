import * as fs from 'fs'
import { ConnectionConfiguration } from '../blockchain/connection'

export interface ClaimsToDBConfiguration {
  readonly db: ConnectionConfiguration
}

export function loadClaimsToDBConfiguration(path: string): ClaimsToDBConfiguration {
  if (!fs.existsSync(path)) {
    console.error(`File "${path}" not found.`)
    process.exit()
  }

  return JSON.parse(fs.readFileSync(path, 'utf8'))
}