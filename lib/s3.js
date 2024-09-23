import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import fetch from 'node-fetch'
import _debug from 'debug'
import crypto from 'crypto'

const { AWS_REGION, AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } =
  process.env

export const createInstance = () => {
  const instanceDebug = _debug('s3')

  if (!AWS_REGION) {
    throw new S3Error('AWS_REGION is not defined.')
  }

  if (!AWS_ACCESS_KEY_ID) {
    throw new S3Error('AWS_ACCESS_KEY_ID is not defined.')
  }

  if (!AWS_SECRET_ACCESS_KEY) {
    throw new S3Error('AWS_SECRET_ACCESS_KEY is not defined.')
  }

  if (!AWS_S3_BUCKET) {
    throw new S3Error('AWS_S3_BUCKET is not defined.')
  }

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

      return client.send(command).catch((e) => {
        throw new S3Error(e.message, {
          fn: 'upload',
          Body: !!Body,
          Key,
          ContentType,
        })
      })
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
            debug('response not ok: %s', res.statusText)
            throw new S3Error('response not ok', {
              fn: 'get',
              status: res.status,
              statusText: res.statusText,
              signedUrl,
              Key,
            })
          }

          return res.arrayBuffer()
        })
        .catch((e) => {
          if (e.name === 'S3Error') {
            throw e
          }

          debug(`failed to fetch ${signedUrl}: ${e.message}`)
          throw new S3Error(e.message, { fn: 'get', signedUrl, Key })
        })
    },
    getUrl: ({ Key }) =>
      `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${Key}`,
  }
}

export const createHash = (data) =>
  crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')

export const createProductionUploader =
  (storage, derivativeId) => async (audioData) => {
    const debug = _debug('s3:production:upload')

    const { audioFile } = audioData

    const hash = createHash(audioData)
    /* org, name, commitId, versioName */
    /* const [org, name] = Buffer.from(derivativeId, 'base64')
      .toString('utf-8')
      .split('/') */
    const Key = ['tts', derivativeId, `${hash}.mp3`].join('/')

    const debugData = {
      ...audioData,
      audioFile: !!audioFile,
    }

    debug('uploading %o, variables: %o', debugData, { derivativeId, Key })

    await storage.upload({
      Body: audioFile,
      Key,
      ContentType: 'audio/mpeg',
    })

    debug('done. %o', debugData)

    return {
      ...audioData,
      derivativeId,
      s3: {
        region: AWS_REGION,
        bucket: AWS_S3_BUCKET,
        key: Key,
      },
    }
  }

export function S3Error(message, payload) {
  this.message = message
  this.name = 'S3Error'
  this.payload = payload
}

S3Error.prototype = Error.prototype
