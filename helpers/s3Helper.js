const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

const generateUploadURL = async (fileName, fileType) => {
  try {
    const key = `${uuidv4()}-${fileName}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      Expires: 60, // seconds
    };

    const uploadUrl = await s3.getSignedUrlPromise("putObject", params);
    return { uploadUrl, key };
  } catch (err) {
    return err
  }
};

module.exports = { generateUploadURL, s3, BUCKET_NAME };
