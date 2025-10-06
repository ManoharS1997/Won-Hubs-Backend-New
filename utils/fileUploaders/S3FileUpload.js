import axios from "axios";

/**
 * Uploads an array of files to S3 using your backend's presigned URL API.
 *
 * @param {File[]} files - Array of File objects (image, pdf, doc, etc.)
 * @returns {Promise<Array<{ key: string, success: boolean, error?: string }>>}
 */
const uploadFilesToS3 = async (files = []) => {
  const results = [];

  for (const file of files) {
    try {
      // 1. Get a presigned URL from backend
      const presignRes = await axios.post("/api/s3/get-url", {
        fileName: file.name,
        fileType: file.type,
      });

      const { uploadUrl, key } = presignRes.data;

      if (!uploadUrl || !key) {
        throw new Error("Presigned URL or key missing from backend response");
      }

      // 2. Upload the file to S3
      await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
      });

      results.push({ key, success: true });
    } catch (error) {
      console.error(`Upload failed for ${file.name}:`, error);
      results.push({ key: file.name, success: false, error: error.message });
    }
  }

  return results;
};

export default uploadFilesToS3;
