
'use strict';

var transaction = JSON.parse(process.argv[2]);


var http          = require('http');
// var child_process = require('child_process');
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


var port = transaction.portC1;
var address = '127.0.0.1';

var handler = function (req, res)
{
    // Answer to POST or PUT requests:
    if (req.method.toLowerCase() === 'put' ||
        req.method.toLowerCase() === 'post')
    {
        var parser = new Parser();

        parser.parse(req).on(commands.TAUTH, function()//metadata)
        {
            // Answer instructing to use port D1 for sending data
            answer(res, commands.TACK_WITHTRANSACTIONANDPORT(transaction.id, transaction.portD1));

        }).on(commands.ERROR, function(cause)
        {
            answer(res, commands.ERROR_WITHCAUSE({"cause":cause}), 400);
        });
    }
    else
    {
        answer(res, commands.error(), 405, {'Allow': 'PUT,POST'});
    }
};

http.createServer(handler)
    .listen(port, address);


console.log('[CONTROL_CHANNEL] Started for transaction: %s', JSON.stringify(transaction));
