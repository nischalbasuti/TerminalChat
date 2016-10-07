var express = require('express');
var http = require('http');

var app = express();
http.createServer(app);

var querystring = require('querystring');
var socket = require('socket.io-client')('http://localhost:8081');
var stdin = process.openStdin();
var prompt = require('prompt');
var chalk = require("chalk");

var loggedIn = false;
var username = "";
var password = "";

var inputBuffer = "\n";

function print(data) {
    process.stdout.write(data);
}

//display message when received.................................................
socket.on('chatm',function(msgString) {
    if (loggedIn == true) {
        var msgObj = JSON.parse(msgString);

        //process.stdout.clearLine();
        //process.stdout.cursorTo(0);
        if(msgObj.user == username) {
            console.log(chalk.green(msgObj.user+": "+msgObj.data));
        } else {
            console.log(chalk.blue("\n"+msgObj.user+": "+msgObj.data));
        }
    }
});

var loginSchema = [
    {
        name: 'username',
        validator: /^[a-zA-Z\s\-]+$/,
        warning: 'Username must be only letters, spaces, or dashes',
        required: true
    },
    {
        name: 'password',
        hidden: true,
        replace: '*',
        required: true
    }
];

prompt.message = "";
prompt.start();
login();

//function to send messages.....................................................
function sendMessage() {
    prompt.get(['message'], function(err, result) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        if (err) {
            console.log(err);
            return;
        }
        //do if not logged in
        if(loggedIn == false) {
            login(result.message);
        }

        console.log(result.message);
        //sending message.......................................................
        var msgObj = {
            user: username,
            data: result.message
        }

        msgString = JSON.stringify(msgObj);
        socket.emit('chatm', msgString);
        sendMessage();
    });
}

//login function................................................................
function login() {
    prompt.get(loginSchema, function (err, result){
        if (err) {
            console.log(err);
            return;
        }

        username = result.username;
        password = result.password;
        //verifing login with server............................................
        var data = JSON.stringify({
            'uname': username,
            'pword': password
        })
        //sending request to login
        var options = {
            host: 'localhost',
            path: '/login',
            port: '8081',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        var req = require('http').request(options, function(res) {
            var resData = '';
            res.on('data', function (chunk) {
                resData += chunk;
            });
            res.on('end', function(){
                if(resData == 'failed' || username == '') {
                    username = '';
                    loggedIn = false;
                } else {
                    loggedIn = true;
                    console.log("***");
                    console.log("logged in as "+username);
                    console.log("***");

                    sendMessage();
                }
            });
        });
        req.on('error', function(err) {
            console.log("*ERROR:\n\n"+err.description);
            return;
        });
        req.write(data);
        req.end();
        return;
    });

    return;
}
