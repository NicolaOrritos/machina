'use strict';

var exec = require('child_process').exec;
var fs   = require('fs');

module.exports = function (grunt) {
    // Show elapsed time at the end
    require('time-grunt')(grunt);
    // Load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        nodeunit: {
            files: ['test/**/*_test.js']
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            bin: {
                src: ['bin/**/*']
            },
            lib: {
                src: ['lib/**/*.js']
            },
            test: {
                src: ['test/**/*.js']
            }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            lib: {
                files: '<%= jshint.lib.src %>',
                tasks: ['jshint:lib', 'nodeunit']
            },
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jshint:test', 'nodeunit']
            }
        }
    });
    
    
    grunt.registerTask('start', function()
    {
        var done = this.async();
        
        exec('./machina init start -d', {cwd: 'bin'}, function(err)
        {
            if (err)
            {
                console.log('Error starting machina: %s', err);
                
                done(false);
            }
            else
            {
                console.log('Machina started');
                
                done(true);
            }
        });
    });
    
    grunt.registerTask('stop', function()
    {
        var done = this.async();
        
        exec('./machina init stop -d', {cwd: 'bin'}, function(err)
        {
            if (err)
            {
                console.log('Error stopping machina: %s', err);
                
                done(false);
            }
            else
            {
                console.log('Machina stopped');
                
                done(true);
            }
        });
    });
    
    grunt.registerTask('clean', function()
    {
        fs.unlinkSync('machina.pid');
    });
    
    grunt.registerTask('test', ['start', 'jshint', 'nodeunit', 'stop', 'clean']);

    // Default task:
    grunt.registerTask('default', ['test']);

};
