const { db } = require("../../config/DB-connection");
const { getOrganizationIdWithUserId } = require("../../helpers/findOrgId");
const formatDateToMySQLDateTime = require("../../helpers/formatDateString")

const jwt = require("jsonwebtoken");


const createCIRecord = async (req, res, next) => {
  try {
    const formData = req.body;
    const accessToken = req.headers["authorization"].split(" ")[1]
    // require("jsonwebtoken");
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.id;
    const orgId = await getOrganizationIdWithUserId(userId);
    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required." });
    }
    console.log('ci redord formData: ', formData);
    const payload = {}
    if (formData) {
      formData?.item_name?.value !== undefined && formData?.item_name?.value !== '' && (payload.item_name = formData?.item_name?.value);
      formData?.item_tag?.value !== undefined && formData?.item_tag?.value !== '' && (payload.item_tag = formData?.item_tag?.value);
      formData?.item_description?.value !== undefined && formData?.item_description?.value !== '' && (payload.item_description = formData?.item_description?.value);
      formData?.company?.value !== undefined && formData?.company?.value !== '' && (payload.company = formData?.company?.value);
      formData?.serial_number?.value !== undefined && formData?.serial_number?.value !== '' && (payload.serial_number = formData?.serial_number?.value);
      formData?.model_number?.value !== undefined && formData?.model_number?.value !== '' && (payload.model_number = formData?.model_number?.value);
      formData?.operating_system?.value !== undefined && formData?.operating_system?.value !== '' && (payload.operating_system = formData?.operating_system?.value);
      formData?.assigned_member?.value !== undefined && formData?.assigned_member?.value !== '' && (payload.assigned_member = formData?.assigned_member?.value);
      formData?.os_domain?.value !== undefined && formData?.os_domain?.value !== '' && (payload.os_domain = formData?.os_domain?.value);
      formData?.version?.value !== undefined && formData?.version?.value !== '' && (payload.version = formData?.version?.value);
      formData?.service_pack?.value !== undefined && formData?.service_pack?.value !== '' && (payload.service_pack = formData?.service_pack?.value);
      formData?.storage?.value !== undefined && formData?.storage?.value !== '' && (payload.storage = formData?.storage?.value);
      formData?.manufacturer?.value !== undefined && formData?.manufacturer?.value !== '' && (payload.manufacturer = formData?.manufacturer?.value);
      formData?.ci_code?.value !== undefined && formData?.ci_code?.value !== '' && (payload.ci_code = formData?.ci_code?.value);
      formData?.environment?.value !== undefined && formData?.environment?.value !== '' && (payload.environment = formData?.environment?.value);
      formData?.location_id?.value !== undefined && formData?.location_id?.value !== '' && (payload.location_id = formData?.location_id?.value);
      formData?.ip_address?.value !== undefined && formData?.ip_address?.value !== '' && (payload.ip_address = formData?.ip_address?.value);
      formData?.hostname?.value !== undefined && formData?.hostname?.value !== '' && (payload.hostname = formData?.hostname?.value);
      // formData?.relationships?.value !== undefined && formData?.relationships?.value !== '' && (payload.relationships = formData?.relationships?.value);
      // formData?.updated_at?.value !== undefined && formData?.updated_at?.value !== '' && (payload.updated_at = formData?.updated_at?.value);
      formData?.ci_name?.value !== undefined && formData?.ci_name?.value !== '' && (payload.ci_name = formData?.ci_name?.value);
      formData?.tags?.value !== undefined && formData?.tags?.value !== '' && (payload.tags = formData?.tags?.value);
      formData?.ci_description?.value !== undefined && formData?.ci_description?.value !== '' && (payload.ci_description = formData?.ci_description?.value);
      formData?.short_description?.value !== undefined && formData?.short_description?.value !== '' && (payload.short_description = formData?.short_description?.value);
      formData?.business_owner?.value !== undefined && formData?.business_owner?.value !== '' && (payload.business_owner = formData?.business_owner?.value);
      // formData?.technical_support_group?.value !== undefined && formData?.technical_support_group?.value !== '' && (payload.technical_support_group = formData?.technical_support_group?.value);
      formData?.vendor?.value !== undefined && formData?.vendor?.value !== '' && (payload.vendor = formData?.vendor?.value);
      formData?.operational_status?.value !== undefined && formData?.operational_status?.value !== '' && (payload.operational_status = formData?.operational_status?.value);
      formData?.lifecycle_stage?.value !== undefined && formData?.lifecycle_stage?.value !== '' && (payload.lifecycle_stage = formData?.lifecycle_stage?.value);
      formData?.parent_ci?.value !== undefined && formData?.parent_ci?.value !== '' && (payload.parent_ci = formData?.parent_ci?.value);
      formData?.child_ci?.value !== undefined && formData?.child_ci?.value !== '' && (payload.child_ci = formData?.child_ci?.value);
      formData?.linked_services?.value !== undefined && formData?.linked_services?.value !== '' && (payload.linked_services = formData?.linked_services?.value);
      formData?.dependency_map?.value !== undefined && formData?.dependency_map?.value !== '' && (payload.dependency_map = formData?.dependency_map?.value);
      formData?.room_number?.value !== undefined && formData?.room_number?.value !== '' && (payload.room_number = formData?.room_number?.value);
      formData?.hardware_specs?.value !== undefined && formData?.hardware_specs?.value !== '' && (payload.hardware_specs = formData?.hardware_specs?.value);
      formData?.security_classification?.value !== undefined && formData?.security_classification?.value !== '' && (payload.security_classification = formData?.security_classification?.value);
      formData?.compliance_status?.value !== undefined && formData?.compliance_status?.value !== '' && (payload.compliance_status = formData?.compliance_status?.value);
      formData?.backup_status?.value !== undefined && formData?.backup_status?.value !== '' && (payload.backup_status = formData?.backup_status?.value);
      formData?.cost_center?.value !== undefined && formData?.cost_center?.value !== '' && (payload.cost_center = formData?.cost_center?.value);
      formData?.license_information?.value !== undefined && formData?.license_information?.value !== '' && (payload.license_information = formData?.license_information?.value);
      formData?.cloud_provider?.value !== undefined && formData?.cloud_provider?.value !== '' && (payload.cloud_provider = formData?.cloud_provider?.value);
      formData?.service_tier?.value !== undefined && formData?.service_tier?.value !== '' && (payload.service_tier = formData?.service_tier?.value);

      payload.created_at = formatDateToMySQLDateTime(new Date().toISOString());
      payload.org_id = orgId;
      payload.active = '1';
      // payload.created_by = userId;
    };

    if (!formData.ci_name) {
      return res.status(400).json({ message: "ci_name and version are required." });
    }

    console.log('ci record payload: ', payload);

    // Build dynamic query based on payload keys
    const columns = Object.keys(payload);
    const values = Object.values(payload);

    if (columns.length === 0) {
      return res.status(400).json({ message: "No valid fields provided." });
    }

    const placeholders = columns.map(() => '?').join(', ');
    const query = `
      INSERT INTO cmdb (${columns.join(', ')})
      VALUES (${placeholders})
    `;

    const [result] = await db.execute(query, values);

    res.status(201).json({ success: true, message: "CI Record created successfully." });
  } catch (err) {
    console.log('error creating CI Record: ', err);
    res.status(500).json({ message: "Internal server error." });
  }
}

const getCIRecordRelations = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "CI ID is required." });
    }

    const query = "SELECT * FROM cmdb WHERE id = ? AND active = '1'";
    const values = [id];

    const [result] = await db.execute(query, values);

    if (result.length === 0) {
      return res.status(404).json({ message: "CI not found." });
    }

    res.status(200).json({
      success: true,
      data: result[0]
    });
  } catch (error) {
    console.error("Error fetching CI record:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

const getOrgCiRecords = async (req, res, next) => {
  try {
    const accessToken = req.headers["authorization"].split(" ")[1]
    // require("jsonwebtoken");
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.id;
    const orgId = await getOrganizationIdWithUserId(userId);
    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required." });
    }

    const query = "SELECT * FROM cmdb WHERE org_id = ? AND active = '1'";
    const values = [orgId];

    const [result] = await db.execute(query, values);
    // console.log('Decoded user ID:', result);

    if (result.length === 0) {
      return res.status(404).json({ message: "No Ci records found for this organization." });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error fetching organization Ci records:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

module.exports = {
  createCIRecord,
  getOrgCiRecords,
  getCIRecordRelations
}