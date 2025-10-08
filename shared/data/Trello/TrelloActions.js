
const apiUrl = process.env.HOSTED_API_URL

const TrelloActions = {
  'Find Member': {
    configure: {
      "Organization": {
        value: "",
        isRequired: true,
        type: "dropdown",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/trello/organizations`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "Memeber Name": {
        value: "",
        isRequired: true,
        type: "input",
      },
      "If no search results are found?": {
        value: "",
        isRequired: true,
        type: "dropdown",
        options: [
          { label: "Mark 'successful' and run steps that  search result", option: "true" },
          { label: "Mark 'Safely halted' and skip that use search result", option: "false" },
        ]
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
        content: "To test Trello, we need to search for a member. This is what we will search for:",
      },
      testingFunction: "testFindingUser",
    }
  },
  'Add Attachment to Card': {
    configure: {
      "Board": {
        value: "",
        isRequired: true,
        type: "dropdown",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/trello-boards`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "List": {
        value: "",
        isRequired: true,
        type: "dropdown",
        dependent: "Board",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/board-lists/`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "Card": {
        value: "",
        isRequired: true,
        type: "dropdown",
        dependent: "List",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/list-cards/list/`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "File Attachments": {
        type: 'input',
        value: '',
        isRequired: true,
      },
      "URL Attachments": {
        type: 'input',
        value: '',
        isRequired: true,
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
        content: "To confirm your trigger is set up correctly, we'll find a recently moved card due in the board:",
      },
      testingFunction: "testAddCardAttachment",
    }
  },
  'Add Member to Board': {
    configure: {
      "Board": {
        value: "",
        isRequired: true,
        type: "dropdown",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/trello-boards`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "Member": {
        value: "",
        isRequired: true,
        type: "dropdown",
        dependent: "Board",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/board/members/`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "Membership Type": {
        value: "",
        isRequired: true,
        type: "dropdown",
        options: [
          { label: "Aadmin", option: "admin" },
          { label: "Normal", option: "normal" },
          { label: "Observer", option: "observer" },
        ]
      },
      "Allow Billable Guest": {
        value: "",
        isRequired: true,
        type: "toggle",
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
        content: "To test Trello, we need to create a new add member to board. This is what will be created:",
      },
      testingFunction: "testAddBoardMember",
    }
  },
  'Add Members to Card': {
    configure: {
      "Board": {
        value: "",
        isRequired: true,
        type: "dropdown",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/trello-boards`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "Member(s)": {
        value: "",
        isRequired: true,
        type: "multi-dropdown",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/trello/members`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "List": {
        value: "",
        isRequired: true,
        type: "dropdown",
        dependent: "Board",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/board-lists/`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "Card": {
        value: "",
        isRequired: true,
        type: "dropdown",
        dependent: "List",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/list-cards/list/`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
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
        content: "To test Trello, we need to create a new member. This is what will be created:",
      },
      testingFunction: "testAddCardMember",
    }
  },
  'Close Board': {
    configure: {
      "Board": {
        value: "",
        isRequired: true,
        type: "dropdown",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/trello-boards`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
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
        content: "To test Trello, we need to create a new close_board. This is what will be created:",
      },
      testingFunction: "testCloseBoard",
    }
  },
  'Create Board': {
    configure: {
      "Organization": {
        value: "",
        isRequired: true,
        type: "dropdown",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/trello/organizations`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "Name": {
        value: "",
        isRequired: true,
        type: "input",
      },
      "Description": {
        value: "",
        isRequired: true,
        type: "textarea",
      },
      "Permission Level": {
        value: "",
        isRequired: true,
        type: "dropdown",
        options: [
          { label: 'Private', option: 'private' },
          { label: 'Organization', option: 'org' },
          { label: 'Public', option: 'public' },
        ]
      },
      "Allow Any Team Member to Join This Board?": {
        type: 'toggle',
        value: '',
        isRequired: true,
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
        content: "To test Trello, we need to create a new board. This is what will be created:",
      },
      testingFunction: "testCreateTrelloBoard",
    }
  },
  'Create Card': {
    configure: {
      "Board": {
        value: "",
        isRequired: true,
        type: "dropdown",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/trello-boards`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "List": {
        value: "",
        isRequired: true,
        type: "dropdown",
        dependent: "Board",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/board-lists/`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "Name": {
        value: "",
        isRequired: true,
        type: "input",
      },
      "Description": {
        value: "",
        isRequired: true,
        type: "textarea",
      },
      "Label": {
        value: "",
        isRequired: true,
        type: "dropdown",
        dependent: "Board",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/board/labels/`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "Custom Label": {
        value: "",
        isRequired: true,
        type: "input",
      },
      "Card Position": {
        value: "",
        isRequired: true,
        type: "dropdown",
        options: [
          { label: 'Bottom', option: 'bottom' },
          { label: 'Top', option: 'top' }
        ]
      },
      "Member": {
        value: "",
        isRequired: true,
        type: "dropdown",
        dependent: "Board",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/board/members/`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "Start Date": {
        value: "",
        isRequired: false,
        type: 'datetime',
        // showTime: true,
      },
      "Due Date": {
        value: "",
        isRequired: false,
        type: 'datetime',
        // showTime: true,
      },
      "File Attachments": {
        type: 'input',
        value: '',
        isRequired: true,
      },
      "URL Attachments": {
        type: 'input',
        value: '',
        isRequired: true,
      },
      "Checklist Name": {
        type: 'input',
        value: '',
        isRequired: true,
      },
      "Checklist Items": {
        type: 'custom-list',
        value: '',
        checklistItems: [],
        isRequired: true,
        customOptions: true
      },
      "Card Color": {
        value: "",
        isRequired: true,
        type: "dropdown",
        options: [
          { option: "none", label: "None" },
          { option: "green", label: "Green" },
          { option: "yellow", label: "Yellow" },
          { option: "orange", label: "Orange" },
          { option: "red", label: "Red" },
          { option: "blue", label: "Blue" },
          { option: "purple", label: "Purple" },
          { option: "sky", label: "Sky" },
          { option: "lime", label: "Lime" },
          { option: "pink", label: "Pink" },
          { option: "black", label: "Black" },
        ]
      },
      "Brightness": {
        value: "",
        isRequired: true,
        type: "dropdown",
        dependent: "Board",
        options: [
          { option: "dark", label: "Dark" },
          { option: "light", label: "Light" },
        ]
      },
      "URL": {
        value: "",
        isRequired: true,
        type: "input",
      },
      "Size": {
        value: "",
        isRequired: true,
        type: "dropdown",
        options: [
          { option: "full", label: "Full" },
          { option: "normal", label: "Normal" },
        ]
      },
      "Coordinates": {
        value: "",
        isRequired: true,
        type: "input",
      },
      Address: {
        value: "",
        isRequired: true,
        type: "input",
      },
      Location: {
        value: "",
        isRequired: true,
        type: "input",
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
        content: "To test Trello, we need to create a new card. This is what will be created:",
      },
      testingFunction: "testCreateTrelloCard",
    },
  },
  'Create Comment': {
    configure: {
      "Board": {
        value: "",
        isRequired: true,
        type: "dropdown",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/trello-boards`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "List": {
        value: "",
        isRequired: true,
        type: "dropdown",
        dependent: "Board",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/board-lists/`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "Card": {
        value: "",
        isRequired: true,
        type: "dropdown",
        dependent: "List",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/list-cards/list/`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "Comment Text": {
        type: 'textarea',
        value: '',
        isRequired: true,
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
        content: "To test Trello, we need to create a new comment. This is what will be created:",
      },
      testingFunction: "testAddCommentToCard",
    }
  },
  'Create List': {
    configure: {
      "Board": {
        value: "",
        isRequired: true,
        type: "dropdown",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/trello-boards`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "Name": {
        type: 'input',
        value: '',
        isRequired: true,
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
        content: "To test Trello, we need to create a new list. This is what will be created:",
      },
      testingFunction: "testCreateListInBoard",
    }
  },
  'Move Card to List': {
    configure: {
      "Board": {
        value: "",
        isRequired: true,
        type: "dropdown",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/trello-boards`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "From List": {
        value: "",
        isRequired: true,
        type: "dropdown",
        dependent: "Board",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/board-lists/`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "Card": {
        value: "",
        isRequired: true,
        type: "dropdown",
        dependent: "From List",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/list-cards/list/`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "To Board": {
        value: "",
        isRequired: true,
        type: "dropdown",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/trello-boards`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "To List": {
        value: "",
        isRequired: true,
        type: "dropdown",
        dependent: "To Board",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/board-lists/`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
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
        content: "To test Trello, we need to create a new move card. This is what will be created:",
      },
      testingFunction: "testMoveCard",
    }
  },
  'Update Card': {
    configure: {
      "Board": {
        value: "",
        isRequired: true,
        type: "dropdown",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/trello-boards`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "List": {
        value: "",
        isRequired: true,
        type: "dropdown",
        dependent: "Board",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/board-lists/`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "Card": {
        value: "",
        isRequired: true,
        type: "dropdown",
        dependent: "List",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/list-cards/list/`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "Card Name": {
        value: "",
        isRequired: true,
        type: "input",
      },
      "Card Description": {
        value: "",
        isRequired: false,
        type: "textarea",
      },
      "Overwrite Description": {
        value: false,
        isRequired: false,
        type: "toggle",
      },
      "Card Start Date": {
        value: "",
        isRequired: false,
        type: 'datetime',
        // showTime: true,
      },
      "Card Due Date": {
        value: "",
        isRequired: false,
        type: 'datetime',
        // showTime: true,
      },
      "Due Complete": {
        value: false,
        isRequired: false,
        type: "toggle",
      },
      "Card Position": {
        value: "",
        isRequired: true,
        type: "dropdown",
        options: [
          { label: 'Bottom', option: 'bottom' },
          { label: 'Top', option: 'top' }
        ]
      },
      "Card Closed": {
        value: "",
        isRequired: true,
        type: "toggle",
      },
      "Card Color": {
        value: "",
        isRequired: true,
        type: "dropdown",
        options: [
          { option: "none", label: "None" },
          { option: "green", label: "Green" },
          { option: "yellow", label: "Yellow" },
          { option: "orange", label: "Orange" },
          { option: "red", label: "Red" },
          { option: "blue", label: "Blue" },
          { option: "purple", label: "Purple" },
          { option: "sky", label: "Sky" },
          { option: "lime", label: "Lime" },
          { option: "pink", label: "Pink" },
          { option: "black", label: "Black" },
        ]
      },
      "Brightness": {
        value: "",
        isRequired: true,
        type: "dropdown",
        dependent: "Board",
        options: [
          { option: "dark", label: "Dark" },
          { option: "light", label: "Light" },
        ]
      },
      "Attachment ID": {
        value: "",
        isRequired: true,
        type: "dropdown",
        dependent: "Card",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/card/attachments/`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
            }),
          },
        },
      },
      "URL": {
        value: "",
        isRequired: true,
        type: "input",
      },
      "Size": {
        value: "",
        isRequired: true,
        type: "dropdown",
        options: [
          { option: "full", label: "Full" },
          { option: "normal", label: "Normal" },
        ]
      },
      "Coordinates": {
        value: "",
        isRequired: true,
        type: "input",
      },
      Address: {
        value: "",
        isRequired: true,
        type: "input",
      },
      Location: {
        value: "",
        isRequired: true,
        type: "input",
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
        content: "To test Trello, we need to create a new card. This is what will be created:",
      },
      testingFunction: "testUpdateTrelloCard",
    }
  },

  // 'Find Board': {
  //     configure: {
  //         "Organization": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             dependent: "Board",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/board-lists/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "Board Name": {
  //             value: "",
  //             isRequired: true,
  //             type: "input",
  //         },
  //         "If no search results are found": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             dependent: "List",
  //             options: [
  //                 { label: "Mark 'successful' and run steps that  search result", option: "true" },
  //                 { label: "Mark 'Safely halted' and skip that use search result", option: "true" },
  //             ]
  //         },
  //         "create A trello Board if Not Exists?": {
  //             value: "",
  //             isRequired: false,
  //             type: "toggle",
  //         },
  //     },
  //     test: {
  //         para: {
  //             type: "para",
  //             content: "To test Trello, we need to search for a board. This is what we will search for:",
  //         },
  //         testingFunction: "",
  //     }
  // },
  // 'Find Card': {
  //     configure: {
  //         "Organization": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             dependent: "Board",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/board-lists/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "Board": {
  //             value: "",
  //             isRequired: true,
  //             type: "input",
  //         },
  //         "List": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             dependent: "Board",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/board-lists/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "Card Name": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             // dependent: "List",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/list-cards/list/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "Card ID": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             // dependent: "List",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/list-cards/list/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "If no search results are found": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             dependent: "List",
  //             options: [
  //                 { label: "Mark 'successful' and run steps that  search result", option: "true" },
  //                 { label: "Mark 'Safely halted' and skip that use search result", option: "true" },
  //             ]
  //         },
  //         "create A trello Board if Not Exists?": {
  //             value: "",
  //             isRequired: false,
  //             type: "toggle",
  //         },
  //     },
  //     test: {
  //         para: {
  //             type: "para",
  //             content: "To test Trello, we need to search for a card. This is what we will search for, For newly created card it will take 1 min to search.",
  //         },
  //         testingFunction: "",
  //     }
  // },
  // 'Find Checklist': {
  //     configure: {
  //         "Board": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/trello-boards`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "List": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             dependent: "Board",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/board-lists/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "Card": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             dependent: "List",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/list-cards/list/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //     },
  //     test: {
  //         para: {
  //             type: "para",
  //             content: "To test Trello, we need to search for a checklist. This is what we will search for:",
  //         },
  //         testingFunction: "",
  //     }
  // },
  // 'Find Checklist Item': {},
  // 'Find Label on Board': {},
  // 'Find List on Board': {},
  // 'Remove Label From Card': {
  //     configure: {
  //         "Board": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/trello-boards`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "List": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             dependent: "Board",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/board-lists/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "Card": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             dependent: "List",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/list-cards/list/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "Label": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             // dependent: "List",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/list-cards/list/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //     },
  //     test: {
  //         para: {
  //             type: "para",
  //             content: "To test Trello, we need to create a new label. This is what will be created:",
  //         },
  //         testingFunction: "",
  //     }
  // },
  // 'Delete Checklikst in Card': {
  //     configure: {
  //         "Board": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/trello-boards`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "List": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             dependent: "Board",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/board-lists/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "Card": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             dependent: "List",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/list-cards/list/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "Checklist": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             // dependent: "List",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/list-cards/list/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //     },
  //     test: {
  //         para: {
  //             type: "para",
  //             content: "To test Trello, we need to create a new checklist. This is what will be created:",
  //         },
  //         testingFunction: "",
  //     }
  // },
  // 'Create Label': {
  //     configure: {
  //         "Board": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/trello-boards`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "Label Name": {
  //             type: 'input',
  //             value: '',
  //             isRequired: true,
  //         },
  //         "Color": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             options: [
  //                 { label: 'Null', option: 'null' },
  //                 { label: 'Green', option: 'green' },
  //                 { label: 'Yellow', option: 'yellow' },
  //                 { label: 'Orange', option: 'orange' },
  //                 { label: 'Red', option: 'red' },
  //                 { label: 'Purple', option: 'public' },
  //                 { label: 'Blue', option: 'blue' },
  //                 { label: 'Sky', option: 'sky' },
  //                 { label: 'Lime', option: 'lime' },
  //                 { label: 'Pink', option: 'pink' },
  //                 { label: 'Black', option: 'black' },
  //             ]
  //         },
  //     },
  //     test: {
  //         para: {
  //             type: "para",
  //             content: "To test Trello, we need to create a new label. This is what will be created:",
  //         },
  //         testingFunction: "",
  //     }
  // },
  // 'Create Checklist Item in Card': {
  //     configure: {
  //         "Board": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/trello-boards`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "List": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             dependent: "Board",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/board-lists/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "Card": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             dependent: "List",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/list-cards/list/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "Checklist": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/list-cards/list/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "Checklist Item Name": {
  //             type: 'input',
  //             value: '',
  //             isRequired: true,
  //         },
  //         "Checklist Item Position": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             options: [
  //                 { label: 'Bottom', option: 'bottom' },
  //                 { label: 'Top', option: 'top' }
  //             ]
  //         }
  //     },
  //     test: {
  //         para: {
  //             type: "para",
  //             content: "To test Trello, we need to create a new checklist item. This is what will be created:",
  //         },
  //         testingFunction: "",
  //     }
  // },
  // 'Complete Checklist Item in Card': {
  //     configure: {
  //         "Board": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/trello-boards`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "List": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             dependent: "Board",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/board-lists/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "Card": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             dependent: "List",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/list-cards/list/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "Checklist": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             dependent: "List",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/list-cards/list/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "Checklist Item": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             dependent: "Checklist",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/list-cards/list/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //     },
  //     test: {
  //         para: {
  //             type: "para",
  //             content: "To confirm your trigger is set up correctly, we'll find a recently moved card due in the board:",
  //         },
  //         testingFunction: "",
  //     }
  // },
  // 'Copy Board': {
  //     configure: {
  //         "Board": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/trello-boards`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "Name": {
  //             value: "",
  //             isRequired: true,
  //             type: "input",
  //         },
  //         "Organization": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/list-cards/list/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "Permission Level": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             options: [
  //                 { label: 'Private', option: 'private' },
  //                 { label: 'Organization', option: 'organization' },
  //                 { label: 'Public', option: 'public' },
  //             ]
  //         },
  //         "Allow Any Team Member to Join This Board?": {
  //             type: 'toggle',
  //             value: '',
  //             isRequired: true,
  //         },
  //     },
  //     test: {
  //         para: {
  //             type: "para",
  //             content: "To test Trello, we need to create a new copy_board. This is what will be created:",
  //         },
  //         testingFunction: "",
  //     }
  // },
  // 'Archive Card': {
  //     configure: {
  //         "Board": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/trello-boards`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "List": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             dependent: "Board",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/board-lists/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "Card": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             dependent: "List",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/list-cards/list/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //     },
  //     test: {
  //         para: {
  //             type: "para",
  //             content: "To test Trello, we need to create a new card. This is what will be created:",
  //         },
  //         testingFunction: "",
  //     }
  // },
  // 'Add Checklist to Card': {
  //     configure: {
  //         "Board": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/trello-boards`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "List": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             dependent: "Board",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/board-lists/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "Card": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             dependent: "List",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/list-cards/list/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "Checklist Name": {
  //             type: 'input',
  //             value: '',
  //             isRequired: true,
  //         },
  //         "Checklist to Copy": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             dependent: "List",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/list-cards/list/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "Checklist Items": {
  //             type: 'input',
  //             value: '',
  //             isRequired: true,
  //         },
  //         "Checklist Positions": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             options: [
  //                 { label: 'Bottom', option: 'bottom' },
  //                 { label: 'Top', option: 'top' }
  //             ]
  //         }
  //     },
  //     test: {
  //         para: {
  //             type: "para",
  //             content: "To confirm your trigger is set up correctly, we'll find a recently moved card due in the board:",
  //         },
  //         testingFunction: "",
  //     }
  // },
  // 'Add Label to Card': {
  //     configure: {
  //         "Board": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/trello-boards`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "Label": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             dependent: "Board",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/list-cards/list/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "List": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             dependent: "Board",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/board-lists/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //         "Card": {
  //             value: "",
  //             isRequired: true,
  //             type: "dropdown",
  //             dependent: "List",
  //             api_data: {
  //                 url: `${apiUrl}/api/trello/connections/get/list-cards/list/`,
  //                 options: {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                         userId: JSON.parse(localStorage.getItem("activeUserData"))?.id,
  //                     }),
  //                 },
  //             },
  //         },
  //     },
  //     test: {
  //         para: {
  //             type: "para",
  //             content: "To test Trello, we need to create a new label. This is what will be created:",
  //         },
  //         testingFunction: "",
  //     }
  // },
}

module.exports = TrelloActions;