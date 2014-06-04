/*
 * machina
 * https://github.com/NicolaOrritos/machina
 *
 * Copyright (c) 2014 Nicola Orritos
 * Licensed under the MIT license.
 */

'use strict';


var utils = require('util');
var sets  = require('sets.js');


var agents          = [];
var agentsToActions = {};
var actionsToAgents = {};


module.exports =
{
    load: function()
    {
        this.all   = agents;
        this.ag2ac = agentsToActions;
        this.ac2ag = actionsToAgents;
    },
    
    sub: function(agent, actions)
    {
        if (agent)
        {
            if (this.all.indexOf(agent) === -1)
            {
                this.all.push(agent);
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
    
    notify: function(agents, actions)
    {
        if (agents && actions)
        {
            for (var a=0; a<agents.length; a++)
            {
                // TODO
            }
        }
    }
};
