
'use strict';


var util = require('util');
var net  = require('net');


var transaction = JSON.parse(process.argv[2]);

var outServer = net.createServer(function(outStream)
{
    outStream.on('data', function(data)
    {
        util.puts(data);
    });
    
    var inServer = net.createServer(function(inStream)
    {
        inStream.pipe(outStream, {end: false});
    });
    
    inServer.listen(transaction.portD1, 'localhost');
    
    console.log('[TCP_DATA_CHANNEL] Started for transaction: %s', JSON.stringify(transaction));
});

outServer.listen(transaction.portD2, 'localhost');
