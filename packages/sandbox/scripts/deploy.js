require('@jneander/dev-tools/lib/env')

const s3 = require('@jneander/dev-tools/lib/deployment/s3')

s3
  .deploy({
    accessKeyId: process.env.SANDBOX_ACCESS_KEY_ID,
    bucket: process.env.SANDBOX_BUCKET_NAME,
    packageDir: 'sandbox/__build__',
    secretAccessKey: process.env.SANDBOX_SECRET_ACCESS_KEY
  })
  .then(() => {
    process.exit(0)
  })
  .catch(() => {
    process.exit(1)
  })
