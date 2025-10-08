const router = require('express').Router()

const departmentControllers = require("../../controllers/departmentControllers/departmentControllers")

router.get('/org-departments', departmentControllers.getOrganizationDepartments)


module.exports = router