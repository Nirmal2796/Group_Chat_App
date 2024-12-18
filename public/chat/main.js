
//HTML ELEMENTS
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
const add_user_email = document.getElementById('add_user_email');
const add_user_form = document.getElementById('add_user_form');

//HTML FORM ELEMENTS EVENT LISTENER
send_message_form.addEventListener('submit', onSendMessage);
group_form.addEventListener('submit', createGroup);
invite_form.addEventListener('submit', inviteViaEmail);
add_user_form.addEventListener('submit', addUser);

//DOM CONTENT LOAD EVENT
document.addEventListener('DOMContentLoaded', DomLoad);


//TOKEN
const token = localStorage.getItem('token');


//INTERVAL;
let myInterval;

//SOCKET INITIALIZATION
var socket = io({
    auth: {
        token: token // Send the token during the handshake
    }
});


//RECEIVE MESSAGE
socket.on('receive-message', (message) => {
    // chat_box.innerHTML = '';
    console.log(message);
    showMessages(message);
})



//DOMLOAD
async function DomLoad() {
    try {

        getGroup();

    }
    catch (err) {
        console.log(err)
    }

}


//GET OLD MESSAGES
async function getOldMessage(gid,glink) {

    localStorage.setItem('gid', gid);

    localStorage.setItem('glink', `http://localhost:3000/join-group/${glink}`);

    group_name_text.innerHTML = document.getElementById(gid).innerText;


    const res = await axios.get(`http://localhost:3000/get-messages/${gid}`, { headers: { 'Auth': token } });

    const messages = res.data.messages;

    // AddToLocalStorage(messages);

    chat_box.innerHTML = '';

    for (m in messages) {

        showMessages(messages[m]);

    }


    //JOIN ROOM
    socket.emit('join-room',gid);

}


//GET MESSAGES
async function getMessage(gid, glink) {

    // let LastMessageID = localStorage.getItem('LastMessageIDLS');

    localStorage.setItem('gid', gid);
    localStorage.setItem('glink', `http://localhost:3000/join-group/${glink}`);

    // if (LastMessageID == undefined) {
    //     LastMessageID = '-1';
    // }

    console.log('GID', gid);

    group_name_text.innerHTML = document.getElementById(gid).innerText;


    // const res = await axios.get(`http://localhost:3000/get-messages/${gid}?LastMessageID=${LastMessageID}`, { headers: { 'Auth': token } });

    // const res = await axios.get(`http://localhost:3000/get-messages?LastMessageID=${LastMessageID}`, { headers: { 'Auth': token } });

    // const messages = res.data.messages.chats;

    // console.log(res.data.messages);


    // myInterval = setInterval(async () => {

    //     const res = await axios.get(`http://localhost:3000/get-messages/${gid}?LastMessageID=${LastMessageID}`, { headers: { 'Auth': token } });

    //     const messages = res.data.messages;

    //     AddToLocalStorage(messages);

    //     LastMessageID = localStorage.getItem('LastMessageIDLS');

    // }, 1000);

    // getGroup();


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




    hideGroupMembers();

    chat_box.innerHTML = '';

    for (m in OldMessages) {

        showMessages(OldMessages[m]);

    }

}

//ADD TO LOCAL STORAGE LOGIC EXPLANATION
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

            const gid = parseInt(localStorage.getItem('gid'));


            let response = await axios.post(`http://localhost:3000/send-message/${gid}`, message, { headers: { 'Auth': token } });

            // console.log(response.data.message);


            //SEND MESSAGE SOCKET
            socket.emit('send-message', chat_message.value, gid);

        }
        catch (err) {
            console.log(err);
        }

        send_message_form.reset();
    }

}


//SHOW MESSAGES ON SCREEN
function showMessages(message) {
    // console.log(message);
    const newMessage = `<p>${message.user.name} : ${message.message}</p>`;
    chat_box.innerHTML += newMessage;
}


//SHOW SEARCH FORM
function showAddUser() {
    document.getElementById('add_user').hidden = true;
    document.getElementById('add_user_form_div').hidden = false;
    group_list.hidden = true;
}

//HIDE SEARCH FORM
function hideAddUser() {
    document.getElementById('add_user').hidden = false;
    document.getElementById('add_user_form_div').hidden = true;
    group_list.hidden = false;
}

//SEARCH USER API CALL AFTER INITE FORM SUBMIT
async function addUser(e) {

    e.preventDefault();

    const gid = localStorage.getItem('gid');

    if (add_user_email.value == '') {

        // chat_error.innerHTML = 'Please enter a name';

        setTimeout(() => {
            // chat_error.removeChild(chat_error.firstChild);
        }, 2000);
    }
    else {

        try {

            add_user = {
                email: add_user_email.value,
                gid: gid
            }

            const res = await axios.post('http://localhost:3000/add_user', add_user, { headers: { 'Auth': token } });

            // console.log(res.response.status);


            alert('User added to the group');
            getGroup();



        }
        catch (err) {
            console.log(err);
            if (err.response.status == 403) {
                alert(err.response.data.message);
            }
            else if (err.response.status == 404) {
                alert(err.response.data.message);
            }
            else if (err.response.status === 409) {
                // console.log(err.response.data);
                alert(err.response.data.message);
            }
        }

        add_user_form.reset();
        // hideSearch();
    }
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
            // console.log(typeof (groups[group].link));
            group_list.innerHTML += `<li><button id=${groups[group].id} value='${groups[group].name}' onclick='getOldMessage(${groups[group].id},"${groups[group].link}")'>${groups[group].name}</button></li>`;
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

//SHOW INVITE VIA EMAIL
function showInviteEmail() {
    const invite_form_div = document.getElementById('invite_form_div');
    invite_form_div.hidden = false;

    document.getElementById('bg-grey').hidden = false;
    close_btn.hidden = true;
    menu_btn.hidden = false;
    menu.hidden = true;
}

//CLOSE INVITE FORM
function closeInvite() {
    const invite_form_div = document.getElementById('invite_form_div');
    invite_form_div.hidden = true;

    document.getElementById('bg-grey').hidden = true;
}

//INVITE VIA EMAIL API CALL AFTER INITE FORM SUBMIT
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

//HIDE FROP MEMBERS
function hideGroupMembers() {

    if (chat_read_div.hidden) {
        group_members_div.hidden = true;
        chat_read_div.hidden = false;
        document.getElementById('back_icon').style.display = 'none';
        document.getElementById('profile_icon').style.display = 'block';
    }

}

//SHOW GROUP MEMBERS
async function showGroupMembers() {

    try {

        group_members_div.hidden = false;
        chat_read_div.hidden = true;
        document.getElementById('back_icon').style.display = 'block';
        document.getElementById('profile_icon').style.display = 'none';

        const gid = localStorage.getItem('gid');

        clearInterval(myInterval);

        const res = await axios.get(`http://localhost:3000/get-groupMembers/${gid}`, { headers: { 'Auth': token } });

        console.log(res.data.users);

        group_members_list.innerHTML = '';

        for (u in res.data.users) {

            console.log(res.data.users[u].user_group);

            if (res.data.users[u].user_group.role == 'admin') {

                const tr = `<tr id='member-${res.data.users[u].id}'>
                                <td id='td_name'>${res.data.users[u].name}</td>
                                <td id='role'>Admin</td>
                                <td><button id='remove-${res.data.users[u].id}' onClick='removeGroupMember(${res.data.users[u].id} , ${gid})'><i class="fa fa-user-times"></i></button></td>
                            </tr>`

                group_members_list.innerHTML += tr;

                // group_members_list.innerHTML+=`<tr>
                //             <td id='td_name'>komal</td>
                //             <td id='role'>Admin</td>
                //             <td><button><i class="fa fa-user-times"></i></button></td>
                //         </tr>`


            }
            else {

                const tr = `<tr id='member-${res.data.users[u].id}'>
                                <td id='td_name'>${res.data.users[u].name}</td>
                                <td></td>
                                <td><button id='remove-${res.data.users[u].id}' onClick='removeGroupMember(${res.data.users[u].id} , ${gid})'>REMOVE</button></td>
                            </tr>`

                group_members_list.innerHTML += tr;
            }
        }

    }
    catch (err) {
        console.log(err);
    }

}

//REMOVE GROUP MEMBERS
async function removeGroupMember(userId, groupId) {

    try {

        const res = await axios.post(`http://localhost:3000/remove-member`, { userId, groupId }, { headers: { 'Auth': token } });

        console.log(res);

        document.getElementById(`member-${userId}`).remove();

    }
    catch (err) {
        console.log(err);
    }
}

//MAKE USERA AN ADMIN
async function makeAdmin(userId, groupId) {

    try {

        const res = await axios.post(`http://localhost:3000/makeAdmin`, { userId, groupId }, { headers: { 'Auth': token } });

        console.log(res);

        // document.getElementById(`admin-${userId}`).remove();

        // const tr = `<tr id='member-${res.data.user.id}'>
        //                         <td id='td_name'>${res.data.users[u].name}</td>
        //                         <td>Admin</td>
        //                         <td><button id='remove-${res.data.users[u].id}' onClick='removeGroupMember(${res.data.users[u].id} , ${gid})'>REMOVE</button></td>
        //                     </tr>`

        //         group_members_list.innerHTML += tr;

        document.getElementById(`member-${userId}`).innerHTML += '<td>Admin</td>'

    }
    catch (err) {
        console.log(err);
    }
}