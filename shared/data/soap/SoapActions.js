// const apiUrl = import.meta.env.VITE_HOSTED_API_URL
const apiUrl = process.env.HOSTED_API_URL

const SoapActions = {
  'Create User': {
    configure: {
      "email": {
        value: "",
        isRequired: true,
        type: 'input',
        selectmultiple: true,
      },
      'name': {
        value: "",
        isRequired: false,
        type: 'input',
      },
      decription: {
        value: "",
        isRequired: true,
        type: 'textarea',
      },
      "Import to Core Table": {
        value: false,
        isRequired: false,
        type: 'toggle',
      }
    },
    test: {
      para: {
        type: 'para',
        content: "We'll send a message to the selected user."
      },
      testingFunction: 'testSoapAPIUserCreation'
    }
  },
}

module.exports = SoapActions;