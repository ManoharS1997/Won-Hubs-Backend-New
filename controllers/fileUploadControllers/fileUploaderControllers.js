const { generateUploadURL, s3, BUCKET_NAME } = require("../../helpers/s3Helper");

const getPresignedUrl = async (req, res) => {
  const { fileName, fileType } = req.body;
  console.log('filename and file type', fileName, fileType)
  try {
    const { uploadUrl, key } = await generateUploadURL(fileName, fileType);
    res.status(200).json({ success: true, uploadUrl, key });
  } catch (error) {
    console.error("Presigned URL Error:", error);
    res.status(500).json({ success: false, error: "Could not generate URL" });
  }
};

const deleteFile = async (req, res) => {
  const { key } = req.body;

  if (!key) return res.status(400).json({ error: "Missing object key" });

  try {
    await s3.deleteObject({ Bucket: BUCKET_NAME, Key: key }).promise();
    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false, error: "Could not delete" });
  }
};

module.exports = { getPresignedUrl, deleteFile };
