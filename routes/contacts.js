const express = require("express");
const router = express.Router();
require("dotenv").config();
const fs = require("fs");
const axios = require("axios");

const sgMail = require("@sendgrid/mail");

router.post("/send", async (req, res) => {
  const response_key = req.body["g-recaptcha-response"];

  if (!req.body["g-recaptcha-response"]) {
    return res.status(400).json({ error: "reCaptcha token is missing" });
  }

  try {
    const googleVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}
        &response=${req.body["g-recaptcha-response"]}`;

    const response = await axios.post(googleVerifyUrl);
    console.log(response);

    const { success } = response.data;

    if (success && req.body.sender && req.body.email && req.body.message) {
      try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const output = `
      				<h3>Contact Details </h3>
      				<ul>
          				<li><h1>Name: ${req.body.sender}</h1></li>
          				<li>Email: ${req.body.email}</li>
                  <li>Phone: ${req.body.phone}</li>
                  <li>Subject: ${req.body.subject}</li>
      				</ul>
      				<h3>Message</h3>
					  <p>Request: ${req.body.message}</p>
					  `;

        const msg = {
          to: "info@youngafricanstech.org",
          from: "info@youngafricanstech.org",
          subject: "requested",
          text: output,
          html: output,
        };
        sgMail.send(msg);
        res.json(msg);
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("check body, name or success");
      res.json(msg);
    }
  } catch (e) {
    console.log(e);
    res.json(msg);
  }
});

router.get("/new", async (req, res) => {
  res.render("contacts/new");
});

module.exports = router;
