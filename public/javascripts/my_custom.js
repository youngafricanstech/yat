$("#post-comment").on("click", function (event) {
  event.preventDefault();
  var name = document.getElementById("name-input").value;
  var email = document.getElementById("email-input").value;
  var message = document.getElementById("message-input").value;
  var phone = document.getElementById("phone-input").value;
  var subject = document.getElementById("subject-input").value;
  var response = grecaptcha.getResponse();

  var name_passed = false;
  var email_passed = false;
  var email_validation_passed = false;
  var message_passed = false;
  var phone_passed = false;
  var subject_passed = false;
  var response_passed = false;

  atpos = email.indexOf("@");
  dotpos = email.lastIndexOf(".");

  // var all_passed = false;
  // if (
  //   name === "" &&
  //   email === "" &&
  //   phone === "" &&
  //   subject === "" &&
  //   message === "" &&
  //   response === ""
  // ) {
  //   var name_dom = document.getElementById("name-error");

  //   name_dom.innerHTML = "Please enter your name";

  //   var email_dom = document.getElementById("email-error");

  //   email_dom.innerHTML = "Please enter your email";

  //   var phone_dom = document.getElementById("phone-error");

  //   phone_dom.innerHTML = "Please enter your number";

  //   var subject_dom = document.getElementById("subject-error");

  //   subject_dom.innerHTML = "Please enter your subject";

  //   var message_dom = document.getElementById("message-error");

  //   message_dom.innerHTML = "Please enter your message";

  //   var recaptcha_dom = document.getElementById("recaptcha-error");

  //   recaptcha_dom.innerHTML = "Please select recaptcha";
  //   return (
  //     name_dom.innerHTML,
  //     email_dom.innerHTML,
  //     phone_dom.innerHTML,
  //     subject_dom.innerHTML,
  //     message_dom.innerHTML,
  //     recaptcha_dom.innerHTML,
  //     (all_passed = true)
  //   );
  // }

  if (name == "") {
    var the_value = document.getElementById("name-error");

    the_value.innerHTML = "Please enter your name";
    name_passed = true;
  } else {
    var the_value = document.getElementById("name-error");

    the_value.innerHTML = "";
  }

  if (email == "") {
    var the_value = document.getElementById("email-error");

    the_value.innerHTML = "Please enter your email";
    email_passed = true;
  } else if (atpos < 1 || dotpos - atpos < 2) {
    var the_value = document.getElementById("email-error-validation");

    the_value.innerHTML = "Please enter a valid email address";
    email_validation_passed = true;
  } else {
    var the_value = document.getElementById("email-error-validation");
    the_value.innerHTML = "";
  }

  if (email != "") {
    var the_value = document.getElementById("email-error");
    the_value.innerHTML = "";
  }

  var found = phone.search(
    /^(\+{1}\d{2,3}\s?[(]{1}\d{1,3}[)]{1}\s?\d+|\+\d{2,3}\s{1}\d+|\d+){1}[\s|-]?\d+([\s|-]?\d+){1,2}$/
  );
  if (found > -1 && phone.length > 9) {
    var the_value = document.getElementById("phone-error");
    the_value.innerHTML = "";
  } else {
    var the_value = document.getElementById("phone-error");

    the_value.innerHTML = "Please enter a valid phone number";

    phone_passed = true;
  }

  if (subject == "") {
    var the_value = document.getElementById("subject-error");

    the_value.innerHTML = "Please enter your subject";
    subject_passed = true;
  } else {
    var the_value = document.getElementById("subject-error");

    the_value.innerHTML = "";
  }

  if (message == "") {
    var the_value = document.getElementById("message-error");

    the_value.innerHTML = "Please enter your Message";
    message_passed = true;
  } else {
    var the_value = document.getElementById("message-error");

    the_value.innerHTML = "";
  }

  if (response == "") {
    var the_value = document.getElementById("recaptcha-error");

    the_value.innerHTML = "Please enter your recaptcha";
    response_passed = true;
  } else {
    var the_value = document.getElementById("recaptcha-error");

    the_value.innerHTML = "";
  }

  if (
    name_passed != true &&
    email_passed != true &&
    message_passed != true &&
    phone_passed != true &&
    subject_passed != true &&
    response_passed != true
  ) {
    var f = $("#send-request");
    $.ajax({
      url: "/contacts/send",
      method: "POST",
      data: f.serialize(),
      success: function (result) {
        $("#name-input").val("");
        $("#email-input").val("");
        $("#phone-input").val("");
        $("#subject-input").val("");
        $("textarea#message-input").val("");
        grecaptcha.reset();

        $("#success-delivey-message").show(() => {
          setTimeout(() => {
            $("#success-delivey-message")
              .fadeTo(500, 1)
              .slideUp(500, () => {
                $("#success-delivey-message").hide();
              });
          }, 10000);
        });
      },
    });
  }
});
