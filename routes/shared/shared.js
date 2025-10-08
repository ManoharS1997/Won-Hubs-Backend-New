const express = require("express")
const router = express.Router()
const authorization = require("../../utils/auth/authorization")

const bulkImportControllers = require("../../controllers/shared/bulkImport");
const readmailsControllers = require("../../controllers/shared/emailControllers");
const formControllers = require("../../controllers/shared/formFields")
const tableControllers = require("../../controllers/shared/tableControllers")
const reportControllers = require('../../controllers/shared/reportControllers')
// by sandhya
const multer = require("multer");

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, "uploads/"),
        filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
    }),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});
// upload functionality written by me  written as a middleware

router.get("/apps/all", authorization, tableControllers.getAllApps);
router.get("/table/:tableName", authorization, tableControllers.getTableData);
router.get("/get-instance-id", authorization, tableControllers.getInstanceId);
router.get("/table/columns/:tableName", authorization, tableControllers.getTableColumns);
router.get("/table/getRecordData/:tableName/:recordId", authorization, tableControllers.getAnyRecorddata);

router.get("/add/fields/:formName", formControllers.getUserFormFields);
router.get("/get/design-department-data", formControllers.getDesignsDepartmentData);
router.get("/external/register-form", formControllers.getExternalUserRegistrationformFieldsData);
router.get("/read/emails", readmailsControllers.readMails);
router.get("/CI-form-fields/:type", formControllers.getCiFormFields);
router.get("/get/icons", formControllers.getDefaultIconsList);
router.get("/get/become-parter-form", formControllers.getBecomePartnerFormFields);
router.get("/new-relation-form-fields", formControllers.getnewRelationFormFields);
router.post("/record/:tableName/:recordId", authorization, tableControllers.getAnyRecorddata);
router.post("/send-otp", readmailsControllers.sendOtpViaEmail);
router.post("/send-email", readmailsControllers.sendEmailToAnyone);
router.post("/recieve/demo-request", readmailsControllers.recieveDemoRequest);
router.post("/get-username", readmailsControllers.getUsernameByEmail);
router.post("/send-registration-email", readmailsControllers.sendRegistrationEmail);
router.post("/launch-instance", readmailsControllers.createEC2Instance);
router.post("/check/email", readmailsControllers.checkEmailExists);
router.post("/bulk/table/upload", upload.single("file"),bulkImportControllers.bulkImport);
router.post("/table-fields/template/:tableName", bulkImportControllers.downloadTemplate);
router.post("/get/report-data", reportControllers.getReportdata);
router.post("/fetch/gauge-reports-data", reportControllers.fetchGaugeReportsData);

module.exports = router;