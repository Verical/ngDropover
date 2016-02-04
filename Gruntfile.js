/*global module:false*/

/**
 * Javascript Project Boilerplate
 * Version 0.1.0
 */
module.exports = function(grunt) {
    "use strict";
    var pkg, config;

    pkg = grunt.file.readJSON('package.json');

    config = {
        banner: [
            '/**\n',
            ' * <%= pkg.name %> v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n',
            ' * <%= pkg.description %>\n',
            ' *\n',
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n',
            ' * Licensed <%= pkg.license %>\n',
            ' */\n'
        ].join(''),

        sources: [
            //'src/intro.js',

            // add'l packages
            'src/dropover.js',

            //'src/export.js',
            //'src/outro.js'
        ],
        pkg: pkg,
        uglifyFiles: {}
    };

    // setup dynamic filenames
    config.versioned = config.pkg.name;
    config.dist = ['dist/', '.js'].join(config.versioned);
    config.uglifyFiles[['dist/', '.min.js'].join(config.versioned)] = config.dist;
    config.website = ['website/vendor/ngdropover/', '.js'].join(config.versioned);

    // Project configuration.
    grunt.initConfig({
        pkg: config.pkg,
        lint: {
            files: ['gruntfile.js', 'test/*.js', 'src/*']
        },
        clean: {
            dist: ['dist/']
        },
        concat: {
            options: {
                // stripBanners: true,
                // banner: config.banner
            },
            dist: {
                src: config.sources,
                dest: config.dist
            }
        },
        uglify: {
            options: {
                mangle: true
            },
            dist: {
                files: config.uglifyFiles
            }
        },
        // copy: {
        //     main: {
        //         files: [{
        //             expand: false,
        //             src: [config.dist],
        //             dest: config.website,
        //             filter: 'isFile'
        //         }],
        //     },
        // },
        jshint: {
            options: {
                jshintrc: 'jshint.json'
            },
            source: config.dist
        },
        karma: {
            unit: {
                options: {
                    frameworks: ['jasmine'],
                    singleRun: true,
                    browsers: ['PhantomJS'],
                    files: [
                        'node_modules/jquery/dist/jquery.js',
                        'node_modules/angular/angular.js',
                        'node_modules/angular-mocks/angular-mocks.js',
                        'src/dropover.js',
                        'test/spec/*.js'
                    ]
                }
            }
        },
        watch: {
            js: {
                files: ['src/*.js', 'examples/js/*'],
                tasks: ['clean', 'concat', 'uglify']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-karma');

    // Default task.
    // grunt.registerTask('default', ['boilerplate-check', 'clean', 'concat', 'jshint', 'uglify', 'jasmine']);
    grunt.registerTask('default', ['clean', 'concat', 'test', 'uglify']);
    grunt.registerTask('test', ['jshint', 'karma']);


};
