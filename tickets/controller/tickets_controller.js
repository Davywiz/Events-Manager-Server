const { validationResult } = require("express-validator");
const Crypto = require("crypto");
const keys=  require('../../keys');
var paystack = require("paystack-api")(
 keys.PAYSTACK_API
);

const Ticket = require("../models/ticket_model");
const Event = require("../../events/models/events_model");
const User = require("../../accounts/models/user_model");

exports.getAllUserTickets = async (req, res, next) => {
  try {
    const checkUser = await User.findById(req.userId);
    if (!checkUser) {
      const error = new Error("No user Found");
      error.statusCode = 404;
      throw error;
    }
    const userTickets = await Ticket.find({
      userId: req.userId,
    })
      .populate("eventId", "title")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      message: "Fetched tickets details successfully",
      tickets: userTickets,
    });
  } catch (error) {
    next(error);
  }
};

exports.getBanks = async (req, res, next) => {
  try {
    const banksList = await paystack.misc.list_banks({
      country: "Nigeria",
    });
    if (banksList.status === false) {
      const error = new Error("Could not get Bank lists");
      error.statusCode = 404;
      throw error;
    }
    const { data } = banksList;

    newList = data.map((bank) => ({
      id: bank.id,
      bankName: bank.name,
      bankCode: bank.code,
    }));
    res.status(200).json({
      message: "Fetched Banks List",
      banks: newList,
    });
  } catch (error) {
    next(error);
  }
};

exports.withdrawFund = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation Failed, entered data is incorrect");
      error.statusCode = 422;
      throw error;
    }
    const eventId = req.params.eventId;

    const event = await Event.findById(eventId);
    if (!event) {
      const error = new Error("Could not find event");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "Withdrawal Successful",
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation Failed, entered data is incorrect");
      error.statusCode = 422;
      throw error;
    }
    const reference = req.params.reference;
    const quantity = req.body.quantity;
    const eventId = req.body.eventId;
    const verify = await paystack.transaction.verify({
      reference: reference,
    });
    if (verify.status === false) {
      const error = new Error("Payment was not made");
      error.statusCode = 404;
      throw error;
    }
    const paidAmount = verify.data.amount / 100;
    const actualPricePaid = paidAmount / Number(quantity);
    const event = await Event.findById(eventId);
    if (!event) {
      const error = new Error("Could not find event");
      error.statusCode = 404;
      throw error;
    }
    if (event.price !== actualPricePaid) {
      const error = new Error("Event Price not match");
      error.statusCode = 403;
      throw error;
    }
    const createdId = Crypto.randomBytes(10).toString("hex").slice(0, 8);
    const eventPaid = {
      eventName: event.title,
      date: event.event_day,
      id: createdId,
      eventPrice: event.price,
      location: event.location,
      amountPaid: paidAmount,
    };
    const ticket = new Ticket({
      userId: req.userId,
      eventId: eventId,
      reference: reference,
      eventDetails: {
        event: eventPaid,
        quantity: quantity,
      },
    });
    await ticket.save();
    event.earnings += paidAmount;
    event.sold_tickets += Number(quantity);
    await event.save();
    res.status(200).json({
      message: "Payment has been verified",
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyPaymentFree = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation Failed, entered data is incorrect");
      error.statusCode = 422;
      throw error;
    }
    const reference = "Free";
    const quantity = req.body.quantity;
    const eventId = req.body.eventId;

    const event = await Event.findById(eventId);
    if (!event) {
      const error = new Error("Could not find event");
      error.statusCode = 404;
      throw error;
    }
    const createdId = Crypto.randomBytes(10).toString("hex").slice(0, 8);
    const eventPaid = {
      eventName: event.title,
      date: event.event_day,
      id: createdId,
      eventPrice: event.price,
      location: event.location,
      amountPaid: "Free",
    };
    const ticket = new Ticket({
      userId: req.userId,
      eventId: eventId,
      reference: reference,
      eventDetails: {
        event: eventPaid,
        quantity: quantity,
      },
    });
    await ticket.save();
    event.sold_tickets += Number(quantity);
    await event.save();
    res.status(200).json({
      message: "Payment has been verified",
    });
  } catch (error) {
    next(error);
  }
};
