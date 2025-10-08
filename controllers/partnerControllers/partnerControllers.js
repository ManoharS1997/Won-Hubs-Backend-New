const { db } = require('../../config/DB-connection')
const formatDateToMySQLDateTime = require("../../helpers/formatDateString")

const CreatePartner = async (req, res) => {
  try {
    const { formData } = req.body

    const payload = {
      company_name: formData.company_name.value,
      website: formData.website.value,
      experience_years: formData.experience_years.value,
      team_size: formData.team_size.value,
      contact_person: formData.contact_person.value,
      contact_email: formData.contact_email.value,
      contact_phone: formData.contact_phone.value,
      communication_skill_level: formData.communication_skill_level.value,
      partnership_type: formData.partnership_type.value,
      sales_channels: formData.sales_channels.value,
      partnership_reason: formData.partnership_reason.value,
      success_stories: formData.success_stories.value,
      sales_model: formData.sales_model.value,
      expertise_description: formData.expertise_description.value,
      tools_experience: formData.tools_experience.value,
      legal_documents: formData.documents,
      company_profile: formData.profileImage,
      agree_quality_standards: formData.agree_quality_standards.value,
      agree_regulations: formData.agree_regulations.value,
      agree_license_terms: formData.agree_license_terms.value,
      agree_program_changes: formData.agree_program_changes.value,
      state: 'true',
      status: 'new',
      submitted_on: formatDateToMySQLDateTime(new Date()),
      // partnership_start_date: formatDateToMySQLDateTime(new Date()),
      // partnership_end_date: formatDateToMySQLDateTime(new Date()),
      // contract_date: formatDateToMySQLDateTime(new Date()),
      partner_number: '',
      partner_category: '',
    }
    const columns = Object.keys(payload).join(', ');
    const values = Object.values(payload);
    const placeholders = values.map(() => '?').join(', ');

    const query = `INSERT INTO partners (${columns}) VALUES (${placeholders})`;

    // Assuming you have a db connection object named `db`
    await db.execute(query, values);

    res.status(201).json({ success: true, message: 'Partner created successfully' });
  } catch (err) {
    console.log('Error Creating Partner record: ', err)
    res.status(500).json({ success: false, message: `Error Creating Partner record: , ${err}` })
  }
}

module.exports = { CreatePartner }