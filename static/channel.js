document.addEventListener('DOMContentLoaded', () => {
    
    // Scroll to to bottom to see latest messages
    var allmess = document.querySelector('#allmessages');    
    allmess.scrollTop = allmess.scrollHeight;
    
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
                    console.log(data.messages);
                    // console.log(data.messages[0]["content"]);
                    document.querySelector('#channel_title').innerHTML = data.channel;
                    if (data.messages.length === 0) {
                        document.querySelector('#allmessages').innerHTML = " ";
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
                        // `{% for item in ${data.messages} %}
                        // <p><b>{{ item.user }}</b>: {{ item.content }} ---- <i>{{ item.timestamp }}</i></p>
                        // {% endfor %}`;
                    }
                    
                    // Update URL
                    // history.pushState(null, '', '/en/step2'); 
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
    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure send button
    socket.on('connect', () => {
        // Associate hitting Enter button with clicking submit
        document.querySelector('#message').onkeyup = event => {
            if (event.keyCode === 13) {
                event.preventDefault();
                document.querySelector('#send').onclick();
            }
        };
        
        // Emit message whenever 'Send' button is clicked on
        document.querySelector('#send').onclick = event => {
            const message = document.querySelector('#message').value;
            
            // ignore empty message
            if (message.length === 0)
                event.preventDefault();
            
            else {
                const channel = document.querySelector('#channel_title').innerHTML;         
                const user = localStorage.getItem('name');
                const timestamp = new Date().toISOString().split('T')[0] + " " + new Date().toISOString().split('T')[1].split('.')[0];
                socket.emit('send message', {"channel": channel,"user": user,"content": message, "timestamp": timestamp});
                
                // Clear input field
                document.querySelector('#message').value = '';
            };
        };
        
    });

    // When a new message is sent, update the whole channel
    socket.on('add new message', data => {
        const mess = document.createElement('p');
        mess.innerHTML = `<b>${data.user}:</b> ${data.content} ---- <i>${data.timestamp}</i>`;
        
        // var allmess = document.querySelector('#allmessages');
        allmess.append(mess);
        
        // Scroll to to bottom to see latest messages
        allmess.scrollTop = allmess.scrollHeight;

    });
    
    
});


// Remembering the Channel before closing window
window.addEventListener('unload', event => {
    localStorage.setItem('last_channel', window.location.href);
});








