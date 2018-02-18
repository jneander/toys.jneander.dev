require('@jneander/dev-tools/utils/env')

const s3 = require('@jneander/dev-tools/deployment/s3')

s3
  .deploy({
    accessKeyId: process.env.LEARNING_ACCESS_KEY_ID,
    bucket: process.env.LEARNING_BUCKET_NAME,
    packageDir: 'learning/__build__',
    secretAccessKey: process.env.LEARNING_SECRET_ACCESS_KEY
  })
  .then(() => {
    process.exit(0)
  })
  .catch(() => {
    process.exit(1)
  })
