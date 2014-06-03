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
    AUNSUB: 'AUNSUB',
    
    
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
