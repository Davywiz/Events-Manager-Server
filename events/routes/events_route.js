const express = require("express");
const {
  body
} = require("express-validator");


const eventController = require("../controller/eventController");
const isAuth = require("../../middleware/is-auth");


const router = express.Router();

//api/ -- route
router.get("/events", eventController.getAllEvents);

router.get("/events/user", isAuth, eventController.getUserEvents);

router.post(
  "/events",
  isAuth,
  [
    body("title").trim().notEmpty(),
    body("description").trim().notEmpty(),
    body("location").trim().notEmpty(),
  ],
  eventController.createEvent
);

router.put(
  "/events/update/:eventId",
  isAuth,
  [
    body("title").trim().notEmpty(),
    body("description").trim().notEmpty(),
    body("location").trim().notEmpty(),
  ],
  eventController.updateEvent
);

router.put(
  "/events/completed/:eventId",
  isAuth,
  [
    body("completed").notEmpty(),
  ],
  eventController.completedEvent
);

router.delete("/events/delete/:eventId", isAuth, eventController.deleteEvent);

module.exports = router;