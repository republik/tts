import id3 from 'node-id3'

export const tag = (tags, buffer) =>
  new Promise((resolve, reject) => {
    id3.write(tags, buffer, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
