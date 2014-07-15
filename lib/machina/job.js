
'use strict';

var utils         = require('util');
var child_process = require('child_process');
var EventEmitter  = require('events').EventEmitter;


var JOB_STOPPED = 'stopped';
var JOB_STARTED = 'started';


var DEFAULT_CONF =
{
    EXECUTABLE: 'pwd',
    ARGS:       [],
    IS_NODE:    false,
    
    DEPENDENCIES: [],
    
    RETRY_STRATEGY:
    {
        ENABLED: true,
        TIMES:   3
    },
    
    FAILURE_STRATEGY:
    {
        STOP_QUEUE: true
    },
    
    TIMEOUT_STRATEGY:
    {
        ENABLED:       true,
        AFTER_SECONDS: 300
    }
};


function Job()
{
    EventEmitter.call(this);
    
    this.status = JOB_STOPPED;
}

utils.inherits(Job, EventEmitter);

Job.load = function(conf)
{
    var job;
    
    if (conf)
    {
        job = new Job();
        job.name = conf.NAME;
        job.conf = {};
        
        
        job.conf.EXECUTABLE = conf.EXECUTABLE || DEFAULT_CONF.EXECUTABLE;
        job.conf.ARGS       = conf.ARGS       || DEFAULT_CONF.ARGS;
        job.conf.IS_NODE    = conf.IS_NODE    || DEFAULT_CONF.IS_NODE;
        
        job.conf.DEPENDENCIES = (conf.DEPENDENCIES && utils.isArray(conf.DEPENDENCIES)) ? conf.DEPENDENCIES : DEFAULT_CONF.DEPENDENCIES;
    
        
        job.conf.RETRY_STRATEGY = {};
        
        if (conf.RETRY_STRATEGY)
        {
            job.conf.RETRY_STRATEGY.ENABLED = conf.RETRY_STRATEGY.ENABLED || DEFAULT_CONF.RETRY_STRATEGY.ENABLED;
            job.conf.RETRY_STRATEGY.TIMES   = conf.RETRY_STRATEGY.TIMES   || DEFAULT_CONF.RETRY_STRATEGY.TIMES;
        }
        else
        {
            job.conf.RETRY_STRATEGY.ENABLED = DEFAULT_CONF.RETRY_STRATEGY.ENABLED;
            job.conf.RETRY_STRATEGY.TIMES   = DEFAULT_CONF.RETRY_STRATEGY.TIMES;
        }
        
        
        job.conf.FAILURE_STRATEGY = {};

        if (conf.FAILURE_STRATEGY)
        {
            job.conf.FAILURE_STRATEGY.STOP_QUEUE = conf.FAILURE_STRATEGY.STOP_QUEUE      || DEFAULT_CONF.FAILURE_STRATEGY.STOP_QUEUE;
        }
        else
        {
            job.conf.FAILURE_STRATEGY.STOP_QUEUE = DEFAULT_CONF.FAILURE_STRATEGY.STOP_QUEUE;
        }
        
        job.conf.TIMEOUT_STRATEGY = {};
        
        if (conf.TIMEOUT_STRATEGY)
        {
            job.conf.TIMEOUT_STRATEGY.ENABLED       = conf.TIMEOUT_STRATEGY.ENABLED       || DEFAULT_CONF.TIMEOUT_STRATEGY.ENABLED;
            job.conf.TIMEOUT_STRATEGY.AFTER_SECONDS = conf.TIMEOUT_STRATEGY.AFTER_SECONDS || DEFAULT_CONF.TIMEOUT_STRATEGY.AFTER_SECONDS;
        }
        else
        {
            job.conf.TIMEOUT_STRATEGY.ENABLED       = DEFAULT_CONF.TIMEOUT_STRATEGY.ENABLED;
            job.conf.TIMEOUT_STRATEGY.AFTER_SECONDS = DEFAULT_CONF.TIMEOUT_STRATEGY.AFTER_SECONDS;
        }
        
        job.retryCount = (job.conf.RETRY_STRATEGY.ENABLED) ? job.conf.RETRY_STRATEGY.TIMES : 0;
    }
    
    return job;
};

Job.prototype.start = function(done)
{
    var self = this;
    
    
    this.status = JOB_STARTED;

    if (this.conf.IS_NODE)
    {
        // TODO
    }
    else
    {
        var child;
        
        if (this.conf.IS_NODE)
        {
            child = child_process.fork(this.conf.EXECUTABLE,  this.conf.ARGS);
        }
        else
        {
            child = child_process.spawn(this.conf.EXECUTABLE, this.conf.ARGS);
        }
        
        
        var beforeTimeoutHandle;
        var timeoutHandle;
        
        
        if (this.conf.TIMEOUT_STRATEGY.ENABLED)
        {
            var timeoutTime        = this.conf.TIMEOUT_STRATEGY.AFTER_SECONDS;
            var aboutToTimeoutTime = timeoutTime - 5;
            
            if (aboutToTimeoutTime < 1)
            {
                aboutToTimeoutTime = 1;
                timeoutTime        = aboutToTimeoutTime + 5;
            }
            
            if (this.conf.IS_NODE)
            {
                beforeTimeoutHandle = setTimeout(function()
                {
                    child.send('about_to_timeout');

                    done(new Error('timeout'));

                }, aboutToTimeoutTime);
            }
            
            timeoutHandle = setTimeout(function()
            {
                child.kill('SIGKILL');
                
                done(new Error('timeout'));
                
            }, timeoutTime);
        }

        
        child.on('error', function(err)
        {
            console.log('Child process exited with error %s', err);
            
            if (beforeTimeoutHandle)
            {
                clearTimeout(beforeTimeoutHandle);
            }
            
            if (timeoutHandle)
            {
                clearTimeout(timeoutHandle);
            }

            if (self.retryCount > 0)
            {
                this.retryCount--;

                self.start(done);
            }
            else if (done)
            {
                done(err);
            }
        });

        child.on('close', function(code)
        {
            if (beforeTimeoutHandle)
            {
                clearTimeout(beforeTimeoutHandle);
            }
            
            if (timeoutHandle)
            {
                clearTimeout(timeoutHandle);
            }

            if (done)
            {
                var err = (code === 0) ? null : code;

                done(err);
            }
        });
    }
};


module.exports = Job;