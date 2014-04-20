module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('./pongApp/package.json'),
	jade:{
		compile:{
			files:{
				"./pongApp/html/index.htm": ["./pongApp/views/index.jade"]
			},
			options:{
				pretty: true
			}
		}
	},
    clean: {
		options: { force: true },
		releases: ["./releases"],
		jadeCompilations: ["./pongApp/html"]
	},
    nodewebkit: {
		options: {
			build_dir: './', // Where the build version of my node-webkit app is saved
			mac: true, // We want to build it for mac
			win: true, // We want to build it for win
			linux32: false, // We don't need linux32
			linux64: false // We don't need linux64
		},
		src: ['./pongApp/**'] // Your node-webkit app
	},
	bower: {
		install: {
			options: {
				 targetDir: './pongApp/lib',
				 install: true,
				 cleanBowerDir: false,
				 cleanTargetDir: false
			}
		}
  }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-bower-task');
  
  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-node-webkit-builder');

  // Default task(s).
  grunt.registerTask('default', ['clean','bower', 'jade', 'nodewebkit']);

};