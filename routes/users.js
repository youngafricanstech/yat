var express = require("express");
const User = require("../models/user");
var router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

const { ensureAuthenticated } = require("../config/auth");
const sgMail = require("@sendgrid/mail"); // Import the SendGrid package

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const crypto = require("crypto");


/* GET users listing. */
router.get("/login", function (req, res, next) {
  res.render("users/login", {
    layout: false,
  });
});

router.get("/register", function (req, res, next) {
  res.render("users/register", { layout: false });
});

router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("users/register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "Email already exists" });
        res.render("users/register", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "You are now registered and can log in"
                );
                res.redirect("/users/login");
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login", { layout: false });
});


// Render Change Password Form
router.get("/change-password", (req, res) => {
  res.render("users/change.ejs", {
    layout: false,
  });
});



// Change Password
router.post("/change-password", ensureAuthenticated, async (req, res) => {
  const { currentPassword, newPassword, newPassword2 } = req.body;
  let errors = [];

  // Check if current password matches
  const user = await User.findById(req.user.id);
  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    errors.push({ msg: "Current password is incorrect" });
  }

  if (newPassword !== newPassword2) {
    errors.push({ msg: "New passwords do not match" });
  }

  if (newPassword.length < 6) {
    errors.push({ msg: "New password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("change-password", {
      errors,
      currentPassword,
      newPassword,
      newPassword2,
    });
  } else {
    // Update password in the database
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });
    req.flash("success_msg", "Password changed successfully");
    res.redirect("/dashboard");
  }
});





// Forgot Password send link
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  let errors = [];

  // Validate email existence
  const user = await User.findOne({ email });

  if (!user) {
    errors.push({ msg: "Email not found" });
    return res.render("forgot-password", { errors, email });
  }

  // Generate a unique reset token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Set token expiration (e.g., 1 hour from now)
  const tokenExpiration = Date.now() + 3600000;

  // Update user with reset token and expiration
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = tokenExpiration;
  await user.save();

  // Define the email content using SendGrid
  const resetLink = `${req.protocol}://${req.get("host")}/users/reset-password-form?token=${resetToken}`;
  const msg = {
    to: user.email,
    from: "register@youngafricanstech.org", // Replace with your sender email
    subject: "Password Reset Request",
    html: `<p>You are receiving this email because you (or someone else) have requested to reset the password for your account.</p>` +
      `<p>Please click on the following link or paste it into your browser to complete the process:</p>` +
      `<a href="${resetLink}">${resetLink}</a>` +
      `<p>The link is valid for one hour.</p>` +
      `<p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
  };

  // Send the email using SendGrid
  sgMail.send(msg)
    .then(() => {
      req.flash("success_msg", "An email with instructions to reset your password has been sent.");
      res.redirect("/users/login");
    })
    .catch((error) => {
      console.error(error);
      req.flash("error_msg", "Error sending the email. Please try again later.");
      res.redirect("/users/forgot-password");
    });
});



// forgot password form
router.get("/forgot-password", (req, res) => {
  res.render("users/forgot-password-form", { layout: false });
});


// reset password form
router.get("/reset-password-form", (req, res) => {
  const { token } = req.query;
  // Render the password reset form with the token
  res.render("users/reset-password-form", { token, layout: false });
});

// now reset the password
router.post("/reset-password-form", async (req, res) => {
  const { token } = req.query;
  const { newPassword, newPassword2 } = req.body;

  // Validate newPassword and newPassword2
  if (newPassword !== newPassword2) {
    req.flash("error_msg", "New passwords do not match.");
    return res.redirect(`/users/reset-password-form?token=${token}`);
  }

  // Update user's password and clear reset token fields
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    req.flash("error_msg", "Password reset token is invalid or has expired.");
    return res.redirect("/users/login");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  req.flash("success_msg", "Password reset successful. You can now log in with your new password.");
  res.redirect("/users/login");
});




module.exports = router;
