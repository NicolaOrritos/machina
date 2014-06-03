'use strict';


var sjl  = require("sjl");

var defaults =
{
    GUTENBERG:
    {
        PORT: 3000
    },
    
    ROTATIVA:
    {
        HOST: 'localhost',
        PORT: 4321,
        ADD_PULSE_PATH: '/pulses/add'
    },
    
    LIBRARIAN:
    {
        HOST: 'localhost',
        PORT: 3210,
        REMOVE_JOBS_ON_COMPLETION: false,
        SAVE_JOB_PATH: '/job',

        JOBS:
        {
            RSS2HTML:
            {
                JOB_NAME: 'RSS_parsing',
                MAX_ATTEMPTS: 5,
                PRIORITY: 'normal',
                BACKEND: 'fs',
                BACKEND_BASEPATH: '/tmp/read/rss2html/books',
                FSBACKEND:
                {
                    NAME: 'fs_backend',
                    OPTIONS:
                    {
                        TEMPLATE:
                        {
                            BASE_PATH:  './templates/basic/html',
                            INDEX_FILE: 'index.html.template'
                        },

                        DESTINATION:
                        {
                            BASE_PATH:  './books',
                            INDEX_FILE: 'index.html',
                            DATA_FILE:  'contents.json'
                        },
                        
                        PLACEHOLDERS:
                        {
                            TITLE:        '%TITLE%',
                            CONTENTS:     '%CONTENTS%',
                            LANG:         '%LANG%',
                            FONT_URL:     '%FONT_URL%',
                            MAIN_CSS_URL: '%MAIN_CSS_URL%'
                        }
                    }
                },
                DBBACKEND:
                {
                    NAME: 'db_backend',
                    OPTIONS:
                    {}
                }
            },
            
            RSS2PDF:
            {
                JOB_NAME: 'RSS_to_PDF',
                MAX_ATTEMPTS: 5,
                PRIORITY: 'normal',
                FS_BACKEND_BASEPATH: '/tmp/read/rss2pdf/books'
            },
            
            HTML2APP:
            {
                JOB_NAME: 'HTML_to_phonegap',
                MAX_ATTEMPTS: 5,
                PRIORITY: 'normal',
                SAVE_TO: './apps',
                INDEX_FILE: 'index.html',
                TEMPLATES:
                {
                    BASE_PATH: './templates',
                    BASIC:
                    {
                        NAME: 'BASIC',
                        SUBPATH: 'basic',
                        CSS_FILES_PATH: 'css',
                        ANDROID_TEMPLATE_PATH: 'android'
                    }
                }
            }
        }
    },

    SERVICE_DB:
    {
        NAME: 'proto1',
        HOST: 'localhost',
        PORT: 28015,
        AUTH_KEY: '',
        TABLES:
        {
            PUBLISHERS: 'publishers',
            BOOKS:      'books',
            APPS:       'apps'
        }
    },
    
    LOGGING:
    {
        BASE_PATH: 'logs'
    }
};

var CONF = sjl("/etc/read.json", defaults, {"silent": true});


module.exports = CONF;
