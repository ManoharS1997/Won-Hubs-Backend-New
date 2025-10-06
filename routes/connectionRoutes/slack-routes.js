const express = require("express");
const router = express.Router();

const slackControllers = require("../../controllers/connectionControllers/slack-controllers")

// trigger slack auth
///api/test/slack
router.post("/test", slackControllers.testConnection);
router.post("/get-conversation-list", slackControllers.populateConversationStore);
router.post("/conversation-history/:channelId", slackControllers.fetchConversationHistory);
router.get('/get/query-matches/:query/:count', slackControllers.fetchQueryMatchMessages)
router.post('/get/all-users/:channelId', slackControllers.getAllUsersFromSlackChannel)
router.post('/get/all-workspace-users', slackControllers.getAllUsersFromWorkspace)
router.post('/get/user/files/:channelId', slackControllers.getLatestFilesCreatedByUser)
router.post('/get/mentions', slackControllers.getMentionsFromAllChannels)
router.post('/get/recent-channels', slackControllers.getRecentChannels)
router.post('/get/private-channel-messages/:channelId', slackControllers.getLatestMessagesFromPrivateChannel)

// actions routes
router.post('/send/direct-message', slackControllers.sendDirectMessage)
router.post('/get/hashtag-messages', slackControllers.getLatestMessagesWithHashtags)



module.exports = router;