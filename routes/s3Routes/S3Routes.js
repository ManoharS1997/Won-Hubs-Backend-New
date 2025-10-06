const express = require("express");
const router = express.Router();
const s3Controllers = require("../../controllers/fileUploadControllers/fileUploaderControllers");

router.post("/get-presigned-url", s3Controllers.getPresignedUrl);
router.delete("/delete/file", s3Controllers.deleteFile)

module.exports = router;
