'use strict';

var exec = require('child_process').exec;

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
        exec('./machina init start -d', {cwd: 'bin'});
    });
    
    grunt.registerTask('stop', function()
    {
        exec('./machina init stop -d', {cwd: 'bin'});
    });
    
    grunt.registerTask('clean', function()
    {
        exec('rm machina.pid', {cwd: 'bin'});
    });
    
    grunt.registerTask('test', ['start', 'jshint', 'nodeunit', 'stop', 'clean']);

    // Default task:
    grunt.registerTask('default', ['test']);

};
