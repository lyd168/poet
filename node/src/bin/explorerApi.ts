import { createServer } from '../explorer/explorerApi'
import { loadExplorerConfiguration } from '../explorer/configuration'

const command = process.argv[2]
const commandArgument = process.argv[3]

if ((command !== '--configuration' && command !== '-c') || !commandArgument) {
  console.error('Usage: [--configuration <path>] [-c <path>]')
  process.exit()
}

const configuration = loadExplorerConfiguration(commandArgument, {
  apiPort: 4000
})

console.log('Explorer API Configuration: ', JSON.stringify(configuration, null, 2))

async function start() {
  try {
    const server = await createServer(configuration)
    await server.listen(configuration.apiPort, '0.0.0.0')
    console.log('Explorer API started successfully.')
  } catch(error) {
    console.log('Explorer API failed to start. Error was:', error, error.stack)
  }
}

start()
