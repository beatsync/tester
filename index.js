var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require("request");
var YouTube = require('youtube-node');
var youTube = new YouTube();

app.use(express.static(__dirname + '/public/'));

app.get('/', function(req, res){
  res.sendfile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('chat message', function(msg){
    if (msg == '/play') {
      console.log('play');
      io.emit('play', msg);
    }
    else if (msg == '/ping') {
      var d = new Date();
      var t = d.getTime();
      console.log('ping at ' + t);
      socket.emit('ping', t);
    }
    else if (msg.indexOf('/pingback') > -1) {
      var d = new Date();
      var t = d.getTime();
      console.log('returned at ' + t);
      var latency = ((msg.split('*')[1] - t)/2);
      socket.emit('latency', latency);
      console.log('latency is ' + latency);
    }
    else if (msg == '/pause') {
      console.log('pause');
      io.emit('pause', msg);
    }
    else if (msg.indexOf('/song') > -1) {
        console.log('song ' + msg.split('*')[1] +  ' ' +  + msg.split('*')[2]);
        io.emit('song', msg);
    }
    else {
      console.log('message: ' + msg);
      io.emit('chat message', msg);
    }
  });
  socket.on('search soundcloud', function(msg){
    request({
      uri: "http://beatsyncer.appspot.com/search",
      method: "POST",
      form: {
        search: msg
      }
    }, function(error, response, body) {
      console.log("soundcloud search: " + msg)
      socket.emit('search soundcloud results', JSON.stringify(body));
    });
  });
  socket.on('search youtube', function(msg){
    youTube.setKey('AIzaSyB1OOSpTREs85WUMvIgJvLTZKye4BVsoFU');

    youTube.search(msg, 5, function(error, result) {
      if (error) {
        console.log(error);
      }
      else {
        console.log("youtube search: " + msg)
        socket.emit('search youtube results', io.emit('search youtube results', JSON.stringify(result, null, 2)));
      }
    });
  });


});

http.listen(2015, function(){
  console.log('listening on *:2015');
});
