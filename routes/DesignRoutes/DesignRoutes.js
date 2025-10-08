const express = require('express');
const router = express.Router();
const {
  createDesign,
  updateDesign,
  getDesignById,
  deleteDesign
} = require('../../controllers/DesignControllers/DesignControllers');

// Base path: /designs

router.post('/newDesign', createDesign);
router.put('/update/:designId', updateDesign);
router.get('/:designId', getDesignById);
router.delete('/delete/:designId', deleteDesign);

module.exports = router;
