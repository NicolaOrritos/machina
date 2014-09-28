
'use strict';

var fs            = require('fs');
var utils         = require('util');
var child_process = require('child_process');
var EventEmitter  = require('events').EventEmitter;
var VError        = require('verror');


var JOB_STOPPED = 'stopped';
var JOB_STARTED = 'started';


var DEFAULT_CONF =
{
    "EXECUTABLE":        "pwd",
    "ARGS":              [],
    "IS_NODE":           false,

    "DEPENDENCIES":      [],

    "RETRY_STRATEGY":
    {
        "ENABLED":       true,
        "TIMES":         3
    },

    "FAILURE_STRATEGY":
    {
        "STOP_QUEUE":    true
    },

    "TIMEOUT_STRATEGY":
    {
        "ENABLED":       true,
        "AFTER_SECONDS": 300
    }
};


function Job()
{
    EventEmitter.call(this);

    this.status = JOB_STOPPED;
}

utils.inherits(Job, EventEmitter);


Job.STARTED_EVENT  = 'job_started';
Job.FINISHED_EVENT = 'job_finished';
Job.ERROR_EVENT    = 'job_error';


function _prepareFileDataPool(filePath, finished)
{
    if (finished)
    {
        var error;
        var stdio = ['ignore', 'ignore', 'pipe'];

        if (filePath)
        {
            var inFilePath  = filePath + '.in';
            var outFilePath = filePath + '.out';

            fs.open(outFilePath, 'r', function(err, fd)
            {
                if (err)
                {
                    // Only out stream to be provided:
                    fs.open(outFilePath, 'w', function(err2, fd2)
                    {
                        if (err2)
                        {
                            throw new VError(err2, 'Could not create "%s"', outFilePath);
                        }
                        else
                        {
                            console.log('Opened file "%s" for output', outFilePath);

                            stdio[0] = 'ignore';
                            stdio[1] = fd2;

                            finished(error, stdio);
                        }
                    });
                }
                else
                {
                    fs.close(fd, function(err6)
                    {
                        if (err6)
                        {
                            throw new VError(err6, 'Could not close "%s"', outFilePath);
                        }
                        else
                        {
                            // Use the previous file, renamed, for input:
                            fs.rename(outFilePath, inFilePath, function(err3)
                            {
                                if (err)
                                {
                                    throw new VError(err3, 'Could not rename "%s" to "%s"', outFilePath, inFilePath);
                                }
                                else
                                {
                                    fs.open(inFilePath, 'r', function(err4, fd2)
                                    {
                                        console.log('Opened file "%s" for input', inFilePath);

                                        // Create a new file for writing output:
                                        fs.open(outFilePath, 'w', function(err5, fd3)
                                        {
                                            if (err5)
                                            {
                                                throw new VError(err5, 'Could not open output file "%s"', outFilePath);
                                            }
                                            else
                                            {
                                                console.log('Opened file "%s" for output', outFilePath);

                                                stdio[0] = fd2;
                                                stdio[1] = fd3;

                                                finished(error, stdio);
                                            }
                                        });
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    }
}

function _createChildProcess(job, childStdio)
{
    function done(error)
    {
        job.emit(Job.FINISHED_EVENT, error);
    }

    if (job)
    {
        var beforeTimeoutHandle;
        var timeoutHandle;
        var child;

        if (job.conf.IS_NODE)
        {
            child = child_process.fork(job.conf.EXECUTABLE,  job.conf.ARGS, {stdio: childStdio});
            job.emit(Job.STARTED_EVENT);
        }
        else
        {
            child = child_process.spawn(job.conf.EXECUTABLE, job.conf.ARGS, {stdio: childStdio});
            job.emit(Job.STARTED_EVENT);
        }


        if (job.conf.TIMEOUT_STRATEGY.ENABLED)
        {
            var timeoutTime        = (job.conf.TIMEOUT_STRATEGY.AFTER_SECONDS) * 1000;
            var aboutToTimeoutTime = (timeoutTime - 5) * 1000;

            if (aboutToTimeoutTime < 1)
            {
                aboutToTimeoutTime = 1 * 1000;
                timeoutTime        = (aboutToTimeoutTime + 5) * 1000;
            }

            if (job.conf.IS_NODE)
            {
                beforeTimeoutHandle = setTimeout(function()
                {
                    child.send('about_to_timeout');

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
                job.retryCount--;

                self.start(done);
            }
            else
            {
                done(new Error(err));
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

            var err;

            if (code !== 0)
            {
                err = new Error('Exited with code ' + code);
            }

            done(err);
        });

        child.stderr.on('data', function(data)
        {
            console.log('[ERROR "%s"]: %s', job.name, data);
        });
    }
}


Job.load = function(conf)
{
    var job;

    if (conf)
    {
        job = new Job();
        job.name = conf.NAME || "" + Date.now();
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


        // Additional configuration settings to be taken as is:
        job.conf.DATA_POOL = conf.DATA_POOL;
    }

    return job;
};

Job.prototype.start = function()
{
    var self = this;

    this.status = JOB_STARTED;


    // Parse eventual data-files configuration:
    if (   this.conf.DATA_POOL
        && this.conf.DATA_POOL.ENABLED
        && this.conf.DATA_POOL.TYPE === 'FILE')
    {
        _prepareFileDataPool(this.conf.DATA_POOL.FILE, function(error, childStdio)
        {
            if (error)
            {
                self.emit(Job.ERROR_EVENT, new Error('Could not prepare file data pool'));
            }
            else
            {
                _createChildProcess(self, childStdio);
            }
        });
    }
    else
    {
        _createChildProcess(this, 'ignore');
    }


    return this;
};


module.exports = Job;
