const createTorrentLib = require('create-torrent')
const parseTorrent = require('parse-torrent')

export function getCreateOpts(hash: string) {
  return {
    name: hash,
    comment: 'Poet Block #' + hash,
    createdBy: 'Poet'
  }
}

export function createTorrent(data: any, hash: string): Promise<any> {
  let torrent: any
  if (data instanceof Buffer) {
    torrent = new Buffer(data) as any
    torrent.name = hash
  } else {
    torrent = data
  }

  const opts = getCreateOpts(hash)

  return new Promise<string>((resolve, reject) => {
    createTorrentLib(torrent, opts, (error: any, file: Buffer) => {
      if (error) {
        return reject(error)
      }
      return resolve(parseTorrent(file))
    })
  })
}

export async function getHash(data: Buffer, hash: string): Promise<string> {
  const torrent = await createTorrent(data, hash)
  return torrent.infoHash
}