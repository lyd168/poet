import * as fs from 'fs'

export interface TrustedPublisherConfiguration {
  readonly notaryPrivateKey: string
  readonly bitcoinAddressPrivateKey: string
  readonly bitcoinAddress: string
  readonly port: number
}

const defaultOptions: Partial<TrustedPublisherConfiguration> = {
  port: 6000,
}

export function getConfiguration(configurationFilePath: string): TrustedPublisherConfiguration {
  if (!fs.existsSync(configurationFilePath)) {
    console.error(`File "${configurationFilePath}" not found.`)
    process.exit()
  }

  return {
    ...defaultOptions,
    ...JSON.parse(fs.readFileSync(configurationFilePath, 'utf8'))
  }
}