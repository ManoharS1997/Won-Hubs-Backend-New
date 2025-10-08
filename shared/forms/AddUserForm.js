
const apiUrl = process.env.HOSTED_API_URL
const IconsList = require('../IconsList')
const IconstList = require('../IconsList')

const AddUserFormFields = [
  {
    type: "dropdown",
    name: "user_type",
    label: "User Type",
    contentType: "string",
    placeholder: "Enter Relation Name",
    customStyles: {},
    isMandatory: true,
    iconName: 'TbUserQuestion',
    options: [
      { value: 'internal', label: 'Internal User' },
      { value: 'external', label: 'External User' },
    ]
  },
  {
    type: "dropdown",
    name: "title",
    label: "Title",
    contentType: "string",
    placeholder: "Select Title",
    customStyles: {},
    isMandatory: true,
    options: [
      { value: "mr", label: "Mr" },
      { value: "ms", label: "Ms" },
      { value: "mrs", label: "Mrs" },
      { value: "other", label: "Other" },
    ],
  },
  {
    type: "input",
    name: "first_name",
    label: "First Name",
    contentType: "string",
    placeholder: "Enter First Name",
    customStyles: {},
    isMandatory: true
  },
  {
    type: "input",
    name: "last_name",
    label: "Last Name",
    contentType: "string",
    placeholder: "Enter Last Name",
    customStyles: {},
    isMandatory: true
  },
  {
    type: "dropdown",
    name: "department",
    label: "Department",
    contentType: "string",
    placeholder: "Select Department",
    customStyles: {},
    isMandatory: true,
    iconName: IconstList.department,
    api_data: {
      url: `${apiUrl}/api/department/org-departments`,
      includeAccessToken: true,
      label: ["department_name"],
      value: "id",
      options: {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    },
  },
  {
    type: "input",
    name: "email",
    label: "Email ",
    contentType: "email",
    placeholder: "Enter Email Address",
    customStyles: {},
    isMandatory: true,
    iconName: IconstList.email
  },
  {
    type: "phone",
    name: "phone",
    label: "Phone",
    placeholder: "Enter Phone Number",
    customStyles: {},
    isMandatory: true,
    iconName: IconsList.phone
  },
  {
    type: "timezone",
    name: "timezone",
    label: "Timezone",
    contentType: "string",
    placeholder: "Select Timezone",
    isMandatory: true,
    iconName: IconsList.timezone
  },
  // {
  //   type: "dropdown",
  //   name: "date_format",
  //   label: "Date Format",
  //   placeholder: "Select Date Format",
  //   customStyles: {},
  //   isMandatory: true,
  //   iconName: 'BsCalendarDateFill',
  //   options: [
  //     { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
  //     { label: 'DD-MM-YYYY', value: 'DD-MM-YYYY' },
  //     { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
  //     { label: 'YYYY/MM/DD', value: 'YYYY/MM/DD' },
  //   ]
  // },
  {
    type: "input",
    name: "photo",
    label: "Photo ",
    contentType: "file",
    placeholder: "Select Photo",
    customStyles: {},
    isMandatory: false,
    iconName: 'MdOutlinePhotoCameraFront'
  },
  {
    type: "toggle",
    name: "password_reset",
    label: "Password Needs Reset",
    customStyles: {},
    isMandatory: false,
  },
]

module.exports = AddUserFormFields