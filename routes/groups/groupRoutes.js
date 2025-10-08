const router = require('express').Router();

const groupControllers = require("../../controllers/groupsControllers/groupConollers")

router.get('/org-groups', groupControllers.getOrgGroups);

module.exports = router;