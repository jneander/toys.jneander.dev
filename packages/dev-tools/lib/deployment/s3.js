const path = require('path')

const s3 = require('s3')

function deploy(options) {
  const client = s3.createClient({
    s3Options: {
      accessKeyId: options.accessKeyId,
      secretAccessKey: options.secretAccessKey
    }
  })

  return new Promise((resolve, reject) => {
    const uploader = client.uploadDir({
      deleteRemoved: options.deleteRemoved || false,
      localDir: path.join(__dirname, '../../..', options.packageDir),
      s3Params: {
        Bucket: options.bucket
      }
    })

    uploader.on('error', (err) => {
      console.error('unable to sync:', err.stack)
      reject(err)
    })

    uploader.on('fileUploadEnd', (localFilePath, s3key) => {
      console.log(`uploaded: ${localFilePath}`)
    })

    uploader.on('end', () => {
      console.log('done uploading')
      resolve()
    })
  })
}

module.exports = {
  deploy
}
