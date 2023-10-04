const ffmpegStatic = require('ffmpeg-static')
const ffmpeg = require('fluent-ffmpeg')

export const concatFfmpeg = async (files) => {
  ffmpeg.setFfmpegPath(ffmpegStatic)

  ffmpeg()
    .input('concat:input-%03d.ts')
    .inputOptions('-i', 'concat:input1.ts|input2.ts|input3.ts')
    .saveToFile('output.ts')
    .on('end', () => {
      console.log('FFmpeg has finished.')
    })
    .on('error', (error) => {
      console.error(error)
    })
}
