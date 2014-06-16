
'use strict';


var EventEmitter = require('events').EventEmitter;
var net          = require('net');
var utils        = require('util');
var request      = require('request');
var commands     = require('./commands');
var Parser       = require('./commandparser');


var DEFAULT_REQ = {
    uri:    'http://localhost:1337/',
    method: 'PUT',
    body:   ''
};


function launchRequest(req, emitter)
{
    if (req)
    {
        request(req, function(err, res, body)
        {
            console.log('Response from req: %s', body);


            var parser = new Parser();

            parser.on(commands.AACK, function(metadata)
            {
                emitter.emit(commands.AACK, metadata);

            }).on(commands.TACK, function(metadata)
            {
                emitter.emit(commands.TACK, metadata);

            }).on(commands.ERROR, function(cause)
            {
                emitter.emit(commands.ERROR, cause);
            });

            parser.parse(body);
        });
    }
}


function ClientSDK()
{
    EventEmitter.call(this);
}

utils.inherits(ClientSDK, EventEmitter);


ClientSDK.prototype.ASUB = function(agent, actions, listen)
{
    var req = DEFAULT_REQ;
    req.body = commands.ASUB_WITHAGENTANDACTIONS(agent, actions);

    launchRequest(req, this);
    
    // If asked to listen for incoming transactions spawn a TCP service to do so:
    if (listen === true)
    {
        var self = this;
        
        this.once(commands.AACK, function(metadata)
        {
            var server = net.createServer(function(conn)
            {
                var aackData = '';
                
                conn.on('data', function(data)
                {
                    aackData += data;
                });

                conn.on('end', function()
                {
                    var command = Parser.parseSync(aackData);
                    
                    aackData = '';
                    
                    self.emit(command.verb, command.metadata);
                });
            });

            server.listen(metadata.port);
        });
    }
    
    return this;
};

ClientSDK.prototype.AUNSUB = function(agent, actions)
{
    var req = DEFAULT_REQ;
    req.body = commands.AUNSUB_WITHAGENTANDACTIONS(agent, actions);

    launchRequest(req, this);
    
    return this;
};

ClientSDK.prototype.TBEGIN = function(actions)
{
    var req = DEFAULT_REQ;
    req.body = commands.TBEGIN_WITHACTIONS(actions);

    launchRequest(req, this);
    
    return this;
};


module.exports = ClientSDK;
