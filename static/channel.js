document.addEventListener('DOMContentLoaded', () => {
    
    // Scroll to to bottom to see latest messages
    var allmess = document.querySelector('#allmessages');    
    allmess.scrollTop = allmess.scrollHeight;
    
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

