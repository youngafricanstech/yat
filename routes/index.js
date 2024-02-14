var express = require("express");
var router = express.Router();
const Course = require("../models/course");

const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express App' });
// });

router.get("/", function (req, res, next) {
  Course.find((error, courses) => {
    if (error) {
      console.log(error);
      res.redirect("/");
    } else {
      console.log(courses);
      res.render("layout", {
        courses: courses,
      });
    }
  });
});

// Welcome Page
// router.get("/", forwardAuthenticated, (req, res) => res.render("index"));

// Dashboard
router.get("/dashboard", ensureAuthenticated, (req, res) =>
  res.render("dashboard", {
    user: req.user,
    layout: false,
  })
);

module.exports = router;
module.exports = router;
