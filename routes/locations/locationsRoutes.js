const router = require('express').Router();

const locationsControllers = require("../../controllers/locationsControllers/locationsControllers")

router.get("/org-locations", locationsControllers.getOrgLocations);
router.post('/create/organization/locations', locationsControllers.AddLocation);
router.post("/newLocation", locationsControllers.AddLocation);
router.put("/update/:locationId", locationsControllers.updateLocation);
router.get("/:locationId", locationsControllers.getLocationById);
router.delete("/delete/:locationId", locationsControllers.deleteLocation);


module.exports = router;