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
        // Associate hitting Enter button with clicking submit
        // document.querySelector('#message').onkeyup = event => {
        //     if (event.keyCode === 13) {
        //         event.preventDefault();
        //         document.querySelector('#send').onclick();
        //     }
        // };
        
        // Emit message whenever 'Send' button is clicked on
        let count = 0;
        document.querySelector('form').onsubmit = event => {
            event.preventDefault();
            const message = document.querySelector('#message').value;
            
            // ignore empty message
            if (message.length === 0)
                return false;
            
            else {
                const id = count++;
                const channel = document.querySelector('#channel_title').innerHTML;         
                const user = localStorage.getItem('name');
                const timestamp = new Date().toISOString().split('T')[0] + " " + new Date().toISOString().split('T')[1].split('.')[0];
                socket.emit('send message', {"channel": channel, "mess_id": id, "user": user, "content": message, "timestamp": timestamp});
                
                // Clear input field
                document.querySelector('#message').value = '';
            };
        };
        
    });

    // When a new message is sent, update the whole channel
    socket.on('add new message', data => {
        const mess = document.createElement('p');
        mess.innerHTML = `<b>${data.user}:</b> ${data.content} ---- <i>${data.timestamp}</i>`;
        const trashbin = document.createElement('label');
        trashbin.setAttribute('value', `${data.mess_id}`)
        mess.append(trashbin);
        allmess.append(mess);
        
        
        // Scroll to to bottom to see latest messages
        allmess.scrollTop = allmess.scrollHeight;

    });

    // Create Ajax request when changing channels
    document.querySelectorAll('.single-channel').forEach(li => {
        li.onclick = () => {
            // Initialize new request
            const request = new XMLHttpRequest();
            const channel = li.dataset.name;
            request.open('POST', '/ajax');

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
                        // // Remove when there is 1st message
                        // document.querySelector('#send').onclick = () => {
                        //     newchannel_content = [];
                        // };
                    }
                    else {
                        // Loop through messages
                        var text = "";
                        var i;
                        for (i = 0; i < data.messages.length; i++) {
                            text += "<p><b>" + data.messages[i]["user"] + "</b>: " 
                            + data.messages[i]["content"] + " ---- <i>" 
                            + data.messages[i]["timestamp"] + "</i></p>";
                        }

                        document.querySelector('#allmessages').innerHTML = text;
                    }

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








