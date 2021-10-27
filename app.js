const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");

const { default: AdminBro } = require("admin-bro");
const options = require("./admin/admin.options");
//const build = require("admin-bro-expressjs");
const buildAdminRouter = require("./admin/admin.router");
const keys = require('./keys');

const eventsRoutes = require("./events/routes/events_route");
const userRoutes = require("./accounts/routes/userRoute");
const ticketRoutes = require("./tickets/routes/ticket_route");

const app = express();

const MONGODB_URI = keys.MONGO_URI;

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "avatar") {
      cb(null, "images/user_pictures");
    } else if (file.fieldname === "event_image") {
      cb(null, "images/event_images");
    }
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const admin = new AdminBro(options);

const router = buildAdminRouter(admin);

//const router = build.buildRouter(admin)

app.use(admin.options.rootPath, router);

app.use(bodyParser.json());

app.use(
  multer({
    storage: fileStorage,
    fileFilter: fileFilter,
  }).fields([
    {
      name: "avatar",
    },
    {
      name: "event_image",
    },
  ])
);

app.use("/images", express.static(path.join(__dirname, "images")));

app.use(cors());

// App Routes

app.use("/api", eventsRoutes);
app.use("/accounts", userRoutes);
app.use("/tickets", ticketRoutes);

// Error Routes
app.use((req, res, next) => {
  return res.status(404).json({
    message: "No route for this url found",
  });
});

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  return res.status(status).json({
    error: message,
    data: data,
  });
});

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then((result) => {
    app.listen(8080, "192.168.43.165", () =>
      console.log(`App listening at http://localhost:8080`)
    );
  })
  .catch((err) => console.log(err));
