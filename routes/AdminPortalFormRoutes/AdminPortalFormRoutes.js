const express = require('express');
const router = express.Router();
const {
  getDepartments,
  getCategories,
  getSubCategories,
  getAdminPortalForms
} = require('../../controllers/AdminPortalControllers/AdminPortalControllers');

// Base path will be: /AdminPortalForm

router.get('/departments', getDepartments);
router.get('/categories/:department', getCategories);
router.get('/subCategories/:category/:department', getSubCategories);
router.get('/forms/:subCategory/:category/:department', getAdminPortalForms);

module.exports = router;
