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


function takeNewPort(freePorts, usedPorts)
{
    var port;

    if (freePorts.length > 0)
    {
        var index = 0;

        while (freePorts[index] === 0)
        {
            ++index;
        }

        freePorts[index] = 0;
        usedPorts[index] = 1;

        port = index + MIN_PORT;
    }
    else
    {
        throw new Error('No more ports');
    }

    return port;
}

function returnPort(port, freePorts, usedPorts)
{
    if (port && port >= MIN_PORT && port < MAX_PORT)
    {
        port -= MIN_PORT;

        freePorts[port] = 1;
        usedPorts[port] = 0;
    }
}


function Transaction(metadata, freePorts, usedPorts)
{
    this.metadata = metadata;
    
    this.portA = takeNewPort(freePorts, usedPorts);
    this.portB = takeNewPort(freePorts, usedPorts);
    
    this.id  = 't_';
    this.id += Date.now();
    this.id += '_';
    this.id += this.portA;
    this.id += '_';
    this.id += this.portB;
}


module.exports =
{
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
        var transaction = new Transaction(metadata, this.freePorts, this.usedPorts);
        
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
                returnPort(this.transactions[id].portA, this.freePorts, this.usedPorts);
                returnPort(this.transactions[id].portB, this.freePorts, this.usedPorts);

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
