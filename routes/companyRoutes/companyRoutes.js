const router = require('express').Router();

const companyControllers = require("../../controllers/comapanyControllers/companyController")


router.post('/create/organization/company',companyControllers.AddCompany)

// Routes
router.post("/newCompany", companyControllers.AddCompany);
router.put("/update/:companyId", companyControllers.updateCompany);
router.get("/:companyId", companyControllers.getCompanyById);
router.delete("/delete/:companyId", companyControllers.deleteCompany);

module.exports = router;