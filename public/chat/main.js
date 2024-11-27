const online_user_list = document.getElementById('online_user_list');
const chat_box = document.getElementById('chat_box');
const send_message_form = document.getElementById('send_message');
const chat_message = document.getElementById('chat_message');
const chat_error = document.getElementById('chat_error');


send_message_form.addEventListener('submit', onSendMessage);

document.addEventListener('DOMContentLoaded', DomLoad);

//token
const token = localStorage.getItem('token');



//DOMLOAD
async function DomLoad() {
    try {

        let LastMessageID = localStorage.getItem('LastMessageIDLS');

        if (LastMessageID == undefined) {
            LastMessageID = '-1';
        }

        // const res = await axios.get(`http://localhost:3000/get-messages?LastMessageID=${LastMessageID}`, { headers: { 'Auth': token } });

        // const messages = res.data.messages;

        setInterval(async () => {

            const res = await axios.get(`http://localhost:3000/get-messages?LastMessageID=${LastMessageID}`, { headers: { 'Auth': token } });

            const messages = res.data.messages;

            AddToLocalStorage(messages);

            LastMessageID = localStorage.getItem('LastMessageIDLS');

        }, 1000);

    }
    catch (err) {
        console.log(err)
    }

}


//ADD TO LOCAL STORAGE
function AddToLocalStorage(messages) {

    let OldMessages = JSON.parse(localStorage.getItem('OldMessages'));

    if (OldMessages == null && messages.length != 0) {

        localStorage.setItem('OldMessages', JSON.stringify(messages));
        localStorage.setItem('LastMessageIDLS', messages[messages.length - 1].id);
        OldMessages = JSON.parse(localStorage.getItem('OldMessages'));

    }
    else if (OldMessages.length <= 10 && messages.length != 0) {

        const res = OldMessages.splice(0, messages.length);
        for (i in messages) {
            OldMessages.push(messages[i]);
        }

        localStorage.setItem('OldMessages', JSON.stringify(OldMessages));
        localStorage.setItem('LastMessageIDLS', OldMessages[OldMessages.length - 1].id);

    }

    chat_box.innerHTML = '';

    for (m in OldMessages) {

        showMessages(OldMessages[m]);

    }
}




//SEND MESSAGE
async function onSendMessage(e) {

    e.preventDefault();

    // console.log(chat_message.value);

    if (chat_message.value == '') {

        chat_error.innerHTML = 'Please enter a message';

        setTimeout(() => {
            chat_error.removeChild(chat_error.firstChild);
        }, 2000);
    }
    else {

        try {
            message = {
                message: chat_message.value
            }

            let response = await axios.post(`http://localhost:3000/send-message`, message, { headers: { 'Auth': token } });

        }
        catch (err) {
            console.log(err);
        }

        send_message_form.reset();
    }

}


//SHOW MESSAGES ON SCREEN
function showMessages(message) {
    const newMessage = `<p>${message.user.name} : ${message.message}</p>`;
    chat_box.innerHTML += newMessage;
}