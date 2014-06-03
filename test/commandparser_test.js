
'use strict';


var utils        = require('util');
var EventEmitter = require('events').EventEmitter;
var Parser       = require('../lib/commandparser');

function Request()
{
    EventEmitter.call(this);
}

utils.inherits(Request, EventEmitter);

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
    
    'Commands parser': function(test)
    {
        test.expect(4);
        
        var parser = new Parser();
        
        test.ok(parser);
        
        var req = new Request();
        req.method = 'POST';
        
        parser.parse(req).once('ERROR', function(cause)
        {
            test.ok(cause);
            
            
            var req2 = new Request();
            req2.method = 'POST';
            
            test.ok(req2);
            
            parser.parse(req2).once('ASUB', function(metadata)
            {
                test.ok(metadata);
                
                
                test.done();
                
            }).once('ERROR', function(cause)
            {
                test.fail(cause);
                
                test.done();
            });
            
            req2.emit('data', 'ASUB{"NOTHING":"nothing"}');
            req2.emit('end');
        });
        
        req.emit('data', 'nothing');
        req.emit('end');
    }
};
