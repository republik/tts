# Republik TTS

A text-to-speech server. Renders documents as synthetic read aloud audio files.

## Development

Republik TTS communicates with external services.

Some of them need to report back (webhook).

You need to start a proxy.

```
$ yarn run lt --port 5030
your url is: https://foo-bar-fizz-buzz-123-123-123-123.loca.lt
```

Set `PUBLIC_URL` in `.env` to url provided.

Then start server.

```
yarn dev
```
