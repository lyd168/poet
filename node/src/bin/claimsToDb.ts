import { startListening } from '../claims-to-db/claimsToDb'

async function start() {
  try {
    await startListening()
  } catch (error) {
    console.log(error, error.stack)
  }
}

start()
