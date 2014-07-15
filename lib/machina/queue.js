
'use strict';

var utils        = require('util');
var fs           = require('fs');
var path         = require('path');
var EventEmitter = require('events').EventEmitter;
var Job          = require('./job');


var STARTED_EVENT  = 'started';
var STOPPED_EVENT  = 'stopped';
var ERROR_EVENT    = 'error';
var FINISHED_EVENT = 'finished';
var CYCLE_EVENT    = 'cycle';


function Queue()
{
    EventEmitter.call(this);
    
    this.jobs = [];
    this.current = 0;
    this.stopped = true;
}

utils.inherits(Queue, EventEmitter);

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
        
        
        this.emit(STARTED_EVENT, this.current);
        

        // Listen for "cycle events", so that when a cycling queue finished it gets restarted
        this.once(CYCLE_EVENT, function()
        {
            self.start();
        });


        if (this.current < this.jobs.length)
        {
            this.job = this.jobs[this.current];
            
            if (this.job.start)
            {
                console.log('Starting job "%s"...', this.job.name);

                this.job.start(function(err)
                {
                    if (err)
                    {
                        console.log('Job "%s" finished with an error: %s', self.job.name, err);
                        
                        self.emit(ERROR_EVENT, err, self.job.name);
                        
                        if (self.job.conf.FAILURE_STRATEGY.STOP_QUEUE)
                        {
                            self.stop();
                        }
                    }
                    else
                    {
                        console.log('Job "%s" finished normally', self.job.name);
                    }
                    
                    // While the previous job was running has this queue been stopped?
                    if (!self.stopped)
                    {
                        self.stopped = true;
                        
                        ++(self.current);
                        
                        self.start();
                    }
                    else
                    {
                        var at = self.current;
                        self.current = 0;

                        self.emit(STOPPED_EVENT, at);
                    }
                });
            }
            else
            {
                // Jump empty jobs

                ++(this.current);

                this.start();
            }
        }
        else if (this.conf.CYCLE)
        {
            this.current = 0;

            this.emit(CYCLE_EVENT);
        }
        else
        {
            this.current = 0;

            this.emit(FINISHED_EVENT);
        }
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
