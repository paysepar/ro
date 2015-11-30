var express = require('express');
var app = express();
var http = require('http').Server(app);
var braintree = require("braintree");
var fs = require('fs');
var portNumber = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000;
var ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html')
});
app.get('/payment', function(req, res){
    res.sendFile(__dirname + '/payment.html')
});
app.get('/buy', function(req,res){
    res.sendFile(__dirname + '/buy.html')
});

app.use(express.static(__dirname + '/public', { maxAge: 86400000 }));

http.listen(portNumber, ip, function(){
  console.log('listening on *:'+ portNumber);
}); // the 0.0.0.0 ip opens the server to outside connections. to make server available locally only, bind to '127.0.0.1'

var gateway = braintree.connect({ // sandbox credentials
  environment: braintree.Environment.Sandbox,
  merchantId: "52bx8gdbpk9rtf6z",
  publicKey: "ms3t8vfmnzjtr6rc",
  privateKey: "f9d90b2ecb8db58a54a00f722366b000"
});

app.get("/client_token", function (req, res) { //generate and send client token when request is received
  gateway.clientToken.generate({}, function (err, response) {
    res.send(response.clientToken);
  });
});


app.post('/checkout', function(req,res) {
    var nonce = req.body.payment_method_nonce;
    gateway.transaction.sale({
        amount: '10.00',
        paymentMethodNonce: 'fake-valid-nonce',
    }, function (err, result) {
        
    })
})