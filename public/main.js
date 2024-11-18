sign_up_user_name=document.getElementById('sign_up_name');
sign_up_user_email=document.getElementById('sign_up_email');
sign_up_user_phone=document.getElementById('sign_up_phone');
sign_up_user_password=document.getElementById('sign_up_password');
sign_up_msg=document.getElementById('sign_up_msg');
sign_up_error=document.getElementById('sign_up_error');

login_user_email=document.getElementById('login_email');
login_user_password=document.getElementById('login_password');
login_msg=document.getElementById('login_msg');
login_error=document.getElementById('login_error');

sign_up_form=document.getElementById('sign_up_form');
login_form=document.getElementById('login_form');

sign_up_submit=document.getElementById('sign_up_submit');
login_submit=document.getElementById('login_submit');

sign_up_form.addEventListener('submit',onSignUp);
login_form.addEventListener('submit',onLogin);




async function onSignUp(e) {

    e.preventDefault();

    if (sign_up_user_name.value == '' || sign_up_user_email.value == '' || sign_up_user_phone.value=='' || sign_up_user_password == '') {
        sign_up_msg.innerHTML = '<b>Please enter all fields</b>';

        setTimeout(() => {
            sign_up_msg.removeChild(sign_up_msg.firstChild);
        }, 2000);
    }
    else {

        try {

            User={
                name:sign_up_user_name.value,
                email:sign_up_user_email.value,
                phone: sign_up_user_phone.value,
                password:sign_up_user_password.value
            };

            const result = await axios.post("http://localhost:3000/signup", User);

            alert(result.data.message);

            sign_up_form.reset();
        }
        catch (err) {
            sign_up_form.reset();
            // sign_up_error.innerHTML = `Error: ${err.response.data}`;
            alert(err.response.data);
            console.log(err);
        }
    }
    
}

async function onLogin(e) {
    
    e.preventDefault();

    if (login_user_email.value == '' ||  login_user_password == '') {
        login_msg.innerHTML = '<b>Please enter all fields</b>';

        setTimeout(() => {
            login_msg.removeChild(sign_up_msg.firstChild);
        }, 2000);
    }
    else {

        try {

            User={
                name:sign_up_user_name.value,
                email:login_user_email.value,
                phone: sign_up_user_phone.value,
                password:login_user_password.value
            };

            const result = await axios.post("http://localhost:3000/login", User);

            alert(result.data.message);

            localStorage.setItem('token',result.data.token);

            login_form.reset();
        }
        catch (err) {
            login_form.reset();
            login_error.innerHTML = `Error: ${err.response.data.message}`;
            setTimeout(() => {
                login_error.removeChild(login_error.firstChild);
            }, 2000);

            console.log(err);
        }
    }
}