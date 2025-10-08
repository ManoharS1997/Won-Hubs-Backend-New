const apiUrl = process.env.HOSTED_API_URL

const SlackEvents = {
  "New Message From Query": {
    configure: {
      "Search Query": {
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
          "To confirm your trigger is set up correctly, we'll find a recent message in your account.",
        type: "para",
      },
      testingFunction: "testSlackQueryMatchedMessages",
    },
  },
  "New Message Posted to Channel": {
    configure: {
      channel: {
        value: "",
        isRequired: true,
        type: "dropdown",
        api_data: {
          url: `${apiUrl}/api/slack/connections/get-conversation-list`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "Trigger For Bot Messages": {
        value: false,
        isRequired: false,
        type: "toggle",
      },
    },
    test: {
      para: {
        type: "para",
        content:
          "We'll fetch latest messages upto 2 from the channel, that have not appeared previously.",
      },
      testingFunction: "testSlackLatestMessages",
    },
  },
  "New File": {
    configure: {
      channel: {
        value: "",
        isRequired: true,
        type: "dropdown",
        api_data: {
          url: `${apiUrl}/api/slack/connections/get-conversation-list`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      username: {
        value: "",
        isRequired: true,
        type: "dropdown",
        dependent: "channel",
        api_data: {
          url: `${apiUrl}/api/slack/connections/get/all-users/`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      Shared: {
        value: false,
        isRequired: false,
        type: "toggle",
      },
    },
    test: {
      para: {
        type: "para",
        content:
          "We'll fetch latest messages upto 2 from the channel, that have not appeared previously.",
      },
      testingFunction: "testSlackNewFiles",
    },
  },
  "New Mention": {
    configure: {
      username: {
        value: "",
        isRequired: true,
        type: "dropdown",
        api_data: {
          url: `${apiUrl}/api/slack/connections/get/all-workspace-users`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "Highlighted Word": {
        value: "",
        isRequired: false,
        type: "input",
      },
      "Trigger For Bot Messages": {
        value: false,
        isRequired: false,
        type: "toggle",
      },
    },
    test: {
      para: {
        type: "para",
        content:
          "We'll fetch latest messages upto 2 from the channel, that have not appeared previously.",
      },
      testingFunction: "testMentions",
    },
  },
  "New Channel": {
    configure: {},
    test: {
      para: {
        type: "para",
        content:
          "To confirm your trigger is set up correctly, we'll find recent channels in your account:",
      },
      testingFunction: "testRecentChannels",
    },
  },
  "New Message Posted to Private Channel": {
    configure: {
      channel: {
        value: "",
        isRequired: true,
        type: "dropdown",
        api_data: {
          url: `${apiUrl}/api/slack/connections/get-conversation-list`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "Trigger For Bot Messages": {
        value: false,
        isRequired: false,
        type: "toggle",
      },
    },
    test: {
      para: {
        type: "para",
        content:
          "To confirm your trigger is set up correctly, we'll find recent private_channel_messages in your account:",
      },
      testingFunction: "testRecentMessagesInprivateChannel",
    },
  },
  "New Public Message Posted Anywhere": {
    configure: {
      "Trigger For Bot Messages": {
        value: false,
        isRequired: false,
        type: "toggle",
      },
      "Optimized data": {
        value: false,
        isRequired: false,
        type: "toggle",
      },
    },
    test: {
      para: {
        type: "para",
        content:
          "To confirm your trigger is set up correctly, we'll find recent anywhere_messages in your account:",
      },
      testingFunction: "testRecentMessagesInprivateChannel",
    },
  },
  "New Pushed Message": {
    configure: {
      "Flow Identifier": {
        value: "",
        isRequired: true,
        type: "input",
      },
      "Access Type": {
        value: "",
        isRequired: true,
        type: "dropdown",
        options: [
          { label: "Only Me", value: "Only Me" },
          { label: "Specific users", value: "Specific users" },
          {
            label: "Anyone in my workspace",
            value: "Anyone in my workspace",
          },
        ],
      },
    },
    test: {
      para: {
        type: "para",
        content:
          "To confirm your trigger is set up correctly, we'll find recent pushed messages in your account:",
      },
      testingFunction: "",
    },
  },
  "New Reaction Added": {
    configure: {
      channel: {
        value: "",
        isRequired: true,
        type: "dropdown",
        api_data: {
          url: `${apiUrl}/api/slack/connections/get-conversation-list`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      Reaction: {
        value: "",
        isRequired: true,
        type: "dropdown",
        api_data: {
          url: `${apiUrl}/api/slack/connections/get-conversation-list`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      username: {
        value: "",
        isRequired: true,
        type: "dropdown",
        dependent: "channel",
        api_data: {
          url: `${apiUrl}/api/slack/connections/get/all-users/`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
    },
    test: {
      para: {
        type: "para",
        content:
          "To confirm your trigger is set up correctly, we'll find recent reactions in your account:",
      },
      testingFunction: "",
    },
  },
  "New Saved Message": {
    configure: {},
    test: {
      para: {
        type: "para",
        content:
          "To confirm your trigger is set up correctly, we'll find recent saved messages in your account:",
      },
      testingFunction: "",
    },
  },
  "New Team Custom Emoji": {
    configure: {
      "Include Alias": {
        value: false,
        isRequired: false,
        type: "toggle",
      },
    },
    test: {
      para: {
        type: "para",
        content:
          "To confirm your trigger is set up correctly, we'll find recent emojis in your account:",
      },
      testingFunction: "",
    },
  },
  "New User": {
    configure: {},
    test: {
      para: {
        type: "para",
        content:
          "To confirm your trigger is set up correctly, we'll find recent users in your account:",
      },
      testingFunction: "",
    },
  },
}

module.exports = SlackEvents;