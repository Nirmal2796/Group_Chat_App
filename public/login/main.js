sign_up_user_name = document.getElementById('sign_up_name');
sign_up_user_email = document.getElementById('sign_up_email');
sign_up_user_phone = document.getElementById('sign_up_phone');
sign_up_user_password = document.getElementById('sign_up_password');
sign_up_msg = document.getElementById('sign_up_msg');
sign_up_error = document.getElementById('sign_up_error');

login_user_email = document.getElementById('login_email');
login_user_password = document.getElementById('login_password');
login_msg = document.getElementById('login_msg');
login_error = document.getElementById('login_error');

sign_up_form = document.getElementById('sign_up_form');
login_form = document.getElementById('login_form');

sign_up_submit = document.getElementById('sign_up_submit');
login_submit = document.getElementById('login_submit');

sign_up_form.addEventListener('submit', onSignUp);
login_form.addEventListener('submit', onLogin);



function ShowSignup() {
    document.getElementById('sign_up_div').hidden = false;
    document.getElementById('login_div').hidden = true;
}

function ShowLogin() {
    document.getElementById('login_div').hidden = false;
    document.getElementById('sign_up_div').hidden = true;
}


async function onSignUp(e) {

    e.preventDefault();

    if (sign_up_user_name.value == '' || sign_up_user_email.value == '' || sign_up_user_phone.value == '' || sign_up_user_password == '') {
        sign_up_msg.innerHTML = '<b>Please enter all fields</b>';

        setTimeout(() => {
            sign_up_msg.removeChild(sign_up_msg.firstChild);
        }, 2000);
    }
    else {

        try {

            User = {
                name: sign_up_user_name.value,
                email: sign_up_user_email.value,
                phone: sign_up_user_phone.value,
                password: sign_up_user_password.value
            };

            const result = await axios.post("http://localhost:3000/signup", User);

            alert(result.data.message);

            sign_up_form.reset();
        }
        catch (err) {

            sign_up_form.reset();

            sign_up_msg.innerHTML = `${err.response.data}`;
            setTimeout(() => {
                sign_up_msg.removeChild(sign_up_msg.firstChild);
            }, 2000);

            console.log(err);
        }
    }

}

async function onLogin(e) {

    e.preventDefault();

    if (login_user_email.value == '' || login_user_password == '') {
        login_msg.innerHTML = '<b>Please enter all fields</b>';

        setTimeout(() => {
            login_msg.removeChild(sign_up_msg.firstChild);
        }, 2000);
    }
    else {

        try {

            User = {
                name: sign_up_user_name.value,
                email: login_user_email.value,
                phone: sign_up_user_phone.value,
                password: login_user_password.value
            };

            //window.location.search will return ?redirect='';
            //new URLSearchParams() This takes the query string and turns it into an object-like structure that lets you easily work with the parameters.
            //Once you create a URLSearchParams object, you can:
            // Get specific parameter values.
            // Add or remove parameters.
            // Iterate over all the parameters.            
            const urlParams = new URLSearchParams(window.location.search);
            const redirect = urlParams.get('redirect');


            // console.log(redirect);

            const result = await axios.post(`http://localhost:3000/login`, User);

            console.log(result.data);
            alert(result.data.message);


            // window.location.href = '../chat/chat.html';

            localStorage.setItem('token', result.data.token);

            
            if (redirect) {
                // Perform the POST request to the redirect URL
                const glink = decodeURIComponent(redirect).split('/join-group/');
                console.log(glink[1]);
                const redirectResponse = await axios.post(`http://localhost:3000/join-group/${glink[1]}/process`, {},
                    { headers: { 'Auth': result.data.token } }
                );

                alert(redirectResponse.data.message || 'Successfully added to the group!');

                console.log('redirectResponse',redirectResponse);

                // Redirect to the chat page after successful group addition
                window.location.href = '../chat/chat.html';
            } else {
                // Default fallback
                window.location.href = '../chat/chat.html';
            }

            login_form.reset();
        }
        catch (err) {

            login_form.reset();
            // Handle the join group response:
         if (err.response.status === 409) {
            // If the user is already a member
            alert('You are already a member of this group.');
            window.location.href = '../chat/chat.html'; // Redirect to chat page even if already a member
        }
        else if(err.response.status === 404){
            alert('Group Does not Exist');
            window.location.href = '../chat/chat.html';
        }
        else{

            login_msg.innerHTML = `${err.response.data.message}`;
            setTimeout(() => {
                login_msg.removeChild(login_msg.firstChild);
            }, 2000);
        }

            console.log(err);
        }
    }
}