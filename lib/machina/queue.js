
'use strict';

var utils        = require('util');
var fs           = require('fs');
var path         = require('path');
var EventEmitter = require('events').EventEmitter;
var Job          = require('./job');


var ERROR_EVENT    = 'error';
var FINISHED_EVENT = 'finished';


function Queue()
{
    EventEmitter.call(this);
    
    this.jobs = [];
    this.current = 0;
    this.started = false;
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
    var self = this;
    var job;
    
    if (this.current < this.jobs.length)
    {
        job = this.jobs[this.current];
    }
    
    if (job)
    {
        if (job.start)
        {
            job.start(function(err)
            {
                if (err)
                {
                    self.started = false;
                    
                    self.emit(ERROR_EVENT);
                }
                else
                {
                    ++(self.current);
                    
                    self.start();
                }
            });
        }
        else
        {
            ++(this.current);

            this.start();
            
            this.emit(ERROR_EVENT);
        }
    }
    else
    {
        this.started = false;
        this.current = 0;
        
        this.emit(FINISHED_EVENT);
    }
};

Queue.prototype.stop = function()
{
    this.started = false;
};

Queue.prototype.empty = function()
{
    this.jobs = [];
    this.current = 0;
    this.started = false;
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
        
        if (conf.jobs && conf.jobs.length)
        {
            for (var a=0; a<conf.jobs.length; a++)
            {
                var jobFileName = conf.jobs[a] + '.job';
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
