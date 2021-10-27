const {
  default: AdminBro
} = require("admin-bro");
const AdminBroMongoose = require("admin-bro-mongoose");

const User = require("../accounts/models/user_model");
const Events = require("../events/models/events_model");
const Tickets = require("../tickets/models/ticket_model");
const ProFee = require("./fee.pro.model");
const ContactList = require("./admin.contactModel");

AdminBro.registerAdapter(AdminBroMongoose);

const AdminCompany = require("./components/admin.entity");

const options = {
  resources: [User, Events, Tickets, ProFee, ContactList, AdminCompany],
  rootPath: "/admin",
  branding: {
    companyName: "Event Manager",
  },
};

module.exports = options;