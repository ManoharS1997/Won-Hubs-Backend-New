const express = require("express");
const router = express.Router();

const {
  createServiceMapping,
  updateServiceMapping,
  getServiceMappingById,
  deleteServiceMapping,
} = require("../../controllers/Service-MappingControllers/Service-MappingControllers");

// ✅ Create new Service Mapping
router.post("/newServiceMap", createServiceMapping);

// ✅ Update Service Mapping
router.put("/update/:serviceId", updateServiceMapping);

// ✅ Get Service Mapping by ID
router.get("/:serviceId", getServiceMappingById);

// ✅ Delete Service Mapping
router.delete("/delete/:serviceId", deleteServiceMapping);

module.exports = router;
