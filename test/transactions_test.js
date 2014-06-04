
'use strict';


var transactions = require('../lib/transactions');

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
    
    'Transactions': function(test)
    {
        test.expect(5);
        
        test.ok(transactions);
        
        transactions.load();
        test.deepEqual(transactions.count(), 0);
        
        var transaction = transactions.create();
        test.ok(transaction);
        test.deepEqual(transactions.count(), 1);
        
        transactions.finish(transaction);
        test.deepEqual(transactions.count(), 0);
        
        
        test.done();
    }
};
