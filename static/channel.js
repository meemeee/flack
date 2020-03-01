// Template for new websocket message
const template = Handlebars.compile(document.querySelector('#ws_new_message').innerHTML);

// Get user name
const user = document.querySelector('#user_name').innerHTML;
// If no namde provided, redirect to index page
if (user === 'None') {
    window.location.replace('/');
}
// Handlebars helper
Handlebars.registerHelper('if_eq', function(a, opts) {
    if (a === user) {
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
});

Handlebars.registerHelper('unless', function(a, b, opts) {
    if (a === b) {
        return opts.inverse(this);
    } else {
        return opts.fn(this);
    }
});

Handlebars.registerHelper('firstLetter', function(a) {
    return a[0];
});

document.addEventListener('DOMContentLoaded', () => {  
    // Sidebar toggle behavior
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar, #content').toggleClass('active');
    });


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
            let count = document.querySelectorAll('.incoming-message').length + document.querySelectorAll('.outgoing-message').length;
            const message = document.querySelector('#message').value;
            
            // ignore empty message
            if (message.length === 0)
                return false;
            
            else {
                // Remove welcome message if any
                if (document.querySelector('#welcome')) {
                    console.log("2")
                    allmess.innerHTML = "";
                }
                    
                const id = count+1;
                const channel = document.querySelector('#channel_title').innerHTML;         
                // const user = localStorage.getItem('name');
                // const user = {{ user }};
                const timestamp = new Date().getHours() + ":" + new Date().getMinutes();
                
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
            a.onclick = event => {
                event.preventDefault();

                // Activate confirmation modal
                $('#remove-message-confirmation').modal();
                document.querySelector('#remove-message-confirmed').onclick = () => {
                    const id = a.getAttribute('value');
                    const channel_name = document.querySelector('#channel_title').innerHTML;
                    $('#remove-message-confirmation').modal('hide');

                    socket.emit('delete message', {"channel": channel_name, "mess_id": id, "user": user});
                    
                }
            }       
        });
    }

  

    // When a new message is sent, update the whole channel
    socket.on('add new message', data => {
        // Only update message if the same channel is open
        if (window.location.pathname.indexOf("/channels/" + `${data.channel}`) > -1) {
            console.log("3")
            // Remove welcome message if any
            if (document.querySelector('#welcome')) {
                console.log("1")
                allmess.innerHTML = "";
            }
            // Add new message to DOM.
            let mess = template({'data': data});        
            allmess.innerHTML += mess;

            // Update delete function for the whole page
            deletemess();
            
            // Scroll to to bottom to see latest messages
            allmess.scrollTop = allmess.scrollHeight;
        }

        // else, subtly alert new messages on side bar
        else {
            const newmess_channel = document.querySelector(`[data-name='${data.channel}']`);
            const newmess_channel_name = document.querySelector(`[id='${data.channel}']`);

           
            // Discard action if there has been an earlier alert
            if (newmess_channel.classList.contains('unread')) 
                return false;
            else {
                const newmess_alert = document.createElement('i');
                newmess_alert.setAttribute('class', 'fa fa-circle ml-2');
                newmess_channel_name.append(newmess_alert);
                newmess_channel.classList.add('unread');
            }
        }   
    });

    // When a message is deleted, update the whole channel
    socket.on('deletion complete', data => {
        if (data.user === user) {
            var deleted_mess = document.getElementById(`${data.mess_id}`);
            deleted_mess.innerHTML = `<p class="deleted mr-2">${data.content}</p>`;
        }
        else {
            var deleted_mess = document.querySelector(`[data-id='${data.mess_id}']`);
            deleted_mess.innerHTML = `<p class="deleted">${data.content}</p>`;
        }      
    });

    // Create Ajax request when changing channels
    document.querySelectorAll('.single-channel').forEach(item => {
        item.onclick = () => {
            // Initialize new request
            const request = new XMLHttpRequest();
            const channel = item.dataset.name;
            // var user_name= localStorage.getItem('name');
            request.open('POST', '/ajax_channel');

            // Callback function for when request completes
            request.onload = () => {
                // Extract JSON data from request
                const data = JSON.parse(request.responseText);
                
                // Remove 'unread' class and icon if any
                if (item.classList.contains('unread')) {
                    item.querySelector('.fa-circle').remove();
                    item.classList.remove('unread');
                }
                    
                // Update the chat div
                if (data.success) {
                    // Replacing page title
                    document.title = "Chat | " + data.channel;

                    // Toggle "active" class in channel name
                    if (document.querySelector('.active'))
                        document.querySelector('.active').classList.remove("active");      
                        item.classList.add("active");
                    
                    // Replacing content on layout
                    document.querySelector('#channel_title').innerHTML = data.channel;
                    document.querySelector('#current-channel-desc').innerHTML = data.desc;
                    
                    // Check if this is a new channel
                    if (data.messages.length === 0) {
                        var newchannel_content = 
                        `<p id="welcome"><i>This is the beginning of <b>${data.channel}</b> channel.</i></p>`;
                        document.querySelector('#allmessages').innerHTML = newchannel_content;
                    }
                    else {
                        // Loop through messages
                        var text = "";
                        var i;
                        for (i = 0; i < data.messages.length; i++) {
                            // Add new message to DOM.
                            let mess = template({'data': data.messages[i]});
                            text += mess;
                        }                       
                        document.querySelector('#allmessages').innerHTML = text;
                    }
                    // Update delete function for the whole page
                    deletemess();

                    // Scroll to to bottom to see latest messages    
                    allmess.scrollTop = allmess.scrollHeight;

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
window.addEventListener('unload', () => {
    localStorage.setItem('last_channel', window.location.href);
});
