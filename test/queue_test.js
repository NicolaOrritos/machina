'use strict';

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

exports.read =
{
    setUp: function(done)
    {
        done();
    },
    'Simple queue tests': function(test)
    {
        test.expect(3);
        
        
        var Queue = require('../lib/machina/queue.js');

        var queue1 = Queue.load('./etc/machina.d/queue1/queue1.queue', false);
        
        test.ok(queue1);
        
        test.deepEqual(queue1.getJobsCount(), 2);
        
        queue1.start();

        queue1.on(Queue.STARTED_EVENT, function(job)
        {
            console.log('Started with job #%s', job);
            
            test.ok(job);
        });

        queue1.on(Queue.ERROR_EVENT, function(err, job)
        {
            console.log('%s, on job "%s"', err, job);
            
            test.ifError(err);
            
            test.done();
        });

        queue1.on(Queue.STOPPED_EVENT, function(job)
        {
            console.log('Stopped on job #%s', job);
            
            test.ok(job);
            
            test.done();
        });

        queue1.on(Queue.FINISHED_EVENT, function()
        {
            console.log('Queue finished');
            
            test.ok(true);
            
            test.done();
        });
    }
};
