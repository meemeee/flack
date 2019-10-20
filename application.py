import os

from flask import Flask, request, render_template, redirect
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Set global variable: a dict of channels
channel_list = {}

@app.route("/")
def index():
    return "Project 2: TODO"

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/channels", methods=["GET", "POST"])
def channels():
    """ Display all channels """

    return render_template("channels.html", channels=channel_list)

@app.route("/new_channel", methods=["POST", "GET"])
def new_channel():

    # User reached via redirect or clicking a link
    """ Create a new channel """
    if request.method == "GET":
        return render_template("create.html")
    
    # User reached via submitting form
    else:
        name = request.form.get("channel_name")
        if not name:
            return render_template("error.html", message="You must provide channel name.")
        
        elif len(name) > 25:
            return render_template("error.html", message="Channel name must not exceed 25 characters.")
        
        elif name in channel_list:
            return render_template("error.html", message="Unavailable channel name. Please choose another.")
        else:
            channel_list.update({name: []})

        return redirect("/channels")

@app.route("/channels/<string:channel>")
def channel(channel):
 
    """ View a single channel """
    # make sure channel exists
    if not channel in channel_list:
        return render_template("error.html", message="No channel with this name.")
        
    messages = channel_list[channel]

    return render_template("channel.html", messages=messages, channel=channel)
        
@socketio.on('send message')
def new_mess(data):
    user = data["user"]
    content = data["content"]
    timestamp = data["timestamp"]
    channel_name = data["channel"]

    # Before add new message, remove 1 last message if len exceeds
    if len(channel_list[channel_name]) == 100:
        del channel_list[channel_name][0]
    
    # Add message to global var channel_list
    channel_list[channel_name].append({"user": user, "content": content, "timestamp": timestamp})

    # Broadcast new message
    emit('add new message', {"user": user, "content": content, "timestamp": timestamp}, broadcast=True)






if __name__ == '__main__':
    socketio.run(app)