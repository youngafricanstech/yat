if (process.env.NODE_ENV !== "production") {
  const dotenv = require("dotenv").config();
}

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var expressLayouts = require("express-ejs-layouts");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var postsRouter = require("./routes/posts");
var commentRouter = require("./routes/comments");
var contactsRouter = require("./routes/contacts");
var coursesRouter = require("./routes/courses");
var pagesRouter = require("./routes/pages");
var contactusRouter = require("./routes/contactus");
var galleriesRouter = require("./routes/galleries");

var registerRouter = require("./routes/registration");
var registerRouter = require("./routes/register");

const request = require("request");

require("dotenv").config();
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");

global.moment = require("moment");

require("./config/passport")(passport);
const { spawn } = require("child_process");
const cron = require('node-cron');
const { exec } = require('child_process');



// Schedule a task every 2 seconds
cron.schedule('0 * * * *', () => {
  // Execute the Python script
  exec('python3 routes/sendcalendar.py', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Python script: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Python script stderr: ${stderr}`);
      return;
    }
    console.log(`Python script output: ${stdout}`);
  });
});



var app = express();

try {
  mongoose.connect(
    process.env.DATABASE_URL || process.env.MONGODB_URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    () => console.log("connected")
  );
} catch (error) {
  console.log(error);
  console.log("could not connect");
}
app.use(expressLayouts);

// var reqTimer = setTimeout(function wakeUp() {
// 	request("https://techfoundation.herokuapp.com/", function () {
// 		console.log("WAKE UP DYNO");
// 	});
// 	return (reqTimer = setTimeout(wakeUp, 221000));
// 	console.log(wakeUp);
// 	console.log(reqTimer);
// }, 1500000);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/posts", postsRouter);
app.use("/posts", commentRouter);
app.use("/contacts", contactsRouter);
app.use("/courses", coursesRouter);
app.use("/pages", pagesRouter);
app.use("/galleries", galleriesRouter);
app.use("/contactus", contactusRouter);
app.use("/registration", registerRouter);
app.use("/register", registerRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});



module.exports = app;
