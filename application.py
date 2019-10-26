import os

from flask import Flask, request, render_template, redirect, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Set global variable: a dict of channels
channel_list = {}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/channels", methods=["GET", "POST"])
def channels():
    """ Display all channels """

    return render_template("channels.html", channels=channel_list)

@app.route("/ajax_channel", methods=["POST"])
def change_channel():

    """ View a channel when in channel list page """
    # make sure channel exists
    channel = request.form.get("channel_name")
    
    if not channel in channel_list:
        return jsonify({"success": False})
        
    messages = channel_list[channel]
    print(messages)
    return jsonify({"success": True, "messages":messages, "channel":channel})


@app.route("/channels/<string:channel>")
def channel(channel):
 
    """ View a channel by modifying the url """
    # make sure channel exists
    if not channel in channel_list:
        return render_template("error.html", message="No channel with this name.")
        
    messages = channel_list[channel]

    return render_template("channel.html", messages=messages, channel=channel, channels=channel_list)


@app.route("/new_channel", methods=["POST", "GET"])
def new_channel():

    """ Create a new channel """
    # User reached via redirect or clicking a link
    if request.method == "GET":
        return render_template("create.html")
    
    # User reached via submitting form
    else:
        name = request.form.get("channel_name")
        if not name:
            return render_template("error.html", message="You must provide channel name.")
        
        elif len(name) > 25 or ' ' in name:
            return render_template("error.html", message="Channel name must not exceed 25 characters or contain space.")
        
        elif name in channel_list:
            return render_template("error.html", message="Unavailable channel name. Please choose another.")
        else:
            channel_list.update({name: []})

        return redirect("/channels/" + name)


@socketio.on('send message')
def new_mess(data):
    mess_id = data["mess_id"]
    user = data["user"]
    content = data["content"]
    timestamp = data["timestamp"]
    channel_name = data["channel"]

    # Before adding new message, remove 1 last message if len exceeds
    if len(channel_list[channel_name]) == 100:
        del channel_list[channel_name][0]
    
    # Add message to global var channel_list
    channel_list[channel_name].append({"mess_id": mess_id, "user": user, "content": content, "timestamp": timestamp})

    # Broadcast new message
    emit('add new message', {"channel": channel_name, "mess_id": mess_id, "user": user, "content": content, "timestamp": timestamp}, broadcast=True)

@socketio.on('delete message')
def delete(data):
    mess_id = data["mess_id"]
    channel_name = data["channel"]
    user = data["user"]

    # Delete message from memory
    messages = channel_list[channel_name]
    for message in messages:
        if message["mess_id"] == int(mess_id):
            content = "Message has been deleted."
            timestamp = []
            message["content"] = content
            message["timestamp"] = timestamp
            print("deleted")
            break
    # Broadcast new message
    emit('deletion complete', {"mess_id": mess_id, "user": user, "content": content, "timestamp": timestamp}, broadcast=True)




    




if __name__ == '__main__':
    socketio.run(app)