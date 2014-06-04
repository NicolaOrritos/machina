/*
 * machina
 * https://github.com/NicolaOrritos/machina
 *
 * Copyright (c) 2014 Nicola Orritos
 * Licensed under the MIT license.
 */

'use strict';


var MIN_PORT = 10000;
var MAX_PORT = 80000;


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
        this.freePorts           = [];
        this.usedPorts           = [];
        this.transactions        = {};
        
        for (var a=MIN_PORT; a<MAX_PORT; a++)
        {
            this.freePorts[a - MIN_PORT] = 1;
            this.usedPorts[a - MIN_PORT] = 0;
        }
    },
    
    create: function(metadata)
    {
        var portA = this.takeNewPort();
        var portB = this.takeNewPort();

        var id  = 't_';
        id += Date.now();
        id += '_';
        id += this.portA;
        id += '_';
        id += this.portB;
        
        var transaction = {
            id: id,
            portA: portA,
            portB: portB,
            metadata: metadata
        };
        
        this.transactions[transaction.id] = transaction;
        
        return transaction;
    },
    
    finish: function(transaction)
    {
        if (transaction)
        {
            var id = transaction.id;

            if (transaction instanceof String)
            {
                id = transaction;
            }

            if (this.transactions[id])
            {
                this.returnPort(this.transactions[id].portA);
                this.returnPort(this.transactions[id].portB);

                this.transactions[id] = undefined;
                delete this.transactions[id];
            }
        }
    },
    
    count: function()
    {
        return Object.keys(this.transactions).length;
    }
};
