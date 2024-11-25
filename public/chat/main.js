const online_user_list=document.getElementById('online_user_list');
const chat_box=document.getElementById('chat_box');
const send_message_form=document.getElementById('send_message');
const chat_message=document.getElementById('chat_message');
const chat_error=document.getElementById('chat_error');


send_message_form.addEventListener('submit',onSendMessage);

document.addEventListener('DOMContentLoaded', DomLoad);

//token
const token = localStorage.getItem('token');

//DOMLOAD
async function DomLoad() {
    try {

        const res = await axios.get(`http://localhost:3000/get-messages`, { headers: { 'Auth': token } });

        const messages = res.data.messages;

        for(m in messages){

            showMessages(messages[m]);

        }
        

        console.log(messages);

    }
    catch (err) {
        console.log(err)
    }

}

//SEND MESSAGE
async function onSendMessage(e) {
    
    e.preventDefault();

    console.log(chat_message.value);

    if(chat_message.value ==''){

        chat_error.innerHTML = 'Please enter a message';

        setTimeout(() => {
            chat_error.removeChild(chat_error.firstChild);
        }, 2000);
    }
    else{

        try {
                message={
                    message:chat_message.value
                }

                let response = await axios.post(`http://localhost:3000/send-message`, message, { headers: { 'Auth': token } });
                
                console.log(response);

                showMessages(response.data.message);
    
            }
            catch (err) {
                console.log(err);
            }
    
            send_message_form.reset();
    }

}

function showMessages(message){
    
    console.log(message);
    const newMessage=`<p>${message.message}</p>`;
    // console.log(newMessage);
    chat_box.innerHTML+=newMessage;
}