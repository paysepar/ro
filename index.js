var express = require('express')
var app = express();
var http = require('http').Server(app);
var portNumber = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000
var ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1"

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html')
});

app.use(express.static(__dirname + '/public', { maxAge: 86400000 }));

http.listen(portNumber, ip, function(){
  console.log('listening on *:' + portNumber);
}); // the 0.0.0.0 ip opens the server to outside connections. to make server available locally only, bind to '127.0.0.1'
