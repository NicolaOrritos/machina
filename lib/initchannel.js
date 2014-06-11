/*
 * machina
 * https://github.com/NicolaOrritos/machina
 *
 * Copyright (c) 2014 Nicola Orritos
 * Licensed under the MIT license.
 */

'use strict';


var http          = require('http');
var child_process = require('child_process');
var Parser        = require('./commandparser');
var commands      = require('./commands');


function answer(res, text, status, head)
{
    if (res && text)
    {
        var st = status || 200;
        var he = head   || {'Content-Type': 'application/json'};
        
        res.writeHead(st, he);
        res.end(text);
    }
}


module.exports =
{
    loadAgents: function()
    {
        this.agents = require('./agents');
        this.agents.load();
    },
    
    loadTransactions: function()
    {
        this.transactions = require('./transactions');
        this.transactions.load();
    },
    
    start: function(options)
    {
        var self = this;
        
        this.activeControlChannels = [];
        
        var port;
        var address;
        
        if (options)
        {
            port    = options.port || 1337;
            address = options.address || '127.0.0.1';
        }
        else
        {
            port    = 1337;
            address = '127.0.0.1';
        }
        
        var handler = function (req, res)
        {
            // Answer to POST or PUT requests:
            if (req.method.toLowerCase() === 'put' ||
                req.method.toLowerCase() === 'post')
            {
                var parser = new Parser();
                
                parser.on(commands.ASUB, function(metadata)
                {
                    self.agents.sub(metadata.agentID, metadata.actions);
                    
                    answer(res, commands.AACK);
                    
                }).on(commands.AUNSUB, function(metadata)
                {
                    self.agents.unsub(metadata.agentID, metadata.actions);
                    
                    answer(res, commands.AACK);
                    
                }).on(commands.TBEGIN, function(metadata)
                {
                    // 1. Create a new transaction
                    var transaction = self.transactions.create(metadata);
                    
                    // 2. Fork the Control Channel for this transaction as a new process:
                    var controlchannel = child_process.fork('./lib/controlchannel', [JSON.stringify(transaction)]);
                    self.activeControlChannels[transaction.id] = controlchannel;

                    controlchannel.on('message', function(data)
                    {
                        if (data.event === 'ready')
                        {
                            console.log('[INIT_CHANNEL] Control channel\'s PID is %d', controlchannel.pid);

                            // 3. Notify agents waiting for actions X,Y,Z to listen for control
                            var interested = self.agents.agents(metadata.actions);
                            self.agents.notify(interested, transaction.portD2, metadata.actions);

                            // 4. Answer instructing to listen for control
                            answer(res, commands.TACK_WITHTRANSACTIONANDPORT(transaction.id, transaction.portC1, 'control'));
                        }
                        else if (data.event === 'dead')
                        {
                            console.log('[INIT_CHANNEL] Control channel "%s" died with status %s', data.transaction.id, data.status);

                            self.transactions.finish(data.transaction.id);

                            self.activeControlChannels[data.transaction.id] = undefined;
                            delete self.activeControlChannels[data.transaction.id];
                        }
                    });
                    
                }).on(commands.ERROR, function(cause)
                {
                    answer(res, commands.ERROR_WITHCAUSE({"cause":cause}), 400);
                });
                
                parser.parse(req);
            }
            else
            {
                answer(res, commands.error(), 405, {'Allow': 'PUT,POST'});
            }
        };

        http.createServer(handler)
            .listen(port, address);

        console.log('[INIT_CHANNEL] Running at %s:%d', address, port);
    },
    
    stop: function()
    {
        for (var a=0; a<this.activeControlChannels.length; a++)
        {
            console.log('[INIT_CHANNEL] Closing control channel #%s...', a);
            
            this.activeControlChannels[a].kill('SIGTERM');
        }
        
        console.log('[INIT_CHANNEL] Closed');
    }
};
