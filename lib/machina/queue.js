
'use strict';

var utils        = require('util');
var fs           = require('fs');
var path         = require('path');
var EventEmitter = require('events').EventEmitter;
var Job          = require('./job');


function Queue()
{
    EventEmitter.call(this);
    
    this.jobs = [];
    this.current = 0;
    this.stopped = true;
}

utils.inherits(Queue, EventEmitter);


Queue.STARTED_EVENT  = 'started';
Queue.STOPPED_EVENT  = 'stopped';
Queue.ERROR_EVENT    = 'error';
Queue.FINISHED_EVENT = 'finished';
Queue.CYCLE_EVENT    = 'cycle';


// Trick for "private" methods:
function _next(queue, jobIndex)
{
    if (queue && jobIndex >= 0)
    {
        if (jobIndex < queue.jobs.length)
        {
            queue.job = queue.jobs[jobIndex];

            if (queue.job && queue.job.start)
            {
                console.log('Starting job "%s"...', queue.job.name);

                queue.job.start(function(err)
                {
                    if (err)
                    {
                        console.log('Job "%s" finished with an error: %s', queue.job.name, err);

                        queue.emit(Queue.ERROR_EVENT, err, queue.job.name);

                        if (queue.job.conf.FAILURE_STRATEGY.STOP_QUEUE)
                        {
                            queue.stop();
                        }
                    }
                    else
                    {
                        console.log('Job "%s" finished normally', queue.job.name);
                    }

                    // While the previous job was running has this queue been stopped?
                    if (!queue.stopped)
                    {
                        ++(queue.current);

                        _next(queue, queue.current);
                    }
                    else
                    {
                        var at = queue.current;
                        queue.current = 0;

                        queue.emit(Queue.STOPPED_EVENT, at);
                    }
                });
            }
            else
            {
                // Jump empty jobs

                ++(queue.current);

                _next(queue, queue.current);
            }
        }
        else
        {
            queue.current = 0;
            
            var event = queue.conf.CYCLE ? Queue.CYCLE_EVENT: Queue.FINISHED_EVENT;
            
            queue.emit(event);
        }
    }
    else
    {
        var err = new Error('Wrong index or queue');
        
        queue.emit(Queue.ERROR_EVENT, err);
        
        queue.stop();
    }
}


Queue.prototype.append = function(job)
{
    var jobs;
    
    if (utils.isArray(job))
    {
        jobs = job;
    }
    else if (job)
    {
        jobs = [job];
    }
    else
    {
        jobs = [];
    }
    
    for (var a=0; a<jobs.length; a++)
    {
        this.jobs.push(jobs[a]);
    }
};

Queue.prototype.start = function()
{
    if (this.stopped)
    {
        var self = this;
        this.stopped = false;
        
        this.emit(Queue.STARTED_EVENT, this.current);
        

        // Listen for "cycle events", so that when a cycling queue finishes it gets restarted
        this.once(Queue.CYCLE_EVENT, function()
        {
            self.start();
        });

        _next(this, this.current);
    }
    else
    {
        // Do not start twice the same queue...
    }
};

Queue.prototype.stop = function()
{
    this.stopped = true;
};

Queue.prototype.empty = function()
{
    this.jobs = [];
    this.current = 0;
};

Queue.prototype.getJobsCount = function()
{
    return this.jobs.length;
};


Queue.load = function(file, start)
{
    var result;
    
    if (file)
    {
        file = path.resolve(file);
        
        var str  = fs.readFileSync(file);
        var conf = JSON.parse(str);
        
        result = new Queue();
        
        if (conf.JOBS && conf.JOBS.length)
        {
            result.conf = conf;
            
            for (var a=0; a<conf.JOBS.length; a++)
            {
                var jobFileName = conf.JOBS[a] + '.job';
                var jobFile     = path.join(path.dirname(file), jobFileName);
                    jobFile     = path.resolve(jobFile);
                
                var jobStr  = fs.readFileSync(jobFile);
                var jobConf = JSON.parse(jobStr);
                
                var job = Job.load(jobConf);
                
                result.append(job);
            }
            
            
            if (start)
            {
                result.start();
            }
        }
    }
    else
    {
        throw new Error('No path provided');
    }
    
    return result;
};


module.exports = Queue;
