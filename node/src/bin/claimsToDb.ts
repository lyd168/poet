import { startListening } from '../claims-to-db/claimsToDb'
import { loadClaimsToDBConfiguration } from '../claims-to-db/configuration'
import { getConfigurationPath } from '../helpers/CommandLineArgumentsHelper'

const configurationPath = getConfigurationPath()
const configuration = loadClaimsToDBConfiguration(configurationPath)

async function start() {
  try {
    await startListening(configuration)
  } catch (error) {
    console.log(error, error.stack)
  }
}

start()
