import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import fetch from 'node-fetch'
import Promise from 'bluebird'
import _debug from 'debug'

const { AWS_REGION, AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } =
  process.env

export const createInstance = () => {
  const instanceDebug = _debug('s3')

  const client = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  })

  return {
    upload: ({ Body, Key, ContentType }) => {
      const command = new PutObjectCommand({
        Body,
        Key,
        ...(ContentType && { ContentType }),
        Bucket: AWS_S3_BUCKET,
        ACL: 'public-read',
      })

      return client.send(command)
    },
    head: async ({ Key }) => {
      const command = new HeadObjectCommand({
        Key,
        Bucket: AWS_S3_BUCKET,
      })

      try {
        const data = await client.send(command)
        return !!data
      } catch {
        return false
      }
    },
    get: async ({ Key }) => {
      const debug = instanceDebug.extend('get')
      const command = new GetObjectCommand({
        Key,
        Bucket: AWS_S3_BUCKET,
      })

      const signedUrl = await getSignedUrl(client, command)

      return fetch(signedUrl)
        .then((res) => {
          if (!res.ok) {
            return false
          }

          return res.arrayBuffer()
        })
        .catch((e) => {
          debug(`failed to fetch ${signedUrl}: ${e.message}`)
        })
    },
    getUrl: ({ Key }) =>
      `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${Key}`,
  }
}

export const createSpeakablesUploader = (pathPrefix, storage) => (speakables) =>
  Promise.map(speakables, async (speakable) => {
    const debug = _debug('s3:speakable:upload')
    const { audioUrl, audioData, nodeHash } = speakable
    if (!audioUrl && audioData) {
      const Key = `${pathPrefix}/${nodeHash}.mp3`

      await storage.upload({
        Body: audioData,
        Key,
        ContentType: 'audio/mpeg',
      })

      const uploadUrl = storage.getUrl({ Key })
      debug('done: %s', {
        ...speakable,
        audioData: !!audioData,
        audioUrl: uploadUrl,
      })

      return {
        ...speakable,
        audioUrl: uploadUrl,
      }
    }

    debug('skipped, either audioUrl is present or audioData missing: %o', {
      ...speakable,
      audioData: !!audioData,
    })

    return speakable
  })

export const createSpeakablesDownloader =
  (pathPrefix, storage) => (speakables) =>
    Promise.map(speakables, async (speakable) => {
      const debug = _debug('s3:speakable:download')
      const { nodeHash } = speakable
      if (nodeHash) {
        const Key = `${pathPrefix}/${nodeHash}.mp3`

        const isAvailable = await storage.head({ Key })
        if (isAvailable) {
          const audioData = await storage.get({ Key })
          if (audioData) {
            debug('found and downloaded: %s', Key)
            return {
              ...speakable,
              audioData,
              audioUrl: storage.getUrl({ Key }),
              downloaded: true,
            }
          }
        }

        debug('missing: %s', Key)
        return {
          ...speakable,
          downloaded: false,
        }
      }

      debug('speakable.nodeHash missing')
      return {
        ...speakable,
        downloaded: false,
      }
    })

export const createProductionUploader = (storage) => async (production) => {
  const debug = _debug('s3:production:upload')
  const { documentId, speakablesHash, audioData } = production

  if (!audioData) {
    debug('audioData missing', { ...production })
    return
  }

  /* org, name, commitId, versioName */
  const [org, name] = Buffer.from(documentId, 'base64')
    .toString('utf-8')
    .split('/')
  const Key = ['tts', org, name, 'published', `${speakablesHash}.mp3`].join('/')

  debug(
    'uploading %o, variables: %o',
    { ...production, audioData: !!audioData },
    { org, name, Key },
  )

  await storage.upload({
    Body: audioData,
    Key,
    ContentType: 'audio/mpeg',
  })

  const uploadUrl = storage.getUrl({ Key })

  debug('done. %o', {
    ...production,
    audioData: !!audioData,
    audioUrl: uploadUrl,
  })

  return {
    ...production,
    audioUrl: uploadUrl,
    s3: {
      region: AWS_REGION,
      bucket: AWS_S3_BUCKET,
      key: Key,
    },
  }
}
