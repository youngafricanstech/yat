const express = require("express");
const router = express.Router();
const Comment = require("../models/comment");
const Post = require("../models/post");
require("dotenv").config();
const fs = require("fs");
const axios = require("axios");

router.post("/:postId/comment", async (req, res) => {
  const response_key = req.body["g-recaptcha-response"];

  const post = await Post.findOne({ _id: req.params.postId });

  if (!req.body["g-recaptcha-response"]) {
    return res.status(400).json({ error: "reCaptcha token is missing" });
  }

  try {
    const googleVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}
    &response=${req.body["g-recaptcha-response"]}`;

    const response = await axios.post(googleVerifyUrl);

    const { success } = response.data;

    if (success && req.body.description && req.body.name) {
      const comment = new Comment();
      comment.description = req.body.description;
      comment.name = req.body.name;
      comment.post = post._id;

      await comment.save();

      post.comments.push(comment._id);
      await post.save();

      res.redirect("/posts/" + post._id + "/comments");
    } else {
      console.log("check body, name or success");
      res.redirect("/posts/" + post._id + "/comments");
    }
  } catch (e) {
    console.log(e);
    res.redirect("/posts/" + post._id + "/comments");
  }
});

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.roles && req.user.roles.includes("admin")) {
    // If the user is an admin, proceed to the next middleware or route handler
    next();
  } else {
    // If not an admin, redirect or send an error response
    res
      .status(403)
      .send("Permission denied. Only admin users can access this route.");
  }
};

router.delete(
  "/comments/:postId/:commentId",
  isAdmin,
  async function (req, res) {
    try {
      const post = await Post.findByIdAndUpdate(
        req.params.postId,
        {
          $pull: { comments: req.params.commentId },
        },
        { new: true }
      );

      if (!post) {
        return res.status(400).send("Post not found!");
      }

      await Comment.findByIdAndDelete(req.params.commentId);

      res.send("Success");
    } catch (err) {
      console.log(err);
      res.status(500).send("Something went wrong");
    }
  }
);

module.exports = router;
