/*
 * machina
 * https://github.com/NicolaOrritos/machina
 *
 * Copyright (c) 2014 Nicola Orritos
 * Licensed under the MIT license.
 */

var fs            = require('fs');
var docopt        = require('docopt').docopt;
var CONF          = require('./conf');
var initchannel   = require('./initchannel');


function startMachina(development)
{
    console.log('Starting machina daemon... (development? %s)', (development ? 'YES' : 'NO'));

    // Write the PID file:
    var pid = process.pid.toString();
    var pidPath = development ? './machina.pid' : '/var/run/machina.pid';

    fs.writeFile(pidPath, pid, function(err)
    {
        if (err)
        {
            console.log("Could not write PID file. Cause: %s", err);
        }
    });


    // Apply some bare-bones config:
    process.env["NODE_ENV"] = CONF.ENVIRONMENT;


    initchannel.start();
}


var doc = " \n\
Usage: \n\
  machina.js [--development] \n\
  machina.js -h | --help \n\
\n\
Options: \n\
  -h --help      Show this help. \n\
  --development  Start in development mode. PID file goes to './machina.pid'. \n\
";

var args = docopt(doc);

startMachina(args['--development']);
