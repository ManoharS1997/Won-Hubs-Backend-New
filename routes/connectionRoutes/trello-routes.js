const express = require("express");
const router = express.Router();

const trelloControllers = require('../../controllers/connectionControllers/trello-controllers');

router.post("/test/trello", trelloControllers.testTrelloConnection);
router.post("/get/trello-boards", trelloControllers.getOrganisationBoards);
router.post("/get/due-cards", trelloControllers.getDueCards);
router.post("/get/board-lists/:BOARD_ID", trelloControllers.getTrelloBoardLists);
router.post("/get/list-cards/:type/:ID", trelloControllers.getTrelloListCards);
router.post("/get/trello/organizations", trelloControllers.getTrelloOrganizations);
router.post("/get/trello/members", trelloControllers.getOrganizationMembers);
router.post("/get/board/members/:boardId", trelloControllers.getBoardMembers);
router.post("/get/board/labels/:boardId", trelloControllers.getBoardLabels);
router.post("/get/card/attachments/:cardId", trelloControllers.getCardAttachments);

router.post("/check/card-movements", trelloControllers.checkCardMovement);
router.post("/check/updated-cards", trelloControllers.checkCardMovement);
router.post("/check/activity", trelloControllers.testTrelloTrigger);
router.post("/check/activity", trelloControllers.testTrelloTrigger);

router.post("/find/user", trelloControllers.findMemberInOrganization);
router.post("/close/board", trelloControllers.closeTrelloBoard);
router.post("/move/card", trelloControllers.moveCardToList);
router.post("/update/card", trelloControllers.updateTrelloCard);
router.post("/create/board", trelloControllers.createTrelloBoard);
router.post("/create/card", trelloControllers.createTrelloCard);
router.post("/create/list", trelloControllers.createListInBoard);
router.post("/add/card/attachment", trelloControllers.addAttachmentonCard);
router.post("/add/board/member", trelloControllers.addMemberToBoard);
router.post("/add/card/member", trelloControllers.addMembersToCard);
router.post("/add/card/comment", trelloControllers.addCommentToCard);

module.exports = router;