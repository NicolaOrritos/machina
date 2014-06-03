/*
 * machina
 * https://github.com/NicolaOrritos/machina
 *
 * Copyright (c) 2014 Nicola Orritos
 * Licensed under the MIT license.
 */

'use strict';


var http   = require('http');
var Parser = require('./commandparser');


module.exports =
{
    start: function(options)
    {
        var port    = options.port || 1337;
        var address = options.address || '127.0.0.1';
        
        var handler = function (req, res)
        {
            // Answer to POST or PUT requests:
            if (req.method.toLowerCase() === 'put' ||
                req.method.toLowerCase() === 'post')
            {
                var parser = new Parser();
                
                parser.parse(req).on('ASUB', function(metadata)
                {
                    // TODO
                    res.writeHead(200, {'Content-Type': 'text/plain'});
                    res.end('ASUB{"metadata":' + metadata + '}\n');
                    
                }).on('AUNSUB', function(metadata)
                {
                    // TODO
                    res.writeHead(200, {'Content-Type': 'text/plain'});
                    res.end('AUNSUB{"metadata":' + metadata + '}\n');
                    
                }).on('ERROR', function(cause)
                {
                    // TODO
                    res.writeHead(200, {'Content-Type': 'text/plain'});
                    res.end('ERROR{"cause":' + cause + '}\n');
                });
            }
            else
            {
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end('ERROR\n');
            }
        };

        http.createServer(handler)
            .listen(port, address);

        console.log('[INIT_CHANNEL] Running at %s:%d', address, port);
    }
};
