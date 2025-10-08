const apiUrl = process.env.HOSTED_API_URL


const SoapEvents = {
  "Retrieve Data": {
    configure: {
      Method: {
        value: "",
        isRequired: true,
        type: "input",
      },
      "Optimized Data": {
        value: "",
        isRequired: false,
        type: "toggle",
      },
    },
    test: {
      test_trigger: {
        content:
          "To confirm your trigger is set up correctly, we'll fetch some data from the API.",
        type: "para",
      },
      testingFunction: "testSoapIntegrationAPI",
    },
  },
}; 

module.exports = SoapEvents;