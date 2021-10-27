const { default: AdminBro } = require("admin-bro");
const build = require("admin-bro-expressjs");
const express = require("express");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

const AdminModel = require("./admin.model");

/**
 * @param {AdminBro} admin
 * @return {express.Router} router
 */
const buildAdminRouter = (admin) => {
  const router = build.buildAuthenticatedRouter(
    admin,
    {
      cookieName: "admin-bro",
      cookiePassword: "superlongandcomplicatedname",
      authenticate: async (email, password) => {
        const adminModel = await AdminModel.findOne({
          email,
        });

        if (
          adminModel &&
          (await bcrypt.compare(password, adminModel.encryptedPassword))
        ) {
          return adminModel.toJSON();
        }
        return null;
      },
    },
    null,
    {
      resave: false,
      saveUninitialized: true,
      store: new MongoStore({
        mongooseConnection: mongoose.connection,
      }),
    }
  );
  return router;
};

module.exports = buildAdminRouter;
