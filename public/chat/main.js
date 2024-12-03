const group_list = document.getElementById('group_list');
const chat_box = document.getElementById('chat_box');
const send_message_form = document.getElementById('send_message');
const chat_message = document.getElementById('chat_message');
const chat_error = document.getElementById('chat_error');
const create_group = document.getElementById('create_group');
const group_form= document.getElementById('group_form');
const group_name_text=document.getElementById('group_name_text');

send_message_form.addEventListener('submit', onSendMessage);
group_form.addEventListener('submit',createGroup);

document.addEventListener('DOMContentLoaded', DomLoad);


//token
const token = localStorage.getItem('token');



//DOMLOAD
async function DomLoad() {
    try {

       
        // getMessage(1);
        getGroup(4);
        
    }
    catch (err) {
        console.log(err)
    }

}

async function getMessage(gid) {

    let LastMessageID = localStorage.getItem('LastMessageIDLS');

    localStorage.setItem('gid',gid);

    if (LastMessageID == undefined) {
        LastMessageID = '-1';
    }


    group_name_text.innerHTML=document.getElementById(gid).innerText;
    // console.log(document.getElementById('group_name_text'));

    const res = await axios.get(`http://localhost:3000/get-messages/${gid}?LastMessageID=${LastMessageID}`, { headers: { 'Auth': token } });

        // const res = await axios.get(`http://localhost:3000/get-messages?LastMessageID=${LastMessageID}`, { headers: { 'Auth': token } });

        // const messages = res.data.messages.chats;

        console.log(res.data.messages);

        setInterval(async () => {

            const res = await axios.get(`http://localhost:3000/get-messages/${gid}?LastMessageID=${LastMessageID}`, { headers: { 'Auth': token } });

            const messages = res.data.messages;

            AddToLocalStorage(messages);

            LastMessageID = localStorage.getItem('LastMessageIDLS');

        }, 1000);

        getGroup();

    
}

//ADD TO LOCAL STORAGE
function AddToLocalStorage(messages) {

    console.log(messages.length);
    
    let OldMessages = JSON.parse(localStorage.getItem('OldMessages'));
    // console.log(OldMessages.length);
    if(OldMessages==null){
        console.log('in 1st if')
        localStorage.setItem('OldMessages', JSON.stringify(messages));
    }
    else if (messages.length != 0 && OldMessages.length == 10 || OldMessages.length == 0) {
        // console.log(OldMessages);
        console.log('in 2 if')
        console.log(messages);
        localStorage.setItem('OldMessages', JSON.stringify(messages));
        // localStorage.setItem('LastMessageIDLS', messages[messages.length - 1].id);
        OldMessages = JSON.parse(localStorage.getItem('OldMessages'));

    }
    else if (messages.length != 0 && OldMessages.length <= 10 ) {
        console.log('in 3 if')
        // OldMessages=JSON.parse(OldMessages);
        const res = OldMessages.splice(0, messages.length);
        for (i in messages) {
            OldMessages.push(messages[i]);
        }
        localStorage.setItem('OldMessages', JSON.stringify(OldMessages));
        localStorage.setItem('LastMessageIDLS', OldMessages[OldMessages.length - 1].id);

    }


    if(OldMessages!=null){
        // console.log('Oldmessages',OldMessages);

        chat_box.innerHTML = '';

    for (m in OldMessages) {

        showMessages(OldMessages[m]);

    }
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

            const gid=localStorage.getItem('gid');

            let response = await axios.post(`http://localhost:3000/send-message/:gid`, message, { headers: { 'Auth': token } });

        }
        catch (err) {
            console.log(err);
        }

        send_message_form.reset();
    }

}


//SHOW MESSAGES ON SCREEN
function showMessages(message) {
    console.log(message);
    const newMessage = `<p>${message.user.name} : ${message.message}</p>`;
    chat_box.innerHTML += newMessage;
}

//SHOW CREATE GROUP FORM
function showCreateGroup(){
    document.getElementById('plus_icon').hidden=true;
    document.getElementById('group_form_div').hidden=false;
    group_list.hidden=true;
}

//CREATE GROUP
async function createGroup(e){

    e.preventDefault();
  
    const group_name=document.getElementById('group_name').value;

    // console.log(group_name);

    group={
        group_name:group_name
    }

    const res=await axios.post('http://localhost:3000/create-group',group, { headers: { 'Auth': token } });

    console.log(res);

}

//SHOW GROUPs
async function getGroup(){

    console.log('in get group');

    const res=await axios.get('http://localhost:3000/get-groups',{ headers: { 'Auth': token } });

    const groups=res.data.groups;
    group_list.innerHTML='';

    for(group in groups){
        // console.log(group);
        group_list.innerHTML+=`<li><button id=${groups[group].id} value='${groups[group].name}' onclick='getMessage(${groups[group].id})'>${groups[group].name}</button></li>`;
    }

    // const classBtn=document.getElementById("4");
    // classBtn.click();
}


//JOIN GROUP
async function joinGroup(params) {
    
    const gid=localStorage.getItem('gid');

    const res=await axios.get(`http://localhost:3000/join-group/${gid}`,{ headers: { 'Auth': token } });

}
