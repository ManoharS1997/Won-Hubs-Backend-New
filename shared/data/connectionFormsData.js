// const apiUrl = import.meta.env.VITE_HOSTED_API_URL

const TrelloActions = require("./Trello/TrelloActions");
const TrelloEvents = require("./Trello/TrelloEvents");
const SlackEvents = require("./Slack/SlackEvents");
const SlackActions = require("./Slack/SlackActions");
const SoapEvents = require("./soap/SoapEvents");
const SoapActions = require("./soap/SoapActions");
const webhookEvents = require("./webhooks/webhookEvents");
const webhookActions = require("./webhooks/webhookActions");

const ConnectionFormsFields = {
    Slack: [
        {
            type: "input",
            name: "channel_name",
            label: "Channel Name",
            contentType: "string",
            placeholder: "Enter Channel Name",
            customStyles: {},
            isMandatory: true,
        },
        {
            type: "input",
            name: "purpose",
            label: "Purpose",
            contentType: "string",
            placeholder: "Describe the Purpose",
            customStyles: {},
            isMandatory: true,
        },
        {
            type: "input",
            name: "slack_api_token",
            label: "Slack API Token",
            contentType: "string",
            placeholder: "Enter Api Token",
            customStyles: {},
            isMandatory: true,
        },
        {
            type: "input",
            name: "slack_user_token",
            label: "Slack User Token",
            contentType: "string",
            placeholder: "Enter Api Token",
            customStyles: {},
            isMandatory: true,
        },
        {
            type: "input",
            name: "webhook_url",
            label: "Webhook URL",
            contentType: "string",
            placeholder: "Enter Webhook URL",
            customStyles: {},
            isMandatory: true,
        },
        {
            type: "textarea",
            name: "short_description",
            label: "Short Description",
            contentType: "string",
            placeholder: "Write Some Short Description",
            customStyles: {},
            isMandatory: true,
            rows: 1,
        },
        {
            type: "textarea",
            name: "description",
            label: "Description",
            contentType: "string",
            placeholder: "Write Some Description",
            customStyles: {},
            isMandatory: false,
        },
    ],
    Trello: [
        {
            type: "input",
            name: "name",
            label: "Name",
            contentType: "string",
            placeholder: "Enter Connection Name",
            customStyles: {},
            isMandatory: true,
        },
        {
            type: "input",
            name: "purpose",
            label: "Purpose",
            contentType: "string",
            placeholder: "Describe the Purpose",
            customStyles: {},
            isMandatory: true,
        },
        {
            type: "input",
            name: "api_token",
            label: "API Token",
            contentType: "string",
            placeholder: "Enter Api Token",
            customStyles: {},
            isMandatory: true,
        },
        {
            type: "input",
            name: "oauth_token",
            label: "OAuth Token",
            contentType: "string",
            placeholder: "Enter OAuthToken",
            customStyles: {},
            isMandatory: true,
        },
        // {
        //     type: 'input',
        //     name: 'webhook_url',
        //     label: 'Webhook URL',
        //     contentType: 'string',
        //     placeholder: 'Enter Webhook URL',
        //     customStyles: {},
        //     isMandatory: true
        // },
        {
            type: "textarea",
            name: "short_description",
            label: "Short Description",
            contentType: "string",
            placeholder: "Write Some Short Description",
            customStyles: {},
            isMandatory: true,
            rows: 1,
        },
        {
            type: "textarea",
            name: "description",
            label: "Description",
            contentType: "string",
            placeholder: "Write Some Description",
            customStyles: {},
            isMandatory: false,
        },
    ],
    "Zen-Desk": [
        {
            type: "input",
            name: "name",
            label: "Name",
            contentType: "string",
            placeholder: "Enter Channel Name",
            customStyles: {},
            isMandatory: true,
        },
        {
            type: "input",
            name: "purpose",
            label: "Purpose",
            contentType: "string",
            placeholder: "Describe the Purpose",
            customStyles: {},
            isMandatory: true,
        },
        {
            type: "input",
            name: "zendesk_user_name",
            label: "Zendesk User Name",
            contentType: "string",
            placeholder: "Enter User Name",
            customStyles: {},
            isMandatory: true,
        },
        {
            type: "input",
            name: "zendesk_api_token",
            label: "Zendesk API Token",
            contentType: "string",
            placeholder: "Enter Api Token",
            customStyles: {},
            isMandatory: true,
        },
        {
            type: "input",
            name: "end_point",
            label: "Zendesk End Point",
            contentType: "string",
            placeholder: "Enter Api Token",
            customStyles: {},
            isMandatory: true,
        },
        {
            type: "textarea",
            name: "short_description",
            label: "Short Description",
            contentType: "string",
            placeholder: "Write Some Short Description",
            customStyles: {},
            isMandatory: true,
            rows: 1,
        },
        {
            type: "textarea",
            name: "description",
            label: "Description",
            contentType: "string",
            placeholder: "Write Some Description",
            customStyles: {},
            isMandatory: false,
        },
    ],
    Zapier: [
        {
            type: "input",
            name: "name",
            label: "Name",
            contentType: "string",
            placeholder: "Enter Name",
            customStyles: {},
            isMandatory: true,
        },
        {
            type: "input",
            name: "purpose",
            label: "Purpose",
            contentType: "string",
            placeholder: "Describe the Purpose",
            customStyles: {},
            isMandatory: true,
        },
        {
            type: "input",
            name: "webhook_url",
            label: "Webhook URL",
            contentType: "string",
            placeholder: "Enter Webhook URL",
            customStyles: {},
            isMandatory: true,
        },
        {
            type: "textarea",
            name: "short_description",
            label: "Short Description",
            contentType: "string",
            placeholder: "Write Some Short Description",
            customStyles: {},
            isMandatory: true,
            rows: 1,
        },
        {
            type: "textarea",
            name: "description",
            label: "Description",
            contentType: "string",
            placeholder: "Write Some Description",
            customStyles: {},
            isMandatory: false,
        },
    ],
    Soap: [
        {
            type: "input",
            name: "name",
            label: "Name",
            contentType: "string",
            placeholder: "Enter Name",
            customStyles: {},
            isMandatory: true,
        },
        {
            type: "input",
            name: "purpose",
            label: "Purpose",
            contentType: "string",
            placeholder: "Describe the Purpose",
            customStyles: {},
            isMandatory: true,
        },
        {
            type: "input",
            name: "wsdl_url",
            label: "WSDL URL",
            contentType: "string",
            placeholder: "Enter WSDL URL",
            customStyles: {},
            isMandatory: true,
        },
        {
            type: "multiOptions",
            name: "end_points",
            label: "End Points",
            contentType: "string",
            placeholder: "Enter End points of the URL",
            customStyles: {},
            isMandatory: false,
        },
        {
            type: "input",
            name: "action",
            label: "Action",
            contentType: "string",
            placeholder: "Enter action method",
            customStyles: {},
            isMandatory: true,
        },
        {
            type: "multiVariables",
            name: "headers",
            label: "Headers",
            contentType: "string",
            placeholder: "Enter headers of the request",
            customStyles: {},
            isMandatory: false,
        },
        {
            type: "textarea",
            name: "body",
            label: "Body",
            cols: 20,
            rows: 10,
            contentType: "string",
            placeholder: "Enter Body of the request",
            customStyles: {},
            isMandatory: true,
        },
        {
            type: "textarea",
            name: "short_description",
            label: "Short Description",
            contentType: "string",
            placeholder: "Write Some Short Description",
            customStyles: {},
            isMandatory: true,
            rows: 1,
        },
        {
            type: "textarea",
            name: "description",
            label: "Description",
            contentType: "string",
            placeholder: "Write Some Description",
            customStyles: {},
            isMandatory: false,
        },
    ],
    Webhook: [
        {
            type: "input",
            name: "name",
            label: "Name",
            contentType: "string",
            placeholder: "Enter Channel Name",
            customStyles: {},
            isMandatory: true,
        },
        {
            type: "input",
            name: "purpose",
            label: "Purpose",
            contentType: "string",
            placeholder: "Describe the Purpose",
            customStyles: {},
            isMandatory: true,
        },
        {
            type: "input",
            name: "webhook_url",
            label: "Webhook URL",
            contentType: "string",
            placeholder: "Enter Webhook URL",
            customStyles: {},
            isMandatory: true,
        },
        {
            type: "dropdown",
            name: "http_method",
            label: "HTTP Method",
            contentType: "string",
            placeholder: "Select HTTP Method",
            customStyles: {},
            isMandatory: false,
            options: [
                { value: "PUT", label: "PUT" },
                { value: "POST", label: "POST" },
                { value: "GET", label: "GET" },
            ],
        },
        {
            type: "input",
            name: "content_type",
            label: "Content-Type",
            contentType: "string",
            placeholder: "Enter Content-Type",
            customStyles: {},
            isMandatory: false,
        },
        {
            type: "multiVariables",
            name: "headers",
            label: "Headers",
            contentType: "string",
            placeholder: "Enter headers of the request",
            customStyles: {},
            isMandatory: false,
        },
        {
            type: "jsonEditor",
            name: "payload",
            label: "Payload",
            contentType: "string",
            placeholder: "Enter Pyload",
            customStyles: {},
            isMandatory: false,
        },
        {
            type: "dropdown",
            name: "authentication_type",
            label: "Authentication-Type",
            placeholder: "Select Authentication Type",
            customStyles: {},
            isMandatory: false,
            options: [
                { value: "basic", label: "Basic" },
                { value: "auth", label: "Auth" },
                { value: "baerer-token", label: "Bearer Token" },
                { value: "api-token", label: "API Token" },
            ],
        },
        {
            type: "input",
            name: "username",
            label: "Username",
            contentType: "string",
            placeholder: "Enter User Name",
            customStyles: {},
            isMandatory: false,
        },
        {
            type: "input",
            name: "password",
            label: "Password",
            contentType: "string",
            placeholder: "Enter Password",
            customStyles: {},
            isMandatory: false,
        },
        {
            type: "input",
            name: "token",
            label: "Token",
            contentType: "string",
            placeholder: "Enter Token",
            customStyles: {},
            isMandatory: false,
        },
        {
            type: "input",
            name: "api_key_header",
            label: "API Key Header",
            contentType: "string",
            placeholder: "Enter API Key Header",
            customStyles: {},
            isMandatory: false,
        },
        {
            type: "input",
            name: "api_key_value",
            label: "API Key Value",
            contentType: "string",
            placeholder: "Enter API Key Value",
            customStyles: {},
            isMandatory: false,
        },
        {
            type: "toggle",
            name: "retry_on_failure",
            label: "Retry on Failure",
            contentType: "boolean",
            customStyles: {},
            isMandatory: false,
        },
        {
            type: "input",
            name: "expected_response_code",
            label: "Expected Response Code",
            contentType: "number",
            placeholder: "Enter Expected Response Code",
            customStyles: {},
            isMandatory: false,
        },
        {
            type: "input",
            name: "timeout_duration",
            label: "Timeout Duration",
            contentType: "number",
            placeholder: "Enter Timeout Duration",
            customStyles: {},
            isMandatory: false,
        },
        {
            type: "toggle",
            name: "enable_ssl_verification",
            label: "Enable SSL Verification",
            contentType: "boolean",
            customStyles: {},
            isMandatory: false,
        },
        {
            type: "textarea",
            name: "short_description",
            label: "Short Description",
            contentType: "string",
            placeholder: "Write Some Short Description",
            customStyles: {},
            isMandatory: true,
            rows: 1,
        },
        {
            type: "textarea",
            name: "description",
            label: "Description",
            contentType: "string",
            placeholder: "Write Some Description",
            customStyles: {},
            isMandatory: false,
        },
    ],
};

const eventsData = {
    Slack: SlackEvents,
    Trello: TrelloEvents,
    soap: SoapEvents,
    webhook: webhookEvents
};

const actionsData = {
    Slack: SlackActions,
    Trello: TrelloActions,
    soap: SoapActions,
    webhook: webhookActions


    // "Core Tables": {
    //     "Create Table": {
    //         configure: {
    //             'Table Name': {
    //                 value: "",
    //                 isRequired: true,
    //                 type: 'input',
    //             },
    //             'Table Description': {
    //                 value: "",
    //                 isRequired: true,
    //                 type: 'input',
    //             },
    //             'Table Columns': {
    //                 value: "",
    //                 isRequired: true,
    //                 type: 'input',
    //             }
    //         },
    //         test: {
    //             para: {
    //                 type: 'para',
    //                 content: "We'll create a table with the given details."
    //             },
    //             testingFunction: ''
    //         }
    //     },
    //     "Delete Table": {
    //         configure: {
    //             'Table Name': {
    //                 value: "",
    //                 isRequired: true,
    //                 type: 'input',
    //             }
    //         },
    //         test: {
    //             para: {
    //                 type: 'para',
    //                 content: "We'll delete the table with the given name."
    //             },
    //             testingFunction: ''
    //         }
    //     },
    //     "Insert Data": {
    //         configure: {
    //             'Table': {
    //                 value: "",
    //                 isRequired: true,
    //                 type: 'dropdown',
    //             },
    //             'Data': {
    //                 value: "",
    //                 isRequired: true,
    //                 type: 'input',
    //             }
    //         },
    //         test: {
    //             para: {
    //                 type: 'para',
    //                 content: "We'll insert the data in the table."
    //             },
    //             testingFunction: ''
    //         }
    //     },
    //     "Update Data": {
    //         configure: {
    //             'Table Name': {
    //                 value: "",
    //                 isRequired: true,
    //                 type: 'input',
    //             },
    //             'Data': {
    //                 value: "",
    //                 isRequired: true,
    //                 type: 'input',
    //             }
    //         },
    //         test: {
    //             para: {
    //                 type: 'para',
    //                 content: "We'll update the data in the table."
    //             },
    //             testingFunction: ''
    //         }
    //     },
    //     "Delete Data": {
    //         configure: {
    //             'Table Name': {
    //                 value: "",
    //                 isRequired: true,
    //                 type: 'input',
    //             },
    //             'Data': {
    //                 value: "",
    //                 isRequired: true,
    //                 type: 'input',
    //             }
    //         },
    //         test: {
    //             para: {
    //                 type: 'para',
    //                 content: "We'll delete the data in the table."
    //             },
    //             testingFunction: ''
    //         }
    //     },
    //     "Get Data": {
    //         configure: {
    //             'Table Name': {
    //                 value: "",
    //                 isRequired: true,
    //                 type: 'input',
    //             }
    //         },
    //         test: {
    //             para: {
    //                 type: 'para',
    //                 content: "We'll get the data from the table."
    //             },
    //             testingFunction: ''
    //         }
    //     },
    // }
}

module.exports = {
    ConnectionFormsFields,
    eventsData,
    actionsData
}