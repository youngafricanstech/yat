
$(document).ready(function () {
    $('form.requires-validation').submit(function (event) {
        var validateCheck = false

        var recaptcha = $("#g-recaptcha-response").val();
        const messageBox = document.getElementById('messageBox');
        const closeMessageBtn = document.getElementById('closeMessageBtn');
        const successmessage = document.getElementById('successmessage');

        if (!this.checkValidity()) {

            event.preventDefault();
            event.stopPropagation();


        } else {
            event.preventDefault();
            validateCheck = true

            var form = $(this);
            var formData = form.serialize();
            $.ajax({
                type: "POST",
                url: "/register/send",
                data: formData,
                success: function (response) {
                    if (recaptcha) {

                        $("#cform")[0].reset();

                        grecaptcha.reset();


                        // window.location.href = "/success";
                        successmessage.innerHTML = 'Interview Booking submitted successfully! Please check your email';
                        messageBox.style.display = 'block';
                    } else {
                        grecaptcha.reset();
                        alert("Recaptcha failed. Please try again.");
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error(textStatus, errorThrown);
                }
            });
        }
        if (validateCheck == true) {
            this.classList.remove('was-validated')


        } else {
            this.classList.add('was-validated');

        }
    });

    closeMessageBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        messageBox.style.display = 'none';
        this.classList.remove('was-validated')

    });
});