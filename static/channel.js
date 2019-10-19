document.addEventListener(DOMContentLoaded, () => {
    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure send button
    socket.on('connect', () => {
        // Emit message whenever 'Send' button is clicked on
        document.querySelector('#send').onclick = () => {
            const channel = document.querySelector('h2').value;
            const message = document.querySelector('#message').value;
            const user = localStorage.getItem('name');
            const timestamp = new Date().toISOString().split('T')[0] + " " + new Date().toISOString().split('T')[1].split('.')[0];
            socket.emit('send message', {"channel": channel,"user": user,"content": message, "timestamp": timestamp});
        };
    });

    // When a new message is sent, update the whole channel
    socket.on('add new message', data => {
        const mess = document.createElement('p');
        p.innerHTML = `<b>${data.user}}:</b> ${data.content} ---- <i>${data.timestamp}</i>`;
        document.querySelector('#allmessages').append(p);
    });
});

