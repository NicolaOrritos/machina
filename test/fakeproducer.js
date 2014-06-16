
'use strict';


var commands  = require('../lib/commands');
var ClientSDK = require('../lib/clientsdk');

var client    = new ClientSDK();

client.TBEGIN().on(commands.TACK, function(metadata)
{
    console.log('Received TACK for TBEGIN. Metadata: %s', JSON.stringify(metadata));
    
}).on(commands.ERROR, function(cause)
{
    console.log('Received ERROR for TBEGIN: %s', cause);
});
