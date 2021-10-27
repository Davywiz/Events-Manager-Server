const express = require("express");
const { body } = require("express-validator");

const isAuth = require("../../middleware/is-auth");
const User = require("../models/user_model");
const accountsController = require("../controller/accountsController");

const router = express.Router();


// /accounts -- route
router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .toLowerCase()
      .custom(async (value, { req }) => {
        const userDoc = await User.findOne({
          email: value,
        });
        if (userDoc) {
          return Promise.reject("Email address already exists!");
        }
      })
      .normalizeEmail(),
    body("password").trim().isLength({
      min: 6,
    }),
    body("username")
      .trim()
      .toLowerCase()
      .not()
      .isEmpty()
      .custom(async (value, { req }) => {
        const userName = await User.findOne({
          name: value,
        });
        if (userName) {
          return Promise.reject("Username already exists, please pick another");
        }
      }),
  ],
  accountsController.signup
);

router.post("/login", accountsController.login);

router.get("/user", isAuth, accountsController.getUser);

router.get("/admin/contacts", isAuth, accountsController.getContacts);

router.post("/update/bank", isAuth, accountsController.bank);

router.post("/update/picture", isAuth, accountsController.picture);

router.delete("/user/delete", isAuth, accountsController.deleteUser);

module.exports = router;
