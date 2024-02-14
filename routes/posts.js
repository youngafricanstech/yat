const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
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

const uploadPath = path.join("public", Post.postImageBasePath);
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
  Post.find(function (err, posts) {
    if (err) {
      console.log(err);
    } else {
      res.render("posts/index", {
        posts: posts,
        layout: false,
      });
    }
  });
});

// New blogpost routes
// router.get("/new", async (req, res, next) => {
//   renderNewPage(res, new Post());
// });


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

// Apply the isAdmin middleware only to the "/new" route
router.get("/new", isAdmin, async (req, res, next) => {
  renderNewPage(res, new Post());
});

// Create blogpost routes
router.post("/create", isAdmin, upload.single("cover"), async (req, res, next) => {
  const post = new Post({
    title: req.body.title,
    description: req.body.description,
    from: req.body.from,
    postImage: req.file.location,
  });
  try {
    const newPost = await post.save();
    res.redirect("/posts");
  } catch (error) {
    console.log(error);
    renderNewPage(res, post, true);
  }
});

// Get a post With comments
router.get("/:id/comments", async (req, res) => {

  Post.findById({ _id: req.params.id })
    .populate("comments", "_id name description createdAt", null, {
      sort: { createdAt: -1 },
    })
    .exec(function (error, post) {
      res.render("posts/show", {
        post: post,
        user: req.user,
        layout: false,
      });
    });
});

router.get("/:id/edit", isAdmin, async (req, res, next) => {
  Post.findById(req.params.id, function (err, post) {
    if (!post) {
      console.log("Noooooooooo");
      return next(new Error("Could not load Document"));
    } else {
      res.render("posts/edit", {
        post: post,
        layout: false,
      });
    }
  });
});

router.post("/edit/:id", isAdmin, upload.single("cover"), async (req, res, next) => {
  Post.findById(req.params.id, function (err, post) {
    var splittedKey = post.postImage.replace(process.env.SPLITTED, "");

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
          res.status(500).send(error);
        } else {
          let post2 = {};
          post2.title = req.body.title;
          post2.description = req.body.description;
          post2.postImage = req.file.location;
          let query = { _id: req.params.id };
          Post.updateOne(query, post2, (err, post) => {
            if (err) {
              console.log(err);
              res.redirect("back");
            } else {
              res.redirect("/posts");
            }
          });
        }
      });
    } else if (!req.file) {
      let post2 = {};
      post2.title = req.body.title;
      post2.description = req.body.description;
      post2.from = req.body.from;
      let query = { _id: req.params.id };
      Post.updateOne(query, post2, (err, post) => {
        if (err) {
          console.log(err);
          res.redirect("back");
        } else {
          res.redirect("/posts");
        }
      });
    }

    // res.s
  });
});

router.get("/:id/delete", isAdmin, async (req, res) => {
  Post.findById(req.params.id, function (err, post) {

    var splittedKey = post.postImage.replace(process.env.SPLITTED, "");
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

        post.deleteOne(query, function (err) {
          if (err) {
            console.log(err);
          }
          res.send("Success");
        });
        console.log("File has been deleted successfully");
      }
      // res.s
    });
  });
});

//Handles the redirects
async function renderNewPage(res, post, hasError = false) {
  try {
    const params = {
      post: post,
      layout: false,
    };
    if (hasError) params.errorMessage = "Error Creating Post";
    res.render("posts/new", params);
  } catch {
    res.redirect("/posts");
  }
}

module.exports = router;
