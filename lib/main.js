
'use strict';


var Queue = require('./machina/queue.js');

var queue1 = Queue.load('etc/machina.d/queue1/queue1.queue', true);

queue1.on('error', function(err, job)
{
    console.log('%s, on job "%s"', err, job);
});
