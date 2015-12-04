var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var braintree = require("braintree");
var fs = require('fs');
var portNumber = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000;
var ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";

app.use(bodyParser.urlencoded({extended:false}));

app.use(express.static(__dirname + '/public', { maxAge: 86400000 }));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html')
});
app.get('/payment', function(req, res){
    res.sendFile(__dirname + '/payment.html')
});
app.get('/buy', function(req,res){
    res.sendFile(__dirname + '/buy.html')
});


http.listen(portNumber, ip, function(){
  console.log('listening on *:'+ portNumber);
}); // the 0.0.0.0 ip opens the server to outside connections. to make server available on this machine only, bind to '127.0.0.1'

var gateway = braintree.connect({ // sandbox credentials
  environment: braintree.Environment.Sandbox,
  merchantId: "52bx8gdbpk9rtf6z",
  publicKey: "ms3t8vfmnzjtr6rc",
  privateKey: "f9d90b2ecb8db58a54a00f722366b000",
});

app.get("/client_token", function (req, res) { //generate and send client token when request is received
    gateway.clientToken.generate({}, function (err, response) {
        res.send(response.clientToken);
  });
});


app.post('/checkout', function(req,res) {
    var orderQuantities = {}
    if (parseInt(req.body.blackNoQuant, 10)) {
        orderQuantities.blackNo = parseInt(req.body.blackNoQuant, 10)
    }
    else {
        orderQuantities.blackNo = 0
    }
    if (parseInt(req.body.redNoQuant, 10) > 0) {
        orderQuantities.redNo = parseInt(req.body.redNoQuant, 10)
    }
    else {
        orderQuantities.redNo = 0
    }
    if (parseInt(req.body.blueNoQuant, 10) > 0) {
        orderQuantities.blueNo = parseInt(req.body.blueNoQuant, 10)
    }
    else {
        orderQuantities.blueNo = 0
    }
    var totalOrderQuantInt = orderQuantities.blackNo + orderQuantities.redNo + orderQuantities.blueNo
    var orderAmount = totalOrderQuantInt * 200
    var orderAmountString = orderAmount.toString()
    gateway.transaction.sale({
        amount: orderAmountString,
        paymentMethodNonce: req.body.payment_method_nonce,
        customFields : {
            blackno: orderQuantities.blackNo,
            redno: orderQuantities.redNo,
            blueno: orderQuantities.blueNo,
        },
        customer: {
            email: req.body.customerEmail,
            firstName: req.body.customerFirstName,
            lastName: req.body.customerLastName,
            phone: req.body.customerPhone,
            
        },
        
        shipping: {
            countryName: "United States of America",
            streetAddress: req.body.shippingStreetAddress,
            extendedAddress: req.body.shippingExtendedAddress,
            locality: req.body.shippingCity,
            region: req.body.shippingState,
            postalCode: req.body.shippingPostalCode,
            firstName: req.body.shippingFirstName,
            lastName: req.body.shippingLastName,
        },
        
        billing: {
            firstName: req.body.billingFirstName,
            lastName: req.body.billingLastName,
            streetAddress: req.body.billingStreetAddress,
            extendedAddress: req.body.billingExtendedAddress,
            locality: req.body.billingCity,
            region: req.body.billingState,
            postalCode: req.body.billingPostalCode,
            countryCodeAlpha2: req.body.billingCountryCodeAlpha2,
        },
        
        descriptor: {
            name: "Rollnado Hov*erboards",
            phone: "5168472926",
            url: "rollnado.com",
        },
        
        options: {
            submitForSettlement: true,
            storeInVaultOnSuccess: true,
            storeShippingAddressInVault: true,
            paypal: {
                description: "Rollnado.com Hoverboards",
            },
        },
        
    }, function (err, result) {
        res.send(result)
    });
});