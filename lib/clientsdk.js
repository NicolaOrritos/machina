
'use strict';


var EventEmitter = require('events').EventEmitter;
// var net          = require('net');
var utils        = require('util');
var request      = require('request');
var commands     = require('./commands');
var Parser       = require('./commandparser');


function ClientSDK()
{
    EventEmitter.call(this);
}

utils.inherits(ClientSDK, EventEmitter);


ClientSDK.prototype.ASUB = function(agent, actions)
{
    var self = this;
    var ac   = actions || [];
    var req  = commands.ASUB + '{"agent": "' + agent + '","actions":' + JSON.stringify(ac) + '}';
    
    var reqOpts = {
        uri: 'http://localhost:1337/',
        method: 'PUT',
        body: req
    };

    request(reqOpts, function(err, res, body)
    {
        console.log('Response from ASUB: %s', body);


        var parser = new Parser();
        
        parser.on(commands.AACK, function(metadata)
        {
            self.emit(commands.AACK, metadata);
            
        }).on(commands.ERROR, function(cause)
        {
            self.emit(commands.ERROR, cause);
        });

        parser.parse(body);
    });
    
    return self;
};


module.exports = ClientSDK;
