/* global module:false, require:false */
var path = require('path');

var folderMount = function folderMount(connect, point) {
  return connect.static(path.resolve(point));
};

module.exports = function(grunt) {
  function registerRobustTasks(name, tasks) {
    grunt.registerTask(name, function() {
      // so we don't have stupid issues with grunt crashing
      // every time a test fails...
      grunt.option('force', true);
      grunt.task.run(tasks);
    });
  }

  grunt.initConfig({
    pkg : grunt.file.readJSON('package.json'),
    connect : {
      server : {
        options : {
          base : './client',
          port : 3000,
          livereload : 3001,
          hostname : '*'
        }
      }
    },
    watch : {
      js : {
        files : ['client/js/**/*.js', 'client/experiments/**/*.js'],
        options : {
          livereload : 3001
        }
      },
      html : {
        files : ['client/**/*.html'],
        options : {
          livereload : 3001
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

  registerRobustTasks('default', ['connect', 'watch']);
};