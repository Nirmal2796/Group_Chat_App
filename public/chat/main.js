const group_list = document.getElementById('group_list');
const chat_box = document.getElementById('chat_box');
const send_message_form = document.getElementById('send_message');
const chat_message = document.getElementById('chat_message');
const chat_error = document.getElementById('chat_error');
const create_group = document.getElementById('create_group');
const group_form = document.getElementById('group_form');
const group_name = document.getElementById('group_name');
const group_name_text = document.getElementById('group_name_text');

send_message_form.addEventListener('submit', onSendMessage);
group_form.addEventListener('submit', createGroup);

document.addEventListener('DOMContentLoaded', DomLoad);


//token
const token = localStorage.getItem('token');



//DOMLOAD
async function DomLoad() {
    try {


        // getMessage(1);
        getGroup();

    }
    catch (err) {
        console.log(err)
    }

}


//GET MESSAGES
async function getMessage(gid,glink) {

    let LastMessageID = localStorage.getItem('LastMessageIDLS');

    localStorage.setItem('gid', gid);
    localStorage.setItem('glink',`http://localhost:3000/join-group/${glink}`);

    if (LastMessageID == undefined) {
        LastMessageID = '-1';
    }

    console.log('GID',gid);

    group_name_text.innerHTML = document.getElementById(gid).innerText;
    

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

    console.log(messages);
    // console.log(messages.length);

    let OldMessages = JSON.parse(localStorage.getItem('OldMessages'));
    console.log(OldMessages);

    if (OldMessages == null && messages.length !=0 ) {
        console.log('in 1st if')
        localStorage.setItem('OldMessages', JSON.stringify(messages));
        localStorage.setItem('LastMessageIDLS', messages[messages.length - 1].id);
    }
    else if (messages.length != 0  && messages.length < 10) {
        console.log('in 2 if')
        // OldMessages=JSON.parse(OldMessages);
        const res = OldMessages.splice(0, messages.length);
        for (i in messages) {
            OldMessages.push(messages[i]);
        }
        localStorage.setItem('OldMessages', JSON.stringify(OldMessages));
        localStorage.setItem('LastMessageIDLS', OldMessages[OldMessages.length - 1].id);

    }
    else if (messages.length == 10 ) {
        // console.log(OldMessages);
        console.log('in 3 if')
        // console.log(messages);
        localStorage.setItem('OldMessages', JSON.stringify(messages));
        localStorage.setItem('LastMessageIDLS', messages[messages.length - 1].id);
        // OldMessages = JSON.parse(localStorage.getItem('OldMessages'));

    }


    if (OldMessages != null) {
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

            const gid = localStorage.getItem('gid');

            let response = await axios.post(`http://localhost:3000/send-message/${gid}`, message, { headers: { 'Auth': token } });

            console.log(response.data.message);
            // localStorage.setItem('LastMessageIDLS', response.data.message.id);
            // AddToLocalStorage(response.data.message);
            // showMessages(response.data.message);
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
function showCreateGroup() {
    document.getElementById('plus_icon').hidden = true;
    document.getElementById('group_form_div').hidden = false;
    group_list.hidden = true;
}

//HIDE CREATE GROUP FORM
function hideCreateGroup() {
    document.getElementById('plus_icon').hidden = false;
    document.getElementById('group_form_div').hidden = true;
    group_list.hidden = false;
}

//CREATE GROUP
async function createGroup(e) {


    e.preventDefault();

    if (group_name.value == '') {

        chat_error.innerHTML = 'Please enter a name';

        setTimeout(() => {
            // chat_error.removeChild(chat_error.firstChild);
        }, 2000);
    }
    else {

        try {

            group = {
                group_name: group_name.value
            }

            const res = await axios.post('http://localhost:3000/create-group', group, { headers: { 'Auth': token } });

            console.log(res);


        }
        catch (err) {
            console.log(err);
        }
        group_form.reset();
        DomLoad();
        hideCreateGroup();
    }

}

//SHOW GROUPS
async function getGroup() {
    try {

        console.log('in get group');

        const res = await axios.get('http://localhost:3000/get-groups', { headers: { 'Auth': token } });

        const groups = res.data.groups;
        group_list.innerHTML = '';

        for (group in groups) {
            console.log(typeof(groups[group].link));
            group_list.innerHTML += `<li><button id=${groups[group].id} value='${groups[group].name}' onclick='getMessage(${groups[group].id},"${groups[group].link}")'>${groups[group].name}</button></li>`;
        }

        // const classBtn=document.getElementById("4");
        // classBtn.click();
    }
    catch (err) {
        console.log(err);
    }
}


//JOIN GROUP
async function joinGroup(params) {

    const gid = localStorage.getItem('gid');

    const res = await axios.get(`http://localhost:3000/join-group/${gid}`, { headers: { 'Auth': token } });

}

//COPY LINK
function copyLink(){
    const gLink = localStorage.getItem('glink');

    if(gLink){
        navigator.clipboard.writeText(gLink);
        console.log("Link copied to clipboard!");
    }
    else{
        console.error("Failed to copy:", err);
    }
}

//SHARE LINK
async function shareLink(){
    const gLink = localStorage.getItem('glink');

    if (navigator.share) {
          try {
            await navigator.share({
              title: "JOIN GROUP",
              url: window.location.href,
            });
            console.log("Content shared successfully");
          } catch (err) {
            console.error("Error sharing:", err);
          }
      } else {
        // Fallback for browsers that don't support Web Share API
        console.log("Web Share API not supported");
      }
}