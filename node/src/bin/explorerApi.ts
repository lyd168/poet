import { createServer } from '../explorer/explorerApi'
import { loadExplorerConfiguration } from '../explorer/configuration'
import { getConfigurationPath } from '../helpers/CommandLineArgumentsHelper'

const configurationPath = getConfigurationPath()
const configuration = loadExplorerConfiguration(configurationPath)

console.log('Explorer API Configuration: ', JSON.stringify(configuration, null, 2))

async function start() {
  try {
    const server = await createServer(configuration)
    await server.listen(configuration.apiPort, '0.0.0.0')
    console.log('Explorer API started successfully.')
  } catch(error) {
    console.log('Explorer API failed to start. Error was:', error)
  }
}

start()
