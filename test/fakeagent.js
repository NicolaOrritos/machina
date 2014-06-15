
'use strict';


var commands  = require('../lib/commands');
var ClientSDK = require('../lib/clientsdk');

var client    = new ClientSDK();

client.ASUB('fakeagent', []).on(commands.AACK, function(metadata)
{
    console.log('Received AACK for ASUB. Metadata: %s', JSON.stringify(metadata));
    
}).on(commands.ERROR, function(cause)
{
    console.log('Received ERROR for ASUB: %s', cause);
});

// TODO
