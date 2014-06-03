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
        else if (commands.isCommand(str, commands.AUNSUB))
        {
            command = {
                verb: commands.AUNSUB
            };
        }
        /* else if (isCommand(str, commands.TBEGIN))
        {
            // TODO
        } */
        
        if (command && command.verb)
        {
            var meta = str.substring(command.verb.length);
            
            command.metadata = JSON.parse(meta);
        }
    }
    
    return command;
}


function Parser()
{
    EventEmitter.call(this);
    
    var self = this;
    
    this.parse = function(req)
    {
        if (req)
        {
            var queryData = '';

            req.on('data', function(data)
            {
                queryData += data;

                if(queryData.length > 1e6)
                {
                    queryData = "";

                    self.emit('ERROR', 'Malformed request');
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
                    self.emit('ERROR', 'Malformed request');
                }
            });
        }
        else
        {
            this.emit('ERROR', 'Malformed request');
        }
        
        return self;
    };
}

utils.inherits(Parser, EventEmitter);




module.exports = Parser;
