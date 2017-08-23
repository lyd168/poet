import * as path from 'path'
import { createConnection, DriverOptions } from 'typeorm'
import { delay } from 'poet-js'

interface ConnectionParameters {
  readonly maxRetry: number
  readonly retryDelay: number
  readonly autoSchemaSync: boolean
  readonly driver: DriverOptions
}

const defaultConnectionParameters: ConnectionParameters = {
  maxRetry: 30,
  retryDelay: 3000,
  autoSchemaSync: false,
  driver: {
    type: 'postgres',
    host: '',
    port: 5432,
    username: 'poet',
    password: '',
    database: 'poet'
  }
}

export async function getConnection(connectionParameters?: Partial<ConnectionParameters>) {
  const mergedConfiguration = {
    ...defaultConnectionParameters,
    ...(connectionParameters || {}),
    driver: {
      ...defaultConnectionParameters.driver,
      ...(connectionParameters && connectionParameters.driver || {})
    }
  }

  console.log('Connecting to DB with configuration:', JSON.stringify(mergedConfiguration, null, 2))

  let attempts = mergedConfiguration.maxRetry
  let lastError
  while (attempts--) {
    console.log(`Attempting connection to db, attempt # ${attempts}`)
    try {
      return await createConnection({
        driver: {
          ...mergedConfiguration.driver,
        },
        entities: [
          path.join(__dirname, 'orm', '*.ts'),
          path.join(__dirname, 'orm', 'domain', '*.ts'),
          path.join(__dirname, 'orm', 'bitcoin', '*.ts'),
          path.join(__dirname, 'orm', 'events', '*.ts')
        ],
        autoSchemaSync: mergedConfiguration.autoSchemaSync
      })
    } catch (error) {
      lastError = error
      console.log('Unable to connect on attempt #', attempts, error, error.stack)
      await delay(connectionParameters.retryDelay)
    }
  }
  console.log('Never connected!', lastError, lastError.stack)
  throw new Error('Unable to connect to db')
}

