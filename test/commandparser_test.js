
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
        test.expect(5);
        
        var parser = new Parser();
        
        test.ok(parser);
        
        var req = new Request();
        req.method = 'POST';
        
        parser.on('ERROR', function(cause)
        {
            test.ok(cause);
            
            
            var req2 = new Request();
            req2.method = 'POST';
            
            test.ok(req2);
            
            var parser2 = new Parser();
            
            parser2.on('ASUB', function(metadata)
            {
                test.ok(metadata);
                
                
                var parser3 = new Parser();
                
                parser3.on('TBEGIN', function(metadata2)
                {
                    test.ok(metadata2);
                    
                    test.done();
                    
                }).on('ERROR', function(cause)
                {
                    test.fail(cause);

                    test.done();
                });
                
                parser3.parse('TBEGIN{}');
                
            }).on('ERROR', function(cause)
            {
                test.fail(cause);
                
                test.done();
            });
            
            parser2.parse(req2);
            req2.emit('data', 'ASUB{"NOTHING":"nothing"}');
            req2.emit('end');
        });
        
        parser.parse(req);
        req.emit('data', 'nothing');
        req.emit('end');
    }
};
