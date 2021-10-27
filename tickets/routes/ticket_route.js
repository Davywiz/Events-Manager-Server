const express = require("express");
const {
  body
} = require("express-validator");


const ticketController = require("../controller/tickets_controller");
const isAuth = require("../../middleware/is-auth");

const router = express.Router();

//tickets/ -- route
router.get("/user", isAuth, ticketController.getAllUserTickets);

router.get(
  "/withdrawal/:eventId",
  isAuth,
  ticketController.withdrawFund
);

router.get("/banks", isAuth, ticketController.getBanks);

//verify payments route
router.put(
  "/verify/free",
  isAuth,
  [
    body("quantity").trim().notEmpty(),
    body("eventId").trim().notEmpty(),
  ],
  ticketController.verifyPaymentFree
);

//paid Events
router.put(
  "/verify/:reference",
  isAuth,
  [
    body("quantity").trim().notEmpty(),
    body("eventId").trim().notEmpty(),
  ],
  ticketController.verifyPayment
);
module.exports = router;