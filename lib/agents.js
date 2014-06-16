/*
 * machina
 * https://github.com/NicolaOrritos/machina
 *
 * Copyright (c) 2014 Nicola Orritos
 * Licensed under the MIT license.
 */

'use strict';


var utils    = require('util');
var sets     = require('sets.js');
var net      = require('net');
var commands = require('./commands');


var MIN_PORT = 70000;
var MAX_PORT = 80000;


var agents          = [];
var agentsToActions = {};
var actionsToAgents = {};
var agentsPorts     = {};


function messageAgent(port, actions, metacallback)
{
    // Establish connection
    var client = net.connect(port, function()
    {
        var answer = '';
        
        client.on('data', function(data)
        {
            answer += data;
        });
        
        client.on('end', function()
        {
            metacallback(answer);
        });
        
        // Send a message
        client.write(commands.TBEGIN_WITHPORTANDACTIONS(port, actions));
    });
}


module.exports =
{
    takeNewPort: function()
    {
        var port;

        if (this.freePorts.length > 0)
        {
            var index = 0;

            while (this.freePorts[index] === 0)
            {
                ++index;
            }

            this.freePorts[index] = 0;
            this.usedPorts[index] = 1;

            port = index + MIN_PORT;
        }
        else
        {
            throw new Error('No more ports');
        }

        return port;
    },

    returnPort: function(port)
    {
        if (port && port >= MIN_PORT && port < MAX_PORT)
        {
            port -= MIN_PORT;

            this.freePorts[port] = 1;
            this.usedPorts[port] = 0;
        }
    },
    
    load: function()
    {
        this.all   = agents;
        this.ag2ac = agentsToActions;
        this.ac2ag = actionsToAgents;
        this.ag2po = agentsPorts;
        
        this.freePorts           = [];
        this.usedPorts           = [];
        this.transactions        = {};
        
        for (var a=MIN_PORT; a<MAX_PORT; a++)
        {
            this.freePorts[a - MIN_PORT] = 1;
            this.usedPorts[a - MIN_PORT] = 0;
        }
    },
    
    sub: function(agent, actions)
    {
        if (agent)
        {
            if (this.all.indexOf(agent) === -1)
            {
                this.all.push(agent);
                
                this.ag2po[agent] = this.takeNewPort();
            }
            
            if (actions)
            {
                if (!utils.isArray(actions))
                {
                    actions = [actions];
                }
                
                var previousActions = this.ag2ac[agent] || [];
                this.ag2ac[agent] = previousActions.concat(actions);
                this.ag2ac[agent] = sets.dedup(this.ag2ac[agent]);
                
                
                for (var a=0; a<actions.length; a++)
                {
                    if (this.ac2ag[actions[a]] === undefined)
                    {
                        this.ac2ag[actions[a]] = [];
                    }
                    
                    this.ac2ag[actions[a]].push(agent);
                    this.ac2ag[actions[a]] = sets.dedup(this.ac2ag[actions[a]]);
                }
            }
        }
        else
        {
            throw new Error('No agent provided');
        }
    },
    
    unsub: function(agent, actions)
    {
        if (agent)
        {
            var index = this.all.indexOf(agent);
            
            if (index !== -1)
            {
                if (actions)
                {
                    if (!utils.isArray(actions))
                    {
                        actions = [actions];
                    }
                    
                    
                    index = this.ag2ac.indexOf(agent);
                    
                    if (index !== -1)
                    {
                        this.ag2ac.splice(index, 1);
                    }

                    
                    for (var a=0; a<actions.length; a++)
                    {
                        index = this.ac2ag[actions[a]].indexOf(agent);
                        
                        if (index !== -1)
                        {
                            this.ac2ag[actions[a]].splice(index, 1);
                            
                            if (this.ac2ag[actions[a]].length < 1)
                            {
                                this.ac2ag.splice(this.ac2ag.indexOf(actions[a]), 1);
                            }
                        }
                    }
                }
                else
                {
                    this.all.splice(index, 1);
                    
                    this.returnPort(this.ag2po[agent]);
                    
                    this.ag2po[agent] = undefined;
                    delete this.ag2po[agent];
                }
            }
        }
    },
    
    list: function()
    {
        return this.all;
    },
    
    actions: function(agent)
    {
        var result = [];
        
        if (agent)
        {
            result = this.ag2ac[agent] || [];
        }
        
        return result;
    },
    
    agents: function(actions)
    {
        var result = [];
        
        if (actions)
        {
            if (!utils.isArray(actions))
            {
                actions = [actions];
            }
            
            for (var a=0; a<actions.length; a++)
            {
                result.concat(this.ac2ag[actions[a]]);
            }
            
            result = sets.dedup(result);
        }
        
        return result;
    },
    
    port: function(agent)
    {
        var port;
        
        if (agent)
        {
            port = this.ag2po[agent];
        }
        
        return port;
    },
    
    notify: function(agents, dataPort, actions, notified)
    {
        console.log('Notifying %s agent(s)...', agents.length);
        
        var count = 0;

        function metacallback()
        {
            if (++count === agents.length)
            {
                if (notified)
                {
                    notified();
                }
            }
        }
        
        if (agents && agents.length && dataPort)
        {
            for (var a=0; a<agents.length; a++)
            {
                var port = this.ag2po[agents[a]];
                var ac   = actions || [];
                
                console.log('Notifying agent "%s"...', agents[a]);
                
                messageAgent(port, ac, metacallback);
            }
        }
    },
    
    notifyAll: function(dataPort, actions, notified)
    {
        this.notify(this.all, dataPort, actions, notified);
    }
};
