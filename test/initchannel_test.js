
'use strict';


var request     = require('request');
var initchannel = require('../lib/machina').InitChannel;

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

exports.machina = {
    setUp: function(done)
    {
        // setup here
        done();
    },
    
    'Init channel': function(test)
    {
        test.expect(4);
        
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
            test.ifError(err);
            test.ok(res);
            test.ok(body);
            
            test.done();
        });
    }
};
