var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');

app.use(bodyParser.json());

//showing connections...........................................................
io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('disconnect', function() {
        console.log('a user disconnected');
    });
    socket.on('chatm', function(msg){
        console.log('message: '+msg);
        io.emit('chatm',msg);
    });
});

//display index.html............................................................
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

//login.........................................................................
app.post('/login', function (req, res) {
    var username = req.body.uname;
    var password = req.body.pword;

    if(typeof username !== 'undefined' || username === null) {
        res.send('success');
        console.log('login successfull');
    } else {
        res.send('failed');
        console.log('login failed');
    }
    console.log("login: "+username+" password: "+password);
});

//start server..................................................................
http.listen(8081, function() {
    console.log('listening on 8081');
});
