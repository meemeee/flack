import os

from flask import Flask, request, render_template, redirect, jsonify, session
from flask_session import Session
from flask_socketio import SocketIO, emit
from functools import wraps

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"

Session(app)

# Set global variable: a dict of channels
channel_list = {}

# Helper
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("username") is None:
            render_template("index.html")
        return f(*args, **kwargs)
    return decorated_function


@app.route("/", methods=["GET", "POST"])
def login():

    # User reached via POST by submitting the form
    if request.method == "POST":
        # Remember which user has logged in
        session["username"] = request.form.get("name")
        
        # Redirect to channels page
        return redirect("/channels")

    # User reached via GET by clicking a link or redirect
    else:
        if session.get("username") is None:
            return render_template("index.html")
        else: 
            return render_template("index.html", user=session.get("username"))

@app.route("/logout", methods=["GET"])
def logout():
    session.clear()
    return redirect("/")

@app.route("/channels", methods=["GET", "POST"])
@login_required
def channels():
    """ Display all channels """
    return render_template("channel.html", channels=channel_list, user=session.get("username"))


@app.route("/ajax_channel", methods=["POST"])
@login_required
def change_channel():

    """ View a channel when in channel list page """
    # make sure channel exists
    channel = request.form.get("channel_name")
    
    if not channel in channel_list:
        return jsonify({"success": False})
        
    messages = channel_list[channel]['messages']
    description = channel_list[channel]['desc']

    return jsonify({"success": True, "messages":messages, "desc":description, "channel":channel, "user":session.get("username")})


@app.route("/channels/<string:channel>")
@login_required
def channel(channel):
 
    """ View a channel by modifying the url """
    # make sure channel exists
    if not channel in channel_list:
        return render_template("error.html", message="No channel with this name.")
        
    messages = channel_list[channel]['messages']
    description = channel_list[channel]['desc']

    return render_template("channel.html", messages=messages, desc=description, channel=channel, channels=channel_list, user=session.get("username"))


@app.route("/new_channel", methods=["POST", "GET"])
@login_required
def new_channel():

    """ Create a new channel """
    # User reached via redirect or clicking a link
    if request.method == "GET":
        return render_template("create.html", user=session.get("username"))
    
    # User reached via submitting form
    else:
        name = request.form.get("channel_name")
        description = request.form.get("channel_desc")

        # Replace space character in name with '-' (if any)
        if " " in name:
            name = name.replace(" ", "-")
              
        if not name:
            return render_template("error.html", message="You must provide channel name.")
        
        elif len(name) > 32:
            return render_template("error.html", message="Channel name must not exceed 32 characters.")
        elif len(description) > 128: 
            return render_template("error.html", message="Channel description must not exceed 128 characters.")

        elif name in channel_list:
            return render_template("error.html", message="Unavailable channel name. Please choose another.")
        else:
            # Format: channel_list = [{name: {'desc': description, 'messages': []}},...]
            Dict = {}
            Dict[name] = {'desc': description, 'messages': []}
   
            channel_list.update(Dict)

        return redirect("/channels/" + name)


@socketio.on('send message')
@login_required
def new_mess(data):
    mess_id = data["mess_id"]
    user = data["user"]
    content = data["content"]
    timestamp = data["timestamp"]
    channel_name = data["channel"]

    # Before adding new message, remove 1 last message if len exceeds
    if len(channel_list[channel_name]['messages']) == 100:
        del channel_list[channel_name]['messages'][0]
    
    # Add message to global var channel_list
    channel_list[channel_name]['messages'].append({"mess_id": mess_id, "user": user, "content": content, "timestamp": timestamp})

    # Broadcast new message
    emit('add new message', {"channel": channel_name, "mess_id": mess_id, "user": user, "content": content, "timestamp": timestamp}, broadcast=True)


@socketio.on('delete message')
@login_required
def delete(data):
    mess_id = data["mess_id"]
    channel_name = data["channel"]
    user = data["user"]

    # Delete message from memory
    messages = channel_list[channel_name]['messages']
    for message in messages:
        if message["mess_id"] == int(mess_id):
            content = "Message has been deleted."
            timestamp = []
            message["content"] = content
            message["timestamp"] = timestamp
           
            break
    # Broadcast new message
    emit('deletion complete', {"mess_id": mess_id, "user": user, "content": content, "timestamp": timestamp}, broadcast=True)


if __name__ == '__main__':
    socketio.run(app, debug=True)
    app.run(host="0.0.0.0", port=5000)
    
