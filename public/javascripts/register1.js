
//according to loftblog tut
if ($('.menu-trigger').length) {
    $(".menu-trigger").on('click', function () {
        $(this).toggleClass('active');
        $('.header-area .nav').slideToggle(200);
    });
}


// Menu elevator animation
$('.scroll-to-section a[href*=\\#]:not([href=\\#])').on('click', function () {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
        if (target.length) {
            var width = $(window).width();
            if (width < 991) {
                $('.menu-trigger').removeClass('active');
                $('.header-area .nav').slideUp(200);
            }
            $('html,body').animate({
                scrollTop: (target.offset().top) - 80
            }, 700);
            return false;
        }
    }
});

$(document).ready(function () {
    $('form.requires-validation').submit(function (event) {
        var validateCheck = false

        var recaptcha = $("#g-recaptcha-response").val();
        const messageBox = document.getElementById('messageBox');
        const closeMessageBtn = document.getElementById('closeMessageBtn');
        const successmessage = document.getElementById('successmessage');
        childage = document.getElementById("age").value
        age_int = parseInt(childage)

        if (!this.checkValidity()) {
            var phoneNumberInput = document.getElementById('phonenumber');

            phoneNumberInput.addEventListener('input', function () {
                var phoneNumber = phoneNumberInput.value;
                var phoneNumberRegex = /^\+?\d{10,15}$/; // Regex pattern for 10 to 14 digits

                if (phoneNumberRegex.test(phoneNumber)) {
                    phoneNumberInput.setCustomValidity('');
                    phoneNumberInput.classList.add('is-valid');
                    phoneNumberInput.classList.remove('is-invalid');
                } else {
                    phoneNumberInput.setCustomValidity('Please enter a valid phone number.');
                    phoneNumberInput.classList.add('is-invalid');
                    phoneNumberInput.classList.remove('is-valid');
                    event.preventDefault();
                    event.stopPropagation();
                }
            });
            event.preventDefault();
            event.stopPropagation();


        } else {
            event.preventDefault();
            validateCheck = true

            var form = $(this);
            var formData = form.serialize();
            $.ajax({
                type: "POST",
                url: "/register/student",
                data: formData,
                success: function (response) {
                    if (recaptcha) {

                        $("#cform")[0].reset();

                        grecaptcha.reset();


                        // window.location.href = "/success";
                        successmessage.innerHTML = 'Yata Application submitted successfully! Please check your email';
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