
const apiUrl = process.env.HOSTED_API_URL

const trelloActivity = [
  { label: 'Any Activity', option: 'all' },
  { label: 'Board Created', option: 'createBoard' },
  { label: 'Card Created', option: 'createCard' },
  { label: 'Card Created via Email', option: 'emailCard' },
  { label: 'List Created', option: 'createList' },
  { label: 'Oraganizaation Created', option: 'createOrganization' },
  { label: 'Attachment Added to Card', option: 'addAttachmentToCard' },
  { label: 'Checklist Added to Card', option: 'addchecklistToCard' },
  { label: 'Member Added to Board', option: 'addMemberToBoard' },
  { label: 'Member Added to Card', option: 'addMemberToCard' },
  { label: 'Member Added to Organization', option: 'addMemberToOrganization' },
  { label: 'Board Added to Organization', option: 'addBoardToOrganization' },
  { label: 'Comment Added to Card', option: 'commentCard' },
  { label: 'Checklist Item Converted to Card', option: 'convertToCardFromChecklist' },
  { label: 'Board Copied', option: 'copyBoard' },
  { label: 'Card Copied', option: 'copyCard' },
  { label: 'Attachment Deleted From Card', option: 'deleteAttachmentFromCard' },
  { label: 'Card Deleted', option: 'deleteCard' },
  { label: 'Member Removed From Card', option: 'removeMemberFromCard' },
  { label: 'Card Moved From Board', option: 'moveCardFromBoard' },
  { label: 'Card Moved to Board', option: 'moveCardToBoard' },
  { label: 'BoardChanged', option: 'updateBoard' },
  { label: 'Checklist Item on Card Changed State', option: 'updateChecklistStateOnCard' },
  { label: 'Checklist Changed', option: 'updateChecklist' },
  { label: 'List Changed', option: 'updateList' },
  { label: 'List Name Changed', option: 'updateListName' },
  { label: 'Card Changed', option: 'updateCard' },
  { label: 'Card (Un)Archived', option: 'updateCard:closed' },
  { label: 'Card Description Changed', option: 'updateCard:desc' },
  { label: 'Card Moved to/from List', option: 'updateCard:idList' },
  { label: 'Card Name Changed', option: 'updateCard:name' },
  { label: 'List (Un)Archived', option: 'updateListClosed' },
  { label: 'Member Made Admin of Board', option: 'makeAdminOfBoard' },
]

const TrelloEvents = {
  "Card Due": {
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
      "Time Before": {
        type: "input",
        value: '',
        isRequired: true,
        placeholder: 'Time Before (1)'
      },
      "Time Before(Unit)": {
        value: "",
        isRequired: true,
        type: "dropdown",
        options: [
          { label: 'Minutes', option: 'minutes' },
          { label: 'Hours', option: 'hours' },
          { label: 'Days', option: 'days' },
          { label: 'Weeks', option: 'weeks' },
        ]
      },
      "Status": {
        value: '',
        isRequired: true,
        type: 'dropdown',
        options: [
          { label: 'Incomplete', option: 'incomplete' },
          { label: 'Complete', option: 'complete' },
          { label: 'All', option: 'all' },
        ]
      },
      "Only cards where you're a member?": {
        value: '',
        isRequired: true,
        type: 'toggle',
      }
    },
    test: {
      para: {
        type: "para",
        content: "To confirm your trigger is set up correctly, we'll find a recent card due in your account:",
      },
      testingFunction: "testDueCards",
    }
  },
  "Card Moved to List": {
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
    },
    test: {
      para: {
        type: "para",
        content: "To confirm your trigger is set up correctly, we'll find a recently moved card due in the board:",
      },
      testingFunction: "testMovedCards",
    }
  },
  "Card Updated": {
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
      "Card": {
        value: "",
        isRequired: true,
        type: "dropdown",
        dependent: "Board",
        api_data: {
          url: `${apiUrl}/api/trello/connections/get/list-cards/board/`,
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
        content: "To confirm your trigger is set up correctly, we'll find recent card updateds in your account:",
      },
      testingFunction: "testUpdatedCards",
    }
  },
  "New Activity": {
    configure: {
      "Activity": {
        value: '',
        isRequired: true,
        type: 'dropdown',
        options: trelloActivity
      },
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
    },
    test: {
      para: {
        type: "para",
        content: "To confirm your trigger is set up correctly, we'll find recent new activities in your account:",
      },
      testingFunction: "testTrelloActivity",
    }
  },
  // "New Board": {},
  // "New Card": {},
  // "New Card Archived": {},
  // "New Checklist": {},
  // "New Comment in Card": {},
  // "New Label": {},
  // "New Label Added to Card": {},
  // "New List": {},
  // "New Memebr on Board": {},
  // "New Notification": {},
}

module.exports = TrelloEvents