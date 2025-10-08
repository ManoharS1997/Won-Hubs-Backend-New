const router = require('express').Router();

const groupControllers = require("../../controllers/groupsControllers/groupConollers")

router.get('/org-groups', groupControllers.getOrgGroups);
router.post('/create/organization/groups',groupControllers.AddGroup)
router.get("/", groupControllers.getOrgGroups);
router.post("/newGroup",groupControllers.AddGroup);
router.put("/update/:groupId", groupControllers.updateGroup);
router.get("/:groupId", groupControllers.getGroupById);
router.delete("/delete/:groupId", groupControllers.deleteGroup);

module.exports = router;