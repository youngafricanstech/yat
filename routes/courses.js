const express = require("express");
const router = express.Router();
const Course = require("../models/course");
const mongoose = require("mongoose");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
// const sharp = require("sharp");

var AWS = require("aws-sdk");
var multerS3 = require("multer-s3");

AWS.config.update({
  secretAccessKey: process.env.S3_SECRECT,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  region: process.env.S3_REGION,
});
AWS.config.update({
  secretAccessKey: process.env.S3_SECRECT,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  region: process.env.S3_REGION,
});

const uploadPath = path.join("public", Course.courseImageBasePath);
const imageMineTypes = ["image/jpeg", "image/png", "image/gif"];
const bucketname = "techfoundationbuilders";

s3 = new AWS.S3();
const upload = multer({
  storage: multerS3({
    s3: s3,
    acl: "public-read",
    bucket: bucketname,
    s3BucketEndpoint: true,
    endpoint: "http://" + bucketname + ".s3.amazonaws.com",
    key: function (req, file, cb) {
      const uploadPathWithOriginalName = uploadPath + "/" + file.originalname;
      cb(null, uploadPathWithOriginalName);
    },
  }),
});

// Get all Blog posts

router.get("/", async (req, res) => {
  Course.find(function (err, courses) {
    if (err) {
      console.log(err);
    } else {
      res.render("courses/index", {
        courses: courses,
        user: req.user,
        layout: false,
      });
    }
  });
});

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.roles && req.user.roles.includes("admin")) {
    // If the user is an admin, proceed to the next middleware or route handler
    next();
  } else {
    // If not an admin, redirect or send an error response
    res.status(403).send("Permission denied. Only admin users can access this route.");
  }
};

// New blogpost routes
router.get("/new", isAdmin, async (req, res, next) => {
  renderNewPage(res, new Course());
});

// Create blogpost routes
router.post("/create", isAdmin, upload.single("cover"), (req, res, next) => {
  const course = new Course({
    title: req.body.title,
    description: req.body.description,
    logo: req.file.location,
  });
  try {
    const newCourse = course.save();
    res.redirect("/courses");
  } catch (error) {
    console.log(error);
    renderNewPage(res, course, true);
  }
});

router.get("/:id/edit", isAdmin, async (req, res, next) => {
  Course.findById(req.params.id, function (err, course) {
    if (!course) {
      console.log("Noooooooooo");
      return next(new Error("Could not load Document"));
    } else {
      res.render("courses/edit", {
        course: course,
        layout: false,
      });
    }
  });
});

// router.post("/:id/update", async (req, res, next) => {
//   Course.findById(req.params.id, function (err, course) {
//     if (req.body.title && req.body.url && req.body.description) {
//       let course = {};
//       course.title = req.body.title;
//       course.url = req.body.url;
//       course.description = req.body.description;
//       let query = { _id: req.params.id };
//       Course.updateOne(query, course, (err, course) => {
//         if (err) {
//           console.log(err);
//           res.redirect("back");
//         } else {
//           res.redirect("/courses");
//         }
//       });
//     }

//   });
// });

router.post("/:id/update", isAdmin, upload.single("cover"), async (req, res, next) => {
  Course.findById(req.params.id, function (err, course) {
    var splittedKey = course.logo.replace(process.env.SPLITTED, "");

    const awsCredentials = {
      secretAccessKey: process.env.S3_SECRECT,
      accessKeyId: process.env.AWS_ACCESS_KEY,
      region: process.env.S3_REGION,
    };
    var s3 = new AWS.S3(awsCredentials);
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: splittedKey,
    };

    if (req.file) {
      s3.deleteObject(params, (error, data) => {
        if (error) {
          console.log(error);
          res.status(500).send(error);
        } else {
          let course1 = {};
          course1.title = req.body.title;
          course1.description = req.body.description;
          course1.logo = req.file.location;
          let query = { _id: req.params.id };
          Course.updateOne(query, course1, (err, found_course) => {
            if (err) {
              console.log(err);
              res.redirect("back");
            } else {
              res.redirect("/courses");
            }
          });
        }
      });
    } else if (!req.file) {
      let course2 = {};
      course2.title = req.body.title;
      course2.description = req.body.description;
      let query = { _id: req.params.id };
      Course.updateOne(query, course2, (err, post) => {
        if (err) {
          console.log(err);
          res.redirect("back");
        } else {
          res.redirect("/courses");
        }
      });
    }

    // res.s
  });
});

router.get("/:id/delete", isAdmin, async (req, res) => {
  Course.findById(req.params.id, function (err, course) {
    var splittedKey = course.logo.replace(process.env.SPLITTED, "");
    const awsCredentials = {
      secretAccessKey: process.env.S3_SECRECT,
      accessKeyId: process.env.AWS_ACCESS_KEY,
      region: process.env.S3_REGION,
    };
    var s3 = new AWS.S3(awsCredentials);
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: splittedKey,
    };
    s3.deleteObject(params, (error, data) => {
      if (error) {
        res.status(500).send(error);
      } else {
        const ObjectId = mongoose.Types.ObjectId;

        let query = { _id: new ObjectId(req.params.id) };

        course.deleteOne(query, function (err) {
          if (err) {
            console.log(err);
            res.redirect("back");
          }
          res.redirect("/courses");
          console.log("deleted successfully");
        });
        console.log("File has been deleted successfully");
      }
      // res.s
    });
  });
});

//Handles the redirects
async function renderNewPage(res, course, hasError = false) {
  try {
    const params = {
      course: course,
      layout: false,
    };
    if (hasError) params.errorMessage = "Error Creating Post";
    res.render("courses/new", params);
  } catch {
    res.redirect("/courses");
  }
}

module.exports = router;
