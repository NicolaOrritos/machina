/*
 * machina
 * https://github.com/NicolaOrritos/machina
 *
 * Copyright (c) 2014 Nicola Orritos
 * Licensed under the MIT license.
 */

'use strict';



module.exports =
{
    ASUB:   'ASUB',
    ASUB_WITHAGENTANDACTIONS: function(agent, actions)
    {
        var ac = actions || [];
        var result = this.ASUB + '{"agent": "' + agent + '","actions":' + JSON.stringify(ac) + '}';
        
        return result;
    },
    
    AUNSUB: 'AUNSUB',
    AUNSUB_WITHAGENTANDACTIONS: function(agent, actions)
    {
        var ac = actions || [];
        var result = this.AUNSUB + '{"agent": "' + agent + '"';
        
        if (actions)
        {
            result += ',"actions":' + JSON.stringify(ac);
        }
        
        result += '}';
        
        
        return result;
    },
    
    AACK:   'AACK',
    AACK_WITHPORT: function(port)
    {
        var result = this.AACK;
        result += '{"port":' + port + '}';
        
        return result;
    },
    
    TBEGIN: 'TBEGIN',
    TBEGIN_WITHACTIONS: function(actions)
    {
        var result = this.TBEGIN;
        
        var ac = actions || [];
        
        result += '{"actions":' + JSON.stringify(ac) + '}';
        
        return result;
    },
    TBEGIN_WITHPORTANDACTIONS: function(port, actions)
    {
        var result = this.TBEGIN;
        
        var ac = actions || [];
        
        result += '{"actions":' + JSON.stringify(ac) + ',"port":' + port + '}';
        
        return result;
    },
    
    TEND:   'TEND',
    TACK:   'TACK',
    TACK_SIMPLE: function()
    {
        var result = this.TACK;
        
        return result;
    },
    TACK_WITHTRANSACTIONANDPORT: function(transaction, port, portName)
    {
        var result = this.TACK;
        result += '{"transaction":"' + transaction + '","' + portName + '":' + port + '}';
        
        return result;
    },
    
    ERROR:  'ERROR',
    ERROR_WITHCAUSE: function(additional)
    {
        var result = this.ERROR;
        
        if (additional)
        {
            result += additional;
        }
        
        return result;
    },
    
    
    isCommand: function(str, command)
    {
        var result = false;

        if (str && command)
        {
            result = (str.indexOf(command) === 0);
        }

        return result;
    }
};
