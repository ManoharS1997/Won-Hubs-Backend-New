const express = require("express");
const router = express.Router();
const authenticateToken = require("../../utils/auth/authorization")

const cmdbControllers = require("../../controllers/cmdbControllers/cmdbControllers")

router.get("/org-records", authenticateToken, cmdbControllers.getOrgCiRecords);
router.get("/get/:id", authenticateToken, cmdbControllers.getCIRecordRelations);
router.post("/newRecord", authenticateToken, cmdbControllers.createCIRecord)

module.exports = router;
