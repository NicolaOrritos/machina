
'use strict';


var request     = require('request');
var initchannel = require('../lib/initchannel');
var Parser      = require('../lib/commandparser');
var commands    = require('../lib/commands');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.machina =
{
    setUp: function(done)
    {
        // setup here
        done();
    },
    
    'Init channel': function(test)
    {
        test.expect(7);
        
        test.ok(initchannel);
        
        initchannel.loadAgents();
        initchannel.loadTransactions();
        initchannel.start();
        
        var reqOpts = {
            uri: 'http://localhost:1337/',
            method: 'PUT',
            body: 'TBEGIN{"actions":["test"]}'
        };
        
        request(reqOpts, function(err, res, body)
        {
            console.log('Response from TBEGIN: %s', body);
            
            test.ifError(err);
            test.ok(res);
            test.ok(body);
            
            var parser = new Parser();
            parser.on(commands.TACK, function(metadata)
            {
                var reqOpts2 = {
                    uri: 'http://localhost:' + metadata.control + "/",
                    method: 'PUT',
                    body: 'TEND{"transaction":"' + metadata.transaction + '"}'
                };
                
                console.log('Calling TEND on "%s"', reqOpts2.uri);

                request(reqOpts2, function(err2, res2, body2)
                {
                    console.log('Response from TEND: %s', body);

                    test.ifError(err2);
                    test.ok(res2);
                    test.ok(body2);

                    test.done();
                });
                
            }).on(commands.ERROR, function(cause)
            {
                test.fail(cause);
                
                test.done();
            });
            
            parser.parse(body);
        });
    },
    
    tearDown: function(done)
    {
        initchannel.stop();
        done();
    }
};
