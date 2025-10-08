const express = require("express");
const router = express.Router();

const webhookRoutes = require("../../controllers/webhookControllers/test-webhooks")
const useWebhookControllers = require('../../controllers/webhookControllers/useWebhooks')
const crudWebhookControllers = require('../../controllers/webhookControllers/webhooksCRUDop')

const { authenticateApiCredentials } = require('../../helpers/checkWebhookAuth');
const authenticateToken = require('../../utils/auth/authorization')


//
router.get("/list", webhookRoutes.getWebhooks);
router.get("/org/webhooks/active", crudWebhookControllers.getOrgWebhooks);
router.get("/:id", authenticateToken, webhookRoutes.getWebhookById);
router.post("/test/any-webhook", webhookRoutes.verifyWebhook);
router.post("/test/any-webhook/tickets", webhookRoutes.getTickets);
router.post("/get/subscription", webhookRoutes.testAnyWebhook);
router.post("/create", webhookRoutes.addWebhook);
router.delete("/delete/:id", webhookRoutes.deleteWebhook);

router.post("/test/any-webhook/user/active", authenticateApiCredentials, useWebhookControllers.getActiveUsers);
router.post("/test/any-webhook/user/oncreate", authenticateApiCredentials, useWebhookControllers.latestUserCreated);
router.post("/test/any-webhook/user/onupdate/:id", authenticateApiCredentials, useWebhookControllers.latestUpdatedUser);
router.post("/test/any-webhook/user/onAssign/:id", authenticateApiCredentials, useWebhookControllers.getUserAssignment);
router.post("/test/any-webhook/user/onTagAdded/:id", authenticateApiCredentials, useWebhookControllers.getLatestUserTag);

router.post("/test/any-webhook/group/active", authenticateApiCredentials, useWebhookControllers.getActiveGroups);
router.post("/test/any-webhook/group/oncreate", authenticateApiCredentials, useWebhookControllers.latestGroupCreated);
router.post("/test/any-webhook/group/onupdate/:id", authenticateApiCredentials, useWebhookControllers.latestUpdatedGroup);
router.post("/test/any-webhook/group/onAssign/:id", authenticateApiCredentials, useWebhookControllers.getGroupAssignment);
router.post("/test/any-webhook/group/onTagAdded/:id", authenticateApiCredentials, useWebhookControllers.getLatestGroupTag);

router.post("/test/any-webhook/department/active", authenticateApiCredentials, useWebhookControllers.getActiveDepartments);
router.post("/test/any-webhook/department/oncreate", authenticateApiCredentials, useWebhookControllers.latestDepartmentCreated);
router.post("/test/any-webhook/department/onupdate/:id", authenticateApiCredentials, useWebhookControllers.latestUpdatedDepartment);
router.post("/test/any-webhook/department/onAssign/:id", authenticateApiCredentials, useWebhookControllers.getDepartmentAssignment);
router.post("/test/any-webhook/department/onTagAdded/:id", authenticateApiCredentials, useWebhookControllers.getLatestDepartmentTag);

router.post("/test/any-webhook/role/active", authenticateApiCredentials, useWebhookControllers.getActiveRoles);
router.post("/test/any-webhook/role/oncreate", authenticateApiCredentials, useWebhookControllers.latestRoleCreated);
router.post("/test/any-webhook/role/onupdate/:id", authenticateApiCredentials, useWebhookControllers.latestUpdatedRole);
router.post("/test/any-webhook/role/onAssign/:id", authenticateApiCredentials, useWebhookControllers.getRoleAssignment);
router.post("/test/any-webhook/role/onTagAdded/:id", authenticateApiCredentials, useWebhookControllers.getLatestRoleTag);

router.post("/test/any-webhook/task/active", authenticateApiCredentials, useWebhookControllers.getActiveTasks);
router.post("/test/any-webhook/task/oncreate", authenticateApiCredentials, useWebhookControllers.latestTaskCreated);
router.post("/test/any-webhook/task/onupdate/:id", authenticateApiCredentials, useWebhookControllers.latestUpdatedTask);
router.post("/test/any-webhook/task/onAssign/:id", authenticateApiCredentials, useWebhookControllers.getTaskAssignment);
router.post("/test/any-webhook/task/onTagAdded/:id", authenticateApiCredentials, useWebhookControllers.getLatestTaskTag);

router.post("/test/any-webhook/location/active", authenticateApiCredentials, useWebhookControllers.getActiveLocations);
router.post("/test/any-webhook/location/oncreate", authenticateApiCredentials, useWebhookControllers.latestLocationCreated);
router.post("/test/any-webhook/location/onupdate/:id", authenticateApiCredentials, useWebhookControllers.latestUpdatedLocation);
router.post("/test/any-webhook/location/onAssign/:id", authenticateApiCredentials, useWebhookControllers.getLocationAssignment);
router.post("/test/any-webhook/location/onTagAdded/:id", authenticateApiCredentials, useWebhookControllers.getLatestLocationTag);

router.post("/test/any-webhook/cmdb/active", authenticateApiCredentials, useWebhookControllers.getActiveCMDB);
router.post("/test/any-webhook/cmdb/oncreate", authenticateApiCredentials, useWebhookControllers.latestCMDBCreated);
router.post("/test/any-webhook/cmdb/onupdate/:id", authenticateApiCredentials, useWebhookControllers.latestUpdatedCMDB);
router.post("/test/any-webhook/cmdb/onAssign/:id", authenticateApiCredentials, useWebhookControllers.getCMDBAssignment);
router.post("/test/any-webhook/cmdb/onTagAdded/:id", authenticateApiCredentials, useWebhookControllers.getLatestCMDBTag);

router.post("/test/any-webhook/ticket/active", authenticateApiCredentials, useWebhookControllers.getActiveTickets);
router.post("/test/any-webhook/ticket/oncreate", authenticateApiCredentials, useWebhookControllers.latestTicketCreated);
router.post("/test/any-webhook/ticket/onupdate/:id", authenticateApiCredentials, useWebhookControllers.latestUpdatedTicket);
router.post("/test/any-webhook/ticket/onAssign/:id", authenticateApiCredentials, useWebhookControllers.getTicketAssignment);
router.post("/test/any-webhook/ticket/onTagAdded/:id", authenticateApiCredentials, useWebhookControllers.getLatestTicketTag);


module.exports = router;