const router = require('express').Router();

const userControllers = require("../../controllers/userControllers/userControllers")


router.get('/org-users', userControllers.getOrgUsers);
router.get('/get/dashboards', userControllers.getUserDashboards);
router.post('/create/organization/user', userControllers.creteOrganizationUser);
router.post('/create/external/user', userControllers.createExternalUser);

module.exports = router