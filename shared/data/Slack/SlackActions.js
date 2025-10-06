const apiUrl = process.env.HOSTED_API_URL


const SlackActions = {
  'Send Direct Message': {
    configure: {
      "users": {
        value: "",
        isRequired: true,
        type: 'multi-dropdown',
        selectmultiple: true,
        api_data: {
          url: `${apiUrl}/api/slack/connections/get/all-workspace-users`,
          options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: JSON.parse(localStorage.getItem('activeUserData'))?.id })
          }
        }
      },
      message: {
        value: "",
        isRequired: true,
        type: 'textarea',
      },
      'Attachment': {
        value: "",
        isRequired: false,
        type: 'file',
      },
      "Send as a bot": {
        value: false,
        isRequired: false,
        type: 'toggle',
      },
      "Attach Image by URL": {
        value: '',
        isRequired: false,
        type: 'input',
      },
      "Link Usernames and Channel Names?": {
        value: false,
        isRequired: false,
        type: 'toggle',
      },
      "Scheduled at": {
        value: "",
        isRequired: false,
        type: 'datetime',
        showTime: true,
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
      testingFunction: 'testSendDirectMessages'
    }
  },
  'Send Channel Message': {
    configure: {
      channel: {
        value: "",
        isRequired: true,
        type: 'dropdown',
        api_data: {
          url: `${apiUrl}/api/slack/connections/get-conversation-list`,
          options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: JSON.parse(localStorage.getItem('activeUserData'))?.id })
          }
        }
      },
      message: {
        value: "",
        isRequired: true,
        type: 'textarea',
      },
      'Attachment': {
        value: "",
        isRequired: false,
        type: 'file',
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
        content: "We'll send a message to the selected channel."
      },
      testingFunction: ''
    }
  },
  'Send Channel Message With Attachment': {
    configure: {
      channel: {
        value: "",
        isRequired: true,
        type: 'dropdown',
        api_data: {
          url: `${apiUrl}/api/slack/connections/get-conversation-list`,
          options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: JSON.parse(localStorage.getItem('activeUserData'))?.id })
          }
        }
      },
      message: {
        value: "",
        isRequired: true,
        type: 'textarea',
      },
      'Attachment': {
        value: "",
        isRequired: true,
        type: 'file',
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
        content: "We'll send a message to the selected channel."
      },
      testingFunction: ''
    }
  },
  'Send Direct Message With Attachment': {
    configure: {
      username: {
        value: "",
        isRequired: true,
        type: 'dropdown',
        api_data: {
          url: `${apiUrl}/api/slack/connections/get/all-workspace-users`,
          options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: JSON.parse(localStorage.getItem('activeUserData'))?.id })
          }
        }
      },
      message: {
        value: "",
        isRequired: true,
        type: 'textarea',
      },
      'Attachment': {
        value: "",
        isRequired: true,
        type: 'file',
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
      testingFunction: ''
    }
  },
  'Add reminder': {
    configure: {
      'Reminder Time': {
        value: "",
        isRequired: true,
        type: 'datetime',
      },
      'Reminder Message': {
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
        content: "We'll add a reminder for the selected time."
      },
      testingFunction: ''
    }
  },
  'Create Channel': {
    configure: {
      'Channel Name': {
        value: "",
        isRequired: true,
        type: 'input',
      },
      'Purpose': {
        value: "",
        isRequired: true,
        type: 'input',
      },
      'Is Private': {
        value: false,
        isRequired: false,
        type: 'toggle',
      },
      'Invite Users': {
        value: "",
        isRequired: false,
        type: 'dropdown',
        api_data: {
          url: `${apiUrl}/api/slack/connections/get/all-users`,
          options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: JSON.parse(localStorage.getItem('activeUserData'))?.id })
          }
        }
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
        content: "We'll create a channel with the given details."
      },
      testingFunction: ''
    }
  },
  'Create Private Channel': {
    configure: {
      'Channel Name': {
        value: "",
        isRequired: true,
        type: 'input',
      },
      'Purpose': {
        value: "",
        isRequired: true,
        type: 'input',
      },
      'Invite Users': {
        value: "",
        isRequired: false,
        type: 'dropdown',
        api_data: {
          url: `${apiUrl}/api/slack/connections/get/all-users`,
          options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: JSON.parse(localStorage.getItem('activeUserData'))?.id })
          }
        }
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
        content: "We'll create a private channel with the given details."
      },
      testingFunction: ''
    }
  },
  'Delete Message': {
    configure: {
      channel: {
        value: "",
        isRequired: true,
        type: 'dropdown',
        api_data: {
          url: `${apiUrl}/api/slack/connections/get-conversation-list`,
          options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: JSON.parse(localStorage.getItem('activeUserData'))?.id })
          }
        }
      },
      message: {
        value: "",
        isRequired: true,
        type: 'dropdown',
        api_data: {
          url: `${apiUrl}/api/slack/connections/get-messages/${'channel'}`,
          options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: JSON.parse(localStorage.getItem('activeUserData'))?.id })
          }
        }
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
        content: "We'll delete the selected message."
      },
      testingFunction: ''
    }
  },
  'Edit Message': {
    configure: {
      channel: {
        value: "",
        isRequired: true,
        type: 'dropdown',
        api_data: {
          url: `${apiUrl}/api/slack/connections/get-conversation-list`,
          options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: JSON.parse(localStorage.getItem('activeUserData'))?.id })
          }
        }
      },
      message: {
        value: "",
        isRequired: true,
        type: 'dropdown',
        api_data: {
          url: `${apiUrl}/api/slack/connections/get-messages/${'channel'}`,
          options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: JSON.parse(localStorage.getItem('activeUserData'))?.id })
          }
        }
      },
      'Edited Message': {
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
        content: "We'll edit the selected message."
      },
      testingFunction: ''
    }
  },
  'Find Public Channel': {
    configure: {
      'Channel Name': {
        value: "",
        isRequired: true,
        type: 'input',
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
        content: "We'll find the selected public channel."
      },
      testingFunction: ''
    }
  },
  'Get Message By Timestamp': {
    configure: {
      channel: {
        value: "",
        isRequired: true,
        type: 'dropdown',
        api_data: {
          url: `${apiUrl}/api/slack/connections/get-conversation-list`,
          options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: JSON.parse(localStorage.getItem('activeUserData'))?.id })
          }
        }
      },
      timestamp: {
        value: "",
        isRequired: true,
        type: 'datetime',
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
        content: "We'll find the message by the selected timestamp."
      },
      testingFunction: ''
    }
  },
  'Raise A Ticket in Wonhubs by Hashtag': {
    configure: {
      'channel': {
        value: "",
        isRequired: true,
        type: 'dropdown',
        api_data: {
          url: `${apiUrl}/api/slack/connections/get-conversation-list`,
          options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: JSON.parse(localStorage.getItem('activeUserData'))?.id })
          }
        }
      },
      'Hashtag': {
        value: "",
        isRequired: true,
        type: 'input',
      },
      // 'Ticket Title': {
      //     value: "",
      //     isRequired: true,
      //     type: 'input',
      // },
      // 'Ticket Description': {
      //     value: "",
      //     isRequired: true,
      //     type: 'textarea',
      // },
      // 'Priority': {
      //     value: "",
      //     isRequired: true,
      //     type: 'dropdown',
      //     options: [
      //         { label: 'High', value: 'High' },
      //         { label: 'Medium', value: 'Medium' },
      //         { label: 'Low', value: 'Low' },
      //     ]
      // },
      // 'Assignee': {
      //     value: "",
      //     isRequired: true,
      //     type: 'dropdown',
      //     api_data: {
      //         url: `${apiUrl}/api/slack/connections/get/all-users`,
      //         options: {
      //             method: 'POST',
      //             headers: { 'Content-Type': 'application/json' },
      //             body: JSON.stringify({ userId: JSON.parse(localStorage.getItem('activeUserData'))?.id })
      //         }
      //     }
      // },
      // 'Due Date': {
      //     value: "",
      //     isRequired: true,
      //     type: 'datetime',
      // },
      // 'Attachment': {
      //     value: "",
      //     isRequired: false,
      //     type: 'file',
      // },
      'Import to Core Table': {
        value: false,
        isRequired: false,
        type: 'toggle',
      }
    },
    test: {
      para: {
        type: 'para',
        content: "We'll raise a ticket in Wonhubs by the selected hashtag.",
      },
      testingFunction: 'fetchLatestMessageWithHashtag'
    }
  },
  'Invite User to Channel': {
    configure: {
      channel: {
        value: "",
        isRequired: true,
        type: 'dropdown',
        api_data: {
          url: `${apiUrl}/api/slack/connections/get-conversation-list`,
          options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: JSON.parse(localStorage.getItem('activeUserData'))?.id })
          }
        }
      },
      username: {
        value: "",
        isRequired: true,
        type: 'dropdown',
        api_data: {
          url: `${apiUrl}/api/slack/connections/get/all-users`,
          options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: JSON.parse(localStorage.getItem('activeUserData'))?.id })
          }
        }
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
        content: "We'll invite the selected user to the channel."
      },
      testingFunction: ''
    }
  },
  'Remove User From Channel': {
    configure: {
      channel: {
        value: "",
        isRequired: true,
        type: 'dropdown',
        api_data: {
          url: `${apiUrl}/api/slack/connections/get-conversation-list`,
          options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: JSON.parse(localStorage.getItem('activeUserData'))?.id })
          }
        }
      },
      username: {
        value: "",
        isRequired: true,
        type: 'dropdown',
        api_data: {
          url: `${apiUrl}/api/slack/connections/get/all-users`,
          options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: JSON.parse(localStorage.getItem('activeUserData'))?.id })
          }
        }
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
        content: "We'll remove the selected user from the channel."
      },
      testingFunction: ''
    }
  },
  'Retrieve Thread Messages': {
    configure: {
      channel: {
        value: "",
        isRequired: true,
        type: 'dropdown',
        api_data: {
          url: `${apiUrl}/api/slack/connections/get-conversation-list`,
          options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: JSON.parse(localStorage.getItem('activeUserData'))?.id })
          }
        }
      },
      thread_ts: {
        value: "",
        isRequired: true,
        type: 'input',
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
        content: "We'll retrieve the thread messages."
      },
      testingFunction: ''
    }
  },
  'Send Private Channel Message': {
    configure: {
      channel: {
        value: "",
        isRequired: true,
        type: 'dropdown',
        api_data: {
          url: `${apiUrl}/api/slack/connections/get-conversation-list`,
          options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: JSON.parse(localStorage.getItem('activeUserData'))?.id })
          }
        }
      },
      message: {
        value: "",
        isRequired: true,
        type: 'textarea',
      },
      'Attachment': {
        value: "",
        isRequired: false,
        type: 'file',
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
        content: "We'll send a message to the selected private channel."
      },
      testingFunction: ''
    }
  },
  'Set Channel Topic': {
    configure: {
      channel: {
        value: "",
        isRequired: true,
        type: 'dropdown',
        api_data: {
          url: `${apiUrl}/api/slack/connections/get-conversation-list`,
          options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: JSON.parse(localStorage.getItem('activeUserData'))?.id })
          }
        }
      },
      topic: {
        value: "",
        isRequired: true,
        type: 'input',
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
        content: "We'll set the topic for the selected channel."
      },
      testingFunction: ''
    }
  },
  'Set Status': {
    configure: {
      'Status Text': {
        value: "",
        isRequired: true,
        type: 'input',
      },
      'Status Emoji': {
        value: "",
        isRequired: true,
        type: 'input',
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
        content: "We'll set the status for the user."
      },
      testingFunction: ''
    }
  },
  'Update Profile': {
    configure: {
      'Name': {
        value: "",
        isRequired: true,
        type: 'input',
      },
      'Profile Picture': {
        value: "",
        isRequired: false,
        type: 'file',
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
        content: "We'll update the profile for the user."
      },
      testingFunction: ''
    }
  },
}

module.exports = SlackActions;