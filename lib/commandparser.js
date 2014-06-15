/*
 * machina
 * https://github.com/NicolaOrritos/machina
 *
 * Copyright (c) 2014 Nicola Orritos
 * Licensed under the MIT license.
 */

'use strict';

var utils        = require('util');
var EventEmitter = require('events').EventEmitter;
var commands     = require('./commands');


function parseCommand(str)
{
    var command;
    
    if (str)
    {
        if (commands.isCommand(str, commands.ASUB))
        {
            command = {
                verb: commands.ASUB
            };
        }
        else if (commands.isCommand(str, commands.AACK))
        {
            command = {
                verb: commands.AACK
            };
        }
        else if (commands.isCommand(str, commands.AUNSUB))
        {
            command = {
                verb: commands.AUNSUB
            };
        }
        else if (commands.isCommand(str, commands.TBEGIN))
        {
            command = {
                verb: commands.TBEGIN
            };
        }
        else if (commands.isCommand(str, commands.TACK))
        {
            command = {
                verb: commands.TACK
            };
        }
        else if (commands.isCommand(str, commands.TEND))
        {
            command = {
                verb: commands.TEND
            };
        }
        
        if (command && command.verb)
        {
            var meta = str.substring(command.verb.length);
            
            if (meta)
            {
                command.metadata = JSON.parse(meta);
            }
            else
            {
                command.metadata = {};
            }
        }
    }
    
    return command;
}


function Parser()
{
    EventEmitter.call(this);
}

utils.inherits(Parser, EventEmitter);

Parser.prototype.parse = function(req)
{
    var self = this;

    if ((typeof req) === 'string' || req instanceof String)
    {
        var command = parseCommand(req);

        if (command)
        {
            this.emit(command.verb, command.metadata);
        }
        else
        {
            this.emit(commands.ERROR, 'Malformed request');
        }
    }
    // Leave the door open to many kinds of requests:
    else if (req instanceof EventEmitter)
    {
        var queryData = '';

        req.on('data', function(data)
        {
            queryData += data;

            if(queryData.length > 1e6)
            {
                queryData = "";

                self.emit(commands.ERROR, 'Malformed request');
            }
        });

        req.on('end', function()
        {
            var command = parseCommand(queryData);

            if (command)
            {
                self.emit(command.verb, command.metadata);
            }
            else
            {
                self.emit(commands.ERROR, 'Malformed request');
            }
        });
    }
    else
    {
        this.emit(commands.ERROR, 'Malformed request');
    }

    return self;
};




module.exports = Parser;
