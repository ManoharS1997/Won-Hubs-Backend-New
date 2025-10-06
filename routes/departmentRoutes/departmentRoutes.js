const router = require('express').Router()

const departmentControllers = require("../../controllers/departmentControllers/departmentControllers")

router.get('/org-departments', departmentControllers.getOrganizationDepartments)

router.post('/create/organization/department',departmentControllers.AddDepartment)
router.post("/newDepartment", departmentControllers.AddDepartment);
router.put("/update/:departmentId", departmentControllers.updateDepartment);
router.get("/:departmentId", departmentControllers.getDepartmentById);
router.delete("/delete/:departmentId", departmentControllers.deleteDepartment);

module.exports = router