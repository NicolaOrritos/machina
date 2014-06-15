'use strict';


var sjl  = require("sjl");

var defaults =
{};

var CONF = sjl("/etc/machina.json", defaults, {"silent": true});


module.exports = CONF;
