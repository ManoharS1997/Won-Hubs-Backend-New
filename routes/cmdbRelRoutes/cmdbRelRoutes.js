const express = require("express");
const router = express.Router();
const authenticateToken = require("../../utils/auth/authorization")

const relationControllers = require("../../controllers/cmdbRelations/relationsControllers")

router.get("/get/:id", authenticateToken, relationControllers.getRelationRecord);
router.get("/relations/:id", authenticateToken, relationControllers.getCIRelations);
router.post("/new/relation", authenticateToken, relationControllers.createRelationRecord)

module.exports = router;
