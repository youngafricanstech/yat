const express = require("express");
const Register = require("../models/register"); // Replace with the correct path to your model file
const sgMail = require("@sendgrid/mail");

const router = express.Router();

const { spawn } = require("child_process");
const axios = require("axios");

// Set your SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);



// Route to get all registrations
router.get("/all_students", async (req, res) => {
    try {
        const registrations = await Register.find();
        res.render("registration/index", {
            registrations: registrations,
            layout: false
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const deleteOldRegistrations = async () => {
    try {
        const now = new Date();
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000); // 14 days ago

        // Find and delete registrations created more than two weeks ago
        await Register.deleteMany({
            createdAt: { $lte: twoWeeksAgo }
        });

        console.log('Old registrations (more than two weeks ago) deleted successfully.');
    } catch (error) {
        console.error('Error deleting old registrations:', error);
    }
};

// Run the function every 10 hours (in milliseconds)
const intervalId = setInterval(deleteOldRegistrations, 10 * 60 * 60 * 1000); // 10 hours




// Route to render the registration form
router.get("/new", (req, res) => {
    res.render("registration/register", { layout: false });
});



// Route to render the verification form
router.get("/newverification", (req, res) => {
    const message = "";
    res.render("registration/verification", { message, layout: false });
});

// Route to render register details if found in the database
router.get("/verify", async (req, res) => {
    const registrationCode = req.query.registrationcode;

    try {
        const userData = await Register.findOne({ registrationcode: registrationCode });

        if (userData) {
            // Respond with JSON on success
            res.render("registration/details-form", { userData, layout: false });
        } else {
            // Render the verification form with a message if no userData found
            const message = "No user with the specified registration code found.";
            res.render("registration/verification", { message, layout: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



// Route to handle new student registration
router.post("/student", async (req, res) => {

    const newRegistration = new Register({
        parent_firstname: req.body.parent_firstname,
        parent_lastname: req.body.parent_lastname,
        country: req.body.country,
        state: req.body.state,
        email: req.body.email,
        cellnumber: req.body.cellnumber,
        childs_fullname: req.body.childs_fullname,
        child_age: req.body.child_age,
        gender: req.body.gender,
        grade: req.body.grade,
    });

    try {
        await newRegistration.save();

        // Send email to the registered user with a link
        await sendEmailConfirmation(req.body.email, req.body.parent_firstname, req.body.parent_lastname, newRegistration.registrationcode, req.body.country, req.body.state, req.body.cellnumber, req.body.childs_fullname, req.body.child_age, req.body.gender, req.body.grade, req.body.message);

        res.status(200).json({ message: "Python script executed successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
        // You might want to handle the error differently based on your use case
    }
});


// Function to send email confirmation using SendGrid
async function sendEmailConfirmation(email, parent_firstname, parent_lastname, registrationCode, country, state, cellnumber, childs_fullname, child_age, gender, grade, message) {
    const msg = {
        to: email,
        from: "register@youngafricanstech.org", // Replace with your SendGrid verified email
        subject: "Registration Confirmation",
        html: `
      <h4>Your Registratio code is ${registrationCode}</h4> Dear <em>${parent_firstname} ${parent_lastname}</em>,<p>We extend our appreciation for your registration with Young Africans Tech.</p>

    <p><strong>Important Steps for Successful Program Admission</strong><br>To ensure your eligibility for our programs, please adhere to the following admission process steps:</p>

    <strong>Step 1: Tutorial for Assessment</strong><br><p>Kindly watch the three tutorials provided by us, meticulously following the instructions therein. It is imperative that you comprehend and replicate the actions demonstrated in each video.</p>

        - <em>Video 1:</em> Install Python, Git Bash, and Visual Studio Code on your computer. 
        Watch the tutorial <a href="https://youtu.be/8bGpZ91Zhu0" target="_blank">"https://youtu.be/8bGpZ91Zhu0"</a>.
        <br>

        - <em>Video 2:</em> Learn Linux Commands with Git Bash on Windows. 
        Watch the tutorial <a href="https://youtu.be/YEyJVrpB-_4" target="_blank">"https://youtu.be/YEyJVrpB-_4"</a>.
        <br>

        - <em>Video 3:</em> Learn Python variables as demonstrated in this tutorial. 
        Watch the tutorial <a href="https://youtu.be/nMVozkBYpMY" target="_blank">"https://youtu.be/nMVozkBYpMY"</a>
        <br>

        - <em>Video 4:</em> Learn Python List/Array as demonstrated in this tutorial. 
        Watch the tutorial <a href="https://youtu.be/CVHN9-6bbYA" target="_blank">"https://youtu.be/CVHN9-6bbYA"</a>


    <p><strong>Step 2: Interview Booking</strong><br>Upon completion of the tutorials, execute the practical tasks outlined and ensure a thorough understanding of the content. Subsequently, use the provided registration code to book your interview via the link below. Failure to enter your registration code may impede your ability to schedule an interview.</p>

    <p>Click <a href="https://www.youngafricanstech.org/register/newverification">https://www.youngafricanstech.org/register/newverification</a> to book for your interview after completing the assessment tutorials above.
    after clicking on the above interview booking link above, enter your registration code ${registrationCode} in the input form and click verify, if your registration code is entered correctly it will take you to the page whe you will book your interview
    </p>

    <p>You have a two-week window to study and learn from the video tutorials and to schedule your interview. It is imperative that you book your interview within this timeframe. Failure to do so before the two weeks expire will result in the automatic deletion of your registration data from our system. After this point, you will no longer be able to schedule your interview.</p>


    The interview questions will be based on the material covered in the above video tutorials, and a minimum passing score of 70 percent is required for program acceptance.<br>

    Should you have any queries or require clarification on the procedures or tutorials, please do not hesitate to contact us. Our contact details are as follows:

    <p>- <em>Cell Phone:</em> <code>+27849614744</code><br>
    - <em>Email:</em> <code>register@youngafricanstech.org</code></p>

    We appreciate your commitment to Young Africans Tech and look forward to your successful completion of the admission process.<br>

    <h5>Kind regards,<br>
    Young Africans Tech</h5>

    `,
    };



    const output = `
                        <h3>Registration Details </h3>
                        <ul>
                            <li><h1>Parent Firstname: ${parent_firstname}</h1></li>
                            <li><h3>Parent Lastname</h3>: ${parent_lastname}</li>
                            <li>Country: ${country}</li>
                            <li>State: ${state}</li>
                            <li>Email: ${email}</li>
                            <li>Phone: ${cellnumber}</li>
                            <li>Child Fullname: ${childs_fullname}</li>
                            <li>Child Age: ${child_age}</li>
                            <li>Gender: ${gender}</li>
                            <li>Grade: ${grade}</li>
                        </ul>
                        <h3>Message</h3>
                        <p>Request: ${message}</p>
                    `;

    const my_msg = {
        to: "register@youngafricanstech.org",
        from: "register@youngafricanstech.org",
        subject: "coding Application from " + childs_fullname,
        text: output,
        html: output,
    };

    try {
        await sgMail.send(msg);
        await sgMail.send(my_msg);


        console.log("Email sent successfully");
    } catch (error) {
        console.error(error);
        throw new Error("Failed to send email");
    }
}


// Book interview
router.post("/send", async (req, res) => {
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
                            <li><h1>Parent Firstname: ${req.body.parent_firstname}</h1></li>
                            <li><h3>Parent Lastname</h3>: ${req.body.parent_lastname}</li>
                            <li>Email: ${req.body.email}</li>
                         
                    `;

                    const msg = {
                        to: "register@youngafricanstech.org",
                        from: "register@youngafricanstech.org",
                        subject: "coding Application from " + req.body.childs_fullname,
                        text: output,
                        html: output,
                    };




                    theMessage = `Next Steps for Your Yat Online Coding Class Application.

                        <h2>Dear ${req.body.parent_firstname} ${req.body.parent_lastname}</h2>

                        <p>Thank you for Booking for your interview</p>

                        <p>As an integral part of our application process, we conduct video interviews to evaluate your child's understanding of the materials presented in the videos provided. These interviews are facilitated through Google Meet. This step is critical in determining your child's eligibility for our coding program.

                            During the video call, we will verify your identity as the child's parent and obtain your consent for your child's participation in our program. Additionally, we will assess your child's knowledge based on the content covered in the tutorial provided. This comprehensive evaluation ensures a thorough understanding of your child's readiness for our coding program..</p>
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
                        subject: "YATA Interview for " + req.body.childs_fullname,
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


module.exports = router;
