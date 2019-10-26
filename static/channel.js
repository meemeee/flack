document.addEventListener('DOMContentLoaded', () => {
    // Display user name
    document.querySelector('#user_name').innerHTML = localStorage.getItem('name');

    // Scroll to to bottom to see latest messages
    var allmess = document.querySelector('#allmessages');    
    allmess.scrollTop = allmess.scrollHeight;
    
    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure send button
    socket.on('connect', () => {
        // Emit message whenever 'Send' button is clicked on      
        document.querySelector('form').onsubmit = event => {
            event.preventDefault();
            let count = document.querySelectorAll('.single-message').length;
            const message = document.querySelector('#message').value;
            
            // ignore empty message
            if (message.length === 0)
                return false;
            
            else {
                if (document.querySelector('#welcome')) 
                    document.querySelector('#allmessages').innerHTML = "";
                const id = count+1;
                const channel = document.querySelector('#channel_title').innerHTML;         
                const user = localStorage.getItem('name');
                const timestamp = new Date().toISOString().split('T')[0] + " " + new Date().toISOString().split('T')[1].split('.')[0];
                socket.emit('send message', {"channel": channel, "mess_id": id, "user": user, "content": message, "timestamp": timestamp});
                
                // Clear input field
                document.querySelector('#message').value = '';
            };
        };
        deletemess();      
    });
    
    // Emit delete action when trashbin is clicked on
    function deletemess () {
        document.querySelectorAll('.trashbin').forEach(a => {
            a.onclick = () => {
                var result = confirm("Do you want to remove this message?");
                if (result) {
                    const id = a.getAttribute('value');
                    const user = localStorage.getItem('name');
                    const channel_name = document.querySelector('#channel_title').innerHTML;

                    socket.emit('delete message', {"channel": channel_name, "mess_id": id, "user": user});
                };
            }       
        });
    }

    // When a new message is sent, update the whole channel
    socket.on('add new message', data => {
        const mess = document.createElement('p');
        mess.innerHTML = `<b>${data.user}:</b> ${data.content} ---- <i>${data.timestamp}</i>`;
        mess.setAttribute('class', 'single-message');
        mess.id = data.mess_id;
        const trashbin = document.createElement('a');
        trashbin.setAttribute('class', 'trashbin');
        trashbin.setAttribute('value', `${data.mess_id}`);
        trashbin.setAttribute('href', '#');
        const icon = document.createElement('i');
        icon.setAttribute('class', 'fa fa-trash-o');
        trashbin.append(icon);
        // addtrashbin(trashbin);
        mess.append(trashbin);
        allmess.append(mess);
        deletemess();
        
        // Scroll to to bottom to see latest messages
        allmess.scrollTop = allmess.scrollHeight;
    });

    // When a message is deleted, update the whole channel
    socket.on('deletion complete', data => {
        del_mess = document.getElementById(`${data.mess_id}`);
        del_mess.innerHTML = `<b>${data.user}:</b> <i>${data.content}</i>`;      
    });

    // Create Ajax request when changing channels
    document.querySelectorAll('.single-channel').forEach(li => {
        li.onclick = () => {
            // Initialize new request
            const request = new XMLHttpRequest();
            const channel = li.dataset.name;
            request.open('POST', '/ajax_channel');

            // Callback function for when request completes
            request.onload = () => {
                // Extract JSON data from request
                const data = JSON.parse(request.responseText);

                // Update the chat div
                if (data.success) {
                    // Replacing page title
                    document.title = "Chat | " + data.channel;
                    
                    // Replacing content on layout
                    document.querySelector('#channel_title').innerHTML = data.channel;
                    
                    // Check if this is a new channel
                    if (data.messages.length === 0) {
                        var newchannel_content = `<i>This is the beginning of <b>${data.channel}</b> channel.</i>`;
                        document.querySelector('#allmessages').innerHTML = newchannel_content;
                        // Remove when there is 1st message
                        document.querySelector('#send').onclick = () => {
                            document.querySelector('#allmessages').innerHTML = "";
                        };
                    }
                    else {
                        // Loop through messages
                        var text = "";
                        var i;
                        for (i = 0; i < data.messages.length; i++) {
                            // Do not display trashbin if message has been deleted
                            if (data.messages[i]["content"].localeCompare("Message has been deleted.") != 0) {
                                text += "<p id=" + data.messages[i]["mess_id"] + " class=\"single-message\"><b>" 
                                + data.messages[i]["user"] + "</b>: " 
                                + data.messages[i]["content"] + " ---- <i>" 
                                + data.messages[i]["timestamp"] + "</i>"
                                +"<a" + " class=\"trashbin\"" 
                                + "value=" + data.messages[i]["mess_id"] 
                                + " href=\"#\"><i class=\"fa fa-trash-o\"></i></a></p>";
                            }
                            else {
                                text += "<p id=" + data.messages[i]["mess_id"] + " class=\"single-message\"><b>" 
                                + data.messages[i]["user"] + "</b>: <i>" 
                                + data.messages[i]["content"] +"</i>"
                            }
                        }
                        
                        document.querySelector('#allmessages').innerHTML = text;
                    }
                    // Update delete function for the whole page
                    deletemess();

                    // Display input message field
                    document.querySelector('#type_message').style.display = "block";
                    
                    // Update URL
                    history.pushState({"id": data.channel}, "", "/channels/" + data.channel); 

                  
                }

                else {
                    document.querySelector('#chatbox').innerHTML = 'There was an error.';
                }
            }

            // Add data to send with request
            const data = new FormData();
            data.append('channel_name', channel);

            // Send request
            request.send(data);
            return false;

        };
    });    
});


// Remembering the Channel before closing window
window.addEventListener('unload', event => {
    localStorage.setItem('last_channel', window.location.href);
});
