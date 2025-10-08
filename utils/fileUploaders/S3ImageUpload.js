import axios from "axios";
const { generateUploadURL, s3, BUCKET_NAME } = require("../../helpers/s3Helper");


/**
 * Uploads an array of image files to S3 using your backend's signed URL flow
 * @param {File[]} imageFiles - array of image File objects
 * @returns {Promise<Array<{ key: string, success: boolean, error?: string }>>}
 */
const uploadImagesToS3 = async (imageFiles = []) => {
  const results = [];

  for (const file of imageFiles) {
    try {
      // 1. Get presigned URL from your backend
      const presignRes = await generateUploadURL({
        fileName: file.name,
        fileType: file.type
      });

      if (!presignRes.data?.uploadUrl || !presignRes.data?.key) {
        throw new Error("Presigned URL or key missing");
      }

      const { uploadUrl, key } = presignRes.data;

      // 2. Upload the file directly to S3
      await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type
        }
      });

      results.push({ key, success: true });
    } catch (error) {
      console.error("Upload failed for file:", file.name, error);
      results.push({ key: file.name, success: false, error: error.message });
    }
  }

  return results;
};

export default uploadImagesToS3;
