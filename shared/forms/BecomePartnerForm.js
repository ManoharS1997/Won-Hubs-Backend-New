const apiUrl = process.env.HOSTED_API_URL;
const IconsList = require('../IconsList');

const BecomePartnerFormFields = {
  step1: [
    {
      type: "input",
      name: "company_name",
      label: "Company Name",
      contentType: "string",
      placeholder: "Enter Company Name",
      customStyles: {},
      isMandatory: true,
      iconName: IconsList.organization,
    },
    {
      type: "input",
      name: "website",
      label: "Company Website",
      contentType: "url",
      placeholder: "Enter Website URL",
      customStyles: {},
      isMandatory: false,
      iconName: IconsList.link,
    },
    {
      type: "input",
      name: "experience_years",
      label: "Years of Experience",
      contentType: "number",
      placeholder: "Enter Years of Relevant Experience",
      customStyles: {},
      isMandatory: true,
      iconName: IconsList.timer,
    },
    {
      type: "dropdown",
      name: "team_size",
      label: "Team Size",
      placeholder: "Enter Number of Technical Staff",
      customStyles: {},
      isMandatory: true,
      iconName: IconsList.users,
      options: [
        { value: "1-10", label: "1-10" },
        { value: "11-50", label: "11-50" },
        { value: "51-100", label: "51-100" },
        { value: "101-250", label: "101-250" },
        { value: "251-500", label: "251-500" },
        { value: "501-1000", label: "501-1000" },
        { value: "1000+", label: "1000+" },
      ],
    },
    // {
    //   type: "input",
    //   name: "partner_reference_number",
    //   label: "Partner Reference Number",
    //   contentType: "string",
    //   placeholder: "Enter Reference Number (if assigned)",
    //   customStyles: {},
    //   isMandatory: true,
    //   iconName: IconsList.ref,
    // },
    {
      type: "input",
      name: "contact_person",
      label: "Primary Contact Name",
      contentType: "string",
      placeholder: "Enter Contact Person Name",
      customStyles: {},
      isMandatory: true,
      iconName: IconsList.user,
    },
    {
      type: "input",
      name: "contact_email",
      label: "Email",
      contentType: "email",
      placeholder: "Enter Contact Email",
      customStyles: {},
      isMandatory: true,
      iconName: IconsList.email,
    },
    {
      type: "phone",
      name: "contact_phone",
      label: "Phone Number",
      placeholder: "Enter Phone Number",
      customStyles: {},
      isMandatory: true,
      iconName: IconsList.phone,
    },
    {
      type: "dropdown",
      name: "communication_skill_level",
      label: "Communication & Negotiation Skills",
      contentType: "string",
      placeholder: "Select Skill Level",
      isMandatory: true,
      iconName: IconsList.communicationSkill,
      options: [
        { value: "basic", label: "Basic" },
        { value: "intermediate", label: "Intermediate" },
        { value: "advanced", label: "Advanced" },
        { value: "expert", label: "Expert" },
      ],
    }
  ],

  step2: [
    {
      type: "dropdown",
      name: "partnership_type",
      label: "Partnership Type",
      contentType: "string",
      placeholder: "Choose Partnership Type",
      customStyles: {},
      isMandatory: true,
      options: [
        { value: "sales", label: "Sales Partner" },
        { value: "services", label: "Service Partner" },
        { value: "technology", label: "Technology Partner" },
      ],
    },
    {
      type: "dropdown",
      name: "sales_channels",
      label: "Sales Channels Used",
      isMandatory: true,
      options: [
        { label: "Email", value: "email" },
        { label: "Phone", value: "phone" },
        { label: "Cold Calling", value: "cold_calling" },
        { label: "WhatsApp", value: "whatsapp" },
        { label: "Traditional / In-person", value: "traditional" }
      ]
    },
    {
      type: "textarea",
      name: "partnership_reason",
      label: "Why are you applying for this partnership?",
      placeholder: "Describe your motivation and value proposition",
      rows: 2,
      resize: true,
      isMandatory: true
    },
    {
      type: "textarea",
      name: "success_stories",
      label: "Success Stories or Achievements",
      placeholder: "Mention any relevant achievements or past success stories",
      resize: true,
      rows: 2,
      isMandatory: false
    },
    {
      type: "textarea",
      name: "sales_model",
      label: "Sales Model & Approach",
      placeholder: "Describe your approach to selling and reaching clients",
      resize: true,
      rows: 2,
      isMandatory: true
    },
    {
      type: "textarea",
      name: "expertise_description",
      label: "Expertise in Nowit Services",
      contentType: "string",
      placeholder: "Describe your technical expertise with Nowit Services",
      customStyles: {},
      resize: true,
      rows: 2,
      isMandatory: true,
      iconName: IconsList.description,
    },
    {
      type: "textarea",
      name: "tools_experience",
      label: "ITSM Tools Experience",
      contentType: "string",
      placeholder: "List tools/technologies used for IT service management",
      customStyles: {},
      resize: true,
      rows: 2,
      isMandatory: true,
      iconName: IconsList.tools,
    },
  ],

  step3: [
    // {
    //   type: "input",
    //   name: "company_profile",
    //   label: "Upload Company Profile (Optional)",
    //   placeholder: "Attach a PDF or presentation",
    //   isMandatory: false,
    //   accept: ".pdf,.pptx,.docx",
    //   iconName: IconsList.profile
    // },
    {
      type: "toggle",
      name: "agree_quality_standards",
      label: "I agree to follow Nowit Services' quality and service standards.",
      customStyles: {},
      isMandatory: true,
    },
    {
      type: "toggle",
      name: "agree_regulations",
      label: "I comply with all applicable regional and central government regulations.",
      customStyles: {},
      isMandatory: true,
    },
    {
      type: "toggle",
      name: "agree_license_terms",
      label: "I understand partner licenses are reviewed and may be updated based on performance.",
      customStyles: {},
      isMandatory: true,
    },
    {
      type: "toggle",
      name: "agree_program_changes",
      label: "I accept that the Product Owner may update program terms at any time.",
      customStyles: {},
      isMandatory: true,
    }
  ]
};


module.exports = BecomePartnerFormFields;
