const express=require("express");
const router=express.Router();
const {AddEvent, GetEventsBasedOnMonthAndYear,CancelEvent,RescheduleEvent}=require("../../controllers/CalendarEventControllers/CalendarEventControllers");

// ✅ Add Event
router.post("/create-event",AddEvent);
router.get("/:month/:year",GetEventsBasedOnMonthAndYear);
router.post("/cancel-event/:id",CancelEvent);
router.patch("/reschedule-event/:id",RescheduleEvent);

module.exports = router;