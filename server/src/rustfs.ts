import { S3Client } from "@aws-sdk/client-s3";
import settings from "./config.js";

let rfs = settings.rustfs;
const rfsCon = new S3Client({
  region: rfs.region,
  endpoint: rfs.url,
  credentials: {
    accessKeyId: rfs.accessKey,
    secretAccessKey: settings.secrets.rustfs,
  },
  forcePathStyle: true,
});

export default rfsCon;
