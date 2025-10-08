const router = require('express').Router();

const locationsControllers = require("../../controllers/locationsControllers/locationsControllers")

router.get("/org-locations", locationsControllers.getOrgLocations);

module.exports = router;