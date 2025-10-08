const router = require('express').Router();

const userControllers = require("../../controllers/userControllers/userControllers")


router.get('/org-users', userControllers.getOrgUsers);
router.get('/get/dashboards', userControllers.getUserDashboards);
router.post('/create/organization/users', userControllers.creteOrganizationUser);
router.post('/create/external/user', userControllers.createExternalUser);
router.post('/newUser', userControllers.createUser);
router.put('/update/:userId', userControllers.updateUser);
router.get('/:userId', userControllers.getUserById);
router.delete('/delete/:userId', userControllers.deleteUser);

module.exports = router