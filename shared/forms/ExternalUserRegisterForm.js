const IconsList = require('../IconsList')

const ExternalUserRegistrationformFieldsData = [
  {
    type: 'input',
    inputType: 'string',
    name: 'first_name',
    label: 'First Name',
    value: '',
    placeholder: 'Enter first name',
    isMandatory: true,
  },
  {
    type: 'input',
    name: 'last_name',
    label: 'Last Name',
    value: '',
    placeholder: 'Enter last name',
    isMandatory: true,
    inputType: 'string',
  },
  {
    type: 'input',
    inputType: 'email',
    name: 'email',
    label: 'Email',
    placeholder: 'Enter Email Address',
    value: '',
    isMandatory: true,
    iconName: IconsList.email
  },
  {
    type: 'input',
    name: 'username',
    label: 'Username',
    placeholder: 'Enter Username',
    value: '',
    isMandatory: true,
    inputType: 'string',
    iconName: 'TbUserCode'
  },
  {
    type: 'input',
    name: 'password',
    label: 'Password',
    placeholder: 'Enter password',
    value: '',
    isMandatory: true,
    inputType: 'password',
    iconName: 'MdPassword'
  },
  {
    type: 'input',
    name: 'confirm_password',
    label: 'Confirm Password',
    value: '',
    isMandatory: true,
    placeholder: 'Re-Type password',
    iconName: 'MdPassword',
    inputType: 'password',
  },
]

module.exports = ExternalUserRegistrationformFieldsData