import Cookies from "js-cookie";
const apiUrl = process.env.HOSTED_API_URL

const webhookEvents = {
  "Catch Hook": {
    configure: {
      "Webhook Url": {
        value: "",
        isRequired: true,
        type: "dropdown",
        api_data: {
          url: `${apiUrl}/api/webhooks/org/webhooks/active`,
          options: {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${Cookies.get("accessToken")}`,
            },
          },
        },
      },
      "Outside Webhook": {
        value: '',
        isRequired: true,
        type: "input",
      },
      "Method": {
        value: '',
        isRequired: false,
        type: "dropdown",
        options: [
          { label: "POST", option: "POST" },
          { label: "GET", option: "GET" },
          { label: "PUT", option: "PUT" },
        ]
      },
      "Path Extension": {
        value: "",
        isRequired: true,
        type: "input",
      },
      "Params": {
        value: "",
        isRequired: false,
        type: "multiVariables",
        name: "Params",
        label: "Params",
        contentType: "string",
        placeholder: "Enter Params of the request",
        customStyles: {
          container: '!flex-col !gap-2',
          label: 'w-fit',
          inputFields: '!w-full'
        },
      },
    },
    test: {
      test_trigger: {
        content:
          "To confirm your trigger is set up correctly, we'll find recent requests in your account.",
        type: "para",
      },
      testingFunction: "testCatchWebhook",
    },
  },
  "Catch Raw Hook": {
    configure: {
      "Webhook Url": {
        value: "",
        isRequired: true,
        type: "input",
      },
    },
    test: {
      test_trigger: {
        content:
          "To confirm your trigger is set up correctly, we'll find recent requests in your account.",
        type: "para",
      },
      testingFunction: "",
    },
  },
}; 

module.exports = webhookEvents;