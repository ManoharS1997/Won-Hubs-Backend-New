const router = require("express").Router()
const partnerControllers = require("../../controllers/partnerControllers/partnerControllers")


router.post('/request/partnership', partnerControllers.CreatePartner)

module.exports = router