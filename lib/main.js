
'use strict';


var Queue = require('./machina/queue.js');

var queue1 = Queue.load('etc/machina.d/queue1/queue1.queue', true);

queue1.on(Queue.ERROR_EVENT, function(err, job)
{
    console.log('%s, on job "%s"', err, job);
});

queue1.on(Queue.STOPPED_EVENT, function(job)
{
    console.log('Stopped on job #%s', job);
});

queue1.on(Queue.FINISHED_EVENT, function()
{
    console.log('Queue finished');
});
