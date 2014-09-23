
'use strict';


var Job   = require('./machina/job.js');
var Queue = require('./machina/queue.js');

var queue1 = Queue.load('etc/machina.d/queue1/queue1.queue');

queue1.on(Queue.ERROR_EVENT, function(err, job)
{
    console.log('%s, on job "%s"', err, job);
});

queue1.on(Queue.STARTED_EVENT, function()
{
    console.log('Queue started');
});

queue1.on(Queue.STOPPED_EVENT, function(job)
{
    console.log('Stopped on job #%s', job);
});

queue1.on(Queue.FINISHED_EVENT, function()
{
    console.log('Queue finished');
});

queue1.on(Job.STARTED_EVENT, function(job)
{
    console.log('Job "%s" started', job);
});

queue1.on(Job.FINISHED_EVENT, function(err, job)
{
    if (err)
    {
        console.log('Job "%s" finished with error "%s"', job, err);
    }
    else
    {
        console.log('Job "%s" finished', job);
    }
});

queue1.start();
