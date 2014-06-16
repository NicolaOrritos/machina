
'use strict';


var commands  = require('../lib/commands');
var ClientSDK = require('../lib/clientsdk');

var client    = new ClientSDK();

client.ASUB('fakeagent', [], true).on(commands.AACK, function(metadata)
{
    console.log('Received AACK for ASUB. Metadata: %s', JSON.stringify(metadata));
    
}).on(commands.TBEGIN, function(metadata)
{
    console.log('Received TBEGIN. Metadata: %s', JSON.stringify(metadata));
    
}).on(commands.ERROR, function(cause)
{
    console.log('Received ERROR for ASUB: %s', cause);
});
