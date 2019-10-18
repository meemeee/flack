import os

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Set global variables
channel_list = list()

@app.route("/")
def index():
    return "Project 2: TODO"

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/channels")
def channels():
    """ Display all channels """

    return render_template("channels.html", channels=channel_list)

if __name__ == '__main__':
    socketio.run(app)