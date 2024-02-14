// $("#make-comment").on("click", function (event) {
//   id = document.getElementById("post-id").innerHTML;
//   console.log(id);
//   event.preventDefault();
//   var name = document.getElementById("name").value;
//   var message = document.getElementById("comment").value;

//   var response = grecaptcha.getResponse();

//   var name_passed = false;
//   var message_passed = false;
//   var response_passed = false;

//   if (name == "") {
//     var the_value = document.getElementById("name-error");

//     the_value.innerHTML = "Please enter your name";
//     name_passed = true;
//   } else if (message == "") {
//     var the_value = document.getElementById("message-error");

//     the_value.innerHTML == ""
//       ? (the_value.innerHTML = "Please enter your message")
//       : (the_value.innerHTML = "");
//     message_passed = true;
//   } else if (response == "") {
//     var the_value = document.getElementById("recaptcha-error");

//     the_value.innerHTML == ""
//       ? (the_value.innerHTML = "Please verify that you are not a robot")
//       : (the_value.innerHTML = "");
//     response_passed = true;
//   }

//   if (name_passed != true) {
//     var the_value = document.getElementById("name-error");

//     the_value.innerHTML = "";
//   }
//   if (message_passed != true) {
//     var the_value = document.getElementById("message-error");

//     the_value.innerHTML = "";
//   }

//   if (response_passed != true) {
//     var the_value = document.getElementById("recaptcha-error");

//     the_value.innerHTML = "";
//   }
//   if (
//     name_passed != true &&
//     message_passed != true &&
//     response_passed != true
//   ) {
//     var f = $("#commentform");
//     $.ajax({
//       url: "/posts/" + id + "/comment",
//       method: "POST",
//       data: f.serialize(),
//       success: function (result) {
//         $("#all-comments").append(`<div class="comments-body">
//             <div class="comments">
//                 <div class="info">${$("#name").val()}</div>
//                 <p class="lists">${$("#comment").val()}</p>
//                  <span class="comment-date">${moment(new Date()).format(
//                    "llll"
//                  )}</span>

//                 </div>
//             </div>`);
//         $("#commnent-counter").text(
//           parseInt($("#commnent-counter").text()) + 1
//         ); //updated total

//         $("#name").val("");
//         $("textarea#comment").val("");
//         grecaptcha.reset();
//         $("#success-delivey-message").show(() => {
//           setTimeout(() => {
//             $("#success-delivey-message")
//               .fadeTo(500, 1)
//               .slideUp(500, () => {
//                 $("#success-delivey-message").hide();
//               });
//           }, 10000);
//         });
//       },
//     });
//   }
// });
