const fs = require("fs");
const path = require("path");

const {
  validationResult
} = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user_model");
const Event = require("../../events/models/events_model");
const ContactDetails = require("../../admin/admin.contactModel");

exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    let avatarPath;
    const email = req.body.email.toLowerCase();
    const name = req.body.username.toLowerCase();
    const password = req.body.password;
    if (req.files.avatar) {
      avatarPath = req.files.avatar[0].path.replace(/\\/g, "/");
    } else {
      avatarPath = "images/user_pictures/placeholder.png";
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      email: email,
      password: hashedPassword,
      name: name,
      avatarUrl: avatarPath,
    });
    const result = await user.save();
    res.status(201).json({
      message: "User Account created!",
      userId: result._id,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;
    const user = await User.findOne({
      email: email,
    });
    if (!user) {
      const error = new Error("A user with this email could not be found");
      error.statusCode = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Invalid Email and Password");
      error.statusCode = 401;
      throw error;
    }
    const time = new Date().addHours(120);
    const token = jwt.sign({
        email: user.email,
        userId: user._id.toString(),
      },
      "somesupersecret", {
        expiresIn: "120h",
      }
    );
    res.status(200).json({
      token: token,
      userId: user._id.toString(),
      user: user._doc,
      expiresIn: time,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("No user found!");
      error.code = 404;
      throw error;
    }
    const {
      password,
      ...userData
    } = user._doc;
    res.status(200).json({
      message: "User Details Fetched",
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

exports.getContacts = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("No user found!");
      error.code = 404;
      throw error;
    }
    const contactsList = await ContactDetails.find();
    const {
      contacts
    } = contactsList[0];
    res.status(200).json({
      message: "Contacts Fetched",
      numbers: contacts,
    });
  } catch (error) {
    next(error);
  }
};

exports.picture = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("No user found!");
      error.code = 404;
      throw error;
    }
    let avatarPath = req.files.avatar[0].path.replace(/\\/g, "/");
    const primaryAvatar = "images/user_pictures/placeholder.png";

    if (user.avatarUrl !== primaryAvatar) {
      clearImage(user.avatarUrl);
    }

    user.avatarUrl = avatarPath;

    const result = await user.save();

    const {
      avatarUrl,
      ...userData
    } = result._doc;

    res.status(200).json({
      message: "Updated Picture!",
      avatar: avatarUrl,
    });
  } catch (error) {
    next(error);
  }
};

exports.bank = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("No user found!");
      error.code = 404;
      throw error;
    }

    user.accountDetails.name = req.body.accountName;
    user.accountDetails.bank = req.body.bankName;
    user.accountDetails.number = req.body.accountNumber;
    user.accountDetails.bankCode = req.body.bankCode;
    const result = await user.save();

    const {
      accountDetails,
      ...userData
    } = result._doc;

    res.status(200).json({
      message: "Updated Bank Details!",
      accountDetails: accountDetails,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const checkUser = await User.findById(req.userId);
    if (!checkUser) {
      const error = new Error("No user Found");
      error.statusCode = 404;
      throw error;
    }
    const result = await Event.find({
      creator: req.userId,
    });
    if (result) {
      let eventPath = result.map((event) => event.event_image);
      eventPath.forEach((path) => {
        clearImage(path);
      });
      await Event.deleteMany({
        creator: req.userId,
      });
    }
    await User.findByIdAndDelete(req.userId);
    res.status(200).json({
      message: "User has been deleted",
    });
  } catch (error) {
    next(error);
  }
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "../..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};

Date.prototype.addHours = function (h) {
  this.setHours(this.getHours() + h);
  return this;
};