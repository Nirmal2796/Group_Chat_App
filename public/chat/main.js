const group_list = document.getElementById('group_list');
const chat_box = document.getElementById('chat_box');
const send_message_form = document.getElementById('send_message');
const chat_read_div = document.getElementById('chat_read_div');
const chat_message = document.getElementById('chat_message');
const chat_error = document.getElementById('chat_error');
const create_group = document.getElementById('create_group');
const group_form = document.getElementById('group_form');
const group_name = document.getElementById('group_name');
const group_name_div = document.getElementById('group_name_div');
const group_name_text = document.getElementById('group_name_text');
const invite_form = document.getElementById('invite_form');
const invite_email_input = document.getElementById('invite_email_input');
const group_members_div = document.getElementById('group_members_div');
const group_members_list = document.getElementById('group_members_list');

send_message_form.addEventListener('submit', onSendMessage);
group_form.addEventListener('submit', createGroup);
invite_form.addEventListener('submit', inviteViaEmail);

document.addEventListener('DOMContentLoaded', DomLoad);


//token
const token = localStorage.getItem('token');


//interval;
let myInterval;

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
async function getMessage(gid, glink) {

    let LastMessageID = localStorage.getItem('LastMessageIDLS');

    localStorage.setItem('gid', gid);
    localStorage.setItem('glink', `http://localhost:3000/join-group/${glink}`);

    if (LastMessageID == undefined) {
        LastMessageID = '-1';
    }

    console.log('GID', gid);

    group_name_text.innerHTML = document.getElementById(gid).innerText;


    const res = await axios.get(`http://localhost:3000/get-messages/${gid}?LastMessageID=${LastMessageID}`, { headers: { 'Auth': token } });

    // const res = await axios.get(`http://localhost:3000/get-messages?LastMessageID=${LastMessageID}`, { headers: { 'Auth': token } });

    // const messages = res.data.messages.chats;

    console.log(res.data.messages);

    myInterval=setInterval(async () => {

        const res = await axios.get(`http://localhost:3000/get-messages/${gid}?LastMessageID=${LastMessageID}`, { headers: { 'Auth': token } });

        const messages = res.data.messages;

        AddToLocalStorage(messages);

        LastMessageID = localStorage.getItem('LastMessageIDLS');

    }, 1000);

    getGroup();


}

//ADD TO LOCAL STORAGE
function AddToLocalStorage(messages) {

    // console.log(messages);
    // console.log(messages.length);

    // Retrieve or initialize
    let OldMessages = JSON.parse(localStorage.getItem('OldMessages')) || [];
    // console.log(OldMessages);

    if (messages.length > 0) {
        if (OldMessages.length + messages.length <= 10) {
            // If combined messages are less than or equal to 10
            OldMessages = [...OldMessages, ...messages];
        }
        else if (messages.length >= 10) {
            // If exactly 10 new messages are received
            OldMessages = messages;
        }
        else {
            // If the combined messages exceed 10, maintain the latest 10
            const excess = OldMessages.length + messages.length - 10;
            OldMessages = [...OldMessages.slice(excess), ...messages];
        }
        // Save to localStorage
        localStorage.setItem("OldMessages", JSON.stringify(OldMessages));
        localStorage.setItem("LastMessageIDLS", OldMessages[OldMessages.length - 1].id);
    }



    chat_box.innerHTML = '';

    for (m in OldMessages) {

        showMessages(OldMessages[m]);

    }

}

/*
1)Explanation of Logic

    1.Combine Old and New Messages:
        -If the combined length is less than or equal to 10, directly append.

    2.Handle 10 New Messages:
        -Replace old messages if exactly 10 new messages are received.

    3.Trim Excess Messages:
        -Ensure the total number of stored messages doesn’t exceed 10.

    4.Update Local Storage:
        -Save the updated message array and the ID of the last message.

    5.Render Messages:
        -Clear the chat box and display the updated messages.


2)Testing Suggestions:
    1.Test with various message lengths:
        -messages.length = 0
        -messages.length < 10
        -messages.length = 10
*/



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
            console.log(typeof (groups[group].link));
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

    // const gid = localStorage.getItem('gid');

    // const res = await axios.get(`http://localhost:3000/join-group/${gid}`, { headers: { 'Auth': token } });

}

//COPY LINK
function copyLink() {
    const gLink = localStorage.getItem('glink');

    if (gLink) {
        navigator.clipboard.writeText(gLink);
        console.log("Link copied to clipboard!");
    }
    else {
        console.error("Failed to copy:", err);
    }
}

//SHARE LINK
async function shareLink() {
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


function inviteEmail() {
    const invite_form_div = document.getElementById('invite_form_div');
    invite_form_div.hidden = false;

    document.getElementById('bg-grey').hidden = false;
    close_btn.hidden = true;
    menu_btn.hidden = false;
    menu.hidden = true;
}

function closeInvite() {
    const invite_form_div = document.getElementById('invite_form_div');
    invite_form_div.hidden = true;

    document.getElementById('bg-grey').hidden = true;
}

async function inviteViaEmail(e) {

    e.preventDefault();

    const glink = localStorage.getItem('glink');

    if (invite_email_input.value == '') {

        // chat_error.innerHTML = 'Please enter a name';

        setTimeout(() => {
            // chat_error.removeChild(chat_error.firstChild);
        }, 2000);
    }
    else {

        try {

            email = {
                invite_email: invite_email_input.value,
                glink: glink
            }

            const res = await axios.post('http://localhost:3000/invite', email, { headers: { 'Auth': token } });

            console.log(res);


        }
        catch (err) {
            console.log(err);
        }

        invite_form.reset();
        closeInvite();
    }


}


async function showGroupMembers() {

    try {

        group_members_div.hidden = false;
        chat_read_div.hidden = true;

        const gid = localStorage.getItem('gid');

        clearInterval(myInterval);

        const res = await axios.get(`http://localhost:3000/get-groupMembers/${gid}`, { headers: { 'Auth': token } });

        console.log(res.data.users);

        for (u in res.data.users) {

            console.log(res.data.users[u].user_group);

            if(res.data.users[u].user_group.role=='admin'){
                const li = `<li id='member-${res.data.users[u].id}'>${res.data.users[u].name}
                <button id='remove-${res.data.users[u].id}' onClick='removeGroupMember(${res.data.users[u].id} , ${gid})'>REMOVE</button>
                Admin
                </li>`;
                    group_members_list.innerHTML += li;
            }
            else{

                const li = `<li id='member-${res.data.users[u].id}'>${res.data.users[u].name}
                            <button id='remove-${res.data.users[u].id}' onClick='removeGroupMember(${res.data.users[u].id} , ${gid})'>REMOVE</button>
                            <button id='admin-${res.data.users[u].id}' onClick='makeAdmin(${res.data.users[u].id} , ${gid})'>Make Admin</button>
                            </li>`;
                group_members_list.innerHTML += li;
            }
        }


    }
    catch (err) {
        console.log(err);
    }

}

async function removeGroupMember(userId, groupId) {

    try {

        const res = await axios.post(`http://localhost:3000/remove-member`,{userId,groupId}, { headers: { 'Auth': token } });

        console.log(res);

        document.getElementById(`member-${userId}`).remove();

    }
    catch (err) {
        console.log(err);
    }
}

async function makeAdmin(userId, groupId) {

    try {

        const res = await axios.post(`http://localhost:3000/makeAdmin`,{userId,groupId}, { headers: { 'Auth': token } });

        console.log(res);

        document.getElementById(`admin-${userId}`).remove();

        document.getElementById(`member-${userId}`).innerHTML+='<p>Admin</p>'

    }
    catch (err) {
        console.log(err);
    }
}