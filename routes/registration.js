const express = require("express");
const router = express.Router();
require("dotenv").config();
const sgMail = require("@sendgrid/mail");
const { spawn } = require("child_process");
const axios = require("axios");

router.post("/register", async (req, res) => {
  console.log("I actualy came here now")
  const response_key = req.body["g-recaptcha-response"];
  if (!req.body["g-recaptcha-response"]) {
    return res.status(400).json({ error: "reCaptcha token is missing" });
  }
  var email_link = ""
  try {
    const googleVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${req.body["g-recaptcha-response"]}`;
    const child_python = spawn("python3", ["routes/sendcalendar.py", req.body.email, req.body.interviewdate]);

    child_python.stdout.on("data", (data) => {
      email_link = data.toString();
    });

    child_python.stderr.on("data", (data) => {
      console.log("stderr: " + data);
    });

    child_python.on("close", async (code) => {
      console.log("just closing now: " + code);

      try {
        const response = await axios.get(googleVerifyUrl);

        const { success } = response.data;

        if (success && req.body.email) {
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);

          const output = `
                        <h3>Registration Details </h3>
                        <ul>
                            <li><h1>Parent Firstname: ${req.body.firstname}</h1></li>
                            <li><h3>Parent Lastname</h3>: ${req.body.lastname}</li>
                            <li>Country: ${req.body.country}</li>
                            <li>State: ${req.body.state}</li>
                            <li>Email: ${req.body.email}</li>
                            <li>Phone: ${req.body.cellnumber}</li>
                            <li>Child Fullname: ${req.body.childs_fullname}</li>
                            <li>Child Age: ${req.body.child_age}</li>
                            <li>Gender: ${req.body.gender}</li>
                            <li>Grade: ${req.body.grade}</li>
                        </ul>
                        <h3>Message</h3>
                        <p>Request: ${req.body.message}</p>
                    `;

          const msg = {
            to: "register@youngafricanstech.org",
            from: "register@youngafricanstech.org",
            subject: "coding Application from " + req.body.childs_fullname,
            text: output,
            html: output,
          };




          theMessage = `Next Steps for Your Yat Online Coding Class Application.

                        <h2>Dear ${req.body.firstname} ${req.body.lastname}</h2>

                        <p>Thank you for applying to the Young Africans Technology online coding class. We appreciate your interest and commitment to this program..</p>

                        <p>As part of our application process, we conduct video interviews and assessments via Zoom. This step is crucial for us to determine your child's eligibility for our coding program. During the video call, we will verify that you are the child's parent and ensure that you provide consent for your child to participate.</p>
                        <h5>**Important Note:**</h5>
                        <p>Your prompt presence at the meeting is imperative. The session is scheduled to commence at 7:00 PM South Africa Time. Please be advised that joining the meeting late may regrettably not be accommodated,
                          and you will not be given another chance if you fail to show up for this meeting. 
                        </p>
                        <h5>Here is your meeeting link</h5>
                        <div>${email_link}</div>
                        <h5>**Action Required:**</h5>
                        <p>To confirm your attendance, we kindly request you to click "Yes" on the calendar invitation that has been sent to your email (for Gmail users only).</p>
                        <p>Should you have any inquiries or require further assistance, please do not hesitate to contact us at +27849614744 or reply on this email</p>

                        <h5>Kind regards</h5>
                        <h5>Young Africans Tech</h5>
                        <h4>https://www.youngafricanstech.org</h4>
                        
                    `;

          const secondMessage = {
            to: req.body.email,
            from: "register@youngafricanstech.org",
            subject: "YAT Application for " + req.body.childs_fullname,
            text: theMessage,
            html: theMessage,
          };

          sgMail.send(msg);
          sgMail.send(secondMessage);

          // Send the appropriate response after sending emails
          res.status(200).json({ message: "Python script executed successfully" });

        } else {
          console.log("check body, name, or success");
          res.status(400).json({ error: "Check body, name, or success" });
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error with reCaptcha verification" });
      }
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/new", async (req, res) => {
  res.render("register", { layout: false });
});

module.exports = router;
