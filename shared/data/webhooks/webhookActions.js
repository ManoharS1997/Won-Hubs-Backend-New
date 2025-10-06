import Cookies from "js-cookie";
const apiUrl = process.env.HOSTED_API_URL

const webhookActions = {
  "Custom Request": {
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
      "Method": {
        value: '',
        isRequired: false,
        type: "dropdown",
        options: [
          { label: "POST", option: "POST" },
          { label: "GET", option: "GET" },
          { label: "PUT", option: "PUT" },
          { label: "DELETE", option: "DELETE" },
          { label: "PATCH", option: "PATCH" },
        ]
      },
      "Url": {
        value: '',
        isRequired: true,
        type: "input",
      },
      "Data": {
        value: "",
        isRequired: true,
        type: "textarea",
        rows: 10,
      },
      "Basic Auth": {
        value: "",
        isRequired: true,
        type: "input"
      },
      "Headers": {
        value: "",
        isRequired: false,
        type: "multiVariables",
        name: "Headers",
        label: "Headers",
        contentType: "string",
        placeholder: "Enter Headers of the request",
        customStyles: {
          container: '!flex-col !gap-2',
          label: 'w-fit',
          inputFields: '!w-full'
        },
      },
      "Return Raw Response": {
        value: false,
        isRequired: false,
        type: 'toggle',
      },
      "Import to Core Table": {
        value: false,
        isRequired: false,
        type: 'toggle',
      }
    },
    test: {
      para: {
        type: "para",
        content: "To test Trello, we need to call the webhook with the parameters to get a response.",
      },
      testingFunction: "testCustomActionRequest",
    }
  },
  "GET": {
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
      "Method": {
        value: '',
        isRequired: false,
        type: "dropdown",
        options: [
          { label: "POST", option: "POST" },
          { label: "GET", option: "GET" },
          { label: "PUT", option: "PUT" },
          { label: "DELETE", option: "DELETE" },
          { label: "PATCH", option: "PATCH" },
        ]
      },
      "Url": {
        value: '',
        isRequired: true,
        type: "input",
      },
      "Query Params": {
        value: "",
        isRequired: false,
        type: "multiVariables",
        name: "Query Params",
        label: "Query Params",
        contentType: "string",
        placeholder: "Enter Query Params of the request",
        customStyles: {
          container: '!flex-col !gap-2',
          label: 'w-fit',
          inputFields: '!w-full'
        },
      },
      "Send As JSON": {
        value: "",
        isRequired: false,
        type: "toggle"
      },
      "JSON Key": {
        value: "",
        isRequired: false,
        type: "toggle"
      },
      "Basic Auth": {
        value: "",
        isRequired: true,
        type: "input"
      },
      "Headers": {
        value: "",
        isRequired: false,
        type: "multiVariables",
        name: "Headers",
        label: "Headers",
        contentType: "string",
        placeholder: "Enter Headers of the request",
        customStyles: {
          container: '!flex-col !gap-2',
          label: 'w-fit',
          inputFields: '!w-full'
        },
      },
      "Import to Core Table": {
        value: false,
        isRequired: false,
        type: 'toggle',
      }
    },
    test: {
      para: {
        type: "para",
        content: "To test Trello, we need to call the webhook with the parameters to get a response.",
      },
      testingFunction: "testGETActionRequest",
    }
  },
  "POST": {
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
      "Method": {
        value: '',
        isRequired: false,
        type: "dropdown",
        options: [
          { label: "POST", option: "POST" },
          { label: "GET", option: "GET" },
          { label: "PUT", option: "PUT" },
          { label: "DELETE", option: "DELETE" },
          { label: "PATCH", option: "PATCH" },
        ]
      },
      "Url": {
        value: '',
        isRequired: true,
        type: "input",
      },
      "Payload Type": {
        value: '',
        isRequired: false,
        type: "dropdown",
        options: [
          { label: "JSON", option: "json" },
          { label: "Form", option: "form" },
          { label: "Xml", option: "xml" },
          { label: "Raw", option: "raw" },
        ]
      },
      "Data": {
        value: "",
        isRequired: false,
        type: "multiVariables",
        name: "Data",
        label: "Data",
        contentType: "string",
        placeholder: "Enter Data of the request",
        customStyles: {
          container: '!flex-col !gap-2',
          label: 'w-fit',
          inputFields: '!w-full'
        },
      },
      "Wrap Request In Array": {
        value: "",
        isRequired: false,
        type: "toggle"
      },
      "Basic Auth": {
        value: "",
        isRequired: true,
        type: "input"
      },
      "Headers": {
        value: "",
        isRequired: false,
        type: "multiVariables",
        name: "Headers",
        label: "Headers",
        contentType: "string",
        placeholder: "Enter Headers of the request",
        customStyles: {
          container: '!flex-col !gap-2',
          label: 'w-fit',
          inputFields: '!w-full'
        },
      },
      "Import to Core Table": {
        value: false,
        isRequired: false,
        type: 'toggle',
      }
    },
    test: {
      para: {
        type: "para",
        content: "To test Trello, we need to call the webhook with the parameters to get a response.",
      },
      testingFunction: "testPOSTActionRequest",
    }
  },
  "PUT": {
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
      "Method": {
        value: '',
        isRequired: false,
        type: "dropdown",
        options: [
          { label: "POST", option: "POST" },
          { label: "GET", option: "GET" },
          { label: "PUT", option: "PUT" },
          { label: "DELETE", option: "DELETE" },
          { label: "PATCH", option: "PATCH" },
        ]
      },
      "Url": {
        value: '',
        isRequired: true,
        type: "input",
      },
      "Payload Type": {
        value: '',
        isRequired: false,
        type: "dropdown",
        options: [
          { label: "JSON", option: "json" },
          { label: "Form", option: "form" },
          { label: "Xml", option: "xml" },
          { label: "Raw", option: "raw" },
        ]
      },
      "Data": {
        value: "",
        isRequired: false,
        type: "multiVariables",
        name: "Data",
        label: "Data",
        contentType: "string",
        placeholder: "Enter Data of the request",
        customStyles: {
          container: '!flex-col !gap-2',
          label: 'w-fit',
          inputFields: '!w-full'
        },
      },
      "Wrap Request In Array": {
        value: "",
        isRequired: false,
        type: "toggle"
      },
      "Basic Auth": {
        value: "",
        isRequired: true,
        type: "input"
      },
      "Headers": {
        value: "",
        isRequired: false,
        type: "multiVariables",
        name: "Headers",
        label: "Headers",
        contentType: "string",
        placeholder: "Enter Headers of the request",
        customStyles: {
          container: '!flex-col !gap-2',
          label: 'w-fit',
          inputFields: '!w-full'
        },
      },
      "Import to Core Table": {
        value: false,
        isRequired: false,
        type: 'toggle',
      }
    },
    test: {
      para: {
        type: "para",
        content: "To test Trello, we need to call the webhook with the parameters to get a response.",
      },
      testingFunction: "testPUTActionRequest",
    }
  },
}

module.exports = webhookActions;