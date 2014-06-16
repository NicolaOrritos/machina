
'use strict';

var transaction = JSON.parse(process.argv[2]);


var http          = require('http');
var child_process = require('child_process');
var Parser        = require('./commandparser');
var commands      = require('./commands');


process.on('exit', function()
{
    console.log('[CONTROL_CHANNEL] Exiting from transaction: %s', transaction.id);
    
    process.send({event: 'dead', status: 0, transaction: transaction});
});

process.on('SIGTERM', function()
{
    console.log('[CONTROL_CHANNEL] Exiting from transaction: %s', transaction.id);
    
    process.send({event: 'dead', status: 'SIGTERM', transaction: transaction});
});

process.on('SIGINT', function()
{
    console.log('[CONTROL_CHANNEL] Exiting from transaction: %s', transaction.id);
    
    process.send({event: 'dead', status: 'SIGINT', transaction: transaction});
});


var port = transaction.portC1;
var address = 'localhost';


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


// Already fork the data-channel
var datachannel = child_process.fork('lib/datachannel_tcp', [JSON.stringify(transaction)]);

datachannel.on('error', function(err)
{
    console.log('[CONTROL_CHANNEL] Data-channel gave an error: %s', err);
});

console.log('[CONTROL_CHANNEL] Data channel\'s PID is %d', datachannel.pid);


var handler = function (req, res)
{
    // Answer to POST or PUT requests:
    if (req.method.toLowerCase() === 'put' ||
        req.method.toLowerCase() === 'post')
    {
        var parser = new Parser();

        parser.on(commands.TAUTH, function()//metadata)
        {
            // Answer instructing to use port D1 for sending data
            answer(res, commands.TACK_WITHTRANSACTIONANDPORT(transaction.id, transaction.portD1));

        }).on(commands.TEND, function()//metadata)
        {
            // Close data channel and then suicide
            answer(res, commands.TACK_SIMPLE());
            
            datachannel.kill('SIGTERM');
            
            console.log('[CONTROL_CHANNEL] Closed data-channel');
            
            process.exit();

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

http.createServer(handler).listen(port, address, function()
{
    process.send({event: 'ready'});
});


console.log('[CONTROL_CHANNEL] Started for transaction: %s', transaction.id);
