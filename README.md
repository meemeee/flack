# Flack Chat App

## Table of contents
* [Description](#description)
* [Installation](#installation)
* [Technologies](#technologies)

## Description

This project is an online messaging service using Flask, similar in spirit to [Slack](https://slack.com/features). The project uses Javascript to run code client-side, AJAX to request data from server asynchronously, and Socket.IO to communicate between clients and servers.

Made for project 2 of [CS50Web](https://cs50.harvard.edu/web/).

### Features
- **Display name**: On the first visit, user will log in with a display name, which will be associated with every message the user sends.
- **Create channels**: Any user can create a new channel, so long as its name doesn’t conflict with the name of an existing channel.
- **Channel List**: Switching among channels will not require reloading the page.
- **Messages View**: The user can see up to 100 latest messages in a single channel. 
- **Send and receive messages in real time**: Sending and receiving messages will not require reloading the page.
- **Remove messages**: Hovering on one message to see an option to remove it (limited to its sender). This is also a real-time action. 
- **New message alert**: If there are unread messages while user is logged in, the corresponding channel will be displayed differently to indicate new messages.  
- **Remember the Channel**: If the user closes a channel page (by closing the browser window), he will be taken back to that channel on his next visit.

## Installation

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

1. Clone the repo
```
git clone https://github.com/meemeee/flack.git
```

2. Install requirements
```
pip3 install -r requirements.txt
```

3. Run on local server
```
export FLASK_APP=application.py
flask run --no-reload
```

## Technologies

* [Flask](https://palletsprojects.com/p/flask/) - Python Micro Web framework
* [Bootstrap](https://getbootstrap.com/docs/4.0/) - CSS framework
* [Handlebars](https://handlebarsjs.com/guide/) -  Templating language
* [fullPage.js](https://github.com/alvarotrigo/fullPage.js/#fullpagejs) -  Fullscreen scrolling library
* [Animate.css](https://github.com/daneden/animate.css) -  Animation library



